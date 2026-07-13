-- Task Management System — v1 schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query) after creating your project.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type task_status as enum ('todo', 'in_progress', 'waiting', 'done');
create type task_priority as enum ('low', 'medium', 'high');

-- ============================================================
-- Profiles (one row per auth user, kept in sync via trigger)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- Projects
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Categories
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ============================================================
-- Tasks
-- ============================================================
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority,
  due_date date,
  start_date date,
  completed_date date,
  assignee_id uuid references profiles (id),
  project_id uuid references projects (id) on delete set null,
  category_id uuid references categories (id) on delete set null,
  needs_help boolean not null default false,
  is_urgent boolean not null default false,
  behind_schedule_override boolean, -- null = auto-calculate, true/false = manual override
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Tags — managed list (like Projects/Categories), many-to-many with tasks
-- ============================================================
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table task_tags (
  task_id uuid not null references tasks (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (task_id, tag_id)
);

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on tasks
  for each row execute procedure set_updated_at();

-- ============================================================
-- Derived "flags" view — single source of truth for Behind Schedule
-- so the Attention Dashboard and Standard Dashboard never diverge.
-- ============================================================
create view tasks_with_flags as
select
  t.*,
  coalesce(
    t.behind_schedule_override,
    (t.due_date is not null and t.due_date < current_date and t.status <> 'done')
  ) as is_behind_schedule
from tasks t;

-- ============================================================
-- Row Level Security
-- Small trusted team (Brett + EA, more invited later) — any
-- authenticated user can read/write everything. No per-row
-- ownership restrictions in v1.
-- ============================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table categories enable row level security;
alter table tasks enable row level security;
alter table tags enable row level security;
alter table task_tags enable row level security;

create policy "authenticated users can read profiles"
  on profiles for select to authenticated using (true);
create policy "users can update own profile"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "authenticated users full access to projects"
  on projects for all to authenticated using (true) with check (true);

create policy "authenticated users full access to categories"
  on categories for all to authenticated using (true) with check (true);

create policy "authenticated users full access to tasks"
  on tasks for all to authenticated using (true) with check (true);

create policy "authenticated users full access to tags"
  on tags for all to authenticated using (true) with check (true);

create policy "authenticated users full access to task_tags"
  on task_tags for all to authenticated using (true) with check (true);

-- ============================================================
-- Helpful indexes
-- ============================================================
create index tasks_project_id_idx on tasks (project_id);
create index tasks_assignee_id_idx on tasks (assignee_id);
create index tasks_status_idx on tasks (status);
create index tasks_due_date_idx on tasks (due_date);
