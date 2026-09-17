import { getCurrentBusiness } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

type CustomerListRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  appointments: { starts_at: string }[];
};

export default async function UgyfelekPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: customersData } = await supabase
    .from("customers")
    .select("id, name, email, phone, notes, appointments(starts_at)")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  const customers = (customersData ?? []) as unknown as CustomerListRow[];

  const rows = customers.map((customer) => {
    const visits = customer.appointments ?? [];
    const lastVisit = visits.length
      ? visits.reduce((latest, v) => (v.starts_at > latest ? v.starts_at : latest), visits[0].starts_at)
      : null;
    return { ...customer, visitCount: visits.length, lastVisit };
  });

  return (
    <div>
      <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Ügyfelek</p>
      <h1 className="mb-6 mt-1 font-display text-[26px] font-bold">Ügyféllista</h1>

      <Card className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-[15px] text-ink-soft">
            Még nincs egyetlen ügyfeled sem — az első időpont felvételekor automatikusan bekerül ide.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14.5px]">
              <thead>
                <tr className="border-b-2 border-ink text-left">
                  <th className="px-5 py-3 font-semibold">Név</th>
                  <th className="px-5 py-3 font-semibold">Elérhetőség</th>
                  <th className="px-5 py-3 text-center font-semibold">Foglalások</th>
                  <th className="px-5 py-3 font-semibold">Legutóbbi látogatás</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => (
                  <tr key={customer.id} className="border-t border-rule">
                    <td className="px-5 py-3 font-semibold">
                      {customer.name}
                      {customer.visitCount > 1 && (
                        <span className="ml-2 rounded-full bg-confirm-soft px-2 py-0.5 text-[11px] font-bold text-confirm">
                          visszatérő
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {customer.email}
                      {customer.email && customer.phone && " · "}
                      {customer.phone}
                    </td>
                    <td className="px-5 py-3 text-center tabular-nums">{customer.visitCount}</td>
                    <td className="px-5 py-3 tabular-nums text-ink-soft">
                      {customer.lastVisit
                        ? new Intl.DateTimeFormat("hu-HU", {
                            timeZone: business.timezone,
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(customer.lastVisit))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
