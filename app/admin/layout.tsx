import { getCurrentBusiness } from "@/lib/data/business";
import { AdminNav } from "@/components/admin/admin-nav";
import { trialDaysLeft } from "@/lib/billing/seat-price";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  const isTrialing = business.subscription_status === "trialing";
  const daysLeft = trialDaysLeft(business.trial_ends_at);
  const trialExpired = isTrialing && daysLeft <= 0;

  return (
    <div className="min-h-screen">
      <AdminNav businessName={business.name} />

      {isTrialing && (
        <div
          className={`px-5 py-2.5 text-center text-[13.5px] font-semibold ${
            trialExpired ? "bg-stamp-soft text-stamp" : "bg-confirm-soft text-confirm"
          }`}
        >
          {trialExpired
            ? "Lejárt a 14 napos próbaidőd. Válts fizetős előfizetésre a Beállításoknál a folytatáshoz."
            : `A próbaidődből még ${daysLeft} nap van hátra — utána ${business.employee_count} × 3 000 Ft = ${
                business.employee_count * 3000
              } Ft/hó.`}
        </div>
      )}

      <main className="mx-auto max-w-[1080px] px-5 py-8">{children}</main>
    </div>
  );
}
