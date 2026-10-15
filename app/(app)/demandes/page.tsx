import { TreePalm } from "lucide-react";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { IconeBillets } from "@/components/ui/atoms/icone-billets";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { TuileAction } from "@/components/ui/molecules/tuile-action";
import { ROUTES } from "@/lib/routes";

/**
 * Envoyer une demande (CONTEXT.md) : une seule décision, congé ou avance, en deux tuiles carrées
 * l'une sous l'autre au centre de l'écran, dans le rose doux de la tuile de l'Accueil : c'est
 * l'icône qui les distingue. La couleur suit sur les écrans du congé et de l'avance.
 */
export default function DemandesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.accueil} />} titre="Demande" />
      <nav aria-label="Demandes" className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <TuileAction href={ROUTES.demanderConge} icone={TreePalm} verbe="Demander" objet="un congé" ton="rose-doux" forme="centree" />
        <TuileAction href={ROUTES.demanderAvance} icone={IconeBillets} verbe="Demander" objet="une avance" ton="rose-doux" forme="centree" />
      </nav>
    </main>
  );
}
