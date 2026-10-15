"use client";

import { JourPlanning } from "@/components/planning/jour-planning";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { usePlanning } from "@/hooks/use-planning";
import { todayISO } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

/**
 * Le planning du collaborateur : une liste continue de jours à partir d'aujourd'hui, sur fond blanc.
 * Chaque jour porte sa date, son salon (par sa couleur) et ses heures ; le bas de l'écran s'estompe
 * pour montrer que la liste continue.
 */
export default function PlanningPage() {
  const { data, error } = usePlanning();
  const aujourdhui = todayISO();

  return (
    <main className="flex flex-1 flex-col">
      <div className="sticky top-0 z-20 bg-base-100 pb-2">
        <BarreHaut gauche={<BoutonRetour href={ROUTES.accueil} />} titre="Planning" />
      </div>

      {error ? (
        <p role="alert" className="px-4 pt-4 text-error">
          {error}
        </p>
      ) : (
        <ol aria-label="Mes jours de travail" className="flex flex-col gap-3.5 px-4 pt-3 pb-24">
          {data?.map((jour) => (
            <JourPlanning key={jour.date} jour={jour} aujourdhui={jour.date === aujourdhui} />
          ))}
        </ol>
      )}

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto h-24 w-full max-w-[480px] bg-linear-to-t from-base-100 pb-safe"
      />
    </main>
  );
}
