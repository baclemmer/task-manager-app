"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  if (!profile.is_admin) throw new Error("Not authorized");

  return user;
}

export async function addUser(formData: FormData) {
  await requireAdmin();

  const email = (formData.get("email") as string).trim();
  const fullName = (formData.get("fullName") as string).trim();
  const password = formData.get("password") as string;

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;

  revalidatePath("/team");
}

export async function removeUser(userId: string) {
  const currentUser = await requireAdmin();
  if (userId === currentUser.id) {
    throw new Error("You can't remove your own account.");
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/team");
}
