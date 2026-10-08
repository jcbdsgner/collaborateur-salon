"use client";

import { ArrowRight } from "lucide-react";
import { Calendrier } from "@/components/conges/calendrier";
import { PlageConge } from "@/components/conges/plage-conge";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useCongeDates } from "@/hooks/use-demandes";
import { ROUTES } from "@/lib/routes";

/**
 * Demander un congé, écran 1/2 (CONTEXT.md) : même construction que l'Avance — la valeur en grand
 * au milieu, de quoi la saisir en bas. Ici, les deux jours du congé en pastilles (un rond vide
 * qui respire montre lequel toucher), puis le calendrier, puis « Continuer ».
 */
export default function CongeDatesPage() {
  const f = useCongeDates();

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.accueil} />} titre="Congé" />
      <div className="mt-2">
        <Progression etape={1} total={2} />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-3 ecran-bas:py-2">
        <PlageConge debut={f.debut} fin={f.fin} saisie />
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        <Calendrier {...f} />
        <Bouton icone={<ArrowRight aria-hidden strokeWidth={2} className="size-5" />} disabled={!f.canContinue} onClick={f.continuer}>
          Continuer
        </Bouton>
      </div>
    </main>
  );
}
