import { createClient } from "@/lib/supabase/server";
import { withFlags } from "@/lib/flags";
import type { Task, TaskWithRelations } from "@/types/database";

const TASK_SELECT =
  "*, project:projects(*), category:categories(*), assignee:profiles(*), task_tags(tag:tags(*))";

export async function getTasks(): Promise<TaskWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data ?? []).map((row) => {
    const { task_tags, ...task } = row as unknown as Task & {
      task_tags: { tag: { id: string; name: string } }[];
    };
    return {
      ...withFlags(task),
      tags: task_tags.map((tt) => tt.tag),
    } as TaskWithRelations;
  });
}

export async function getProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data;
}
