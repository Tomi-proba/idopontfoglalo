import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email/resend";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type DueReminderRow = {
  id: string;
  rendered_message: string;
  appointments: {
    confirmation_token: string;
    status: string;
    customers: { name: string; email: string | null } | null;
  } | null;
};

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const nowIso = new Date().toISOString();

  const { data: dueData, error } = await supabase
    .from("reminder_messages")
    .select(
      "id, rendered_message, appointments(confirmation_token, status, customers(name, email))",
    )
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = (dueData ?? []) as unknown as DueReminderRow[];

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const reminder of due) {
    const appointment = reminder.appointments;

    // A foglalást időközben lemondták — az emlékeztetőnek nincs már tárgya.
    if (!appointment || appointment.status === "cancelled") {
      await supabase
        .from("reminder_messages")
        .update({ status: "sent", sent_at: nowIso })
        .eq("id", reminder.id);
      skipped += 1;
      continue;
    }

    const email = appointment.customers?.email;
    if (!email) {
      await supabase.from("reminder_messages").update({ status: "failed" }).eq("id", reminder.id);
      failed += 1;
      continue;
    }

    const token = appointment.confirmation_token;
    const result = await sendReminderEmail({
      to: email,
      subject: "Emlékeztető a közelgő időpontodról",
      text: reminder.rendered_message,
      confirmUrl: `${APP_URL}/api/confirm/${token}?action=confirm`,
      cancelUrl: `${APP_URL}/api/confirm/${token}?action=cancel`,
    });

    if (result.ok) {
      await supabase
        .from("reminder_messages")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", reminder.id);
      sent += 1;
    } else {
      await supabase.from("reminder_messages").update({ status: "failed" }).eq("id", reminder.id);
      failed += 1;
    }
  }

  return NextResponse.json({ processed: due.length, sent, skipped, failed });
}
