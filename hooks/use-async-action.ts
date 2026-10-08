"use client";

import { useCallback, useState } from "react";
import { ApiError, type ApiErrorCode } from "@/lib/api";
import { VIBRATION, vibrer } from "@/lib/feedback";

export type Resultat<R> = { ok: true; data: R } | { ok: false };

/** Erreurs connues de l'écran, en plus de celles de l'API — chacune aura son picto. */
export type ErreurCode =
  | ApiErrorCode
  | "codes_differents"
  | "photo_illisible"
  | "biometrie_annulee"
  | "micro_refuse"
  | "inconnue";

/**
 * Une erreur prête à montrer sans texte : `code` choisit le picto, `tick` change à chaque
 * nouvelle erreur (même identique) pour relancer l'animation de tremblement. Le message reste
 * pour les lecteurs d'écran.
 */
export type Erreur = { code: ErreurCode; message: string; tick: number };

/** État d'erreur d'un écran : chaque erreur fait vibrer le téléphone. */
export function useErreur() {
  const [erreur, setErreur] = useState<Erreur | null>(null);
  const signaler = useCallback((code: ErreurCode, message: string) => {
    vibrer(VIBRATION.erreur);
    setErreur((prev) => ({ code, message, tick: (prev?.tick ?? 0) + 1 }));
  }, []);
  const effacer = useCallback(() => setErreur(null), []);
  return { erreur, signaler, effacer };
}

/** Un appel d'API déclenché par l'utilisateur : en cours, erreur prête à montrer. */
export function useAsyncAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const { erreur, signaler, effacer } = useErreur();

  const run = useCallback(
    async (...args: A): Promise<Resultat<R>> => {
      setPending(true);
      effacer();
      try {
        return { ok: true, data: await fn(...args) };
      } catch (e) {
        if (e instanceof ApiError) signaler(e.code, e.message);
        else signaler("inconnue", e instanceof Error ? e.message : "Une erreur est survenue.");
        return { ok: false };
      } finally {
        setPending(false);
      }
    },
    [fn, signaler, effacer],
  );

  return { run, pending, erreur, signaler, effacer };
}
