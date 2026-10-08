"use client";

import { ErreurMessage } from "@/components/shared/erreur";
import { useEtapeBiometrie } from "@/hooks/use-premiere-connexion";

/** Après le code secret — squelette non stylé : proposer Face ID / l'empreinte digitale. */
export default function BiometriePage() {
  const f = useEtapeBiometrie();
  return (
    <main>
      <button type="button" disabled={f.pending} onClick={f.activer}>Activer {f.libelle}</button>
      <ErreurMessage erreur={f.erreur} />
      <button type="button" disabled={f.pending} onClick={f.plusTard}>Plus tard</button>
    </main>
  );
}
