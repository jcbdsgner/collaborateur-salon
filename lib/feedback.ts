/**
 * Retours non textuels — l'app doit se comprendre sans lire (CONTEXT.md) : la vibration.
 * La vibration n'existe pas sur iPhone (Safari) : elle y est simplement ignorée.
 */

export function vibrer(motif: number | readonly number[]) {
  try {
    navigator.vibrate?.(typeof motif === "number" ? motif : [...motif]);
  } catch {
    /* non pris en charge */
  }
}

export const VIBRATION = {
  erreur: [80, 60, 80],
  /** Un code bon : une petite tape. */
  succes: [40],
  /** Une demande envoyée. */
  envoi: [40],
} as const;
