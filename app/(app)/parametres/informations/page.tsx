"use client";

import { Mail, Phone, UserRound } from "lucide-react";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { GroupeReglages, LigneInfo } from "@/components/ui/molecules/ligne-reglage";
import { useCollaborateur } from "@/hooks/use-session";
import { formatPhone } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

/**
 * Mes informations, ouvert depuis Paramètres : nom complet, téléphone et e-mail, grisés. Le
 * collaborateur ne peut pas les changer, c'est le salon qui les tient.
 */
export default function InformationsPage() {
  const collaborateur = useCollaborateur();

  return (
    <main className="flex flex-1 flex-col">
      <BarreHaut gauche={<BoutonRetour href={ROUTES.parametres} />} titre="Mes informations" />

      <div className="px-4 pt-6 pb-4">
        <GroupeReglages label="Mes informations">
          <LigneInfo
            icone={UserRound}
            label="Nom complet"
            valeur={collaborateur ? [collaborateur.name, collaborateur.nom].filter(Boolean).join(" ") : null}
          />
          <LigneInfo icone={Phone} label="Téléphone" valeur={collaborateur ? formatPhone(collaborateur.phone) : null} />
          <LigneInfo icone={Mail} label="E-mail" valeur={collaborateur?.email ?? null} />
        </GroupeReglages>
      </div>
    </main>
  );
}
