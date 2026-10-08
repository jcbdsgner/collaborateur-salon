"use client";

import { CodeOublie } from "@/components/shared/code-oublie";
import { SaisieCode } from "@/components/shared/saisie-code";
import type { EtatCadenas } from "@/components/ui/atoms/cadenas-anime";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useChangerCode, type EtapeChangerCode } from "@/hooks/use-parametres";

/**
 * Pour chaque écran : le titre, l'état du cadenas pendant la saisie, puis une fois le code bon.
 * Code actuel : fermé → s'ouvre. Nouveau : ouvert → devient des flèches. Confirmation : flèches
 * → redevient un cadenas qui se referme.
 */
const ECRANS: Record<Exclude<EtapeChangerCode, "oubli">, { titre: string; cadenas: EtatCadenas; bon: EtatCadenas }> = {
  ancien: { titre: "Votre code actuel", cadenas: "ferme", bon: "ouvert" },
  nouveau: { titre: "Choisissez un nouveau code", cadenas: "ouvert", bon: "fleches" },
  confirmation: { titre: "Tapez-le encore une fois", cadenas: "fleches", bon: "ferme" },
};

/**
 * Changer le code secret, en 3 écrans ; pas de bouton « Valider » (CONTEXT.md). Sous le code
 * actuel, « J'ai oublié mon code » mène à Code secret oublié.
 */
export default function ChangerCodePage() {
  const f = useChangerCode();

  if (f.etape === "oubli") {
    return (
      <main className="flex flex-1 flex-col">
        <BarreHaut gauche={<BoutonRetour onClick={f.retour} />} titre="Code secret" />
        <CodeOublie oubli={f.oubli} phoneDisplay={f.phoneDisplay} onBiometrie={f.oubliBiometrie} onRetour={f.retour} />
      </main>
    );
  }

  const e = ECRANS[f.etape];
  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour onClick={f.retour} />} titre="Code secret" />
      <div className="mt-2 ecran-bas:mt-1">
        <Progression etape={f.progression.etape} total={f.progression.total} />
      </div>
      <SaisieCode
        etape={f.etape}
        cadenas={f.valide ? e.bon : e.cadenas}
        titre={e.titre}
        remplis={f.valeur.length}
        valide={f.valide}
        erreur={f.erreur}
        disabled={f.pending}
        onChiffre={f.ajouterChiffre}
        onEffacer={f.effacerChiffre}
        lienOubli={f.etape === "ancien" ? f.oublie : undefined}
      />
    </main>
  );
}
