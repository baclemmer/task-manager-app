-- Migration: adds Urgent flag, Start/Complete dates, and a managed Tags list.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run if a previous attempt failed partway through.

-- The view references `select t.*`, so it depends on every column of
-- `tasks` — drop it before altering columns, recreate at the end.
drop view if exists tasks_with_flags;

alter table tasks
  add column if not exists start_date date,
  add column if not exists completed_date date,
  add column if not exists is_urgent boolean not null default false;

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists task_tags (
  task_id uuid not null references tasks (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (task_id, tag_id)
);

alter table tags enable row level security;
alter table task_tags enable row level security;

drop policy if exists "authenticated users full access to tags" on tags;
create policy "authenticated users full access to tags"
  on tags for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users full access to task_tags" on task_tags;
create policy "authenticated users full access to task_tags"
  on task_tags for all to authenticated using (true) with check (true);

-- Migrate any existing free-text tags into the new managed tags table,
-- then drop the old column. Safe to run even if `tags` was never used.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'tasks' and column_name = 'tags'
  ) then
    insert into tags (name)
    select distinct unnest(tags) from tasks
    where tags is not null and array_length(tags, 1) > 0
    on conflict (name) do nothing;

    insert into task_tags (task_id, tag_id)
    select t.id, tg.id
    from tasks t
    cross join lateral unnest(t.tags) as tag_name
    join tags tg on tg.name = tag_name
    on conflict do nothing;

    alter table tasks drop column tags cascade;
  end if;
end $$;

create view tasks_with_flags as
select
  t.*,
  coalesce(
    t.behind_schedule_override,
    (t.due_date is not null and t.due_date < current_date and t.status <> 'done')
  ) as is_behind_schedule
from tasks t;
