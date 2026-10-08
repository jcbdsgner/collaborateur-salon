"use client";

import { useSyncExternalStore } from "react";
import { Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/ui/atoms/logo";

const sansAbonnement = () => () => {};

/**
 * Sur ordinateur, l'app ne s'affiche pas : elle est faite pour le téléphone (CONTEXT.md). On
 * invite à l'ouvrir dessus, avec un QR de l'adresse de la page à scanner à l'appareil photo.
 * Le choix se fait en CSS (variante `ordinateur`), sans attendre le JavaScript.
 */
export function EcranOrdinateur() {
  // L'adresse n'est connue que dans le navigateur.
  const adresse = useSyncExternalStore(sansAbonnement, () => window.location.href, () => null);

  return (
    <div className="hidden min-h-dvh flex-col items-center justify-center gap-10 bg-cream px-8 py-12 ordinateur:flex">
      <Logo className="h-16" />
      <div className="flex w-full max-w-[440px] flex-col items-center gap-6 rounded-[32px] bg-base-100 p-10 text-center shadow-[0_12px_40px_rgb(136_102_102/0.12)]">
        <span className="flex size-20 items-center justify-center rounded-full bg-rose-soft text-taupe">
          <Smartphone aria-hidden strokeWidth={1.75} className="size-10" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Ouvrez l&apos;app sur votre téléphone</h1>
          <p className="text-[17px] text-base-content/70">Scannez ce code avec l&apos;appareil photo de votre téléphone.</p>
        </div>
        <div className="size-52 rounded-3xl border border-base-300 bg-base-100 p-4">
          {adresse ? (
            <QRCodeSVG value={adresse} size={200} level="M" fgColor="#1d1d1d" title="Adresse de l'app" className="size-full" />
          ) : (
            <div className="size-full animate-pulse rounded-xl bg-base-200" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
