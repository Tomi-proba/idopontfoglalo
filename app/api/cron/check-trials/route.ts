import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendTrialEndingEmail } from "@/lib/email/resend";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { monthlyPriceHuf, trialDaysLeft } from "@/lib/billing/seat-price";

export const dynamic = "force-dynamic";

// Napi egyszer fut: minden trialing állapotú vállalkozásnak, akinek 3 napon
// belül lejár a próbaideje és még nem kapott figyelmeztetést, küld egy
// emailt. A trial_reminder_sent_at mező védi az ismételt küldéstől.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, owner_email, employee_count, trial_ends_at")
    .eq("subscription_status", "trialing")
    .is("trial_reminder_sent_at", null)
    .lte("trial_ends_at", in3Days);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const business of businesses ?? []) {
    const result = await sendTrialEndingEmail({
      to: business.owner_email,
      businessName: business.name,
      daysLeft: Math.max(0, trialDaysLeft(business.trial_ends_at)),
      monthlyPrice: monthlyPriceHuf(business.employee_count),
    });

    if (result.ok) {
      await supabase
        .from("businesses")
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq("id", business.id);
      sent += 1;
    }
  }

  return NextResponse.json({ checked: businesses?.length ?? 0, sent });
}
