// Egyszerű szöveg-behelyettesítés — nincs szükség külső AI-hívásra.
// A cégtulajdonos a {név}, {időpont}, {szolgáltatás} változókat használhatja
// a sablonjában, ezeket helyettesítjük be a foglalás adataival.

export interface ReminderContext {
  customerName: string;
  /** Már formázott, olvasható időpont, pl. "2026. szeptember 18., csütörtök 14:30" */
  formattedTime: string;
  serviceName: string;
}

const PLACEHOLDERS: Record<keyof ReminderContext, string> = {
  customerName: "{név}",
  formattedTime: "{időpont}",
  serviceName: "{szolgáltatás}",
};

export function renderReminderTemplate(template: string, context: ReminderContext): string {
  let result = template;
  (Object.keys(PLACEHOLDERS) as (keyof ReminderContext)[]).forEach((key) => {
    result = result.split(PLACEHOLDERS[key]).join(context[key]);
  });
  return result;
}

export function formatAppointmentTime(isoString: string, timezone: string): string {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export const DEFAULT_REMINDER_TEMPLATE =
  "Szia {név}! Szeretettel várunk {időpont}-kor: {szolgáltatás}. Ha közbejön valami, szólj nyugodtan!";
