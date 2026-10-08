"use client";

import { useCallback, useEffect, useState } from "react";
import { fermerReponseConge as apiFermerReponseConge, getAccueil, type Accueil } from "@/lib/api";
import { useAppStore } from "@/lib/store/app-store";

/** Données de l'Accueil : Code QR, réponse au dernier congé. Rechargées si la base change. */
export function useAccueil() {
  const [data, setData] = useState<Accueil | null>(null);
  const [error, setError] = useState<string | null>(null);
  const collaborateurs = useAppStore((s) => s.collaborateurs);
  const demandesConge = useAppStore((s) => s.demandesConge);

  useEffect(() => {
    let alive = true;
    getAccueil()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [collaborateurs, demandesConge]);

  /** Retire la réponse tout de suite (la bulle a déjà fini de partir), puis l'enregistre. */
  const fermerReponseConge = useCallback((demandeId: string) => {
    setData((d) => d && { ...d, dernierConge: null });
    void apiFermerReponseConge(demandeId);
  }, []);

  return { data, loading: !data && !error, error, fermerReponseConge };
}
