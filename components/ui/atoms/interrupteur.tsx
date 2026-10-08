"use client";

import { cn } from "@/lib/utils";

type Props = {
  actif: boolean;
  onChange: (actif: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/** Interrupteur oui / non, gros (56 × 32px) : taupe quand il est activé, gris sinon. */
export function Interrupteur({ actif, onChange, disabled, ...aria }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      disabled={disabled}
      onClick={() => onChange(!actif)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]",
        actif ? "bg-secondary" : "bg-gray-300",
      )}
      {...aria}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 left-1 size-6 rounded-full bg-base-100 shadow-brand transition-transform",
          actif && "translate-x-6",
        )}
      />
    </button>
  );
}
