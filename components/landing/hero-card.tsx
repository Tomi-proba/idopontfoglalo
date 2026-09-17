"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HeroCard() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="relative rounded-[2px] border border-rule bg-paper-raised p-6 pb-5 shadow-[0_1px_0_rgba(42,36,28,0.06),0_8px_20px_-12px_rgba(42,36,28,0.35)]">
      <span
        aria-hidden
        className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-rule-strong bg-paper"
      />
      <div
        className={`absolute right-[22px] top-5 rounded border-[2.5px] border-confirm px-2.5 py-1 font-display text-[13px] font-black tracking-wide text-confirm transition-all duration-300 ${
          confirmed ? "rotate-[-9deg] scale-100 opacity-100" : "rotate-[-9deg] scale-0 opacity-0"
        }`}
      >
        VISSZAIGAZOLVA
      </div>

      <div className="mb-3.5 flex items-start justify-between gap-2.5">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-wide text-ink-faint">
            Időpont-kártya
          </div>
          <div className="mt-0.5 font-display text-[17px] font-bold">Cinke Fodrászat</div>
        </div>
        <Pill tone={confirmed ? "confirm" : "pending"}>
          {confirmed ? "Visszaigazolva" : "Vár visszaigazolásra"}
        </Pill>
      </div>

      <div className="mb-0.5 font-hand text-[30px] font-bold leading-none">Kovács Anna</div>
      <div className="text-[14.5px] text-ink-soft">
        <b className="font-semibold text-ink">Csütörtök, 14:30</b> · Hajvágás + festés
      </div>

      <div className="mt-4 border-t border-dashed border-rule-strong pt-3.5 text-[13.5px] text-ink-soft">
        Tárgy: Emlékeztető a holnapi időpontról
        <br />
        Szia <mark className="rounded bg-stamp-soft px-1 font-semibold text-stamp">Kovács Anna</mark>! Várunk{" "}
        <mark className="rounded bg-stamp-soft px-1 font-semibold text-stamp">csütörtökön, 14:30</mark>-kor:{" "}
        <mark className="rounded bg-stamp-soft px-1 font-semibold text-stamp">Hajvágás + festés</mark>. Szólj, ha
        közbejön valami!
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => setConfirmed((c) => !c)}
        className="mt-4 w-full justify-center text-[13.5px]"
      >
        {confirmed ? "Vissza várakozóra" : "Kipróbálom: visszaigazolom"}
      </Button>
    </div>
  );
}
