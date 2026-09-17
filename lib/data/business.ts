import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Business } from "@/types/database";

/**
 * A bejelentkezett tulajdonos vállalkozását adja vissza. A middleware már
 * garantálja, hogy /admin alatt csak bejelentkezett felhasználó jár —
 * ha mégsem találnánk hozzá businesses sort (pl. a signup félbeszakadt),
 * visszairányítjuk a bejelentkezéshez.
 */
export async function getCurrentBusiness(): Promise<Business> {
  if (!isSupabaseConfigured()) redirect("/bejelentkezes");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/bejelentkezes");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business) redirect("/bejelentkezes");

  return business;
}
