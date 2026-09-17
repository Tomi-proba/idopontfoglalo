"use client";

import { useState } from "react";
import { updateBusinessHoursAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { DAY_NAMES } from "@/lib/constants";
import type { BusinessHours } from "@/types/database";

export function BusinessHoursForm({ hours }: { hours: BusinessHours[] }) {
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));
  const [closedDays, setClosedDays] = useState<Set<number>>(
    new Set(DAY_NAMES.map((_, day) => day).filter((day) => byDay.get(day)?.is_closed ?? day === 0)),
  );

  return (
    <form action={updateBusinessHoursAction}>
      <div className="divide-y divide-rule border-y border-rule">
        {DAY_NAMES.map((label, day) => {
          const row = byDay.get(day);
          const isClosed = closedDays.has(day);
          return (
            <div key={day} className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-3 py-2.5">
              <span className="text-[14.5px] font-semibold">{label}</span>
              <input
                type="time"
                name={`open-${day}`}
                defaultValue={row?.open_time?.slice(0, 5) ?? "09:00"}
                disabled={isClosed}
                className="rounded-[3px] border border-rule-strong bg-paper-raised-2 px-2 py-1.5 text-[14px] disabled:opacity-40"
              />
              <input
                type="time"
                name={`close-${day}`}
                defaultValue={row?.close_time?.slice(0, 5) ?? "17:00"}
                disabled={isClosed}
                className="rounded-[3px] border border-rule-strong bg-paper-raised-2 px-2 py-1.5 text-[14px] disabled:opacity-40"
              />
              <label className="flex items-center gap-1.5 text-[13px] text-ink-soft">
                <input
                  type="checkbox"
                  name={`closed-${day}`}
                  checked={isClosed}
                  onChange={(e) => {
                    const next = new Set(closedDays);
                    if (e.target.checked) next.add(day);
                    else next.delete(day);
                    setClosedDays(next);
                  }}
                />
                Zárva
              </label>
            </div>
          );
        })}
      </div>
      <Button type="submit" className="mt-4">
        Nyitvatartás mentése
      </Button>
    </form>
  );
}
