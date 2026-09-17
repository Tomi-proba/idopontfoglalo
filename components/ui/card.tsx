import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative rounded-[2px] border border-rule bg-paper-raised shadow-[0_1px_0_rgba(42,36,28,0.06),0_8px_20px_-12px_rgba(42,36,28,0.35)] ${className}`}
      {...props}
    />
  );
}

export function Pill({
  tone = "pending",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "confirm" | "pending" }) {
  const toneClass =
    tone === "confirm" ? "bg-confirm-soft text-confirm" : "bg-stamp-soft text-stamp";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold tracking-wide ${toneClass} ${className}`}
      {...props}
    />
  );
}
