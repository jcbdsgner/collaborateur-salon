import { cn } from "@/lib/utils";

/** Où on en est dans un parcours : un trait par étape, plein jusqu'à l'étape en cours. */
export function Progression({ etape, total }: { etape: number; total: number }) {
  return (
    <div role="img" aria-label={`Étape ${etape} sur ${total}`} className="mx-auto flex gap-2" style={{ width: total * 40 }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < etape ? "bg-secondary" : "bg-base-300")} />
      ))}
    </div>
  );
}
