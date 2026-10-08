"use client";

import { Send } from "lucide-react";
import { ChampRaison } from "@/components/conges/champ-raison";
import { PlageConge } from "@/components/conges/plage-conge";
import { ErreurMessage } from "@/components/shared/erreur";
import { Envoi } from "@/components/shared/envoi";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { RAISON_TEXTE_MAX, useCongeRaison } from "@/hooks/use-demandes";
import { ROUTES } from "@/lib/routes";

/**
 * Demander un congé, écran 2/2 (CONTEXT.md) : les dates choisies en rappel, puis la raison dans un
 * champ de texte, avec dans son coin un micro pour la dire en vocal (60 s au plus) au lieu de
 * l'écrire. « Envoyer » → Envoi.
 */
export default function CongeRaisonPage() {
  const f = useCongeRaison();

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.demanderConge} />} titre="Congé" />
      <div className="mt-2">
        <Progression etape={2} total={2} />
      </div>

      {f.debut && <PlageConge debut={f.debut} fin={f.fin} taille="moyen" className="mt-5" />}

      <div className="flex flex-1 flex-col gap-2 px-4 pt-5 pb-2">
        <ChampRaison texte={f.texte} max={RAISON_TEXTE_MAX} onTexte={f.majTexte} vocal={f.vocal} />
        <div className="min-h-6">
          <ErreurMessage erreur={f.erreur} />
        </div>
      </div>

      <div className="px-4 pb-4">
        <Bouton icone={<Send aria-hidden strokeWidth={2} className="size-5" />} disabled={!f.canSubmit} onClick={f.envoyer}>
          Envoyer
        </Bouton>
      </div>

      {f.envoi && <Envoi ton="rose" onToucher={f.fermerEnvoi} />}
    </main>
  );
}
