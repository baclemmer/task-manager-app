import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Given free-typed tag names from the task form, returns the tag ids to
 * link, creating any tags that don't exist yet in the shared list.
 */
export async function resolveTagIds(
  supabase: SupabaseClient<Database>,
  names: string[],
): Promise<string[]> {
  const trimmed = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (trimmed.length === 0) return [];

  const { data: existing, error: selectError } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", trimmed);
  if (selectError) throw selectError;

  const existingNames = new Set(existing?.map((t) => t.name));
  const missingNames = trimmed.filter((n) => !existingNames.has(n));

  let created: { id: string; name: string }[] = [];
  if (missingNames.length > 0) {
    const { data, error: insertError } = await supabase
      .from("tags")
      .insert(missingNames.map((name) => ({ name })))
      .select("id, name");
    if (insertError) throw insertError;
    created = data ?? [];
  }

  return [...(existing ?? []), ...created].map((t) => t.id);
}
