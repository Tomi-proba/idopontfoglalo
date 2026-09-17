import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureBusinessForUser } from "@/lib/actions/business";

// A Supabase Auth ide irányítja vissza a felhasználót az email-linkes
// belépés / email-megerősítés után. A `code`-ot session-re váltjuk,
// majd ha még nincs businesses sora, létrehozzuk a signUp-kor eltárolt
// user_metadata (company_name, employee_count) alapján.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureBusinessForUser(
        supabase,
        data.user.id,
        data.user.email ?? "",
        data.user.user_metadata as { company_name?: string; employee_count?: number },
      );
      return NextResponse.redirect(`${origin}/admin`);
    }
  }

  return NextResponse.redirect(`${origin}/bejelentkezes?error=auth`);
}
