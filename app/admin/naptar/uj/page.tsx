import Link from "next/link";
import { getCurrentBusiness } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";
import { todayInZone } from "@/lib/time";
import { AppointmentForm } from "@/components/admin/appointment-form";
import { Card } from "@/components/ui/card";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayInZone(business.timezone);

  const [{ data: employees }, { data: services }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("services")
      .select("name")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("name", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/admin/naptar?date=${date}`} className="text-[14px] font-semibold text-ink-soft hover:text-ink">
        ← Vissza a naptárhoz
      </Link>
      <h1 className="mb-6 mt-2 font-display text-[26px] font-bold">Új időpont felvétele</h1>
      <Card className="p-6">
        <AppointmentForm
          date={date}
          employees={employees ?? []}
          serviceNames={(services ?? []).map((s) => s.name)}
        />
      </Card>
    </div>
  );
}
