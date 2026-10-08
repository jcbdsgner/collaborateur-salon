"use client";

import { useRef } from "react";
import { Camera, Check, RotateCcw } from "lucide-react";
import { ErreurMessage } from "@/components/shared/erreur";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useChangerPhoto } from "@/hooks/use-parametres";
import { useCollaborateur } from "@/hooks/use-session";
import { ROUTES } from "@/lib/routes";

const icone = (I: typeof Camera) => <I aria-hidden strokeWidth={2} className="size-5" />;

/**
 * Changer la photo : la photo actuelle en grand, « Prendre une photo » ouvre la caméra frontale.
 * Une fois prise, on voit la nouvelle : « Enregistrer » ou « Reprendre ».
 */
export default function ChangerPhotoPage() {
  const f = useChangerPhoto();
  const collaborateur = useCollaborateur();
  const camera = useRef<HTMLInputElement>(null);
  const nouvelle = f.canSubmit || f.pending;

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.parametres} />} titre="Ma photo" />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <Avatar
          photoUrl={f.photoUrl}
          initiale={collaborateur?.name.charAt(0) ?? ""}
          taille={240}
          className="text-6xl ring-4 ring-primary ring-offset-4 ring-offset-base-100"
        />
        <ErreurMessage erreur={f.erreur} />
      </div>

      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={(e) => {
          void f.choisir(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
        {nouvelle ? (
          <>
            <Bouton icone={icone(Check)} disabled={!f.canSubmit} onClick={f.enregistrer}>
              Enregistrer
            </Bouton>
            <Bouton ton="doux" icone={icone(RotateCcw)} disabled={f.pending} onClick={() => camera.current?.click()}>
              Reprendre
            </Bouton>
          </>
        ) : (
          <Bouton icone={icone(Camera)} onClick={() => camera.current?.click()}>
            Prendre une photo
          </Bouton>
        )}
      </div>
    </main>
  );
}
