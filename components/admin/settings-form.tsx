"use client";

import { useActionState, useState } from "react";
import { updateBusinessSettingsAction, type SettingsActionState } from "@/lib/actions/settings";
import { renderReminderTemplate } from "@/lib/reminders/template-engine";
import { monthlyPriceHuf, formatHuf } from "@/lib/billing/seat-price";
import { Button } from "@/components/ui/button";
import { Field, Label, Input, Textarea } from "@/components/ui/field";
import type { Business } from "@/types/database";

const initialState: SettingsActionState = {};

export function SettingsForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState(updateBusinessSettingsAction, initialState);
  const [template, setTemplate] = useState(business.reminder_template);
  const [employeeCount, setEmployeeCount] = useState(business.employee_count);

  const preview = renderReminderTemplate(template, {
    customerName: "Kovács Anna",
    formattedTime: "csütörtök 14:30",
    serviceName: "Hajvágás",
  });

  return (
    <form action={formAction}>
      <Field>
        <Label htmlFor="name">Cég / vállalkozás neve</Label>
        <Input type="text" id="name" name="name" defaultValue={business.name} required />
      </Field>

      <Field>
        <Label htmlFor="reminderTemplate">Emlékeztető sablon-szövege</Label>
        <Textarea
          id="reminderTemplate"
          name="reminderTemplate"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          required
          className="min-h-[100px]"
        />
        <p className="mt-1.5 text-[12.5px] text-ink-faint">
          Használható változók: {"{név}"}, {"{időpont}"}, {"{szolgáltatás}"}
        </p>
        <div className="mt-2.5 rounded-[3px] border border-dashed border-rule-strong bg-paper-raised-2 p-3 text-[14px]">
          <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
            Élő előnézet
          </span>
          {preview}
        </div>
      </Field>

      <Field>
        <Label htmlFor="reminderHoursBefore">Emlékeztető ennyi órával az időpont előtt menjen ki</Label>
        <Input
          type="number"
          id="reminderHoursBefore"
          name="reminderHoursBefore"
          min={1}
          max={168}
          defaultValue={business.reminder_hours_before}
          required
          className="max-w-[120px]"
        />
      </Field>

      <Field>
        <Label htmlFor="employeeCount">Csapatméret (naptárak száma)</Label>
        <Input
          type="number"
          id="employeeCount"
          name="employeeCount"
          min={1}
          max={30}
          value={employeeCount}
          onChange={(e) => setEmployeeCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
          required
          className="max-w-[120px]"
        />
        <p className="mt-1.5 text-[12.5px] text-ink-faint">
          {business.subscription_status === "trialing"
            ? `A próba után: ${formatHuf(monthlyPriceHuf(employeeCount))}/hó.`
            : `Havidíjad ${formatHuf(monthlyPriceHuf(employeeCount))}/hó lesz a mentés után.`}
        </p>
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Mentés…" : "Beállítások mentése"}
      </Button>

      {state.error && <p className="mt-3 text-[13.5px] font-semibold text-stamp">{state.error}</p>}
      {state.saved && <p className="mt-3 text-[13.5px] font-semibold text-confirm">Elmentve.</p>}
    </form>
  );
}
