"use client";

import { RotateCcw, Send } from "lucide-react";
import { PlageConge } from "@/components/conges/plage-conge";
import { BoutonMicro, duree, NoteVocale } from "@/components/conges/vocal";
import { ErreurMessage } from "@/components/shared/erreur";
import { Envoi } from "@/components/shared/envoi";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useCongeRaison } from "@/hooks/use-demandes";
import { ROUTES } from "@/lib/routes";

const icone = (I: typeof Send) => <I aria-hidden strokeWidth={2} className="size-5" />;

/**
 * Demander un congé, écran 2/2 (CONTEXT.md) : les dates choisies en rappel, puis la raison en
 * vocal — un gros micro rose qu'on touche pour parler et retouche pour arrêter (60 s au plus).
 * Ensuite, la note vocale à réécouter, « Envoyer » → Envoi, ou « Recommencer » (comme
 * « Reprendre » pour la photo).
 */
export default function CongeRaisonPage() {
  const f = useCongeRaison();
  const { vocal } = f;
  const enregistrement = vocal.etat === "enregistrement";

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.demanderConge} />} titre="Congé" />
      <div className="mt-2">
        <Progression etape={2} total={2} />
      </div>

      {f.debut && <PlageConge debut={f.debut} fin={f.fin} taille="moyen" className="mt-5" />}

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-4">
        {vocal.etat === "enregistre" && vocal.vocal ? (
          <NoteVocale
            ondes={vocal.ondes}
            avancement={vocal.avancement}
            lecture={vocal.lecture}
            dureeSec={vocal.vocal.dureeSec}
            onEcouter={vocal.ecouter}
          />
        ) : (
          <>
            <BoutonMicro enregistre={enregistrement} niveau={vocal.niveau} secondes={vocal.secondes} max={vocal.max} onToucher={vocal.basculer} />
            <p className="h-8 text-center">
              {enregistrement ? (
                <span className="text-[26px] leading-8 font-semibold tabular-nums">{duree(vocal.secondes)}</span>
              ) : (
                <span className="text-[17px] leading-8 text-gray-600">Dites pourquoi</span>
              )}
            </p>
          </>
        )}
        <div className="min-h-6">
          <ErreurMessage erreur={f.erreur} />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <Bouton icone={icone(Send)} disabled={!f.canSubmit} onClick={f.envoyer}>
          Envoyer
        </Bouton>
        {vocal.etat === "enregistre" && (
          <Bouton ton="doux" icone={icone(RotateCcw)} onClick={vocal.recommencer}>
            Recommencer
          </Bouton>
        )}
      </div>

      {f.envoi && <Envoi ton="rose" onToucher={f.fermerEnvoi} />}
    </main>
  );
}
