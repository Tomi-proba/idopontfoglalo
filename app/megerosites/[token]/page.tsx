import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, Pill } from "@/components/ui/card";
import type { AppointmentStatus } from "@/types/database";

type ConfirmationRow = {
  id: string;
  starts_at: string;
  status: AppointmentStatus;
  customers: { name: string } | null;
  services: { name: string } | null;
  businesses: { name: string; timezone: string } | null;
};

export default async function MegerositesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceRoleClient();

  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("id, starts_at, status, customers(name), services(name), businesses(name, timezone)")
    .eq("confirmation_token", token)
    .maybeSingle();

  const appointment = appointmentData as unknown as ConfirmationRow | null;

  if (!appointment) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold">Ez a link már nem érvényes</h1>
        <p className="text-ink-soft">Ha kérdésed van az időpontoddal kapcsolatban, keresd fel közvetlenül a szalont.</p>
      </main>
    );
  }

  const business = appointment.businesses;
  const timeLabel = new Intl.DateTimeFormat("hu-HU", {
    timeZone: business?.timezone ?? "Europe/Budapest",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(appointment.starts_at));

  const isConfirmed = appointment.status === "confirmed";
  const isCancelled = appointment.status === "cancelled";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Card className="p-7 text-center">
        {isConfirmed && (
          <span className="mb-4 inline-block -rotate-6 rounded border-[2.5px] border-confirm px-3.5 py-2 font-display text-[15px] font-black tracking-wide text-confirm">
            VISSZAIGAZOLVA
          </span>
        )}
        {isCancelled && (
          <span className="mb-4 inline-block -rotate-6 rounded border-[2.5px] border-stamp px-3.5 py-2 font-display text-[15px] font-black tracking-wide text-stamp">
            LEMONDVA
          </span>
        )}

        <h1 className="mb-2 font-display text-2xl font-bold">
          {isConfirmed && "Köszönjük, várunk!"}
          {isCancelled && "Rendben, lemondtuk az időpontot."}
          {!isConfirmed && !isCancelled && "Jössz erre az időpontra?"}
        </h1>

        <p className="mb-5 text-ink-soft">
          {business?.name} · {appointment.services?.name}
          <br />
          <b className="text-ink">{timeLabel}</b>
        </p>

        <div className="mb-5 flex justify-center">
          <Pill tone={isConfirmed ? "confirm" : "pending"}>
            {isConfirmed ? "Visszaigazolva" : isCancelled ? "Lemondva" : "Vár visszaigazolásra"}
          </Pill>
        </div>

        {!isCancelled && (
          <a
            href={`/api/confirm/${token}?action=${isConfirmed ? "cancel" : "confirm"}`}
            className={`mb-2.5 flex items-center justify-center gap-2 rounded-[3px] border-[1.5px] px-5 py-3 text-[15.5px] font-semibold ${
              isConfirmed
                ? "border-ink text-ink hover:bg-paper-raised"
                : "border-stamp bg-stamp text-[#fbf8ef]"
            }`}
          >
            {isConfirmed ? "Mégsem tudok jönni" : "Igen, jövök"}
          </a>
        )}
        {!isConfirmed && (
          <a
            href={`/api/confirm/${token}?action=${isCancelled ? "confirm" : "cancel"}`}
            className="flex items-center justify-center gap-2 rounded-[3px] border-[1.5px] border-ink px-5 py-3 text-[15.5px] font-semibold hover:bg-paper-raised"
          >
            {isCancelled ? "Mégis jövök" : "Nem tudok jönni"}
          </a>
        )}
      </Card>
    </main>
  );
}
