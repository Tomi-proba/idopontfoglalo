"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import { zonedTimeToUtcIso, addDaysToDateString } from "@/lib/time";

export interface ClosureActionState {
  error?: string;
}

export async function createClosureAction(
  _prevState: ClosureActionState,
  formData: FormData,
): Promise<ClosureActionState> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? startDate);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!startDate) return { error: "Add meg legalább a kezdő dátumot." };

  const startsAt = zonedTimeToUtcIso(startDate, "00:00", business.timezone);
  const endsAt = zonedTimeToUtcIso(addDaysToDateString(endDate, 1), "00:00", business.timezone);

  const { error } = await supabase.from("closures").insert({
    business_id: business.id,
    starts_at: startsAt,
    ends_at: endsAt,
    reason: reason || null,
  });

  if (error) return { error: "Nem sikerült menteni a zárvatartást." };

  revalidatePath("/admin/beallitasok");
  return {};
}

export async function deleteClosureAction(formData: FormData): Promise<void> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const closureId = String(formData.get("closureId") ?? "");

  if (closureId) {
    await supabase.from("closures").delete().eq("id", closureId).eq("business_id", business.id);
  }

  revalidatePath("/admin/beallitasok");
}
