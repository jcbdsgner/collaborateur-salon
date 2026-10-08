"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { definirCodeParLien, verifierLienCode } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useCodeConfirme } from "@/hooks/use-code-confirme";

export type EtatLien = "verification" | "bon" | "invalide";

/**
 * Le lien reçu par SMS (Code secret oublié) : s'il est encore bon, choisir un nouveau code puis le
 * confirmer (2 écrans, `useCodeConfirme`) ; la session s'ouvre et on arrive à l'Accueil. Usé ou
 * expiré : on le dit, et on renvoie à la Connexion pour en demander un autre.
 */
export function useNouveauCode(jeton: string) {
  const router = useRouter();
  const [etat, setEtat] = useState<EtatLien>("verification");
  const enregistrement = useAsyncAction(definirCodeParLien);

  useEffect(() => {
    let vivant = true;
    verifierLienCode(jeton).then(
      () => vivant && setEtat("bon"),
      () => vivant && setEtat("invalide"),
    );
    return () => {
      vivant = false;
    };
  }, [jeton]);

  const code = useCodeConfirme(async (nouveau) => {
    if ((await enregistrement.run(jeton, nouveau)).ok) return router.replace(ROUTES.accueil);
    setEtat("invalide");
    return false;
  });

  return {
    etat,
    ...code,
    progression: { etape: code.etape === "confirmation" ? 2 : 1, total: 2 },
    /** Depuis la confirmation : revenir choisir le code ; sinon, la Connexion. */
    retour: () => {
      if (!code.retour()) router.replace(ROUTES.connexion);
    },
    nouveauLien: () => router.replace(ROUTES.connexion),
    pending: enregistrement.pending,
    erreur: code.erreur ?? enregistrement.erreur,
  };
}
