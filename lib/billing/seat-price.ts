export const SEAT_PRICE_HUF = 3000;
export const TRIAL_DAYS = 14;

export function monthlyPriceHuf(employeeCount: number): number {
  return employeeCount * SEAT_PRICE_HUF;
}

export function formatHuf(amount: number): string {
  return `${amount.toLocaleString("hu-HU")} Ft`;
}

export function trialDaysLeft(trialEndsAt: string): number {
  const diffMs = new Date(trialEndsAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
