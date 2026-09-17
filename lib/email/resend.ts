import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = process.env.REMINDER_FROM_EMAIL ?? "Cetli <onboarding@resend.dev>";

export async function sendReminderEmail(params: {
  to: string;
  subject: string;
  text: string;
  confirmUrl: string;
  cancelUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const html = `
    <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #2a241c;">
      <p>${params.text.replace(/\n/g, "<br>")}</p>
      <p style="margin-top: 24px;">
        <a href="${params.confirmUrl}" style="display:inline-block;background:#ae3a2c;color:#fbf8ef;padding:10px 18px;border-radius:3px;text-decoration:none;font-weight:600;margin-right:10px;">Igen, jövök</a>
        <a href="${params.cancelUrl}" style="display:inline-block;border:1.5px solid #2a241c;color:#2a241c;padding:10px 18px;border-radius:3px;text-decoration:none;font-weight:600;">Nem tudok jönni</a>
      </p>
    </div>
  `;

  try {
    const { error } = await getClient().emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      text: `${params.text}\n\nIgen, jövök: ${params.confirmUrl}\nNem tudok jönni: ${params.cancelUrl}`,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Ismeretlen hiba" };
  }
}

export async function sendTrialEndingEmail(params: {
  to: string;
  businessName: string;
  daysLeft: number;
  monthlyPrice: number;
}): Promise<{ ok: boolean; error?: string }> {
  const subject =
    params.daysLeft <= 0
      ? "Lejárt a Cetli próbaidőd"
      : `Már csak ${params.daysLeft} nap van hátra a Cetli próbaidődből`;

  const body =
    params.daysLeft <= 0
      ? `Szia! A(z) ${params.businessName} 14 napos ingyenes próbaideje lejárt. A foglalásaid és beállításaid megmaradtak — válts fizetős előfizetésre az admin felület Beállítások oldalán a folytatáshoz (${params.monthlyPrice.toLocaleString("hu-HU")} Ft/hó).`
      : `Szia! Már csak ${params.daysLeft} napod van hátra a(z) ${params.businessName} ingyenes próbaidejéből. Utána ${params.monthlyPrice.toLocaleString("hu-HU")} Ft/hó áron folytatódik az előfizetésed — ha nem szeretnéd folytatni, egyszerűen nem kell tenned semmit.`;

  try {
    const { error } = await getClient().emails.send({
      from: FROM,
      to: params.to,
      subject,
      text: body,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Ismeretlen hiba" };
  }
}
