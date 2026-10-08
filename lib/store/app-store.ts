import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { COLLABORATEURS, COMPTES, DEMANDES_CONGE } from "@/lib/data/collaborateurs";
import type { Collaborateur, Compte, DemandeAvance, DemandeConge } from "@/lib/data/types";

/** Une session reste valable ce nombre de jours sans se reconnecter, prolongée à chaque ouverture. */
export const SESSION_DUREE_JOURS = 30;

/**
 * La « base » simulée et la session, persistées dans `localStorage` : un collaborateur reste
 * connecté sur son téléphone et ses changements (photo, code) survivent au rechargement.
 * Les écrans ne l'écrivent jamais directement : ils passent par `lib/api`, qui sera remplacée par
 * la vraie API sans toucher aux écrans.
 */
type AppState = {
  collaborateurs: Collaborateur[];
  comptes: Record<string, Compte>;
  demandesConge: DemandeConge[];
  demandesAvance: DemandeAvance[];
  /** `Collaborateur.id` connecté, ou null. */
  sessionId: string | null;
  /** ISO datetime — au-delà, la session est fermée à la prochaine ouverture de l'app. */
  sessionExpireLe: string | null;
  /** Clé biométrique de CET appareil (Face ID, empreinte), gardée après déconnexion. */
  biometrie: { collaborateurId: string; credentialId: string } | null;
  /** Liens « nouveau code » envoyés par SMS (Code secret oublié), par jeton — une seule utilisation. */
  liensCode: Record<string, { collaborateurId: string; expireLe: string }>;
};

export const INITIAL_STATE: AppState = {
  collaborateurs: COLLABORATEURS,
  comptes: COMPTES,
  demandesConge: DEMANDES_CONGE,
  demandesAvance: [],
  sessionId: null,
  sessionExpireLe: null,
  biometrie: null,
  liensCode: {},
};

const expiration = () => new Date(Date.now() + SESSION_DUREE_JOURS * 86_400_000).toISOString();

export const useAppStore = create<AppState>()(
  persist(() => INITIAL_STATE, {
    name: "collaborateur-bco",
    version: 5,
    // Démo : un changement de forme des données repart simplement des données de départ.
    migrate: () => INITIAL_STATE,
    storage: createJSONStorage(() => localStorage),
    // À chaque ouverture de l'app : session expirée ⇒ fermée, sinon prolongée. La relecture de
    // localStorage est synchrone, pendant la création du store : `useAppStore` n'existe pas encore
    // à cet instant, d'où le report (sinon l'erreur bloque la relecture et l'écran reste blanc).
    onRehydrateStorage: () => (state) => {
      if (!state?.sessionId) return;
      const expiree = !state.sessionExpireLe || new Date(state.sessionExpireLe).getTime() < Date.now();
      queueMicrotask(() =>
        useAppStore.setState(expiree ? { sessionId: null, sessionExpireLe: null } : { sessionExpireLe: expiration() }),
      );
    },
  }),
);

export function ouvrirSession(collaborateurId: string) {
  useAppStore.setState({ sessionId: collaborateurId, sessionExpireLe: expiration() });
}

export function fermerSession() {
  useAppStore.setState({ sessionId: null, sessionExpireLe: null });
}

/** Remet la démo à zéro (comptes, demandes, session). */
export function resetDemo() {
  useAppStore.setState(INITIAL_STATE);
}
