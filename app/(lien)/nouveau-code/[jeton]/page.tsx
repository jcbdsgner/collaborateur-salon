"use client";

import { use } from "react";
import { ArrowLeft, LinkIcon } from "lucide-react";
import { SaisieCode } from "@/components/shared/saisie-code";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useNouveauCode } from "@/hooks/use-nouveau-code";

/**
 * Le lien reçu par SMS (Code secret oublié) : choisir un nouveau code (cadenas ouvert, qui
 * devient des flèches), le retaper (il se referme), puis l'Accueil. Hors session : le lien suffit.
 * Pendant la vérification du lien, l'écran est déjà là, pavé en attente : pas d'écran blanc.
 */
export default function NouveauCodePage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = use(params);
  const f = useNouveauCode(jeton);

  if (f.etat === "invalide") {
    return (
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center animate-in fade-in duration-300">
          <span className="flex size-36 items-center justify-center rounded-full bg-error-soft text-error">
            <LinkIcon aria-hidden strokeWidth={1.5} className="size-16" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Ce lien ne marche plus</h2>
            <p className="text-[17px] text-base-content/70">Il a déjà servi, ou il est trop ancien. Demandez-en un nouveau.</p>
          </div>
        </div>
        <div className="px-4 pt-2 pb-6">
          <Bouton icone={<ArrowLeft aria-hidden className="size-6" />} onClick={f.nouveauLien}>
            Revenir à la connexion
          </Bouton>
        </div>
      </main>
    );
  }

  const confirmation = f.etape === "confirmation";
  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour onClick={f.retour} />} titre="Nouveau code" />
      <div className="mt-2">
        <Progression etape={f.progression.etape} total={f.progression.total} />
      </div>
      <SaisieCode
        etape={f.etape}
        cadenas={confirmation ? (f.valide ? "ferme" : "fleches") : f.valide ? "fleches" : "ouvert"}
        titre={confirmation ? "Tapez-le encore une fois" : "Choisissez un nouveau code"}
        remplis={f.valeur.length}
        valide={f.valide}
        erreur={f.erreur}
        disabled={f.pending || f.etat === "verification"}
        onChiffre={f.ajouterChiffre}
        onEffacer={f.effacerChiffre}
      />
    </main>
  );
}
