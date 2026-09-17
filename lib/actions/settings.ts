"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import { DAY_NAMES } from "@/lib/constants";

export interface SettingsActionState {
  error?: string;
  saved?: boolean;
}

export async function updateBusinessSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const reminderTemplate = String(formData.get("reminderTemplate") ?? "").trim();
  const reminderHoursBefore = Math.max(1, Math.min(168, Number(formData.get("reminderHoursBefore")) || 18));
  const employeeCount = Math.max(1, Math.min(30, Number(formData.get("employeeCount")) || 1));

  if (!name || !reminderTemplate) {
    return { error: "A cég neve és az emlékeztető szövege nem lehet üres." };
  }

  const { count: activeEmployees } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("active", true);

  if (employeeCount < (activeEmployees ?? 0)) {
    return {
      error: `Jelenleg ${activeEmployees} aktív dolgozód van — ennél kisebb létszámot nem állíthatsz be. Inaktiválj előbb dolgozókat a Dolgozók oldalon.`,
    };
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      reminder_template: reminderTemplate,
      reminder_hours_before: reminderHoursBefore,
      employee_count: employeeCount,
    })
    .eq("id", business.id);

  if (error) return { error: "Nem sikerült menteni a beállításokat." };

  revalidatePath("/admin", "layout");
  return { saved: true };
}

export async function updateBusinessHoursAction(formData: FormData): Promise<void> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const rows = DAY_NAMES.map((_, day) => ({
    business_id: business.id,
    employee_id: null,
    day_of_week: day,
    open_time: String(formData.get(`open-${day}`) ?? "09:00"),
    close_time: String(formData.get(`close-${day}`) ?? "17:00"),
    is_closed: formData.get(`closed-${day}`) === "on",
  }));

  await supabase.from("business_hours").delete().eq("business_id", business.id).is("employee_id", null);
  await supabase.from("business_hours").insert(rows);

  revalidatePath("/admin/beallitasok");
}
