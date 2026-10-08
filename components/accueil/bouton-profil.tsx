import { Settings } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { BoutonIcone } from "@/components/ui/atoms/bouton-icone";
import type { Collaborateur } from "@/lib/data/types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const TAILLES = {
  /** Dans l'en-tête des petits écrans, à droite du logo. */
  petit: { bouton: "", photo: 52, anneau: "ring-2 ring-primary ring-offset-2 ring-offset-base-100", pastille: "-right-0.5 -bottom-0.5 size-6", icone: "size-3.5" },
  /** En badge sur le bloc du QR, sur les grands écrans. */
  grand: { bouton: "size-20", photo: 76, anneau: "ring-4 ring-base-100", pastille: "right-0 bottom-0 size-7", icone: "size-4" },
};

/**
 * Sa propre photo : elle dit « c'est mon code » et ouvre les Paramètres. La pastille roue dentée
 * montre qu'elle se touche (une photo seule passerait pour une décoration).
 */
export function BoutonProfil({
  collaborateur,
  taille,
  className,
}: {
  collaborateur: Collaborateur | undefined;
  taille: keyof typeof TAILLES;
  className?: string;
}) {
  const t = TAILLES[taille];
  return (
    <BoutonIcone href={ROUTES.parametres} aria-label="Paramètres" ton="nu" className={cn(t.bouton, className)}>
      <Avatar photoUrl={collaborateur?.photoUrl} initiale={collaborateur?.name.charAt(0) ?? ""} taille={t.photo} className={t.anneau} />
      <span className={cn("absolute flex items-center justify-center rounded-full border border-base-300 bg-base-100", t.pastille)}>
        <Settings aria-hidden strokeWidth={2} className={t.icone} />
      </span>
    </BoutonIcone>
  );
}
