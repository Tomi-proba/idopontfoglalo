"use client";

import { useState } from "react";
import { Card, Pill } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PersonaKey = "fodrasz" | "kozmetika" | "masszor";
type Tone = "barati" | "formalis";

interface ScheduleSlot {
  time: string;
  name: string;
  service: string;
  status: "confirmed" | "pending";
  isDemo?: boolean;
}

interface Persona {
  label: string;
  biz: string;
  day: string;
  nev: string;
  ido: string;
  szolgaltatas: string;
  schedule: ScheduleSlot[];
}

const PERSONAS: Record<PersonaKey, Persona> = {
  fodrasz: {
    label: "Fodrász",
    biz: "Cinke Fodrászat",
    day: "Csütörtök",
    nev: "Kovács Anna",
    ido: "csütörtök, 14:30",
    szolgaltatas: "Hajvágás + festés",
    schedule: [
      { time: "09:00", name: "Szabó Eszter", service: "Vágás", status: "confirmed" },
      { time: "11:00", name: "Papp Zoltán", service: "Szakállvágás", status: "confirmed" },
      { time: "14:30", name: "Kovács Anna", service: "Hajvágás + festés", status: "pending", isDemo: true },
      { time: "16:00", name: "Fekete Réka", service: "Melír", status: "confirmed" },
    ],
  },
  kozmetika: {
    label: "Kozmetikus",
    biz: "Bőrbarát Kozmetika",
    day: "Péntek",
    nev: "Nagy Petra",
    ido: "péntek, 10:00",
    szolgaltatas: "Arckezelés",
    schedule: [
      { time: "09:00", name: "Varga Ildikó", service: "Szemöldökformázás", status: "confirmed" },
      { time: "10:00", name: "Nagy Petra", service: "Arckezelés", status: "pending", isDemo: true },
      { time: "12:30", name: "Kis Dóra", service: "Gyantázás", status: "confirmed" },
      { time: "15:00", name: "Oláh Zsófia", service: "Arckezelés", status: "confirmed" },
    ],
  },
  masszor: {
    label: "Masszőr",
    biz: "Nyugalom Masszázsstúdió",
    day: "Szerda",
    nev: "Tóth Gábor",
    ido: "szerda, 17:00",
    szolgaltatas: "Svéd masszázs",
    schedule: [
      { time: "13:00", name: "Balogh Imre", service: "Talpmasszázs", status: "confirmed" },
      { time: "15:00", name: "Simon Judit", service: "Sportmasszázs", status: "confirmed" },
      { time: "17:00", name: "Tóth Gábor", service: "Svéd masszázs", status: "pending", isDemo: true },
      { time: "18:30", name: "Kovács Bence", service: "Talpmasszázs", status: "confirmed" },
    ],
  },
};

const TEMPLATES: Record<Tone, string> = {
  barati: "Szia {nev}! 😊 Várunk {ido}-kor: {szolgaltatas}. Szólj nyugodtan, ha közbejön valami!",
  formalis:
    "Tisztelt {nev}! Tájékoztatjuk, hogy időpontja {ido} órakor kezdődik — {szolgaltatas}. Kérjük, esetleges lemondását előre jelezze.",
};

function renderMessage(persona: Persona, tone: Tone) {
  const parts = TEMPLATES[tone].split(/(\{nev\}|\{ido\}|\{szolgaltatas\})/g);
  return parts.map((part, i) => {
    if (part === "{nev}") return <mark key={i} className="rounded bg-stamp-soft px-1 font-semibold text-stamp">{persona.nev}</mark>;
    if (part === "{ido}") return <mark key={i} className="rounded bg-stamp-soft px-1 font-semibold text-stamp">{persona.ido}</mark>;
    if (part === "{szolgaltatas}") return <mark key={i} className="rounded bg-stamp-soft px-1 font-semibold text-stamp">{persona.szolgaltatas}</mark>;
    return <span key={i}>{part}</span>;
  });
}

export function DemoSection() {
  const [personaKey, setPersonaKey] = useState<PersonaKey>("fodrasz");
  const [tone, setTone] = useState<Tone>("barati");
  const [confirmed, setConfirmed] = useState(false);
  const persona = PERSONAS[personaKey];

  return (
    <section id="demo" className="py-14">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-8 max-w-[60ch]">
          <p className="text-[12.5px] font-bold uppercase tracking-wider text-stamp">Élő demó</p>
          <h2 className="mt-2.5 font-display text-[clamp(24px,3vw,32px)] font-bold">
            Ugyanaz a rendszer, más-más iparágra szabva.
          </h2>
          <p className="mt-2.5 text-ink-soft">
            Válassz vállalkozás-típust és hangnemet — nézd meg, hogyan alakul a naptár és az emlékeztető email
            élesben.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2.5">
          <div className="inline-flex overflow-hidden rounded-full border border-rule-strong">
            {(Object.keys(PERSONAS) as PersonaKey[]).map((key, i) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPersonaKey(key);
                  setConfirmed(false);
                }}
                aria-pressed={personaKey === key}
                className={`px-4 py-2 text-[13.5px] font-semibold ${i > 0 ? "border-l border-rule-strong" : ""} ${
                  personaKey === key ? "bg-ink text-paper-raised-2" : "text-ink-soft"
                }`}
              >
                {PERSONAS[key].label}
              </button>
            ))}
          </div>
          <div className="inline-flex overflow-hidden rounded-full border border-rule-strong">
            {(["barati", "formalis"] as Tone[]).map((key, i) => (
              <button
                key={key}
                type="button"
                onClick={() => setTone(key)}
                aria-pressed={tone === key}
                className={`px-4 py-2 text-[13.5px] font-semibold ${i > 0 ? "border-l border-rule-strong" : ""} ${
                  tone === key ? "bg-ink text-paper-raised-2" : "text-ink-soft"
                }`}
              >
                {key === "barati" ? "Baráti hangnem" : "Formális hangnem"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-7 md:grid-cols-2">
          <Card className="p-5">
            <div className="mb-3.5 flex items-baseline justify-between">
              <h3 className="font-display text-[16.5px] font-bold">{persona.biz}</h3>
              <span className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-faint">
                {persona.day}
              </span>
            </div>
            <div>
              {persona.schedule.map((slot) => {
                const isConfirmed = slot.isDemo ? confirmed : slot.status === "confirmed";
                return (
                  <div
                    key={slot.time}
                    className={`grid grid-cols-[52px_1fr_auto] items-center gap-3 border-t border-rule py-2.5 first:border-t-0 ${
                      slot.isDemo ? "-mx-3 rounded-[3px] border-t-transparent bg-stamp-soft px-3" : ""
                    }`}
                  >
                    <time className="text-[14px] font-semibold tabular-nums text-ink-soft">{slot.time}</time>
                    <div className="text-[14.5px]">
                      <b className="font-semibold">{slot.name}</b>
                      <small className="block text-[12.5px] text-ink-faint">{slot.service}</small>
                    </div>
                    <Pill tone={isConfirmed ? "confirm" : "pending"}>
                      {isConfirmed ? "Visszaigazolva" : "Vár"}
                    </Pill>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-dashed border-rule-strong bg-paper-raised-2 px-5 py-3.5 text-[12.5px] text-ink-faint">
              Emlékeztető előnézet — kimenő email
              <div className="mt-0.5 text-[14px] font-bold text-ink">Tárgy: Emlékeztető a holnapi időpontodról</div>
            </div>
            <div className="min-h-[118px] px-5 pb-2 pt-5 text-[15.5px] leading-[1.65]">
              {renderMessage(persona, tone)}
            </div>
            <div className="mt-2.5 flex gap-2.5 border-t border-rule px-5 py-4">
              <Button type="button" onClick={() => setConfirmed(true)} className="px-4 py-2.5 text-[14px]">
                Visszaigazolom, jövök
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmed(false)}
                className="px-4 py-2.5 text-[14px]"
              >
                Vissza várakozóra
              </Button>
            </div>
            <p className="px-5 pb-4 text-[12.5px] text-ink-faint">
              Ezt a szöveget a vállalkozás tulajdonosa írja meg a beállításokban — a rendszer csak a {"{név}"},{" "}
              {"{időpont}"}, {"{szolgáltatás}"} adatokat helyettesíti be. Minden dolgozónak saját naptára van, a
              csapatméretig.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
