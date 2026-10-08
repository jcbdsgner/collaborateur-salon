"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { activerBiometrie, changerCode, changerPhoto, deconnexion, desactiverBiometrie, remplacerCodeOublie, verifierCode } from "@/lib/api";
import { biometrieDisponible, enregistrerBiometrie, libelleBiometrie, messageErreurBiometrie } from "@/lib/biometrie";
import { CODE_LENGTH, formatPhone, normalizeCode } from "@/lib/format";
import { VIBRATION, vibrer } from "@/lib/feedback";
import { photoToDataUrl } from "@/lib/image";
import { ROUTES } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useCodeConfirme, VALIDE_MS } from "@/hooks/use-code-confirme";
import { MAX_ECHECS_CODE, useCodeOublie, useOubliDepuisConnexion } from "@/hooks/use-code-oublie";
import { useCollaborateur } from "@/hooks/use-session";

/** Changer la photo de profil : caméra frontale → aperçu → enregistrer. */
export function useChangerPhoto() {
  const router = useRouter();
  const actuelle = useCollaborateur()?.photoUrl ?? null;
  const [apercu, setApercu] = useState<string | null>(null);
  const action = useAsyncAction(changerPhoto);

  return {
    photoUrl: apercu ?? actuelle,
    choisir: async (file: File | undefined) => {
      if (!file) return;
      action.effacer();
      try {
        setApercu(await photoToDataUrl(file));
      } catch (e) {
        action.signaler("photo_illisible", e instanceof Error ? e.message : "Impossible de lire la photo.");
      }
    },
    canSubmit: Boolean(apercu) && !action.pending,
    enregistrer: async () => {
      if (apercu && (await action.run(apercu)).ok) router.replace(ROUTES.parametres);
    },
    pending: action.pending,
    erreur: action.erreur,
  };
}

export type EtapeChangerCode = "ancien" | "oubli" | "nouveau" | "confirmation";

/**
 * Changer le code secret, en 3 écrans : l'ancien code (vérifié dès qu'il est complet ; bon ⇒ ses
 * points passent au vert), puis le nouveau et sa confirmation (`useCodeConfirme`).
 * Code secret oublié (« J'ai oublié mon code » ou 3 codes faux) : Face ID / l'empreinte remplace
 * l'ancien code, sinon un lien part par SMS. Depuis la Connexion, Face ID est déjà passé : on
 * démarre au nouveau code, en 2 écrans, et on finit sur l'Accueil.
 */
export function useChangerCode() {
  const router = useRouter();
  const collaborateur = useCollaborateur();
  const [depuisConnexion] = useState(() => useOubliDepuisConnexion.getState());
  useEffect(() => useOubliDepuisConnexion.setState(false), []);
  /** L'ancien code a été remplacé par Face ID / l'empreinte. */
  const [parBiometrie, setParBiometrie] = useState(depuisConnexion);
  const [ancienFait, setAncienFait] = useState(depuisConnexion);
  const [oubli, setOubli] = useState(false);
  const [ancien, setAncien] = useState("");
  const [echecs, setEchecs] = useState(0);
  const [ancienValide, setAncienValide] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const verif = useAsyncAction(verifierCode);
  const enregistrement = useAsyncAction(changerCode);
  const remplacement = useAsyncAction(remplacerCodeOublie);
  const codeOublie = useCodeOublie({ collaborateurId: collaborateur?.id ?? null, phone: collaborateur?.phone ?? "" });

  const code = useCodeConfirme(async (nouveau) => {
    const res = parBiometrie ? await remplacement.run(nouveau) : await enregistrement.run(ancien, nouveau);
    if (!res.ok) return false;
    router.replace(depuisConnexion ? ROUTES.accueil : ROUTES.parametres);
  });

  const etape: EtapeChangerCode = ancienFait ? code.etape : oubli ? "oubli" : "ancien";

  const ouvrirOubli = () => {
    setAncien("");
    verif.effacer();
    setOubli(true);
    void codeOublie.ouvrir();
  };

  const saisirAncien = async (v: string) => {
    const valeur = normalizeCode(v);
    setAncien(valeur);
    verif.effacer();
    if (valeur.length < CODE_LENGTH || verif.pending) return;
    if (!(await verif.run(valeur)).ok) {
      setAncien("");
      const n = echecs + 1;
      setEchecs(n);
      if (n >= MAX_ECHECS_CODE) ouvrirOubli();
      return;
    }
    setAncienValide(true);
    vibrer(VIBRATION.succes);
    timer.current = setTimeout(() => {
      setAncienValide(false);
      setAncienFait(true);
    }, VALIDE_MS);
  };

  const progression = parBiometrie
    ? { etape: etape === "confirmation" ? 2 : 1, total: 2 }
    : { etape: { ancien: 1, oubli: 1, nouveau: 2, confirmation: 3 }[etape], total: 3 };

  return {
    etape,
    progression,
    /** « J'ai oublié mon code », depuis l'écran du code actuel. */
    oublie: ouvrirOubli,
    oubli: codeOublie,
    phoneDisplay: formatPhone(collaborateur?.phone ?? ""),
    oubliBiometrie: async () => {
      if (!(await codeOublie.verifier())) return;
      setParBiometrie(true);
      setOubli(false);
      setAncienFait(true);
    },
    /** Valeur de l'écran en cours. */
    valeur: etape === "ancien" ? ancien : code.valeur,
    valide: etape === "ancien" ? ancienValide : code.valide,
    ajouterChiffre: (c: string) => (etape === "ancien" ? saisirAncien(ancien + c) : code.ajouterChiffre(c)),
    effacerChiffre: () => (etape === "ancien" ? !ancienValide && setAncien(ancien.slice(0, -1)) : code.effacerChiffre()),
    retour: () => {
      if (etape === "ancien") return router.back();
      if (etape === "oubli") {
        setEchecs(0);
        return setOubli(false);
      }
      if (code.retour()) return;
      if (depuisConnexion) return router.replace(ROUTES.accueil);
      setAncien("");
      setParBiometrie(false);
      setAncienFait(false);
    },
    pending: verif.pending || enregistrement.pending || remplacement.pending || codeOublie.pending,
    erreur:
      etape === "ancien" ? verif.erreur
      : etape === "oubli" ? null
      : (code.erreur ?? enregistrement.erreur ?? remplacement.erreur),
  };
}

/**
 * Paramètres — Face ID / l'empreinte : activer ou désactiver sur cet appareil. `disponible` faux
 * ⇒ l'appareil ne sait pas faire, le réglage ne s'affiche pas.
 */
export function useBiometrie() {
  const collaborateur = useCollaborateur();
  const active = useAppStore((s) => Boolean(s.biometrie && s.biometrie.collaborateurId === s.sessionId));
  const [disponible, setDisponible] = useState(false);
  const [creation, setCreation] = useState(false);
  const activation = useAsyncAction(activerBiometrie);
  const desactivation = useAsyncAction(desactiverBiometrie);

  useEffect(() => {
    biometrieDisponible().then(setDisponible);
  }, []);

  return {
    disponible,
    active,
    libelle: libelleBiometrie(),
    activer: async () => {
      if (!collaborateur) return;
      setCreation(true);
      activation.effacer();
      try {
        await activation.run(await enregistrerBiometrie(collaborateur));
      } catch (e) {
        activation.signaler("biometrie_annulee", messageErreurBiometrie(e));
      } finally {
        setCreation(false);
      }
    },
    desactiver: () => desactivation.run(),
    pending: creation || activation.pending || desactivation.pending,
    erreur: activation.erreur ?? desactivation.erreur,
  };
}

/** Se déconnecter — sans confirmation (CONTEXT.md). */
export function useDeconnexion() {
  const router = useRouter();
  const action = useAsyncAction(deconnexion);
  return {
    deconnecter: async () => {
      if ((await action.run()).ok) router.replace(ROUTES.connexion);
    },
    pending: action.pending,
  };
}
