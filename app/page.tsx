import Link from "next/link";
import { HeroCard } from "@/components/landing/hero-card";
import { DemoSection } from "@/components/landing/demo-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { SignupForm } from "@/components/landing/signup-form";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LandingPage() {
  const configured = isSupabaseConfigured();

  return (
    <>
      <header className="py-5.5">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-5">
          <div className="font-display text-[23px] font-black tracking-tight">
            Cetli<span className="text-stamp">.</span>
          </div>
          <nav className="flex flex-wrap items-center gap-6">
            <a href="#hogyan" className="text-[14.5px] font-semibold text-ink-soft hover:text-ink">
              Hogyan működik
            </a>
            <a href="#demo" className="text-[14.5px] font-semibold text-ink-soft hover:text-ink">
              Demó
            </a>
            <a href="#arak" className="text-[14.5px] font-semibold text-ink-soft hover:text-ink">
              Árak
            </a>
            <Link
              href="/bejelentkezes"
              className="text-[14.5px] font-semibold text-ink-soft hover:text-ink"
            >
              Belépés
            </Link>
            <a
              href="#kezdes"
              className="rounded-[3px] border-[1.5px] border-stamp bg-stamp px-4.5 py-2.5 text-[14px] font-semibold text-[#fbf8ef]"
            >
              Kezdd el ingyen
            </a>
          </nav>
        </div>
      </header>

      <main className="px-5">
        <section className="py-9.5 pb-15">
          <div className="mx-auto grid max-w-[1080px] items-center gap-14 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">
                Egyedi időpont-emlékeztető rendszer
              </p>
              <h1 className="my-3.5 font-display text-[clamp(30px,4.4vw,48px)] font-bold leading-[1.12]">
                Az emlékeztető, amit <em className="font-display italic font-semibold text-stamp">te</em>{" "}
                fogalmazol — nem egy robot.
              </h1>
              <p className="mb-6.5 max-w-[46ch] text-[17.5px] text-ink-soft">
                Testreszabott foglalás- és emlékeztető-rendszer fodrászoknak, kozmetikusoknak, körmösöknek,
                masszőröknek és magánrendelőknek. A szöveget a saját hangnemedben írod meg egyszer — a rendszer
                minden foglaláshoz automatikusan behelyettesíti a nevet, az időpontot, a szolgáltatást.
              </p>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-confirm-soft px-3 py-1.5 text-[12.5px] font-bold tracking-wide text-confirm">
                ✓ 2 hét ingyenes próba · nincs szükség bankkártyára
              </div>
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href="#kezdes"
                  className="inline-flex items-center gap-2 rounded-[3px] border-[1.5px] border-stamp bg-stamp px-5 py-3 text-[15.5px] font-semibold text-[#fbf8ef] transition-transform hover:-translate-y-px"
                >
                  Indítom az ingyenes próbát
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-[3px] border-[1.5px] border-ink px-5 py-3 text-[15.5px] font-semibold hover:bg-paper-raised"
                >
                  Megnézem működés közben ↓
                </a>
              </div>
              <p className="mt-5.5 text-[13.5px] text-ink-faint">
                Önkiszolgáló regisztráció — csapatmérettől függően 3.000 Ft/hó/fő, próba után.
              </p>
            </div>

            <HeroCard />
          </div>
        </section>

        <section id="hogyan" className="py-14">
          <div className="mx-auto max-w-[1080px]">
            <div className="mb-8 max-w-[60ch]">
              <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Hogyan működik</p>
              <h2 className="mt-2.5 font-display text-[clamp(24px,3vw,32px)] font-bold">
                Három lépés, amit a vállalkozásod már ma megérez.
              </h2>
              <p className="mt-2.5 text-ink-soft">
                Nincs mesterséges intelligencia, nincs bizonytalan „AI-hangnem" — egyszerű, megbízható
                szöveg-behelyettesítés a te saját sablonoddal.
              </p>
            </div>
            <div className="grid divide-y divide-rule border-y border-rule md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  num: "Első",
                  title: "Felveszed az időpontot",
                  body: "Ügyfél neve, szolgáltatás, időpont, egy opcionális megjegyzés — pár kattintás telefonon vagy tableten is.",
                },
                {
                  num: "Második",
                  title: "A rendszer időzít",
                  body: "A beállított idővel az időpont előtt (pl. 18 órával korábban) automatikusan összeállítja és kiküldi az emlékeztetőt — a te sablonodból.",
                },
                {
                  num: "Harmadik",
                  title: "Az ügyfél visszajelez",
                  body: "Egy kattintással megerősíti vagy lemondja az időpontot — te pedig azonnal látod a naptáradban, ki jön biztosan.",
                },
              ].map((step) => (
                <div key={step.num} className="p-6">
                  <div className="mb-2.5 font-display text-[15px] font-bold italic text-stamp">{step.num}</div>
                  <h3 className="mb-2 text-[18.5px] font-bold">{step.title}</h3>
                  <p className="text-[15px] text-ink-soft">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DemoSection />
        <PricingSection />

        <section id="kezdes" className="py-14">
          <div className="mx-auto grid max-w-[1080px] gap-11 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Kezdd el</p>
              <h2 className="mt-2.5 font-display text-[clamp(22px,3vw,28px)] font-bold">
                A fiókodat te magad hozod létre — nem én állítom be neked.
              </h2>
              <p className="mt-3 max-w-[38ch] text-[15.5px] text-ink-soft">
                Két perc az egész, és rögtön a saját admin felületeden vagy. A próbaidő alatt nem kérünk
                bankkártyát, és nem kell rám várnod.
              </p>
              <ul className="mt-5.5 flex flex-col gap-2.5">
                <li className="flex gap-2.5 text-[14.5px] text-ink-soft">
                  <b className="text-ink">1.</b> Megadod a vállalkozásod nevét és a csapatméretet.
                </li>
                <li className="flex gap-2.5 text-[14.5px] text-ink-soft">
                  <b className="text-ink">2.</b> Fiókot hozol létre — jelszóval, vagy belépő linkkel emailben.
                </li>
                <li className="flex gap-2.5 text-[14.5px] text-ink-soft">
                  <b className="text-ink">3.</b> Azonnal a saját admin felületeden vagy: nyitvatartás, dolgozók,
                  sablon-szöveg — minden a tiéd, most rögtön.
                </li>
              </ul>
            </div>

            {!configured && (
              <div className="mb-4 rounded-[3px] border border-dashed border-stamp bg-stamp-soft px-4 py-3 text-[13.5px] font-semibold text-stamp">
                Ez a verzió még nincs összekötve az adatbázissal (Supabase) — a fiók
                létrehozása egyelőre nem fog működni. Lásd a README-t a beállításhoz.
              </div>
            )}
            <Card className="p-0">
              <SignupForm />
            </Card>
          </div>
        </section>
      </main>

      <footer className="mt-5 border-t border-rule py-11.5">
        <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-3 px-5 text-[13px] text-ink-faint">
          <span>Cetli — egyedi időpont-emlékeztető rendszer kisvállalkozásoknak</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
}
