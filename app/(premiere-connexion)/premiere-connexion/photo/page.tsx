"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, Camera, RotateCcw, UserRound } from "lucide-react";
import { ErreurMessage } from "@/components/shared/erreur";
import { Bouton } from "@/components/ui/atoms/bouton";
import { Progression } from "@/components/ui/atoms/progression";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useEtapePhoto } from "@/hooks/use-premiere-connexion";

const icone = (I: typeof Camera) => <I aria-hidden strokeWidth={2} className="size-5" />;

/**
 * Première connexion, étape 1/3 : la photo de profil, obligatoire, prise à la caméra frontale.
 * Même écran que « Ma photo » des Paramètres : « Prendre une photo », puis « Continuer » ou « Reprendre ».
 */
export default function PhotoPage() {
  const f = useEtapePhoto();
  const camera = useRef<HTMLInputElement>(null);

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut titre="Votre photo" />
      <div className="mt-2">
        <Progression etape={f.progression.etape} total={f.progression.total} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <span className="flex size-60 items-center justify-center overflow-hidden rounded-full bg-accent text-secondary ring-4 ring-primary ring-offset-4 ring-offset-base-100">
          {f.photoUrl ? (
            <Image src={f.photoUrl} alt="Votre photo" width={240} height={240} unoptimized className="size-full object-cover" />
          ) : (
            <UserRound aria-hidden strokeWidth={1.25} className="size-32" />
          )}
        </span>
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
        {f.canContinue ? (
          <>
            <Bouton icone={icone(ArrowRight)} onClick={f.continuer}>
              Continuer
            </Bouton>
            <Bouton ton="doux" icone={icone(RotateCcw)} onClick={() => camera.current?.click()}>
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
