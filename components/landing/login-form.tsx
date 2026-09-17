"use client";

import { useActionState, useState } from "react";
import { signInAction, requestMagicLinkAction, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Label, Input } from "@/components/ui/field";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInAction,
    initialState,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    requestMagicLinkAction,
    initialState,
  );

  const state = mode === "password" ? passwordState : magicState;

  return (
    <div>
      <div className="mb-5 inline-flex overflow-hidden rounded-full border border-rule-strong">
        <button
          type="button"
          onClick={() => setMode("password")}
          aria-pressed={mode === "password"}
          className={`px-4 py-2 text-[13.5px] font-semibold ${mode === "password" ? "bg-ink text-paper-raised-2" : "text-ink-soft"}`}
        >
          Jelszóval
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          aria-pressed={mode === "magic"}
          className={`border-l border-rule-strong px-4 py-2 text-[13.5px] font-semibold ${mode === "magic" ? "bg-ink text-paper-raised-2" : "text-ink-soft"}`}
        >
          Email-linkkel
        </button>
      </div>

      {mode === "password" ? (
        <form action={passwordAction}>
          <Field>
            <Label htmlFor="email">Email cím</Label>
            <Input type="email" id="email" name="email" required />
          </Field>
          <Field>
            <Label htmlFor="password">Jelszó</Label>
            <Input type="password" id="password" name="password" required />
          </Field>
          <Button type="submit" disabled={passwordPending} className="w-full justify-center">
            {passwordPending ? "Belépés…" : "Belépek"}
          </Button>
        </form>
      ) : (
        <form action={magicAction}>
          <Field>
            <Label htmlFor="magic-email">Email cím</Label>
            <Input type="email" id="magic-email" name="email" required />
          </Field>
          <Button type="submit" disabled={magicPending} className="w-full justify-center">
            {magicPending ? "Küldés…" : "Belépő link küldése"}
          </Button>
        </form>
      )}

      {state.error && <p className="mt-3 text-[13.5px] font-semibold text-stamp">{state.error}</p>}
      {state.info && <p className="mt-3 text-[13.5px] font-semibold text-confirm">{state.info}</p>}
    </div>
  );
}
