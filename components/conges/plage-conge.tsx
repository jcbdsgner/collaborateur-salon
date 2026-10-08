import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MOIS_COURT = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const date = (iso: string) => new Date(`${iso}T00:00:00`);

type Taille = "grand" | "moyen";

const TAILLES: Record<Taille, { pastille: string; chiffre: string; mois: string; fleche: string; jours: string }> = {
  grand: { pastille: "size-[72px]", chiffre: "text-[30px]", mois: "text-[15px]", fleche: "size-7 mt-[22px]", jours: "text-lg" },
  moyen: { pastille: "size-12", chiffre: "text-xl", mois: "text-[13px]", fleche: "size-5 mt-3.5", jours: "text-[15px]" },
};

/**
 * Sur le calendrier d'un écran bas (`ecran-bas:`, < 700px), le récapitulatif tient sur une ligne
 * — « 20 → 24 · 5 jours », sans le mois (le calendrier l'affiche) — pour qu'un mois de 6 semaines
 * tienne sans défiler.
 */
const COMPACT = {
  bloc: "ecran-bas:flex-row ecran-bas:gap-4",
  pastille: "ecran-bas:size-12 ecran-bas:text-xl",
  mois: "ecran-bas:hidden",
  fleche: "ecran-bas:mt-3.5 ecran-bas:size-5",
};

/**
 * Un jour du congé : son numéro dans une pastille taupe (la même que sur le calendrier), le mois
 * en court dessous. Vide, c'est un rond en pointillés qui « respire » : c'est ce jour-là qu'on
 * attend.
 */
function Jour({ iso, attendu, taille, compact }: { iso: string; attendu: boolean; taille: Taille; compact: boolean }) {
  const t = TAILLES[taille];
  const d = iso ? date(iso) : null;
  return (
    <span className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold tabular-nums transition",
          t.pastille,
          t.chiffre,
          compact && COMPACT.pastille,
          d ? "bg-secondary text-secondary-content animate-in zoom-in-75 duration-200" : "border-2 border-dashed border-secondary/40",
          !d && attendu && "anim-jour-attendu",
        )}
      >
        {d?.getDate()}
      </span>
      <span className={cn("leading-none text-gray-500", t.mois, compact && COMPACT.mois, !d && "invisible")}>{d ? MOIS_COURT.format(d) : "–"}</span>
    </span>
  );
}

/**
 * Le congé en chiffres, compris sans lire : premier jour → dernier jour, et combien de jours.
 * Sur le calendrier, les ronds vides montrent lequel toucher ; le même bloc, plein, revient sur
 * l'écran du vocal. Un congé d'un jour n'affiche qu'une pastille.
 */
export function PlageConge({
  debut,
  fin,
  taille = "grand",
  saisie = false,
  className,
}: {
  debut: string;
  fin: string;
  taille?: Taille;
  /** Sur le calendrier : les jours pas encore choisis s'affichent en pointillés. */
  saisie?: boolean;
  className?: string;
}) {
  const t = TAILLES[taille];
  const unJour = Boolean(debut) && (fin === debut || (!fin && !saisie));
  const nombre = debut ? Math.round((date(fin || debut).getTime() - date(debut).getTime()) / 86_400_000) + 1 : 0;

  return (
    <div className={cn("flex flex-col items-center gap-3", saisie && COMPACT.bloc, className)}>
      <div className="flex items-start gap-3">
        <Jour iso={debut} attendu={!debut} taille={taille} compact={saisie} />
        {!unJour && (
          <>
            <ArrowRight aria-hidden strokeWidth={2} className={cn("text-secondary/60", t.fleche, saisie && COMPACT.fleche)} />
            <Jour iso={fin} attendu={Boolean(debut) && !fin} taille={taille} compact={saisie} />
          </>
        )}
      </div>
      {nombre ? (
        <p className={cn("font-medium text-gray-600 tabular-nums", t.jours)}>
          <span className="font-semibold text-base-content">{nombre}</span> {nombre > 1 ? "jours" : "jour"}
        </p>
      ) : (
        <p className={cn("whitespace-nowrap text-gray-600", t.jours)}>Touchez le 1er jour</p>
      )}
    </div>
  );
}
