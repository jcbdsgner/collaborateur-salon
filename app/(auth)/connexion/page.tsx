"use client";

import { Fingerprint, Phone, ScanFace } from "lucide-react";
import { CodeOublie } from "@/components/shared/code-oublie";
import { ErreurMessage } from "@/components/shared/erreur";
import { SaisieCode } from "@/components/shared/saisie-code";
import { Bouton } from "@/components/ui/atoms/bouton";
import { BoutonRetour } from "@/components/ui/atoms/bouton-retour";
import { Logo } from "@/components/ui/atoms/logo";
import { PaveNumerique } from "@/components/ui/molecules/pave-numerique";
import { BarreHaut } from "@/components/ui/molecules/barre-haut";
import { useConnexion } from "@/hooks/use-connexion";
import { cn } from "@/lib/utils";

/** Le modèle du numéro : les chiffres tapés le remplissent, le reste reste en gris clair. */
const MODELE = "77 777 77 77";

/** Le numéro en gros chiffres, groupés comme on le dit : « 77 123 45 67 ». */
function Numero({ chiffres }: { chiffres: string }) {
  let i = 0;
  return (
    <p aria-hidden className="flex text-[34px] leading-none font-semibold tracking-wide tabular-nums">
      {MODELE.split("").map((c, k) => {
        if (c === " ") return <span key={k} className="w-3" />;
        const tape = chiffres[i++];
        return (
          <span key={k} className={cn("inline-block w-[0.62em] text-center", tape ? "text-base-content" : "text-gray-300")}>
            {tape ?? "0"}
          </span>
        );
      })}
    </p>
  );
}

/**
 * Connexion (CONTEXT.md) : Face ID / l'empreinte si activé sur l'appareil, sinon le numéro puis
 * le code secret, chacun au pavé numérique et sans bouton « Valider » : la saisie part toute seule
 * dès qu'elle est complète. Sous le code, « J'ai oublié mon code ».
 */
export default function ConnexionPage() {
  const f = useConnexion();
  if (f.etape === "chargement") return null;

  if (f.etape === "biometrie") {
    const Icone = f.libelleBiometrie === "Face ID" ? ScanFace : Fingerprint;
    return (
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <Logo className="h-16" />
          <button
            type="button"
            onClick={f.connecterAvecBiometrie}
            disabled={f.pending}
            aria-label={`Se connecter avec ${f.libelleBiometrie}`}
            className="flex size-40 items-center justify-center rounded-full bg-rose-soft text-taupe transition active:scale-95 disabled:opacity-60"
          >
            <Icone aria-hidden strokeWidth={1.25} className="size-24" />
          </button>
          <div className="min-h-6">
            <ErreurMessage erreur={f.erreur} />
          </div>
        </div>
        <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
          <Bouton icone={<Icone aria-hidden className="size-6" />} disabled={f.pending} onClick={f.connecterAvecBiometrie}>
            Se connecter avec {f.libelleBiometrie}
          </Bouton>
          <Bouton ton="doux" icone={<Phone aria-hidden className="size-6" />} onClick={f.utiliserNumero}>
            Utiliser mon numéro
          </Bouton>
        </div>
      </main>
    );
  }

  if (f.etape === "oubli") {
    return (
      <main className="flex flex-1 flex-col">
        <BarreHaut gauche={<BoutonRetour onClick={f.retourCode} />} titre="Code secret" />
        <CodeOublie oubli={f.oubli} phoneDisplay={f.phoneDisplay} onBiometrie={f.oubliBiometrie} onRetour={f.retourCode} />
      </main>
    );
  }

  if (f.etape === "code") {
    return (
      <main className="flex flex-1 flex-col">
        <BarreHaut gauche={<BoutonRetour onClick={f.retour} />} titre={f.phoneDisplay} />
        <SaisieCode
          etape="code"
          cadenas="ferme"
          titre="Votre code secret"
          remplis={f.code.length}
          erreur={f.erreur}
          disabled={f.pending}
          onChiffre={(c) => f.setCode(f.code + c)}
          onEffacer={() => f.setCode(f.code.slice(0, -1))}
          lienOubli={f.oublie}
        />
      </main>
    );
  }

  const chiffres = f.phoneDisplay.replace(/\D/g, "");
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <Logo className="h-14" />
        <span className="flex size-16 items-center justify-center rounded-full bg-accent text-secondary">
          <Phone aria-hidden strokeWidth={1.75} className="size-8" />
        </span>
        <h1 className="text-center text-xl font-semibold">Votre numéro de téléphone</h1>
        <div key={f.erreur?.tick} role="status" aria-label={`Numéro : ${f.phoneDisplay}`} className={cn(f.erreur && "attention-shake-once")}>
          <Numero chiffres={chiffres} />
        </div>
        <div className="min-h-6">
          <ErreurMessage erreur={f.erreur} />
        </div>
      </div>
      <div className="px-4 pt-2 pb-6">
        <PaveNumerique
          disabled={f.pending}
          onChiffre={(c) => chiffres.length < 9 && f.setPhone(chiffres + c)}
          onEffacer={() => f.setPhone(chiffres.slice(0, -1))}
        />
      </div>
    </main>
  );
}
