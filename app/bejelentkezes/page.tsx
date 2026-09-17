import Link from "next/link";
import { LoginForm } from "@/components/landing/login-form";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="mb-8 font-display text-2xl font-black">
        Cetli<span className="text-stamp">.</span>
      </Link>
      <h1 className="mb-2 font-display text-2xl font-bold">Belépés</h1>
      <p className="mb-6 text-[15px] text-ink-soft">
        Lépj be a saját admin felületedre.
      </p>
      {!configured && (
        <div className="mb-4 rounded-[3px] border border-dashed border-stamp bg-stamp-soft px-4 py-3 text-[13.5px] font-semibold text-stamp">
          Ez a verzió még nincs összekötve az adatbázissal (Supabase) — a belépés
          egyelőre nem fog működni. Lásd a README-t a beállításhoz.
        </div>
      )}
      <Card className="p-6">
        <LoginForm />
      </Card>
      <p className="mt-6 text-[14px] text-ink-soft">
        Még nincs fiókod?{" "}
        <Link href="/#kezdes" className="font-semibold text-stamp">
          Indítsd el az ingyenes próbát
        </Link>
      </p>
    </main>
  );
}
