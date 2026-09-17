import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[3px] border-[1.5px] px-5 py-3 font-body text-[15.5px] font-semibold transition-transform hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp";

const variants: Record<Variant, string> = {
  primary: "border-stamp bg-stamp text-[#fbf8ef] hover:translate-y-0",
  ghost: "border-ink bg-transparent text-ink hover:bg-paper-raised",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
