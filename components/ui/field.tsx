import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ className = "", ...props }: LabelHTMLAttributes<HTMLDivElement> & { className?: string }) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`mb-1.5 block text-[13.5px] font-semibold text-ink ${className}`} {...props} />;
}

const inputClass =
  "w-full rounded-[3px] border border-rule-strong bg-paper-raised-2 px-3 py-2.5 font-body text-[15px] text-ink focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-stamp";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-[80px] resize-y ${className}`} {...props} />;
}
