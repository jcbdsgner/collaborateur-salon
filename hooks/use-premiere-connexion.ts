"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";
import { deconnexion, terminerPremiereConnexion } from "@/lib/api";
import { biometrieDisponible, enregistrerBiometrie, libelleBiometrie, messageErreurBiometrie } from "@/lib/biometrie";
import { isValidCode } from "@/lib/format";
import { photoToDataUrl } from "@/lib/image";
import { progression, ROUTES } from "@/lib/routes";
import { useAsyncAction, useErreur } from "@/hooks/use-async-action";
import { useCodeConfirme } from "@/hooks/use-code-confirme";
import { useCollaborateur } from "@/hooks/use-session";

/**
 * Brouillon du parcours, en mémoire seulement : rien n'est enregistré avant la fin (après le code,
 * ou après le choix biométrique si l'appareil sait le faire). La session, elle, s'est ouverte dès
 * le numéro reconnu (compte sans code).
 */
type Brouillon = { photoUrl: string | null; code: string };
const VIDE: Brouillon = { photoUrl: null, code: "" };
const useBrouillon = create<Brouillon>(() => VIDE);

/** Vidé à chaque nouveau départ depuis le numéro — jamais en fin de parcours (la garde renverrait à la photo). */
export function resetPremiereConnexion() {
  useBrouillon.setState(VIDE);
}

/**
 * La photo du parcours : celle qu'on vient de prendre, ou celle du compte s'il en a déjà une (code
 * remis à zéro par le salon) — l'étape photo est alors sautée.
 */
function usePhoto() {
  const prise = useBrouillon((s) => s.photoUrl);
  const existante = useCollaborateur()?.photoUrl ?? null;
  return { photoUrl: prise ?? existante, avecPhoto: !existante };
}

/** Renvoie à la première étape incomplète si on arrive directement sur une étape plus loin. */
function useEtapePrecedenteRequise(etape: "code" | "biometrie") {
  const router = useRouter();
  const { photoUrl } = usePhoto();
  const code = useBrouillon((s) => s.code);
  useEffect(() => {
    if (!photoUrl) router.replace(ROUTES.premiereConnexion.photo);
    else if (etape === "biometrie" && !isValidCode(code)) router.replace(ROUTES.premiereConnexion.code);
  }, [etape, photoUrl, code, router]);
}

/** Étape 1/3 — photo de profil, obligatoire. Le champ ouvre directement la caméra frontale. */
export function useEtapePhoto() {
  const router = useRouter();
  const photoUrl = useBrouillon((s) => s.photoUrl);
  const { avecPhoto } = usePhoto();
  const { erreur, signaler, effacer } = useErreur();

  // Le compte a déjà sa photo : seulement le code à refaire.
  useEffect(() => {
    if (!avecPhoto) router.replace(ROUTES.premiereConnexion.code);
  }, [avecPhoto, router]);

  return {
    progression: progression("photo"),
    photoUrl,
    choisir: async (file: File | undefined) => {
      if (!file) return;
      effacer();
      try {
        useBrouillon.setState({ photoUrl: await photoToDataUrl(file) });
      } catch (e) {
        signaler("photo_illisible", e instanceof Error ? e.message : "Impossible de lire la photo.");
      }
    },
    erreur,
    canContinue: Boolean(photoUrl),
    continuer: () => photoUrl && router.push(ROUTES.premiereConnexion.code),
  };
}

/**
 * Étapes 2 et 3/3 — créer le code puis le confirmer, 2 écrans (`useCodeConfirme`). Codes identiques ⇒ proposition
 * biométrique si l'appareil sait le faire, sinon tout est enregistré ici.
 */
export function useEtapeCode() {
  useEtapePrecedenteRequise("code");
  const router = useRouter();
  const { photoUrl, avecPhoto } = usePhoto();
  const action = useAsyncAction(terminerPremiereConnexion);

  const code = useCodeConfirme(async (choisi) => {
    useBrouillon.setState({ code: choisi });
    if (await biometrieDisponible()) return router.push(ROUTES.premiereConnexion.biometrie);
    if (!(await action.run(photoUrl, choisi)).ok) return false;
    router.replace(ROUTES.accueil);
  });

  return {
    progression: progression(code.etape === "confirmation" ? "confirmation" : "code", avecPhoto),
    ...code,
    /**
     * Depuis la confirmation : revenir choisir le code ; depuis le choix : revenir à la photo, ou
     * à la Connexion si le compte avait déjà sa photo.
     */
    retour: async () => {
      if (code.retour()) return;
      if (avecPhoto) return router.push(ROUTES.premiereConnexion.photo);
      await deconnexion();
      router.replace(ROUTES.connexion);
    },
    pending: action.pending,
    erreur: code.erreur ?? action.erreur,
  };
}

/**
 * Après le code : proposer Face ID / l'empreinte. « Activer » crée la clé de l'appareil puis
 * enregistre tout ; « Plus tard » enregistre sans.
 */
export function useEtapeBiometrie() {
  useEtapePrecedenteRequise("biometrie");
  const router = useRouter();
  const collaborateur = useCollaborateur();
  const { photoUrl } = usePhoto();
  const code = useBrouillon((s) => s.code);
  const action = useAsyncAction(terminerPremiereConnexion);
  const [activation, setActivation] = useState(false);

  async function terminer(credentialId: string | null) {
    if ((await action.run(photoUrl, code, credentialId)).ok) router.replace(ROUTES.accueil);
  }

  return {
    libelle: libelleBiometrie(),
    activer: async () => {
      if (!collaborateur) return;
      setActivation(true);
      action.effacer();
      try {
        await terminer(await enregistrerBiometrie(collaborateur));
      } catch (e) {
        action.signaler("biometrie_annulee", messageErreurBiometrie(e));
      } finally {
        setActivation(false);
      }
    },
    plusTard: () => terminer(null),
    pending: activation || action.pending,
    erreur: action.erreur,
  };
}
