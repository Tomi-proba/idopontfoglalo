import { getCurrentBusiness } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";
import { toggleEmployeeActiveAction } from "@/lib/actions/employees";
import { NewEmployeeForm } from "@/components/admin/new-employee-form";
import { Card } from "@/components/ui/card";

export default async function DolgozokPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, active")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  const activeCount = (employees ?? []).filter((e) => e.active).length;

  return (
    <div>
      <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Dolgozók</p>
      <h1 className="mt-1 font-display text-[26px] font-bold">Dolgozói naptárak</h1>
      <p className="mb-6 mt-1.5 text-[14.5px] text-ink-soft">
        {activeCount} / {business.employee_count} naptár aktív. A csapatméretet a Beállításoknál módosíthatod,
        ez határozza meg a havi díjat is.
      </p>

      <Card className="mb-6 overflow-hidden p-0">
        {(employees ?? []).map((employee) => (
          <div
            key={employee.id}
            className="flex items-center justify-between gap-4 border-t border-rule px-5 py-3.5 first:border-t-0"
          >
            <span className={`font-semibold ${employee.active ? "" : "text-ink-faint line-through"}`}>
              {employee.name}
            </span>
            <form action={toggleEmployeeActiveAction}>
              <input type="hidden" name="employeeId" value={employee.id} />
              <input type="hidden" name="active" value={String(employee.active)} />
              <button
                type="submit"
                className="text-[13px] font-semibold text-ink-faint underline decoration-dotted hover:text-stamp"
              >
                {employee.active ? "Inaktiválás" : "Visszaaktiválás"}
              </button>
            </form>
          </div>
        ))}
      </Card>

      {activeCount < business.employee_count ? (
        <Card className="p-5">
          <NewEmployeeForm />
        </Card>
      ) : (
        <p className="text-[13.5px] text-ink-faint">
          Elérted a csapatméretedet ({business.employee_count} fő). Inaktiválj egy dolgozót, vagy növeld a
          létszámot a Beállításoknál egy új naptár felvételéhez.
        </p>
      )}
    </div>
  );
}
