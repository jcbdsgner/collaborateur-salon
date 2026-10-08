"use client";

import { ArrowLeft, Fingerprint, MessageSquareText, RotateCw, ScanFace, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErreurMessage } from "@/components/shared/erreur";
import { Bouton } from "@/components/ui/atoms/bouton";
import type { useCodeOublie } from "@/hooks/use-code-oublie";
import { cn } from "@/lib/utils";

type Props = {
  oubli: ReturnType<typeof useCodeOublie>;
  /** Le numéro du compte, « 77 123 45 67 » : là où le SMS part. */
  phoneDisplay: string;
  onBiometrie: () => void;
  onRetour: () => void;
};

function Picto({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("relative flex size-36 items-center justify-center rounded-full bg-rose-soft text-taupe", className)}>{children}</span>
  );
}

/** Le téléphone, et la bulle du SMS qui y arrive. */
function PictoSms({ envoye }: { envoye: boolean }) {
  return (
    <Picto>
      <Smartphone aria-hidden strokeWidth={1.5} className="size-20" />
      <span
        className={cn(
          "absolute -top-1 -right-2 flex size-14 items-center justify-center rounded-full bg-primary text-taupe shadow-brand",
          envoye ? "animate-in zoom-in-50 slide-in-from-bottom-6 duration-500" : "animate-pulse",
        )}
      >
        <MessageSquareText aria-hidden strokeWidth={2} className="size-7" />
      </span>
    </Picto>
  );
}

/**
 * Démo seulement (pas de backend, aucun SMS ne part) : la notification du SMS reçu, comme celle
 * du téléphone. La toucher ouvre le lien, comme on le ferait depuis l'app Messages.
 */
function NotificationSmsDemo({ lien }: { lien: string }) {
  const router = useRouter();
  const url = new URL(lien);
  return (
    <button
      type="button"
      onClick={() => router.push(url.pathname)}
      className="fixed inset-x-3 top-3 z-50 flex items-start gap-3 rounded-2xl bg-white/95 p-3 text-left shadow-[0_8px_30px_rgb(0_0_0/0.15)] backdrop-blur animate-in fade-in slide-in-from-top-10 duration-500"
      style={{ animationDelay: "1.2s", animationFillMode: "both" }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#34c759] text-white">
        <MessageSquareText aria-hidden className="size-6" />
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-snug">
        <span className="flex items-center justify-between gap-2">
          <strong className="font-semibold">Beauty and Co</strong>
          <span className="rounded-full bg-base-200 px-2 text-[11px] font-medium text-gray-500">Démo · maintenant</span>
        </span>
        Pour choisir un nouveau code secret, touchez ce lien :{" "}
        <span className="break-all text-[#0a66d8] underline">{url.host + url.pathname}</span>
      </span>
    </button>
  );
}

/**
 * Code secret oublié (CONTEXT.md), un seul écran et une seule décision, lisible sans lire :
 * - Face ID / l'empreinte de l'appareil est la sienne : le visage ou l'empreinte à toucher, et
 *   « Recevoir un lien par SMS » dessous ;
 * - sinon, le SMS est déjà parti : le téléphone et la bulle du SMS, le numéro en gros chiffres,
 *   « Renvoyer » au bout de 30 s.
 */
export function CodeOublie({ oubli, phoneDisplay, onBiometrie, onRetour }: Props) {
  const IconeBio = oubli.libelle === "Face ID" ? ScanFace : Fingerprint;
  const faceId = oubli.biometrie && !oubli.envoye;

  let picto: React.ReactNode, titre: string, texte: React.ReactNode;
  if (faceId) {
    picto = (
      <Picto>
        <IconeBio aria-hidden strokeWidth={1.5} className="size-20" />
      </Picto>
    );
    titre = "Code oublié ?";
    texte = `Vérifiez avec ${oubli.libelle}, puis choisissez un nouveau code.`;
  } else {
    picto = <PictoSms envoye={oubli.envoye} />;
    titre = oubli.envoye ? "Lien envoyé par SMS" : "Envoi du SMS…";
    texte = (
      <>
        <span className="block text-[26px] font-semibold tracking-wide text-base-content tabular-nums">{phoneDisplay}</span>
        {oubli.envoye && "Touchez le lien reçu pour choisir un nouveau code."}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-8 duration-300 motion-reduce:animate-none">
      {oubli.lienDemo && <NotificationSmsDemo lien={oubli.lienDemo} />}

      {oubli.pret && (
        <div key={faceId ? "bio" : "sms"} className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center animate-in fade-in duration-300">
          {picto}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">{titre}</h2>
            <p className="text-[17px] text-base-content/70">{texte}</p>
          </div>
          <div className="min-h-6">
            <ErreurMessage erreur={oubli.erreur} />
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3 px-4 pt-2 pb-6">
        {faceId && (
          <>
            <Bouton icone={<IconeBio aria-hidden className="size-6" />} disabled={oubli.pending} onClick={onBiometrie}>
              Utiliser {oubli.libelle}
            </Bouton>
            <Bouton ton="doux" icone={<MessageSquareText aria-hidden className="size-6" />} disabled={oubli.pending} onClick={oubli.envoyerSms}>
              Recevoir un lien par SMS
            </Bouton>
          </>
        )}
        {/* Toujours là (désactivé pendant l'envoi) : rien ne saute quand le SMS est parti. */}
        {!faceId && (
          <Bouton
            ton="doux"
            icone={<RotateCw aria-hidden className={cn("size-6", oubli.pending && "animate-spin")} />}
            disabled={oubli.pending || oubli.renvoiDans > 0}
            onClick={oubli.envoyerSms}
          >
            {oubli.renvoiDans > 0 ? `Renvoyer (${oubli.renvoiDans} s)` : oubli.pending ? "Envoi…" : "Renvoyer le SMS"}
          </Bouton>
        )}
        <Bouton ton="doux" icone={<ArrowLeft aria-hidden className="size-6" />} onClick={onRetour}>
          Retour
        </Bouton>
      </div>
    </div>
  );
}
