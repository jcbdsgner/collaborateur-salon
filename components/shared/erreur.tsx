import { CircleAlert } from "lucide-react";
import type { Erreur } from "@/hooks/use-async-action";

/**
 * L'erreur : picto rouge et message, qui tremble à chaque nouvelle erreur (`erreur.tick`) ; le
 * téléphone vibre déjà (`useErreur`). Un picto propre à chaque `erreur.code` viendra au design.
 */
export function ErreurMessage({ erreur }: { erreur: Erreur | null }) {
  if (!erreur) return null;
  return (
    <p
      role="alert"
      key={erreur.tick}
      data-code={erreur.code}
      className="attention-shake-once flex items-center justify-center gap-2 text-center text-[15px] font-medium text-error"
    >
      <CircleAlert aria-hidden strokeWidth={2} className="size-5 shrink-0" />
      {erreur.message}
    </p>
  );
}
