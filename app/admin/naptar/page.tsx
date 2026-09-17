import Link from "next/link";
import { getCurrentBusiness } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";
import { todayInZone, addDaysToDateString, formatDateHeading, zonedTimeToUtcIso } from "@/lib/time";
import { updateAppointmentStatusAction } from "@/lib/actions/appointments";
import { Card, Pill } from "@/components/ui/card";
import type { AppointmentStatus } from "@/types/database";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Vár visszaigazolásra",
  confirmed: "Visszaigazolva",
  cancelled: "Lemondva",
  completed: "Megtörtént",
  no_show: "Nem jött el",
};

type AppointmentListRow = {
  id: string;
  starts_at: string;
  status: AppointmentStatus;
  notes: string | null;
  employee_id: string;
  customers: { name: string } | null;
  services: { name: string } | null;
  employees: { name: string } | null;
};

export default async function NaptarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayInZone(business.timezone);

  const dayStart = zonedTimeToUtcIso(date, "00:00", business.timezone);
  const dayEnd = zonedTimeToUtcIso(addDaysToDateString(date, 1), "00:00", business.timezone);

  const [{ data: appointmentsData }, { data: employees }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, starts_at, status, notes, employee_id, customers(name), services(name), employees(name)")
      .eq("business_id", business.id)
      .gte("starts_at", dayStart)
      .lt("starts_at", dayEnd)
      .order("starts_at", { ascending: true }),
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("created_at", { ascending: true }),
  ]);

  // A beágyazott join-ok (customers(name) stb.) pontos típusát a
  // postgrest-js csak élő adatbázisból generált Relationships metaadatból
  // tudná levezetni — kézzel írt típusokkal itt explicit castra van szükség.
  const appointments = (appointmentsData ?? []) as unknown as AppointmentListRow[];

  const showEmployeeColumn = (employees?.length ?? 0) > 1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Naptár</p>
          <h1 className="mt-1 font-display text-[26px] font-bold capitalize">{formatDateHeading(date)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/naptar?date=${addDaysToDateString(date, -1)}`}
            className="rounded-[3px] border border-rule-strong px-3 py-2 text-[14px] font-semibold hover:bg-paper-raised"
          >
            ← Előző nap
          </Link>
          <Link
            href={`/admin/naptar?date=${todayInZone(business.timezone)}`}
            className="rounded-[3px] border border-rule-strong px-3 py-2 text-[14px] font-semibold hover:bg-paper-raised"
          >
            Ma
          </Link>
          <Link
            href={`/admin/naptar?date=${addDaysToDateString(date, 1)}`}
            className="rounded-[3px] border border-rule-strong px-3 py-2 text-[14px] font-semibold hover:bg-paper-raised"
          >
            Következő nap →
          </Link>
          <Link
            href={`/admin/naptar/uj?date=${date}`}
            className="rounded-[3px] border-[1.5px] border-stamp bg-stamp px-4 py-2 text-[14px] font-semibold text-[#fbf8ef]"
          >
            + Új időpont
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {!appointments || appointments.length === 0 ? (
          <p className="p-8 text-center text-[15px] text-ink-soft">
            Ezen a napon még nincs felvett időpont.
          </p>
        ) : (
          <div>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="grid grid-cols-[70px_1fr_auto] items-center gap-4 border-t border-rule px-5 py-3.5 first:border-t-0"
              >
                <time className="text-[15px] font-semibold tabular-nums text-ink-soft">
                  {new Intl.DateTimeFormat("hu-HU", {
                    timeZone: business.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(appt.starts_at))}
                </time>
                <div className="text-[15px]">
                  <b className="font-semibold">{appt.customers?.name}</b>
                  <span className="text-ink-soft"> · {appt.services?.name}</span>
                  {showEmployeeColumn && (
                    <span className="ml-2 text-[12.5px] text-ink-faint">{appt.employees?.name}</span>
                  )}
                  {appt.notes && <div className="text-[13px] text-ink-faint">{appt.notes}</div>}
                </div>
                <div className="flex items-center gap-2.5">
                  <Pill tone={appt.status === "confirmed" ? "confirm" : "pending"}>
                    {STATUS_LABEL[appt.status as AppointmentStatus]}
                  </Pill>
                  <form action={updateAppointmentStatusAction}>
                    <input type="hidden" name="appointmentId" value={appt.id} />
                    <input type="hidden" name="date" value={date} />
                    <input
                      type="hidden"
                      name="status"
                      value={appt.status === "cancelled" ? "scheduled" : "cancelled"}
                    />
                    <button
                      type="submit"
                      className="text-[13px] font-semibold text-ink-faint underline decoration-dotted hover:text-stamp"
                    >
                      {appt.status === "cancelled" ? "Visszaállítás" : "Lemondás"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
