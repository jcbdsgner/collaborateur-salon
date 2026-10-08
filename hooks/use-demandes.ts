"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";
import { demanderAvance, demanderConge } from "@/lib/api";
import { formatFCFA, MONTANT_MAX_CHIFFRES, normalizeMontant, todayISO } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useCalendrierPlage } from "@/hooks/use-calendrier-plage";
import { useEnregistrementVocal } from "@/hooks/use-enregistrement-vocal";
import { useEnvoi } from "@/hooks/use-envoi";

/** Les dates choisies à l'écran 1, gardées pour l'écran 2 (en mémoire). */
const useBrouillonConge = create<{ debut: string; fin: string }>(() => ({ debut: "", fin: "" }));

/**
 * Demander un congé, écran 1 : toucher le premier jour puis le dernier sur un seul calendrier.
 * Un seul jour touché suffit : c'est un congé d'un jour (pas besoin de le toucher deux fois).
 */
export function useCongeDates() {
  const router = useRouter();
  const initial = useBrouillonConge.getState();
  const calendrier = useCalendrierPlage({ min: todayISO(), ...initial });

  return {
    ...calendrier,
    canContinue: Boolean(calendrier.debut),
    continuer: () => {
      if (!calendrier.debut) return;
      useBrouillonConge.setState({ debut: calendrier.debut, fin: calendrier.fin || calendrier.debut });
      router.push(ROUTES.congeRaison);
    },
  };
}

/**
 * Demander un congé, écran 2 : la raison en vocal, puis « Envoyer » ⇒ Envoi (coche, son,
 * vibration) et retour à l'Accueil. Aucun statut ni historique ensuite (CONTEXT.md).
 */
export function useCongeRaison() {
  const router = useRouter();
  const { debut, fin } = useBrouillonConge();
  const vocal = useEnregistrementVocal();
  const action = useAsyncAction(demanderConge);
  const envoi = useEnvoi();

  // Arrivé ici sans dates (rechargement) : retour au calendrier.
  useEffect(() => {
    if (!debut || !fin) router.replace(ROUTES.demanderConge);
  }, [debut, fin, router]);

  // On ne vide le brouillon qu'en quittant l'écran : vidé avant, la garde des dates ci-dessus
  // renverrait au calendrier pendant l'Envoi.
  useEffect(() => {
    if (envoi.visible) return () => useBrouillonConge.setState({ debut: "", fin: "" });
  }, [envoi.visible]);

  return {
    debut,
    fin,
    vocal,
    canSubmit: vocal.etat === "enregistre" && !action.pending,
    envoyer: async () => {
      if (vocal.etat !== "enregistre" || action.pending) return;
      if (!(await action.run({ debut, fin, raison: vocal.vocal })).ok) return;
      envoi.montrer();
    },
    envoi: envoi.visible,
    fermerEnvoi: envoi.fermer,
    pending: action.pending,
    erreur: action.erreur ?? vocal.erreur,
  };
}

/** Montants proposés d'un geste (illustrés en billets au design). */
export const MONTANTS_RAPIDES = [5_000, 10_000, 25_000, 50_000];

/**
 * Demander une avance sur salaire : seulement un montant en FCFA — clavier numérique ou montant
 * rapide —, ni plafond ni raison. « Envoyer » ⇒ Envoi puis retour à l'Accueil.
 */
export function useDemandeAvance() {
  const [montant, setMontantRaw] = useState<number | null>(null);
  const action = useAsyncAction(demanderAvance);
  const envoi = useEnvoi();
  const chiffres = montant === null ? "" : String(montant);

  const majChiffres = (d: string) => {
    setMontantRaw(normalizeMontant(d));
    action.effacer();
  };

  return {
    montant,
    /** Affichage en grand, chiffres groupés « 150 000 » (l'unité FCFA à côté). */
    montantDisplay: montant === null ? "" : new Intl.NumberFormat("fr-FR").format(montant),
    montantLabel: montant === null ? null : formatFCFA(montant),
    /** Une touche du pavé : un chiffre, ou « 000 ». Au-delà de 7 chiffres, la touche ne fait rien. */
    appuyer: (touche: string) => (chiffres + touche).length <= MONTANT_MAX_CHIFFRES && majChiffres(chiffres + touche),
    effacerChiffre: () => majChiffres(chiffres.slice(0, -1)),
    montantsRapides: MONTANTS_RAPIDES,
    choisirMontant: (m: number) => majChiffres(String(m)),
    canSubmit: montant !== null && montant > 0 && !action.pending,
    envoyer: async () => {
      if (montant === null || montant <= 0 || action.pending) return;
      if ((await action.run(montant)).ok) envoi.montrer();
    },
    envoi: envoi.visible,
    fermerEnvoi: envoi.fermer,
    pending: action.pending,
    erreur: action.erreur,
  };
}
