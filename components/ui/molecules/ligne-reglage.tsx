import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const base = "flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left";

function Icone({ icone: I }: { icone: LucideIcon }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">
      <I aria-hidden strokeWidth={1.75} className="size-6" />
    </span>
  );
}

/**
 * Une ligne de réglage (référence Pinterest « compte, liste épurée ») : icône dans un rond rose,
 * libellé, puis à droite une flèche (`href`, ça ouvre un écran) ou un contrôle (`droite`).
 */
export function LigneReglage({
  icone,
  label,
  href,
  droite,
  id,
}: {
  icone: LucideIcon;
  label: string;
  href?: string;
  droite?: React.ReactNode;
  /** Pour relier un contrôle (`aria-labelledby`) à son libellé. */
  id?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={cn(base, "transition active:bg-base-200")}>
        <Icone icone={icone} />
        <span className="flex-1 text-[17px]">{label}</span>
        <ChevronRight aria-hidden className="size-5 text-gray-400" />
      </Link>
    );
  }
  return (
    <div className={base}>
      <Icone icone={icone} />
      <span id={id} className="flex-1 text-[17px]">
        {label}
      </span>
      {droite}
    </div>
  );
}

/**
 * Un groupe de lignes dans une carte. Le `titre` ne s'affiche que s'il y a plusieurs groupes à
 * distinguer ; seul, la carte suffit (`label` le nomme alors pour les lecteurs d'écran).
 */
export function GroupeReglages({ titre, label, children }: { titre?: string; label?: string; children: React.ReactNode }) {
  return (
    <section aria-label={titre ?? label} className="flex flex-col gap-2">
      {titre && <h2 className="px-1 text-sm font-semibold text-gray-500">{titre}</h2>}
      <div className="divide-y divide-base-300 overflow-hidden rounded-3xl border border-base-300">{children}</div>
    </section>
  );
}
