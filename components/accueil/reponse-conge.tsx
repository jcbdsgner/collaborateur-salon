import { CircleCheck, CircleX } from "lucide-react";
import { BulleNotification } from "@/components/ui/molecules/bulle-notification";
import type { DecisionConge } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const MOIS = new Intl.DateTimeFormat("fr-FR", { month: "long" });
const date = (iso: string) => new Date(`${iso}T00:00:00`);

/** « Le 20 octobre », « Du 20 au 24 octobre », « Du 30 octobre au 2 novembre ». */
function periode(debut: string, fin: string) {
  const d = date(debut);
  const f = date(fin);
  if (debut === fin) return `Le ${d.getDate()} ${MOIS.format(d)}`;
  if (d.getMonth() === f.getMonth()) return `Du ${d.getDate()} au ${f.getDate()} ${MOIS.format(f)}`;
  return `Du ${d.getDate()} ${MOIS.format(d)} au ${f.getDate()} ${MOIS.format(f)}`;
}

type Props = { decision: DecisionConge; debut: string; fin: string; onFermer: () => void };

/**
 * Réponse à la dernière Demande de congé, dans une bulle qu'on ferme (croix ou glissement).
 * Une phrase coupée toujours au même endroit (la décision, puis les dates) : accepté et refusé
 * ne diffèrent que par la couleur et le mot.
 */
export function ReponseConge({ decision, debut, fin, onFermer }: Props) {
  const accepte = decision === "accepte";
  const Icone = accepte ? CircleCheck : CircleX;
  return (
    <BulleNotification onFermer={onFermer}>
      <p className="flex items-start gap-3 text-base leading-snug">
        <Icone aria-hidden strokeWidth={2.25} className={cn("mt-0.5 size-7 shrink-0", accepte ? "text-success" : "text-error")} />
        <span>
          <span className="block">
            Votre congé est{" "}
            <strong className={cn("font-semibold", accepte ? "text-success" : "text-error")}>
              {accepte ? "accepté" : "refusé"}
            </strong>
            .
          </span>
          <span className="block text-[15px] text-gray-600">{periode(debut, fin)}</span>
        </span>
      </p>
    </BulleNotification>
  );
}
