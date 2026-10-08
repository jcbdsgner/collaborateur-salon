import { Mic, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "vocal" | "texte";

const OPTIONS: { mode: Mode; label: string; Icone: typeof Mic }[] = [
  { mode: "vocal", label: "Vocal", Icone: Mic },
  { mode: "texte", label: "Écrire", Icone: PenLine },
];

/**
 * Dire ou écrire la raison : deux pastilles côte à côte, icône + mot, celle choisie en taupe.
 * Désactivé pendant un enregistrement (on arrête d'abord le micro).
 */
export function ChoixRaison({ mode, disabled, onChoisir }: { mode: Mode; disabled?: boolean; onChoisir: (m: Mode) => void }) {
  return (
    <div role="radiogroup" aria-label="Raison du congé" className="grid grid-cols-2 gap-1 rounded-full bg-base-200 p-1">
      {OPTIONS.map(({ mode: m, label, Icone }) => {
        const actif = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={actif}
            disabled={disabled && !actif}
            onClick={() => onChoisir(m)}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition active:scale-[0.97]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]",
              "disabled:opacity-50",
              actif ? "bg-secondary text-secondary-content shadow-sm" : "text-base-content",
            )}
          >
            <Icone aria-hidden strokeWidth={2} className="size-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
