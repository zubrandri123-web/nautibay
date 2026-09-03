import { createClient } from "@/lib/supabase/server";

// True when the signed-in user's email is in the `admins` table. RLS only
// lets a user see their own row, so this query returning a row IS the check.
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const { data } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return Boolean(data);
}
