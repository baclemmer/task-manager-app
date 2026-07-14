import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Bypasses Row Level Security entirely — only for admin server actions
 * (invite/remove users) that need Supabase's Auth Admin API. Never import
 * this into a "use client" file; the `server-only` import above makes any
 * such attempt a build error.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
