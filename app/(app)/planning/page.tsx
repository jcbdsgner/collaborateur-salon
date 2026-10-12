import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { ROUTES } from "@/lib/routes";

/** Le planning du collaborateur — écran pas encore dessiné : seulement le retour à l'Accueil. */
export default function PlanningPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.accueil} />} titre="Planning" />
    </main>
  );
}
