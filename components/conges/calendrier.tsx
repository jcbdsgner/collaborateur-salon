import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JourCalendrier } from "@/hooks/use-calendrier-plage";
import { cn } from "@/lib/utils";

type Props = {
  semaines: JourCalendrier[][];
  joursSemaine: string[];
  libelleMois: string;
  peutReculer: boolean;
  moisPrecedent: () => void;
  moisSuivant: () => void;
  toucher: (iso: string) => void;
};

const fleche = "flex size-12 items-center justify-center rounded-full bg-base-100 text-secondary transition active:scale-90 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[var(--button-2-color)]";

/**
 * Le calendrier du congé : des tuiles blanches dans un bloc rose doux, comme le bloc du QR. Le
 * premier et le dernier jour en taupe (les pastilles du récapitulatif au-dessus), les jours entre
 * les deux en rose de marque — la couleur du congé. Les jours passés sont grisés.
 */
export function Calendrier({ semaines, joursSemaine, libelleMois, peutReculer, moisPrecedent, moisSuivant, toucher }: Props) {
  return (
    <div className="rounded-[32px] bg-accent p-3">
      <div className="mb-1 flex items-center justify-between">
        <button type="button" onClick={moisPrecedent} disabled={!peutReculer} aria-label="Mois précédent" className={fleche}>
          <ChevronLeft aria-hidden strokeWidth={2.25} className="size-6" />
        </button>
        <p className="text-[17px] font-semibold first-letter:uppercase">{libelleMois}</p>
        <button type="button" onClick={moisSuivant} aria-label="Mois suivant" className={fleche}>
          <ChevronRight aria-hidden strokeWidth={2.25} className="size-6" />
        </button>
      </div>

      <table className="w-full table-fixed border-separate border-spacing-1">
        <thead>
          <tr>
            {joursSemaine.map((j, i) => (
              <th key={i} scope="col" className="pb-0.5 text-[13px] font-medium text-gray-500">
                {j}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semaines.map((semaine) => (
            <tr key={semaine[0].iso}>
              {semaine.map((j) => (
                <td key={j.iso} className="p-0">
                  {j.dansLeMois && (
                    <button
                      type="button"
                      disabled={j.desactive}
                      aria-pressed={j.debut || j.fin || j.dansLaPlage}
                      aria-current={j.aujourdhui ? "date" : undefined}
                      onClick={() => toucher(j.iso)}
                      className={cn(
                        "relative flex h-11 w-full items-center justify-center rounded-xl text-[17px] tabular-nums transition active:scale-90 ecran-bas:h-10",
                        "focus-visible:outline-2 focus-visible:outline-[var(--button-2-color)]",
                        j.desactive && "text-gray-300",
                        !j.desactive && "bg-base-100 text-base-content",
                        j.dansLaPlage && "bg-primary",
                        (j.debut || j.fin) && "scale-105 bg-secondary font-semibold text-secondary-content shadow-brand",
                        j.aujourdhui && !(j.debut || j.fin) && "font-bold text-secondary",
                      )}
                    >
                      {j.numero}
                      {j.aujourdhui && (
                        <span aria-hidden className={cn("absolute bottom-1 size-1 rounded-full", j.debut || j.fin ? "bg-secondary-content" : "bg-secondary")} />
                      )}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
