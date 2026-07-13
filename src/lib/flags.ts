import type { Task, TaskWithFlags } from "@/types/database";

// Single source of truth for the "Behind Schedule" flag, mirroring the
// coalesce() logic in supabase/schema.sql's tasks_with_flags view.
export function withFlags<T extends Task>(task: T): T & TaskWithFlags {
  const isBehindSchedule =
    task.behind_schedule_override ??
    (!!task.due_date && task.due_date < new Date().toISOString().slice(0, 10) && task.status !== "done");

  return { ...task, is_behind_schedule: isBehindSchedule };
}

export function needsAttention(task: TaskWithFlags): boolean {
  return task.needs_help || task.is_behind_schedule || task.is_urgent;
}
