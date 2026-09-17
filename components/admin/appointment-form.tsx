"use client";

import { useActionState } from "react";
import { createAppointmentAction, type AppointmentActionState } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import { Field, Label, Input, Textarea } from "@/components/ui/field";

const initialState: AppointmentActionState = {};

export function AppointmentForm({
  date,
  employees,
  serviceNames,
}: {
  date: string;
  employees: { id: string; name: string }[];
  serviceNames: string[];
}) {
  const [state, formAction, pending] = useActionState(createAppointmentAction, initialState);

  return (
    <form action={formAction}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="customerName">Ügyfél neve</Label>
          <Input type="text" id="customerName" name="customerName" required />
        </Field>
        <Field>
          <Label htmlFor="customerEmail">Email cím</Label>
          <Input type="email" id="customerEmail" name="customerEmail" />
        </Field>
      </div>

      <Field>
        <Label htmlFor="serviceName">Szolgáltatás típusa</Label>
        <Input type="text" id="serviceName" name="serviceName" list="service-options" required />
        <datalist id="service-options">
          {serviceNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="date-input">Dátum</Label>
          <Input type="date" id="date-input" name="date" defaultValue={date} required />
        </Field>
        <Field>
          <Label htmlFor="time">Időpont</Label>
          <Input type="time" id="time" name="time" required />
        </Field>
      </div>

      {employees.length > 1 && (
        <Field>
          <Label htmlFor="employeeId">Dolgozó</Label>
          <select
            id="employeeId"
            name="employeeId"
            required
            className="w-full rounded-[3px] border border-rule-strong bg-paper-raised-2 px-3 py-2.5 text-[15px] text-ink"
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field>
        <Label htmlFor="notes">Megjegyzés (opcionális)</Label>
        <Textarea id="notes" name="notes" placeholder="pl. első alkalom" />
      </Field>

      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Mentés…" : "Időpont felvétele"}
      </Button>

      {state.error && (
        <p className="mt-3 text-[13.5px] font-semibold text-stamp" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
