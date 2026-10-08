"use client";

import { Hourglass, Send } from "lucide-react";

export type TonEnvoi = "rose" | "rose-doux";

/** La couleur de la demande, la même que sa tuile de l'Accueil. */
const FOND: Record<TonEnvoi, string> = {
  rose: "color-mix(in srgb, var(--color-primary) 85%, white)",
  "rose-doux": "var(--color-base-300)",
};

/**
 * L'Envoi d'une demande (CONTEXT.md) — envoyée, pas encore acceptée : en plein écran, un rond
 * dans la couleur de la demande, d'où un avion en papier s'envole en laissant une traînée, puis un
 * sablier qui se retourne : la réponse viendra. Pas de vert ni de coche, réservés à « Accepté ».
 * La vibration et le retour automatique à l'Accueil viennent de `useEnvoi` ; toucher l'écran y
 * retourne plus tôt.
 */
export function Envoi({ ton, onToucher }: { ton: TonEnvoi; onToucher?: () => void }) {
  return (
    <div
      role="status"
      aria-label="Demande envoyée"
      onClick={onToucher}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden bg-base-100 px-6 animate-in fade-in duration-300"
    >
      <span className="relative -mb-6 block h-[220px] w-[250px]">
        <span
          className="absolute top-1/2 left-1/2 flex size-36 -translate-1/2 items-center justify-center rounded-full anim-envoi-entree"
          style={{ background: FOND[ton] }}
        >
          <Hourglass aria-hidden strokeWidth={1.75} className="size-16 text-taupe anim-envoi-sablier" />
        </span>
        <svg viewBox="0 0 250 220" className="absolute inset-0 overflow-visible" aria-hidden>
          <path
            d="M 150 85 Q 185 70 205 40"
            fill="none"
            stroke="var(--color-taupe)"
            strokeOpacity={0.45}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="2 9"
            className="anim-envoi-trainee"
          />
        </svg>
        <span className="absolute top-1/2 left-1/2 anim-envoi-avion">
          <Send aria-hidden strokeWidth={1.75} fill="white" className="size-14 -translate-x-1/2 -translate-y-1/2 overflow-visible text-taupe" />
        </span>
      </span>
      <p className="text-[17px] font-medium text-gray-600 anim-envoi-texte">Demande envoyée</p>
    </div>
  );
}
