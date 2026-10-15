import Link from "next/link";
import { cn } from "@/lib/utils";

type Ton = "rose" | "rose-doux";

/**
 * Les deux roses de la marque b&co : core-brand-color adouci (85 %, sinon il pèse plus que l'autre)
 * et core-brand-color-2. Clairs, de même intensité (aucune demande ne domine), encre sombre, icône taupe.
 */
const TONS: Record<Ton, { tuile: string; fond: string }> = {
  rose: { tuile: "bg-primary/85", fond: "color-mix(in srgb, var(--color-primary) 85%, white)" },
  "rose-doux": { tuile: "bg-base-300", fond: "var(--color-base-300)" },
};

type Icone = React.ComponentType<{ className?: string; strokeWidth?: number }>;

type Props = {
  href: string;
  icone: Icone;
  /** Le verbe commun aux tuiles, en léger : « Demander ». */
  verbe: string;
  /** Ce qui distingue la tuile, en gras : « un congé ». */
  objet: string;
  ton: Ton;
  /** `carree` (Accueil, par deux sur une ligne) ou `centree` : carrée elle aussi, contenu centré (Envoyer une demande). */
  forme?: "carree" | "centree";
};

/**
 * Grande tuile illustrée qui ouvre une demande. L'icône et la couleur portent le sens ; le texte
 * aide qui sait lire, et c'est le mot qui change (`objet`) qui ressort. L'ombre dit « ça se
 * touche » : le bloc du QR, qui ne se touche pas, n'en a pas.
 * Carrée : elle grandit avec la largeur de l'écran sans s'étirer, et son contenu (centré) grandit
 * avec elle — 56px d'icône et 17px de texte sur un téléphone de 375px, jusqu'à 68px et 20px.
 * Sur un écran bas (`ecran-bas:`, < 700px), elle se fait compacte (≈ 122px de haut au lieu de ≈ 170) :
 * le QR, prioritaire, récupère la place.
 * Centrée : un carré de 60 % de la largeur de l'écran, l'icône et le texte au centre, qui grandissent
 * avec lui (unités `cqw`) : tout s'agrandit en proportion de l'écran. Deux l'une sous l'autre tiennent
 * toujours dans sa hauteur (moins ≈ 140px pour la barre du haut et les marges).
 */
export function TuileAction({ href, icone: Icone, verbe, objet, ton, forme = "carree" }: Props) {
  const centree = forme === "centree";
  const t = TONS[ton];
  return (
    <Link
      href={href}
      style={{ "--fond": t.fond } as React.CSSProperties}
      className={cn(
        "flex flex-col justify-center gap-4 rounded-[28px] p-6 text-base-content shadow-brand transition active:scale-[0.97]",
        centree
          ? "@container aspect-square w-[min(60vw,calc((100dvh-140px)/2))] items-center gap-[4cqw] p-[6cqw] text-center"
          : "aspect-square px-5 ecran-bas:aspect-auto ecran-bas:gap-2 ecran-bas:p-4 ecran-bas:px-3.5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]",
        t.tuile,
      )}
    >
      {/* Grande icône sans pastille ; -ml-1 compense la marge interne du dessin pour l'aligner sur le texte. */}
      <Icone
        strokeWidth={1.5}
        className={cn("text-secondary", centree ? "size-[38cqw] shrink-0" : "-ml-1 size-[clamp(56px,15vw,68px)] ecran-bas:size-10")}
      />
      <span className={cn("leading-snug", centree ? "text-[12cqw]" : "text-[clamp(16px,4.2vw,20px)] ecran-bas:text-[15px]")}>
        <span className="block">{verbe}</span>
        <span className="block font-semibold">{objet}</span>
      </span>
    </Link>
  );
}
