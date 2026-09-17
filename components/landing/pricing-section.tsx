"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { monthlyPriceHuf, formatHuf } from "@/lib/billing/seat-price";

const FEATURES = [
  "Nyitvatartás — cég- és dolgozói szinten",
  "Szabadság / zárvatartás kezelése",
  "Automatikus emlékeztető email",
  "Igen / nem visszaigazolás",
  "Több dolgozós naptár-kezelés",
  "Automatikus várólista-kitöltés",
  "Visszatérő ügyfél-emlékeztető",
  "Ügyfél-előzmény",
  "Értékelés-kérés (Google)",
  "Dolgozónkénti ügyfél-értékelés",
  "Dolgozónkénti teljesítmény-statisztika",
  "Havi összesített statisztika",
];

const CHIPS = [
  { seats: 1, label: "1 fő — egyéni vállalkozó" },
  { seats: 3, label: "3 fős szalon" },
  { seats: 5, label: "5 fős stúdió" },
];

export function PricingSection() {
  const [seats, setSeats] = useState(1);
  const total = monthlyPriceHuf(seats);

  return (
    <section id="arak" className="py-14">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-8 max-w-[60ch]">
          <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Árazás</p>
          <h2 className="mt-2.5 font-display text-[clamp(24px,3vw,32px)] font-bold">
            3.000 Ft / hó / fő — minden funkció mindenkinek.
          </h2>
          <p className="mt-2.5 text-ink-soft">
            Nincsenek csomagszintek. Amit a rendszer tud, azt minden előfizető megkapja — az ár kizárólag attól
            függ, hány dolgozói naptárra van szükséged. Regisztrációkor egyszer megadod a csapatméretet, ez lesz a
            naptárak felső határa is.
          </p>
        </div>

        <div className="grid items-start gap-7 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4.5 flex flex-wrap items-center justify-between gap-3.5">
              <span className="font-display text-[17px] font-bold">Hány fős a csapatod?</span>
              <div className="inline-flex items-center overflow-hidden rounded-full border border-rule-strong">
                <button
                  type="button"
                  aria-label="Eggyel kevesebb fő"
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  className="h-[34px] w-[34px] bg-paper-raised-2 text-lg font-bold hover:bg-stamp-soft hover:text-stamp"
                >
                  –
                </button>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                  className="h-[34px] w-12 border-x border-rule-strong bg-paper-raised text-center text-[15px] font-bold tabular-nums"
                />
                <button
                  type="button"
                  aria-label="Eggyel több fő"
                  onClick={() => setSeats((s) => Math.min(30, s + 1))}
                  className="h-[34px] w-[34px] bg-paper-raised-2 text-lg font-bold hover:bg-stamp-soft hover:text-stamp"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip.seats}
                  type="button"
                  onClick={() => setSeats(chip.seats)}
                  className="rounded-full border border-rule-strong px-3.5 py-1.5 text-[13px] font-semibold text-ink-soft hover:border-stamp hover:text-stamp"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="border-t border-dashed border-rule-strong pt-4">
              <div className="mb-2 flex justify-between text-[14.5px] tabular-nums text-ink-soft">
                <span>
                  {seats} dolgozói naptár × {formatHuf(3000)}
                </span>
                <span>{formatHuf(total)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-rule pt-2.5 font-display text-[22px] font-bold tabular-nums">
                <span>Havidíj összesen</span>
                <span>{formatHuf(total)}/hó</span>
              </div>
            </div>

            <Link
              href="#kezdes"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[3px] border-[1.5px] border-stamp bg-stamp px-5 py-3 text-[15.5px] font-semibold text-[#fbf8ef] transition-transform hover:-translate-y-px"
            >
              2 hét ingyenes próba indítása
            </Link>
            <p className="mt-3 text-[12.5px] text-ink-faint">
              Bankkártya nem szükséges a próbához. Ha bővül a csapatod, a létszámot bármikor módosíthatod az admin
              felületen — a díj automatikusan követi.
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 font-display text-[17px] font-bold">Minden előfizetésben benne van</div>
            <ul className="grid grid-cols-1 gap-x-4.5 gap-y-2.5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="relative pl-5.5 text-[14.5px] text-ink-soft">
                  <span className="absolute left-0 top-0 font-bold text-confirm">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
