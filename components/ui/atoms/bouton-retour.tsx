import { ArrowLeft } from "lucide-react";
import { BoutonIcone } from "@/components/ui/atoms/bouton-icone";

/** Retour, toujours en haut à gauche : vers `href`, ou une action (`onClick`) quand l'écran a des étapes. */
export function BoutonRetour(props: { href: string } | { onClick: () => void }) {
  const icone = <ArrowLeft aria-hidden strokeWidth={2} className="size-6" />;
  return "href" in props ? (
    <BoutonIcone href={props.href} aria-label="Retour">
      {icone}
    </BoutonIcone>
  ) : (
    <BoutonIcone onClick={props.onClick} aria-label="Retour">
      {icone}
    </BoutonIcone>
  );
}
