"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { connexion, connexionBiometrie, identifier } from "@/lib/api";
import { biometrieDisponible, libelleBiometrie, messageErreurBiometrie, verifierBiometrie } from "@/lib/biometrie";
import { CODE_LENGTH, formatPhone, isValidPhone, normalizeCode, normalizePhone } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import { useAsyncAction, useErreur } from "@/hooks/use-async-action";
import { MAX_ECHECS_CODE, useCodeOublie, useOubliDepuisConnexion } from "@/hooks/use-code-oublie";
import { resetPremiereConnexion } from "@/hooks/use-premiere-connexion";

export type EtapeConnexion = "chargement" | "biometrie" | "numero" | "code" | "oubli";

/**
 * Écran Connexion. Chaque saisie part toute seule dès qu'elle est complète (9 chiffres, puis
 * 4) — pas de bouton à trouver.
 * - Biométrie activée sur cet appareil ⇒ on arrive sur l'écran Face ID / empreinte ; « Utiliser
 *   mon numéro » reste possible.
 * - Numéro d'un compte sans code ⇒ la session s'ouvre, on part vers la Première connexion (photo).
 * - Sinon ⇒ le code secret. « J'ai oublié mon code », ou 3 codes faux de suite ⇒ Code secret oublié :
 *   Face ID / l'empreinte puis un nouveau code si la clé de l'appareil est la sienne, sinon un lien
 *   par SMS.
 */
export function useConnexion() {
  const router = useRouter();
  const cle = useAppStore((s) => s.biometrie);
  const [etape, setEtape] = useState<EtapeConnexion>(cle ? "chargement" : "numero");
  const [phone, setPhoneRaw] = useState("");
  const [code, setCodeRaw] = useState("");
  const [collaborateurId, setCollaborateurId] = useState<string | null>(null);
  const [echecs, setEchecs] = useState(0);
  const oubli = useCodeOublie({ collaborateurId, phone });
  const identification = useAsyncAction(identifier);
  const authentification = useAsyncAction(connexion);
  const bio = useErreur();
  const [bioPending, setBioPending] = useState(false);

  useEffect(() => {
    if (!cle) return;
    biometrieDisponible().then((ok) => setEtape((e) => (e === "chargement" ? (ok ? "biometrie" : "numero") : e)));
  }, [cle]);

  const pending = identification.pending || authentification.pending || bioPending || oubli.pending;

  async function envoyerNumero(numero: string) {
    const res = await identification.run(numero);
    if (!res.ok) return;
    setCollaborateurId(res.data.collaborateurId);
    setEchecs(0);
    if (!res.data.premiereConnexion) return setEtape("code");
    resetPremiereConnexion();
    router.replace(ROUTES.premiereConnexion.photo);
  }

  async function envoyerCode(valeur: string) {
    if ((await authentification.run(phone, valeur)).ok) return router.replace(ROUTES.accueil);
    setCodeRaw("");
    const n = echecs + 1;
    setEchecs(n);
    if (n >= MAX_ECHECS_CODE) ouvrirOubli();
  }

  function ouvrirOubli() {
    setCodeRaw("");
    authentification.effacer();
    setEtape("oubli");
    void oubli.ouvrir();
  }

  /** Code oublié : Face ID / l'empreinte ouvre la session, puis on choisit un nouveau code. */
  async function oubliBiometrie() {
    if (!(await oubli.verifier())) return;
    setBioPending(true);
    // Posé avant d'ouvrir la session : la garde de route y lit où aller (le nouveau code, pas l'Accueil).
    useOubliDepuisConnexion.setState(true);
    try {
      await connexionBiometrie();
      router.replace(ROUTES.changerCode);
    } catch (e) {
      useOubliDepuisConnexion.setState(false);
      oubli.effacer();
      bio.signaler("biometrie_annulee", messageErreurBiometrie(e));
    } finally {
      setBioPending(false);
    }
  }

  async function connecterAvecBiometrie() {
    if (!cle || pending) return;
    setBioPending(true);
    bio.effacer();
    try {
      await verifierBiometrie(cle.credentialId);
      await connexionBiometrie();
      router.replace(ROUTES.accueil);
    } catch (e) {
      bio.signaler("biometrie_annulee", messageErreurBiometrie(e));
    } finally {
      setBioPending(false);
    }
  }

  return {
    etape,
    libelleBiometrie: libelleBiometrie(),
    connecterAvecBiometrie,
    /** Depuis l'écran biométrie : passer au numéro. */
    utiliserNumero: () => setEtape("numero"),
    /** Valeur à afficher, « 77 123 45 67 ». */
    phoneDisplay: formatPhone(phone),
    setPhone: (v: string) => {
      const numero = normalizePhone(v);
      setPhoneRaw(numero);
      identification.effacer();
      if (isValidPhone(numero) && !pending) void envoyerNumero(numero);
    },
    code,
    setCode: (v: string) => {
      const valeur = normalizeCode(v);
      setCodeRaw(valeur);
      authentification.effacer();
      if (valeur.length === CODE_LENGTH && !pending) void envoyerCode(valeur);
    },
    /** « J'ai oublié mon code », depuis l'écran du code. */
    oublie: ouvrirOubli,
    oubli,
    oubliBiometrie,
    /** Depuis Code oublié : revenir au code. */
    retourCode: () => {
      setEchecs(0);
      setEtape("code");
    },
    /** Revenir au numéro (changer de numéro). */
    retour: () => {
      setCodeRaw("");
      authentification.effacer();
      setEtape("numero");
    },
    pending,
    erreur:
      etape === "biometrie" ? bio.erreur
      : etape === "numero" ? identification.erreur
      : etape === "oubli" ? bio.erreur
      : authentification.erreur,
  };
}

