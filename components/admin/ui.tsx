"use client";

import { useFormStatus } from "react-dom";

/** Submit button that shows a pending state while its form action runs. */
export function SubmitButton({
  children,
  variant = "gold",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "gold" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const base =
    "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const variants = {
    gold: "bg-gold text-pure-white hover:bg-gold-light",
    ghost: "border border-border text-text-body hover:bg-white",
    danger: "border border-red-300 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-gold";
