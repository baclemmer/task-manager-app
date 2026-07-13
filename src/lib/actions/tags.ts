"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTag(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  if (!name) return;
  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({ name });
  if (error) throw error;
  revalidatePath("/projects");
}

export async function renameTag(id: string, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const supabase = await createClient();
  const { error } = await supabase.from("tags").update({ name }).eq("id", id);
  if (error) throw error;
  revalidatePath("/projects");
  revalidatePath("/attention");
  revalidatePath("/dashboard");
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/projects");
  revalidatePath("/attention");
  revalidatePath("/dashboard");
}
