"use client";

import { useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store/app-store";

const subscribeHydration = (cb: () => void) => useAppStore.persist.onFinishHydration(cb);

/** Vrai une fois l'état relu depuis `localStorage` — avant, la session est inconnue. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, () => useAppStore.persist.hasHydrated(), () => false);
}

export type SessionState =
  | { status: "chargement" }
  | { status: "anonyme" }
  | { status: "premiere-connexion"; collaborateurId: string }
  | { status: "connecte"; collaborateurId: string };

export function useSession(): SessionState {
  const hydrated = useHydrated();
  const sessionId = useAppStore((s) => s.sessionId);
  const premiere = useAppStore((s) => (s.sessionId ? s.comptes[s.sessionId]?.code === null : false));
  if (!hydrated) return { status: "chargement" };
  if (!sessionId) return { status: "anonyme" };
  return premiere ? { status: "premiere-connexion", collaborateurId: sessionId } : { status: "connecte", collaborateurId: sessionId };
}

/** Le collaborateur connecté, lu en direct (photo changée → mise à jour immédiate). */
export function useCollaborateur() {
  return useAppStore((s) => s.collaborateurs.find((c) => c.id === s.sessionId) ?? null);
}
