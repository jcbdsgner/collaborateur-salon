"use client";

import { Send } from "lucide-react";
import { ErreurMessage } from "@/components/shared/erreur";
import { Envoi } from "@/components/shared/envoi";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { IconeBillets } from "@/components/ui/atoms/icone-billets";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { PaveNumerique } from "@/components/ui/molecules/pave-numerique";
import { useDemandeAvance } from "@/hooks/use-demandes";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const groupe = new Intl.NumberFormat("fr-FR");

/** Le montant en gros chiffres, « FCFA » à côté. */
function Montant({ valeur }: { valeur: string }) {
  return (
    <p className="flex items-baseline justify-center gap-2 tabular-nums">
      <span className={cn("text-[44px] leading-none font-semibold", !valeur && "text-gray-300")}>{valeur || "0"}</span>
      <span className="text-xl font-medium text-gray-500">FCFA</span>
    </p>
  );
}

/**
 * Demander une avance sur salaire (CONTEXT.md) : un montant en FCFA, tapé au pavé ou choisi parmi
 * les montants rapides, puis « Envoyer » → Envoi. La liasse de
 * billets et le rose doux reprennent la tuile de l'Accueil.
 */
export default function DemanderAvancePage() {
  const f = useDemandeAvance();

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.accueil} />} titre="Avance" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-base-300 text-secondary" style={{ "--fond": "var(--color-base-300)" } as React.CSSProperties}>
          <IconeBillets strokeWidth={1.5} className="size-9" />
        </span>
        <Montant valeur={f.montantDisplay} />
        <div className="min-h-6">
          <ErreurMessage erreur={f.erreur} />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Montants rapides">
          {f.montantsRapides.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={f.montant === m}
              onClick={() => f.choisirMontant(m)}
              className={cn(
                "h-12 rounded-2xl text-[15px] font-semibold tabular-nums transition active:scale-95",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]",
                f.montant === m ? "bg-secondary text-secondary-content" : "bg-base-300 text-base-content",
              )}
            >
              {groupe.format(m)}
            </button>
          ))}
        </div>
        <PaveNumerique variante="plat" onChiffre={f.appuyer} onEffacer={f.effacerChiffre} disabled={f.pending} />
        <Bouton icone={<Send aria-hidden strokeWidth={2} className="size-5" />} disabled={!f.canSubmit} onClick={f.envoyer}>
          Envoyer
        </Bouton>
      </div>

      {f.envoi && <Envoi ton="rose-doux" onToucher={f.fermerEnvoi} />}
    </main>
  );
}
