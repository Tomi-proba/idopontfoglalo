"use client";

import { useActionState, useState } from "react";
import { signUpAction, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Label, Input } from "@/components/ui/field";
import { monthlyPriceHuf, formatHuf } from "@/lib/billing/seat-price";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [loginMode, setLoginMode] = useState<"password" | "magic">("password");
  const [seats, setSeats] = useState(1);

  if (state.info) {
    return (
      <div className="p-8 text-center">
        <span className="mb-4 inline-block -rotate-6 rounded border-[2.5px] border-confirm px-3.5 py-2 font-display text-[15px] font-black tracking-wide text-confirm">
          MÉG EGY LÉPÉS
        </span>
        <h3 className="mb-2 font-display text-[22px] font-bold">Ellenőrizd az email fiókodat</h3>
        <p className="text-ink-soft">{state.info}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="p-6">
      <Field>
        <Label htmlFor="company">Cég / vállalkozás neve</Label>
        <Input type="text" id="company" name="company" required />
      </Field>
      <Field>
        <Label htmlFor="email">Email cím</Label>
        <Input type="email" id="email" name="email" required />
      </Field>

      <Field>
        <Label>Belépés módja</Label>
        <div className="inline-flex overflow-hidden rounded-full border border-rule-strong">
          <button
            type="button"
            onClick={() => setLoginMode("password")}
            aria-pressed={loginMode === "password"}
            className={`px-4 py-2 text-[13.5px] font-semibold ${loginMode === "password" ? "bg-ink text-paper-raised-2" : "text-ink-soft"}`}
          >
            Jelszóval
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("magic")}
            aria-pressed={loginMode === "magic"}
            className={`border-l border-rule-strong px-4 py-2 text-[13.5px] font-semibold ${loginMode === "magic" ? "bg-ink text-paper-raised-2" : "text-ink-soft"}`}
          >
            Email-linkkel
          </button>
        </div>
        <input type="hidden" name="loginMode" value={loginMode} />
      </Field>

      {loginMode === "password" ? (
        <Field>
          <Label htmlFor="password">Jelszó</Label>
          <Input type="password" id="password" name="password" minLength={8} required />
        </Field>
      ) : (
        <p className="-mt-2 mb-4 text-[12.5px] text-ink-faint">
          Jelszó helyett egy belépő linket küldünk erre az email címre — arra kattintva léphetsz be, jelszó
          megadása nélkül.
        </p>
      )}

      <Field>
        <Label htmlFor="employeeCount">Hány fős a csapatod?</Label>
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
            id="employeeCount"
            name="employeeCount"
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
        <p className="mt-2 text-[12.5px] text-ink-faint">
          {seats} dolgozói naptár — a próba után {formatHuf(monthlyPriceHuf(seats))}/hó. A 14 napos próbaidő alatt
          ingyenes.
        </p>
      </Field>

      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Fiók létrehozása…" : "Fiók létrehozása — próba indítása"}
      </Button>

      {state.error && (
        <p className="mt-3 text-[13.5px] font-semibold text-stamp" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
