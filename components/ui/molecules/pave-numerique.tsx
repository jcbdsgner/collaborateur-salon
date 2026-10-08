"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const TOUCHES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]";

const VARIANTES = {
  /** Code secret : touches rondes à traits fins (référence « confirmer le code »). */
  rond: {
    grille: "grid grid-cols-3 justify-items-center gap-x-6 gap-y-4 ecran-bas:gap-y-3",
    touche: "size-[72px] rounded-full ecran-bas:size-16",
    chiffre: "border border-base-300 text-[28px] font-medium active:border-primary active:bg-primary",
  },
  /** Montant : touches plates, sans contour (référence « montant + pavé »), pour laisser la place au montant. */
  plat: {
    grille: "grid grid-cols-3 gap-1",
    touche: "h-14 w-full rounded-2xl ecran-bas:h-12",
    chiffre: "text-[28px] font-medium active:bg-base-200",
  },
};

type Props = {
  onChiffre: (chiffre: string) => void;
  onEffacer: () => void;
  disabled?: boolean;
  variante?: keyof typeof VARIANTES;
  /** Touche en bas à gauche (ex. « 000 » pour un montant) ; vide par défaut. */
  toucheGauche?: string;
};

/**
 * Pavé numérique : les chiffres en grand, « effacer » en bas à droite. Pas de touche « Valider » :
 * un code part tout seul quand il est complet (CONTEXT.md).
 */
export function PaveNumerique({ onChiffre, onEffacer, disabled, variante = "rond", toucheGauche }: Props) {
  const v = VARIANTES[variante];
  const touche = (c: string) => (
    <button
      key={c}
      type="button"
      disabled={disabled}
      onClick={() => onChiffre(c)}
      className={cn("flex items-center justify-center transition active:scale-95 disabled:opacity-40", focus, v.touche, v.chiffre)}
    >
      {c}
    </button>
  );
  return (
    <div className={v.grille}>
      {TOUCHES.map(touche)}
      {toucheGauche ? touche(toucheGauche) : <span aria-hidden />}
      {touche("0")}
      <button
        type="button"
        disabled={disabled}
        onClick={onEffacer}
        aria-label="Effacer"
        className={cn("flex items-center justify-center text-gray-500 transition active:scale-95 active:bg-base-200 disabled:opacity-40", focus, v.touche)}
      >
        <Delete aria-hidden strokeWidth={1.75} className="size-8" />
      </button>
    </div>
  );
}
