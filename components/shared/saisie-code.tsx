"use client";

import { CircleHelp } from "lucide-react";
import { ErreurMessage } from "@/components/shared/erreur";
import { CadenasAnime, type EtatCadenas } from "@/components/ui/atoms/cadenas-anime";
import { PointsCode } from "@/components/ui/atoms/points-code";
import { PaveNumerique } from "@/components/ui/molecules/pave-numerique";
import type { Erreur } from "@/hooks/use-async-action";
import { cn } from "@/lib/utils";

type Props = {
  /** Change à chaque écran du parcours : le titre et les points glissent depuis la droite. */
  etape: string;
  /** Le cadenas reste en place d'un écran à l'autre et s'anime (ouvert, flèches, fermé). */
  cadenas: EtatCadenas;
  titre: string;
  remplis: number;
  /** Code complet et bon : points et cadenas verts, le pavé attend la suite. */
  valide?: boolean;
  erreur: Erreur | null;
  onChiffre: (chiffre: string) => void;
  onEffacer: () => void;
  disabled?: boolean;
  /** « J'ai oublié mon code », sous les points — seulement là où on tape un code existant. */
  lienOubli?: () => void;
};

/**
 * Un écran de saisie de code : cadenas animé, phrase courte, points, erreur, pavé numérique.
 * Partagé par « Changer le code secret » et la Première connexion (et plus tard la Connexion).
 */
export function SaisieCode({ etape, cadenas, titre, remplis, valide, erreur, onChiffre, onEffacer, disabled, lienOubli }: Props) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4">
        <CadenasAnime etat={cadenas} succes={valide} />
        <div
          key={etape}
          className="flex flex-col items-center gap-5 animate-in fade-in slide-in-from-right-8 duration-300 motion-reduce:animate-none"
        >
          <h2 className="text-center text-xl font-semibold">{titre}</h2>
          <div key={erreur?.tick} className={cn(erreur && "attention-shake-once")}>
            <PointsCode remplis={remplis} etat={valide ? "valide" : "actif"} aria-label={titre} />
          </div>
        </div>
        <div className="min-h-6">
          <ErreurMessage erreur={erreur} />
        </div>
        {lienOubli && (
          <button
            type="button"
            onClick={lienOubli}
            className="flex min-h-12 items-center gap-2 rounded-full px-4 text-[15px] font-medium text-taupe active:scale-[0.97]"
          >
            <CircleHelp aria-hidden className="size-5" />
            J&apos;ai oublié mon code
          </button>
        )}
      </div>

      <div className="px-4 pt-2 pb-6">
        <PaveNumerique disabled={disabled || valide} onChiffre={onChiffre} onEffacer={onEffacer} />
      </div>
    </>
  );
}
