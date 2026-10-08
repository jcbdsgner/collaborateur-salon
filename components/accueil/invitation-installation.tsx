"use client";

import Image from "next/image";
import { Download, Ellipsis, Share, SquarePlus } from "lucide-react";
import { Bouton } from "@/components/ui/atoms/bouton";
import { useInstallation } from "@/hooks/use-installation";

/** Un geste à faire dans Safari : son icône en grand, telle qu'on la voit à l'écran, et son nom. */
function Geste({ n, icone: Icone, children }: { n: number; icone: typeof Share; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold tabular-nums">{n}</span>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icone aria-hidden strokeWidth={2} className="size-7" />
      </span>
      <span className="text-[17px] leading-snug">{children}</span>
    </li>
  );
}

/**
 * Proposition d'installer l'app sur l'écran d'accueil, en feuille au bas de l'Accueil (posée
 * par-dessus : la mise en page de l'Accueil ne bouge pas). Une seule décision : installer, ou
 * plus tard. Sur iPhone, les deux gestes à faire dans Safari, avec leurs icônes.
 */
export function InvitationInstallation() {
  const { mode, installer, plusTard } = useInstallation();
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button type="button" aria-label="Plus tard" onClick={plusTard} className="absolute inset-0 bg-black/30 animate-in fade-in duration-300" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="installation-titre"
        className="relative flex w-full max-w-[480px] flex-col gap-6 rounded-t-[32px] bg-base-100 px-4 pt-6 pb-safe animate-in slide-in-from-bottom duration-300 motion-reduce:animate-none"
      >
        <div className="flex flex-col items-center gap-3 px-2 text-center">
          <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="size-18 rounded-[20px] shadow-brand" />
          <h2 id="installation-titre" className="text-xl font-semibold">
            Installer l&apos;app
          </h2>
          <p className="text-[15px] text-gray-600">Pour l&apos;ouvrir d&apos;un geste, depuis l&apos;écran de votre téléphone.</p>
        </div>

        {mode === "ios" && (
          <ol className="flex flex-col gap-4 px-2">
            <Geste n={1} icone={Share}>
              Touchez <strong className="font-semibold">Partager</strong>
              <span className="mt-0.5 flex items-center gap-1 text-[14px] text-gray-500">
                ou d&apos;abord <Ellipsis aria-label="le menu" className="size-4" />
              </span>
            </Geste>
            <Geste n={2} icone={SquarePlus}>
              Puis <strong className="font-semibold">Sur l&apos;écran d&apos;accueil</strong>
            </Geste>
          </ol>
        )}

        <div className="flex flex-col gap-3 pb-6">
          {mode === "invitation" && (
            <Bouton icone={<Download aria-hidden className="size-6" />} onClick={installer}>
              Installer l&apos;app
            </Bouton>
          )}
          <Bouton ton="doux" onClick={plusTard}>
            {mode === "ios" ? "J'ai compris" : "Plus tard"}
          </Bouton>
        </div>
      </section>
    </div>
  );
}
