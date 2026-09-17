import { getCurrentBusiness } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";
import { BusinessHoursForm } from "@/components/admin/business-hours-form";
import { ClosuresPanel } from "@/components/admin/closures-panel";
import { Card } from "@/components/ui/card";

export default async function BeallitasokPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ data: hours }, { data: closures }] = await Promise.all([
    supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", business.id)
      .is("employee_id", null),
    supabase
      .from("closures")
      .select("*")
      .eq("business_id", business.id)
      .is("employee_id", null)
      .order("starts_at", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Beállítások</p>
      <h1 className="mb-6 mt-1 font-display text-[26px] font-bold">Vállalkozás &amp; emlékeztető</h1>

      <Card className="mb-8 p-6">
        <SettingsForm business={business} />
      </Card>

      <h2 className="mb-3 font-display text-[19px] font-bold">Nyitvatartás</h2>
      <Card className="mb-8 p-6">
        <BusinessHoursForm hours={hours ?? []} />
      </Card>

      <h2 className="mb-3 font-display text-[19px] font-bold">Szabadság / zárvatartás</h2>
      <Card className="p-6">
        <ClosuresPanel closures={closures ?? []} timezone={business.timezone} />
      </Card>
    </div>
  );
}
