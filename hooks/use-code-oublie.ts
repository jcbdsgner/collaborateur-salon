"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { envoyerLienCode } from "@/lib/api";
import { biometrieDisponible, libelleBiometrie, messageErreurBiometrie, verifierBiometrie } from "@/lib/biometrie";
import { useAppStore } from "@/lib/store/app-store";
import { useAsyncAction, useErreur } from "@/hooks/use-async-action";

/** Au bout de ce nombre de codes faux de suite, l'app propose d'elle-même « Code secret oublié ». */
export const MAX_ECHECS_CODE = 3;

/** Délai avant de pouvoir renvoyer le SMS. */
export const RENVOI_SMS_S = 30;

/**
 * Face ID / l'empreinte vient d'être passé depuis la Connexion : « Changer le code secret » démarre
 * alors directement au nouveau code, et finit sur l'Accueil. En mémoire seulement.
 */
export const useOubliDepuisConnexion = create<boolean>(() => false);

/**
 * Code secret oublié (CONTEXT.md), à l'ouverture de l'écran (`ouvrir`) :
 * - la clé biométrique de CET appareil est celle du collaborateur ⇒ Face ID / l'empreinte prouve
 *   son identité et il choisit un nouveau code ; le lien par SMS reste proposé dessous ;
 * - sinon ⇒ un lien part tout de suite par SMS au numéro du compte, sans rien avoir à toucher.
 */
export function useCodeOublie({ collaborateurId, phone }: { collaborateurId: string | null; phone: string }) {
  const cle = useAppStore((s) => s.biometrie);
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const [bioPending, setBioPending] = useState(false);
  const bio = useErreur();
  const sms = useAsyncAction(envoyerLienCode);
  const [lienDemo, setLienDemo] = useState<string | null>(null);
  /** Secondes avant de pouvoir renvoyer ; null ⇒ rien d'envoyé depuis l'ouverture de l'écran. */
  const [renvoiDans, setRenvoiDans] = useState<number | null>(null);

  useEffect(() => {
    biometrieDisponible().then(setDisponible);
  }, []);

  const biometrie = Boolean(disponible) && Boolean(collaborateurId) && cle?.collaborateurId === collaborateurId;
  const envoye = renvoiDans !== null;

  async function envoyerSms() {
    if (sms.pending || !phone) return;
    bio.effacer();
    const res = await sms.run(phone);
    if (!res.ok) return;
    setLienDemo(res.data.lienDemo);
    setRenvoiDans(RENVOI_SMS_S);
  }

  // Compte à rebours du renvoi.
  useEffect(() => {
    if (!renvoiDans) return;
    const t = setTimeout(() => setRenvoiDans(renvoiDans - 1), 1000);
    return () => clearTimeout(t);
  }, [renvoiDans]);

  return {
    /** À l'ouverture de l'écran : tout repart de zéro ; sans Face ID possible, le SMS part tout seul. */
    ouvrir: async () => {
      setRenvoiDans(null);
      setLienDemo(null);
      sms.effacer();
      bio.effacer();
      const dispo = disponible ?? (await biometrieDisponible());
      if (!(dispo && collaborateurId && cle?.collaborateurId === collaborateurId)) await envoyerSms();
    },
    /** La vérification de l'appareil n'est pas finie : rien à montrer encore. */
    pret: disponible !== null,
    biometrie,
    libelle: libelleBiometrie(),
    /** Demande Face ID / l'empreinte ; vrai si c'est bon. */
    verifier: async (): Promise<boolean> => {
      if (!biometrie || !cle || bioPending) return false;
      setBioPending(true);
      bio.effacer();
      sms.effacer();
      try {
        await verifierBiometrie(cle.credentialId);
        return true;
      } catch (e) {
        bio.signaler("biometrie_annulee", messageErreurBiometrie(e));
        return false;
      } finally {
        setBioPending(false);
      }
    },
    envoyerSms,
    envoye,
    /** Secondes avant « Renvoyer » ; 0 ⇒ possible. */
    renvoiDans: renvoiDans ?? 0,
    /** Démo seulement : le lien que le SMS aurait porté. */
    lienDemo,
    pending: bioPending || sms.pending,
    erreur: bio.erreur ?? sms.erreur,
    effacer: () => {
      bio.effacer();
      sms.effacer();
    },
  };
}
