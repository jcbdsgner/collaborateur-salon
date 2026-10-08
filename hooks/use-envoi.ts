"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VIBRATION, vibrer } from "@/lib/feedback";
import { ROUTES } from "@/lib/routes";

/** Durée de l'écran Envoi avant le retour à l'Accueil : le temps de voir le sablier se retourner. */
export const ENVOI_DUREE_MS = 2800;

/**
 * L'Envoi d'une demande (CONTEXT.md) : plein écran — l'avion part, le sablier se retourne —,
 * vibration, puis retour à l'Accueil.
 */
export function useEnvoi() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const montrer = useCallback(() => {
    vibrer(VIBRATION.envoi);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => router.replace(ROUTES.accueil), ENVOI_DUREE_MS);
    return () => clearTimeout(t);
  }, [visible, router]);

  return {
    visible,
    montrer,
    /** Toucher l'écran : retour à l'Accueil sans attendre. */
    fermer: () => router.replace(ROUTES.accueil),
  };
}
