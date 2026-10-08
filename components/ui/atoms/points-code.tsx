import { CODE_LENGTH } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** Nombre de chiffres déjà tapés. */
  remplis: number;
  total?: number;
  /** `valide` : code complet et bon, les points passent au vert. */
  etat?: "actif" | "valide";
  "aria-label": string;
};

/** Une rangée de points : un par chiffre du code, plein quand il est tapé (on voit sans lire où on en est). */
export function PointsCode({ remplis, total = CODE_LENGTH, etat = "actif", "aria-label": label }: Props) {
  return (
    <div
      role="img"
      aria-label={`${label} : ${remplis} chiffre${remplis > 1 ? "s" : ""} sur ${total}`}
      className="flex justify-center gap-5"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "size-[18px] rounded-full border-2 transition-[background-color,border-color,transform] duration-200",
            etat === "valide" ? "scale-110 border-success bg-success" : i < remplis ? "border-secondary bg-secondary" : "border-gray-300",
          )}
        />
      ))}
    </div>
  );
}
