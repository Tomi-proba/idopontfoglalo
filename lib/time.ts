// Az admin felület a vállalkozás saját időzónájában (business.timezone)
// mutat és kér be minden dátumot/időt, az adatbázisban viszont mindig UTC
// timestamptz-ként tároljuk. Ez a segédfüggvény alakítja át a helyi
// "2026-09-20" + "14:30" bevitelt a megfelelő UTC pillanattá.
export function zonedTimeToUtcIso(dateStr: string, timeStr: string, timeZone: string): string {
  const naive = new Date(`${dateStr}T${timeStr}:00Z`);
  const asIfUtc = new Date(naive.toLocaleString("en-US", { timeZone: "UTC" }));
  const asIfZoned = new Date(naive.toLocaleString("en-US", { timeZone }));
  const offsetMs = asIfUtc.getTime() - asIfZoned.getTime();
  return new Date(naive.getTime() + offsetMs).toISOString();
}

export function todayInZone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("hu-HU", { weekday: "long", month: "long", day: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}
