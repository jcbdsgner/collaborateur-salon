"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, DoorOpen, FingerprintPattern, LockKeyhole, ScanFace, Smartphone } from "lucide-react";
import { FeuilleInstallation } from "@/components/accueil/invitation-installation";
import { ErreurMessage } from "@/components/shared/erreur";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Interrupteur } from "@/components/ui/atoms/interrupteur";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { GroupeReglages, LigneReglage } from "@/components/ui/molecules/ligne-reglage";
import { useInstallation } from "@/hooks/use-installation";
import { useBiometrie, useDeconnexion } from "@/hooks/use-parametres";
import { useCollaborateur } from "@/hooks/use-session";
import { ROUTES } from "@/lib/routes";

/**
 * Paramètres, un seul écran (CONTEXT.md) : sa photo en tête (on la touche pour la changer, une
 * pastille appareil photo le montre), la rubrique Sécurité (code secret, Face ID / empreinte),
 * « Installer l'app » tant qu'elle n'est pas sur l'écran d'accueil du téléphone, puis
 * « Se déconnecter » en bas, sans confirmation. Le cadenas du code secret est celui de l'écran
 * qu'il ouvre ; la porte ouverte dit « je sors » mieux qu'une flèche.
 */
export default function ParametresPage() {
  const collaborateur = useCollaborateur();
  const { deconnecter, pending } = useDeconnexion();
  const bio = useBiometrie();
  const IconeBio = bio.libelle === "Face ID" ? ScanFace : FingerprintPattern;
  const installation = useInstallation();
  // iPhone : la ligne ouvre la feuille des deux gestes ; Android : directement la fenêtre du navigateur.
  const [gestesIOS, setGestesIOS] = useState(false);

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.accueil} />} titre="Paramètres" />

      <div className="flex flex-1 flex-col gap-8 px-4 pt-6 pb-4 ecran-bas:gap-5 ecran-bas:pt-3">
        <div className="flex flex-col items-center gap-3">
          <Link
            href={ROUTES.changerPhoto}
            aria-label="Changer la photo"
            className="relative rounded-full transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--button-2-color)]"
          >
            <Avatar
              photoUrl={collaborateur?.photoUrl}
              initiale={collaborateur?.name.charAt(0) ?? ""}
              taille={112}
              className="ring-2 ring-primary ring-offset-4 ring-offset-base-100"
            />
            <span className="absolute right-0 bottom-0 flex size-10 items-center justify-center rounded-full border-4 border-base-100 bg-primary">
              <Camera aria-hidden strokeWidth={2} className="size-5" />
            </span>
          </Link>
          <p className="text-xl font-semibold">{collaborateur?.name}</p>
        </div>

        <GroupeReglages titre={installation.mode ? "Sécurité" : undefined} label="Sécurité">
          <LigneReglage icone={LockKeyhole} label="Changer le code secret" href={ROUTES.changerCode} />
          {bio.disponible && (
            <LigneReglage
              icone={IconeBio}
              id="libelle-biometrie"
              label={`Se connecter avec ${bio.libelle}`}
              droite={
                <Interrupteur
                  actif={bio.active}
                  disabled={bio.pending}
                  onChange={(oui) => (oui ? bio.activer() : bio.desactiver())}
                  aria-labelledby="libelle-biometrie"
                />
              }
            />
          )}
        </GroupeReglages>
        <ErreurMessage erreur={bio.erreur} />

        {installation.mode && (
          <GroupeReglages titre="Application">
            <LigneReglage
              icone={Smartphone}
              label="Installer l'app"
              onClick={() => (installation.mode === "invitation" ? installation.installer() : setGestesIOS(true))}
            />
          </GroupeReglages>
        )}

        <Bouton ton="danger" icone={<DoorOpen aria-hidden strokeWidth={2} className="size-5" />} disabled={pending} onClick={deconnecter} className="mt-auto">
          Se déconnecter
        </Bouton>
      </div>
      {gestesIOS && <FeuilleInstallation mode="ios" installer={installation.installer} fermer={() => setGestesIOS(false)} />}
    </main>
  );
}
