"use client";

import { useActionState } from "react";
import { createClosureAction, deleteClosureAction, type ClosureActionState } from "@/lib/actions/closures";
import { Button } from "@/components/ui/button";
import { Field, Label, Input } from "@/components/ui/field";
import type { Closure } from "@/types/database";

const initialState: ClosureActionState = {};

export function ClosuresPanel({ closures, timezone }: { closures: Closure[]; timezone: string }) {
  const [state, formAction, pending] = useActionState(createClosureAction, initialState);

  return (
    <div>
      {closures.length > 0 && (
        <div className="mb-5 divide-y divide-rule border-y border-rule">
          {closures.map((closure) => (
            <div key={closure.id} className="flex items-center justify-between gap-3 py-2.5 text-[14.5px]">
              <span>
                {new Intl.DateTimeFormat("hu-HU", { timeZone: timezone, month: "short", day: "numeric" }).format(
                  new Date(closure.starts_at),
                )}{" "}
                –{" "}
                {new Intl.DateTimeFormat("hu-HU", { timeZone: timezone, month: "short", day: "numeric" }).format(
                  new Date(new Date(closure.ends_at).getTime() - 86400000),
                )}
                {closure.reason && <span className="text-ink-soft"> · {closure.reason}</span>}
              </span>
              <form action={deleteClosureAction}>
                <input type="hidden" name="closureId" value={closure.id} />
                <button
                  type="submit"
                  className="text-[13px] font-semibold text-ink-faint underline decoration-dotted hover:text-stamp"
                >
                  Törlés
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end">
        <Field className="mb-0">
          <Label htmlFor="startDate">Kezdő nap</Label>
          <Input type="date" id="startDate" name="startDate" required />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="endDate">Utolsó nap</Label>
          <Input type="date" id="endDate" name="endDate" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="reason">Indok (opcionális)</Label>
          <Input type="text" id="reason" name="reason" placeholder="pl. nyaralás" />
        </Field>
        <Button type="submit" disabled={pending} className="px-4 py-2.5 text-[14px]">
          {pending ? "Mentés…" : "Hozzáadás"}
        </Button>
      </form>
      {state.error && <p className="mt-2 text-[13.5px] font-semibold text-stamp">{state.error}</p>}
    </div>
  );
}
