import { QRCodeSVG } from "qrcode.react";

/**
 * Le Code QR en grand, sur fond blanc (marge calme pour le scanner). Carré qui prend toute la
 * largeur disponible. `value` absente ⇒ emplacement de chargement de même taille.
 */
export function CarteQR({ value }: { value: string | null }) {
  return (
    <div className="aspect-square w-full rounded-[28px] bg-base-100 p-5">
      {value ? (
        <QRCodeSVG value={value} size={320} level="M" fgColor="#1d1d1d" title="Mon code QR de pointage" className="size-full" />
      ) : (
        <div className="size-full animate-pulse rounded-xl bg-base-200" aria-hidden />
      )}
    </div>
  );
}
