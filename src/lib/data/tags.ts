import { createClient } from "@/lib/supabase/server";

export async function getTags() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw error;
  return data;
}
