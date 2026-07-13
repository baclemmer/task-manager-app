"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveTagIds } from "@/lib/tags-helpers";
import type { TaskPriority, TaskStatus } from "@/types/database";

function revalidateTaskViews() {
  revalidatePath("/attention");
  revalidatePath("/dashboard");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Applies the "auto-fill/clear completed_date based on status" rule shared by create/update/quick-status-change. */
function resolveCompletedDate(status: TaskStatus, explicitCompletedDate: string | null): string | null {
  if (status !== "done") return null;
  return explicitCompletedDate || today();
}

async function syncTaskTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  tagNames: string[],
) {
  const tagIds = await resolveTagIds(supabase, tagNames);
  await supabase.from("task_tags").delete().eq("task_id", taskId);
  if (tagIds.length > 0) {
    await supabase.from("task_tags").insert(tagIds.map((tag_id) => ({ task_id: taskId, tag_id })));
  }
}

function readTaskFields(formData: FormData) {
  const status = ((formData.get("status") as string) || "todo") as TaskStatus;
  return {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    status,
    priority: ((formData.get("priority") as string) || null) as TaskPriority | null,
    due_date: (formData.get("dueDate") as string) || null,
    start_date: (formData.get("startDate") as string) || null,
    completed_date: resolveCompletedDate(status, (formData.get("completedDate") as string) || null),
    assignee_id: (formData.get("assigneeId") as string) || null,
    project_id: (formData.get("projectId") as string) || null,
    category_id: (formData.get("categoryId") as string) || null,
    is_urgent: formData.get("isUrgent") === "on",
    tags: formData.getAll("tags") as string[],
  };
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { tags, ...fields } = readTaskFields(formData);

  const { data, error } = await supabase.from("tasks").insert(fields).select("id").single();
  if (error) throw error;

  await syncTaskTags(supabase, data.id, tags);
  revalidateTaskViews();
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient();
  const { tags, ...fields } = readTaskFields(formData);

  const { error } = await supabase.from("tasks").update(fields).eq("id", id);
  if (error) throw error;

  await syncTaskTags(supabase, id, tags);
  revalidateTaskViews();
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  revalidateTaskViews();
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status, completed_date: resolveCompletedDate(status, null) })
    .eq("id", id);
  if (error) throw error;
  revalidateTaskViews();
}

export async function setNeedsHelp(id: string, needsHelp: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ needs_help: needsHelp }).eq("id", id);
  if (error) throw error;
  revalidateTaskViews();
}

export async function setUrgent(id: string, isUrgent: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ is_urgent: isUrgent }).eq("id", id);
  if (error) throw error;
  revalidateTaskViews();
}

export async function setBehindScheduleOverride(id: string, value: boolean | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ behind_schedule_override: value })
    .eq("id", id);
  if (error) throw error;
  revalidateTaskViews();
}

export async function reassignTask(id: string, assigneeId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ assignee_id: assigneeId }).eq("id", id);
  if (error) throw error;
  revalidateTaskViews();
}
