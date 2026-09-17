import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/types/database";

// Az emlékeztető emailben szereplő "Igen, jövök" / "Lemondom" linkek ide
// mutatnak. Nincs bejelentkezés — a megerősítés-token (egy nehezen
// kitalálható UUID) önmagában azonosítja a foglalást, ezért service-role
// klienssel, RLS megkerülésével írunk.
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const action = request.nextUrl.searchParams.get("action");

  if (token && (action === "confirm" || action === "cancel")) {
    const supabase = createServiceRoleClient();
    const updates: { status: AppointmentStatus; confirmed_at?: string } =
      action === "confirm"
        ? { status: "confirmed", confirmed_at: new Date().toISOString() }
        : { status: "cancelled" };

    await supabase.from("appointments").update(updates).eq("confirmation_token", token);
  }

  return NextResponse.redirect(new URL(`/megerosites/${token}`, request.url));
}
