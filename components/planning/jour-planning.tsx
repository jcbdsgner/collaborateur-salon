import { MapPin, Moon } from "lucide-react";
import { SALON_LABEL } from "@/lib/data/planning";
import type { JourPlanning as Jour, Salon } from "@/lib/data/types";
import { dateLocale, formatHeure, formatJourCourt } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Chaque salon a sa couleur : rose de marque pour Almadies, taupe pour Sea Plaza. */
const TON: Record<Salon, string> = {
  almadies: "bg-primary text-primary-content",
  "sea-plaza": "bg-secondary text-secondary-content",
};

/**
 * Une ligne du Planning : la date à gauche (le chiffre en gros ; aujourd'hui dans une tuile
 * anthracite), les créneaux à droite. Une journée coupée empile ses cartes : la suivante glisse
 * sous la précédente.
 */
export function JourPlanning({ jour, aujourdhui }: { jour: Jour; aujourdhui: boolean }) {
  const repos = jour.creneaux.length === 0;
  return (
    <li className="grid grid-cols-[64px_1fr] items-start gap-3">
      <div
        className={cn(
          "flex h-20 flex-col items-center justify-center rounded-[20px]",
          aujourdhui && "bg-neutral text-neutral-content",
        )}
      >
        <span className={cn("text-[30px] leading-none font-bold", repos && !aujourdhui && "text-base-content/25")}>
          {dateLocale(jour.date).getDate()}
        </span>
        <span className={cn("mt-1 text-[13px]", aujourdhui ? "opacity-75" : "text-base-content/50")}>
          {formatJourCourt(jour.date)}
        </span>
      </div>

      {repos ? (
        <div className="flex h-20 items-center gap-2 rounded-3xl border-2 border-dashed border-base-300 px-[18px] font-medium text-base-content/45">
          <Moon aria-hidden className="size-5" />
          Repos
        </div>
      ) : (
        <div className="flex flex-col">
          {jour.creneaux.map((c, i) => (
            <div
              key={`${c.salon}-${c.debut}`}
              className={cn(
                "min-h-20 rounded-3xl px-[18px] py-3.5",
                TON[c.salon],
                // Les cartes suivantes passent sous la précédente. Leurs coins du haut restent droits :
                // cachés sous la carte du dessus, ils comblent le creux de ses coins arrondis.
                i === 0 ? "relative z-10" : "-mt-[26px] rounded-t-none pt-9",
              )}
            >
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin aria-hidden strokeWidth={2.2} className="size-4" />
                {SALON_LABEL[c.salon]}
              </p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                {formatHeure(c.debut)} → {formatHeure(c.fin)}
              </p>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
