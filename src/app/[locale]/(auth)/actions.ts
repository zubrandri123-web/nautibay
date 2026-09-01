"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect(`/${locale}/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  // When email confirmation is disabled, sign-up returns a live session —
  // send the user straight in instead of the "check your email" screen.
  if (data.session) {
    redirect(`/${locale}/boats`);
  }

  redirect(`/${locale}/sign-up?checkEmail=${encodeURIComponent(email)}`);
}

export async function signInAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/${locale}/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/boats`);
}

export async function signOutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
