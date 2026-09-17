"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import { zonedTimeToUtcIso } from "@/lib/time";
import { renderReminderTemplate, formatAppointmentTime } from "@/lib/reminders/template-engine";
import type { AppointmentStatus } from "@/types/database";

const VALID_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
];

export interface AppointmentActionState {
  error?: string;
}

async function findOrCreateCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  name: string,
  email: string,
) {
  if (email) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("business_id", businessId)
      .eq("email", email)
      .maybeSingle();
    if (existing) return existing.id;
  }
  const { data: created, error } = await supabase
    .from("customers")
    .insert({ business_id: businessId, name, email: email || null })
    .select("id")
    .single();
  if (error || !created) throw error ?? new Error("Nem sikerült létrehozni az ügyfelet.");
  return created.id;
}

async function findOrCreateService(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  name: string,
) {
  const { data: existing } = await supabase
    .from("services")
    .select("id")
    .eq("business_id", businessId)
    .eq("name", name)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("services")
    .insert({ business_id: businessId, name })
    .select("id")
    .single();
  if (error || !created) throw error ?? new Error("Nem sikerült létrehozni a szolgáltatást.");
  return created.id;
}

export async function createAppointmentAction(
  _prevState: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const serviceName = String(formData.get("serviceName") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  let employeeId = String(formData.get("employeeId") ?? "");
  const redirectDate = date || undefined;

  if (!customerName || !serviceName || !date || !time) {
    return { error: "Töltsd ki az ügyfél nevét, a szolgáltatást, a dátumot és az időpontot." };
  }

  if (!employeeId) {
    const { data: employees } = await supabase
      .from("employees")
      .select("id")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("created_at", { ascending: true })
      .limit(1);
    employeeId = employees?.[0]?.id ?? "";
  }
  if (!employeeId) {
    return { error: "Nincs beállítva dolgozó ehhez a vállalkozáshoz." };
  }

  const startsAt = zonedTimeToUtcIso(date, time, business.timezone);

  const customerId = await findOrCreateCustomer(supabase, business.id, customerName, customerEmail);
  const serviceId = await findOrCreateService(supabase, business.id, serviceName);

  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .insert({
      business_id: business.id,
      employee_id: employeeId,
      customer_id: customerId,
      service_id: serviceId,
      starts_at: startsAt,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (apptError || !appointment) {
    return { error: "Nem sikerült létrehozni az időpontot. Próbáld újra." };
  }

  const scheduledFor = new Date(
    new Date(startsAt).getTime() - business.reminder_hours_before * 60 * 60 * 1000,
  ).toISOString();

  const renderedMessage = renderReminderTemplate(business.reminder_template, {
    customerName,
    formattedTime: formatAppointmentTime(startsAt, business.timezone),
    serviceName,
  });

  await supabase.from("reminder_messages").insert({
    appointment_id: appointment.id,
    business_id: business.id,
    rendered_message: renderedMessage,
    scheduled_for: scheduledFor,
  });

  redirect(`/admin/naptar${redirectDate ? `?date=${redirectDate}` : ""}`);
}

export async function updateAppointmentStatusAction(formData: FormData): Promise<void> {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const statusInput = String(formData.get("status") ?? "");
  const status = VALID_STATUSES.find((s) => s === statusInput);
  const date = String(formData.get("date") ?? "");

  if (appointmentId && status) {
    await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
      .eq("business_id", business.id);
  }

  redirect(`/admin/naptar${date ? `?date=${date}` : ""}`);
}
