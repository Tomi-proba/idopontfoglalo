import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

interface SignupMetadata {
  company_name?: string;
  employee_count?: number;
}

/**
 * Regisztráció (jelszavas vagy email-linkes) után ez hozza létre a
 * businesses sort és az első (tulajdonosi) dolgozói naptárat, ha még
 * nem léteznek — a signUp/signInWithOtp hívásnál eltárolt user_metadata
 * alapján. Idempotens: ha már van business a felhasználóhoz, csak
 * visszaadja azt.
 */
export async function ensureBusinessForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  email: string,
  metadata: SignupMetadata | undefined,
): Promise<string> {
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (existing) return existing.id;

  const companyName = metadata?.company_name?.trim() || "Az én vállalkozásom";
  const employeeCount = Math.max(1, Math.min(30, metadata?.employee_count ?? 1));

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      owner_user_id: userId,
      name: companyName,
      owner_email: email,
      employee_count: employeeCount,
    })
    .select("id")
    .single();

  if (error || !business) {
    throw error ?? new Error("Nem sikerült létrehozni a vállalkozást.");
  }

  await supabase.from("employees").insert({ business_id: business.id, name: companyName });

  return business.id;
}
