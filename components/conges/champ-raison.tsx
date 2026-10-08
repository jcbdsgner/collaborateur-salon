import { Mic, Square, Trash2 } from "lucide-react";
import { duree, NoteVocale } from "@/components/conges/vocal";
import type { useEnregistrementVocal } from "@/hooks/use-enregistrement-vocal";
import { cn } from "@/lib/utils";

const RAYON = 30;
const TOUR = 2 * Math.PI * RAYON;

const focusVisible = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]";

type Props = {
  texte: string;
  max: number;
  onTexte: (t: string) => void;
  vocal: ReturnType<typeof useEnregistrementVocal>;
};

/**
 * La raison du congé, comme une messagerie : un champ de texte, et dans son coin bas droit un
 * micro rose pour dire la raison au lieu (ou en plus) de l'écrire. Pendant l'enregistrement, le
 * champ montre le chrono et un halo qui suit la voix ; le micro devient « stop » et son anneau se
 * remplit jusqu'à 60 s. Ensuite, la note vocale s'affiche en bas du champ, la corbeille à la
 * place du micro pour l'effacer.
 */
export function ChampRaison({ texte, max, onTexte, vocal }: Props) {
  const enregistrement = vocal.etat === "enregistrement";
  const enregistre = vocal.etat === "enregistre" && vocal.vocal;

  return (
    <div className="flex min-h-56 w-full flex-1 flex-col rounded-3xl border-2 border-base-300 bg-base-100 transition-colors focus-within:border-secondary">
      {enregistrement ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3" aria-live="polite">
          <span className="relative flex size-16 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary transition-transform duration-100"
              style={{ transform: `scale(${1 + vocal.niveau * 0.5})` }}
            />
            <Mic aria-hidden strokeWidth={1.75} className="relative size-7 text-secondary" />
          </span>
          <span className="text-[26px] leading-8 font-semibold tabular-nums">{duree(vocal.secondes)}</span>
        </div>
      ) : (
        <label className="flex flex-1">
          <span className="sr-only">Raison du congé</span>
          <textarea
            value={texte}
            onChange={(e) => onTexte(e.target.value)}
            maxLength={max}
            placeholder="Écrivez pourquoi, ou touchez le micro"
            className="w-full flex-1 resize-none bg-transparent px-4 pt-4 text-[17px] leading-6 outline-none placeholder:text-gray-500"
          />
        </label>
      )}

      <div className="flex items-end gap-2 p-2 pl-4">
        <div className="flex min-w-0 flex-1 items-center self-center">
          {enregistre ? (
            <NoteVocale
              ondes={vocal.ondes}
              avancement={vocal.avancement}
              lecture={vocal.lecture}
              dureeSec={vocal.vocal!.dureeSec}
              onEcouter={vocal.ecouter}
            />
          ) : (
            !enregistrement &&
            texte.length > 0 && (
              <span className="text-[13px] text-gray-500 tabular-nums">
                {texte.length}/{max}
              </span>
            )
          )}
        </div>

        {enregistre ? (
          <button
            type="button"
            onClick={vocal.recommencer}
            aria-label="Effacer le vocal"
            className={cn("flex size-18 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content transition active:scale-90", focusVisible)}
          >
            <Trash2 aria-hidden strokeWidth={2} className="size-6" />
          </button>
        ) : (
          <span className="relative flex size-16 shrink-0 items-center justify-center">
            {enregistrement ? (
              <svg aria-hidden viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
                <circle cx="32" cy="32" r={RAYON} fill="none" strokeWidth="3" className="stroke-base-300" />
                <circle
                  cx="32"
                  cy="32"
                  r={RAYON}
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={TOUR}
                  strokeDashoffset={TOUR * (1 - Math.min(vocal.secondes, vocal.max) / vocal.max)}
                  className="stroke-secondary transition-[stroke-dashoffset] duration-300"
                />
              </svg>
            ) : (
              texte.length === 0 && <span aria-hidden className="absolute inset-1 rounded-full bg-primary anim-micro-appel" />
            )}
            <button
              type="button"
              onClick={vocal.basculer}
              aria-pressed={enregistrement}
              aria-label={enregistrement ? "Arrêter l'enregistrement" : "Enregistrer la raison en vocal"}
              className={cn(
                "relative flex size-14 items-center justify-center rounded-full shadow-brand transition active:scale-90",
                focusVisible,
                enregistrement ? "bg-secondary text-secondary-content" : "bg-primary text-secondary",
              )}
            >
              {enregistrement ? (
                <Square aria-hidden fill="currentColor" strokeWidth={0} className="size-5 rounded" />
              ) : (
                <Mic aria-hidden strokeWidth={2} className="size-6" />
              )}
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
