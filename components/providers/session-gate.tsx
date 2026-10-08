"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOubliDepuisConnexion } from "@/hooks/use-code-oublie";
import { useSession, type SessionState } from "@/hooks/use-session";
import { ROUTES } from "@/lib/routes";

type Statut = Exclude<SessionState["status"], "chargement">;

const DESTINATION: Record<Statut, string> = {
  anonyme: ROUTES.connexion,
  "premiere-connexion": ROUTES.premiereConnexion.photo,
  connecte: ROUTES.accueil,
};

/**
 * Garde de route côté client (pas de backend, la session vit dans `localStorage`) : n'affiche
 * l'écran que si la session est dans l'état attendu par ce groupe de routes, sinon redirige
 * vers l'écran qui lui correspond. Rien ne s'affiche pendant la relecture de la session.
 */
export function SessionGate({ requires, children }: { requires: Statut; children: React.ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const ok = session.status === requires;

  useEffect(() => {
    if (session.status === "chargement" || ok) return;
    // Code secret oublié : Face ID vient d'ouvrir la session pour choisir un nouveau code.
    const oubli = session.status === "connecte" && useOubliDepuisConnexion.getState();
    router.replace(oubli ? ROUTES.changerCode : DESTINATION[session.status]);
  }, [session.status, ok, router]);

  return ok ? children : null;
}
