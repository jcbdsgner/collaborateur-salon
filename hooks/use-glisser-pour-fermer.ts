"use client";

import { useRef, useState } from "react";

/** Part au-delà de cette fraction de la largeur ; en deçà, la bulle revient en place. */
const SEUIL = 0.35;
const SORTIE_MS = 200;
const REPLI_MS = 200;

type Etat = "repos" | "glisse" | "sortie" | "repliee";

/**
 * Faire glisser un élément vers la gauche ou la droite pour le fermer, ou appeler `fermer()`
 * (bouton croix). L'élément part sur le côté, puis sa place se replie, puis `onFerme` est appelé.
 * Le défilement vertical reste possible (`touch-action: pan-y`).
 */
export function useGlisserPourFermer(onFerme: () => void) {
  const [dx, setDx] = useState(0);
  const [etat, setEtat] = useState<Etat>("repos");
  const depart = useRef<number | null>(null);
  const [largeur, setLargeur] = useState(0);

  const partir = (sens: 1 | -1) => {
    setEtat("sortie");
    setDx(sens * (largeur || 400) * 1.1);
    setTimeout(() => setEtat("repliee"), SORTIE_MS);
    setTimeout(onFerme, SORTIE_MS + REPLI_MS);
  };

  const relacher = () => {
    if (depart.current === null) return;
    depart.current = null;
    if (Math.abs(dx) > largeur * SEUIL) partir(dx > 0 ? 1 : -1);
    else {
      setEtat("repos");
      setDx(0);
    }
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      // Un appui sur la croix reste un appui : on ne capture pas le pointeur.
      if (etat !== "repos" || (e.target as HTMLElement).closest("button")) return;
      depart.current = e.clientX;
      setLargeur(e.currentTarget.offsetWidth);
      e.currentTarget.setPointerCapture(e.pointerId);
      setEtat("glisse");
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (depart.current !== null) setDx(e.clientX - depart.current);
    },
    onPointerUp: relacher,
    onPointerCancel: relacher,
  };

  const progression = largeur ? Math.min(Math.abs(dx) / largeur, 1) : 0;

  return {
    handlers,
    style: {
      transform: `translateX(${dx}px)`,
      opacity: 1 - progression * 0.8,
      transition: etat === "glisse" ? "none" : `transform ${SORTIE_MS}ms ease-out, opacity ${SORTIE_MS}ms ease-out`,
      touchAction: "pan-y",
    } satisfies React.CSSProperties,
    /** Vrai une fois la bulle partie : sa place se replie. */
    repliee: etat === "repliee",
    /** Pour le bouton croix : la bulle part vers la droite. */
    fermer: () => {
      if (etat === "repos") partir(1);
    },
    REPLI_MS,
  };
}
