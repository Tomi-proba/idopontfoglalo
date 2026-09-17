"use client";

import { useActionState } from "react";
import { createEmployeeAction, type EmployeeActionState } from "@/lib/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

const initialState: EmployeeActionState = {};

export function NewEmployeeForm() {
  const [state, formAction, pending] = useActionState(createEmployeeAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-3">
      <Input type="text" name="name" placeholder="Új dolgozó neve" required className="max-w-xs" />
      <Button type="submit" disabled={pending} className="px-4 py-2.5 text-[14px]">
        {pending ? "Mentés…" : "Hozzáadás"}
      </Button>
      {state.error && <p className="w-full text-[13.5px] font-semibold text-stamp">{state.error}</p>}
    </form>
  );
}
