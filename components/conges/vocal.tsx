import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/** « 0:07 », « 1:00 ». */
export const duree = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

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
