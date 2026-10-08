"use client";

import { X } from "lucide-react";
import { useGlisserPourFermer } from "@/hooks/use-glisser-pour-fermer";
import { cn } from "@/lib/utils";

/**
 * Bulle de notification gris clair qui se ferme d'une croix ou en la faisant glisser sur le côté.
 * Elle arrive par le bas, puis fait un petit aller-retour horizontal pour montrer qu'on peut la
 * faire glisser. Une fois partie, sa place se replie avant `onFermer`.
 */
export function BulleNotification({ onFermer, children }: { onFermer: () => void; children: React.ReactNode }) {
  const { handlers, style, repliee, fermer, REPLI_MS } = useGlisserPourFermer(onFermer);
  return (
    <div
      className={cn("grid transition-[grid-template-rows]", repliee ? "grid-rows-[0fr]" : "grid-rows-[1fr]")}
      style={{ transitionDuration: `${REPLI_MS}ms` }}
    >
      <div className="min-h-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none">
          <div {...handlers} style={style} className="cursor-grab select-none active:cursor-grabbing">
            <div
              role="status"
              className="indice-glisser relative rounded-3xl bg-gray-100 py-4 pr-12 pl-4"
            >
              {children}
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer"
                className="absolute top-1 right-1 flex size-12 items-center justify-center rounded-full transition active:scale-90"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                  <X aria-hidden strokeWidth={2.5} className="size-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
