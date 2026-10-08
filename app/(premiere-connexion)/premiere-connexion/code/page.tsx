"use client";

import { SaisieCode } from "@/components/shared/saisie-code";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useEtapeCode } from "@/hooks/use-premiere-connexion";

/**
 * Première connexion, étapes 2 et 3 : choisir son code (cadenas ouvert, qui devient des flèches),
 * puis le retaper (les flèches redeviennent un cadenas qui se referme). Le retour ramène à la photo,
 * ou depuis la confirmation, au choix du code.
 */
export default function CodePage() {
  const f = useEtapeCode();
  const confirmation = f.etape === "confirmation";

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour onClick={f.retour} />} titre="Code secret" />
      <div className="mt-2">
        <Progression etape={f.progression.etape} total={f.progression.total} />
      </div>
      <SaisieCode
        etape={f.etape}
        cadenas={confirmation ? (f.valide ? "ferme" : "fleches") : f.valide ? "fleches" : "ouvert"}
        titre={confirmation ? "Tapez-le encore une fois" : "Choisissez votre code secret"}
        remplis={f.valeur.length}
        valide={f.valide}
        erreur={f.erreur}
        disabled={f.pending}
        onChiffre={f.ajouterChiffre}
        onEffacer={f.effacerChiffre}
      />
    </main>
  );
}
