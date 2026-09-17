"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";

export interface EmployeeActionState {
  error?: string;
}

export async function createEmployeeAction(
  _prevState: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Add meg a dolgozó nevét." };

  const { count } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("active", true);

  if ((count ?? 0) >= business.employee_count) {
    return {
      error: `A csapatméreted jelenleg ${business.employee_count} fő. Ha többet szeretnél felvenni, először növeld a létszámot a Beállításoknál.`,
    };
  }

  const { error } = await supabase.from("employees").insert({ business_id: business.id, name });
  if (error) return { error: "Nem sikerült felvenni a dolgozót." };

  revalidatePath("/admin/dolgozok");
  return {};
}

export async function toggleEmployeeActiveAction(formData: FormData): Promise<void> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const employeeId = String(formData.get("employeeId") ?? "");
  const active = formData.get("active") === "true";

  if (employeeId) {
    await supabase
      .from("employees")
      .update({ active: !active })
      .eq("id", employeeId)
      .eq("business_id", business.id);
  }

  revalidatePath("/admin/dolgozok");
}
