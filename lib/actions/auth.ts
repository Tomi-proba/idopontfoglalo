"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureBusinessForUser } from "@/lib/actions/business";
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/config";

export interface AuthActionState {
  error?: string;
  info?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const companyName = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const loginMode = String(formData.get("loginMode") ?? "password");
  const password = String(formData.get("password") ?? "");
  const employeeCount = Math.max(1, Math.min(30, Number(formData.get("employeeCount")) || 1));

  if (!companyName || !email) {
    return { error: "Add meg a vállalkozásod nevét és az email címed." };
  }
  if (loginMode === "password" && password.length < 8) {
    return { error: "A jelszó legalább 8 karakter legyen." };
  }
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const metadata = { company_name: companyName, employee_count: employeeCount };

  if (loginMode === "magic") {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
        shouldCreateUser: true,
        data: metadata,
      },
    });
    if (error) return { error: error.message };
    return {
      info: "Elküldtük a belépő linket a megadott email címre. Kattints rá a folytatáshoz — a fiókod és a próbaidőd akkor indul el.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${APP_URL}/auth/callback`, data: metadata },
  });
  if (error) return { error: error.message };
  if (!data.user) return { error: "Váratlan hiba történt a regisztráció során." };

  if (data.session) {
    await ensureBusinessForUser(supabase, data.user.id, email, metadata);
    redirect("/admin");
  }

  return {
    info: "Fiókod elkészült! Nézd meg a postafiókod, és erősítsd meg az email címed a belépéshez — utána azonnal a saját admin felületeden vagy.",
  };
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Add meg az email címed és a jelszavad." };
  }
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Hibás email cím vagy jelszó." };

  redirect("/admin");
}

export async function requestMagicLinkAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Add meg az email címed." };
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${APP_URL}/auth/callback`, shouldCreateUser: false },
  });
  if (error) return { error: error.message };

  return { info: "Elküldtük a belépő linket — nézd meg a postafiókod." };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
