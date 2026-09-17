import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Szerver oldali kliens a bejelentkezett felhasználó nevében (RLS aktív).
 * Server Component / Server Action / Route Handler kontextusban használható.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component-ből hívva a cookie-írás nem megengedett —
            // middleware.ts gondoskodik a session frissítéséről.
          }
        },
      },
    },
  );
}

/**
 * Service-role kliens: RLS-t megkerülő, csak megbízható szerver-only
 * útvonalakon használható (cron job-ok, a visszaigazolás-endpoint).
 * SOHA nem szabad kliens oldali kódba kerülnie.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
