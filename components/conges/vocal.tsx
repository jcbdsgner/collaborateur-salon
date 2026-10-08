import { Mic, Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/** « 0:07 », « 1:00 ». */
export const duree = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const RAYON = 86;
const TOUR = 2 * Math.PI * RAYON;

/**
 * Le gros bouton micro, rose comme le congé. Au repos, une onde l'entoure pour inviter à le
 * toucher. Pendant l'enregistrement, il passe en taupe avec un carré « stop », un halo rose
 * suit la voix (on voit que le micro entend) et un anneau se remplit jusqu'à 60 s.
 */
export function BoutonMicro({
  enregistre,
  niveau,
  secondes,
  max,
  onToucher,
}: {
  enregistre: boolean;
  niveau: number;
  secondes: number;
  max: number;
  onToucher: () => void;
}) {
  return (
    <span className="relative flex size-48 items-center justify-center">
      {enregistre ? (
        <>
          <span
            aria-hidden
            className="absolute inset-4 rounded-full bg-primary transition-transform duration-100"
            style={{ transform: `scale(${1 + niveau * 0.3})` }}
          />
          <svg aria-hidden viewBox="0 0 192 192" className="absolute inset-0 -rotate-90">
            <circle cx="96" cy="96" r={RAYON} fill="none" strokeWidth="6" className="stroke-base-300" />
            <circle
              cx="96"
              cy="96"
              r={RAYON}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={TOUR}
              strokeDashoffset={TOUR * (1 - Math.min(secondes, max) / max)}
              className="stroke-secondary transition-[stroke-dashoffset] duration-300"
            />
          </svg>
        </>
      ) : (
        <span aria-hidden className="absolute inset-6 rounded-full bg-primary anim-micro-appel" />
      )}
      <button
        type="button"
        onClick={onToucher}
        aria-pressed={enregistre}
        aria-label={enregistre ? "Arrêter l'enregistrement" : "Enregistrer la raison"}
        className={cn(
          "relative flex size-36 items-center justify-center rounded-full shadow-brand transition active:scale-95",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--button-2-color)]",
          enregistre ? "bg-secondary text-secondary-content" : "bg-primary text-secondary",
        )}
      >
        {enregistre ? (
          <Square aria-hidden fill="currentColor" strokeWidth={0} className="size-12 rounded-lg" />
        ) : (
          <Mic aria-hidden strokeWidth={1.75} className="size-16" />
        )}
      </button>
    </span>
  );
}

/**
 * Le vocal enregistré, comme une note vocale WhatsApp : lecture / pause, la forme d'onde de la
 * voix qui se colore pendant la réécoute, la durée.
 */
export function NoteVocale({
  ondes,
  avancement,
  lecture,
  dureeSec,
  onEcouter,
}: {
  ondes: number[];
  avancement: number;
  lecture: boolean;
  dureeSec: number;
  onEcouter: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-full bg-accent p-2 pr-5 animate-in fade-in zoom-in-95 duration-200">
      <button
        type="button"
        onClick={onEcouter}
        aria-label={lecture ? "Pause" : "Réécouter"}
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-content transition active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]"
      >
        {lecture ? (
          <Pause aria-hidden fill="currentColor" strokeWidth={0} className="size-6" />
        ) : (
          <Play aria-hidden fill="currentColor" strokeWidth={0} className="ml-0.5 size-6" />
        )}
      </button>
      <span aria-hidden className="flex h-10 flex-1 items-center justify-between">
        {ondes.map((v, i) => (
          <span
            key={i}
            className={cn("w-[3px] rounded-full transition-colors", (i + 0.5) / ondes.length <= avancement ? "bg-secondary" : "bg-secondary/30")}
            style={{ height: `${18 + v * 82}%` }}
          />
        ))}
      </span>
      <span className="text-[15px] font-medium text-gray-600 tabular-nums">{duree(dureeSec)}</span>
    </div>
  );
}
