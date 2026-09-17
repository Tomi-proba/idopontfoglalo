export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Ez a rendszer még nincs összekötve az adatbázissal — a fiók létrehozásához előbb be kell állítani a Supabase-t (lásd a README-t), utána tud csak működni a regisztráció.";
