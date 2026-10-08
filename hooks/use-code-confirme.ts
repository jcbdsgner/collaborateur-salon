"use client";

import { useEffect, useRef, useState } from "react";
import { CODE_LENGTH, normalizeCode } from "@/lib/format";
import { VIBRATION, vibrer } from "@/lib/feedback";
import { useErreur } from "@/hooks/use-async-action";

/** Le temps de voir les points passer au vert (et le cadenas s'animer) avant l'écran suivant. */
export const VALIDE_MS = 650;
/** En fin de parcours, le temps de voir le cadenas se refermer avant de partir. */
export const FIN_MS = 900;

export type EtapeCode = "nouveau" | "confirmation";

/**
 * Créer un code puis le confirmer, en 2 écrans (CONTEXT.md, Code + confirmation) : « nouveau »,
 * puis « confirmation ». Pour qu'on ne croie pas le premier code refusé, ses points passent au
 * vert (`valide`, petite vibration) avant de glisser vers la confirmation. Codes identiques ⇒
 * `onComplet(code)` ; différents ⇒ erreur `codes_differents` et retour à « nouveau ».
 * Sert à la Première connexion et à « Changer le code secret ». `onComplet` peut renvoyer `false`
 * (enregistrement refusé) : tout recommence.
 */
export function useCodeConfirme(onComplet: (code: string) => void | boolean | Promise<void | boolean>) {
  const [etape, setEtape] = useState<EtapeCode>("nouveau");
  const [premier, setPremier] = useState("");
  const [second, setSecond] = useState("");
  const [valide, setValide] = useState(false);
  const { erreur, signaler, effacer } = useErreur();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const recommencer = () => {
    clearTimeout(timer.current);
    setEtape("nouveau");
    setPremier("");
    setSecond("");
    setValide(false);
  };

  function saisir(v: string) {
    if (valide) return;
    const val = normalizeCode(v);
    effacer();
    if (etape === "nouveau") {
      setPremier(val);
      if (val.length < CODE_LENGTH) return;
      setValide(true);
      vibrer(VIBRATION.succes);
      timer.current = setTimeout(() => {
        setValide(false);
        setEtape("confirmation");
      }, VALIDE_MS);
      return;
    }
    setSecond(val);
    if (val.length < CODE_LENGTH) return;
    if (val !== premier) {
      recommencer();
      signaler("codes_differents", "Les deux codes ne correspondent pas.");
      return;
    }
    setValide(true);
    vibrer(VIBRATION.succes);
    timer.current = setTimeout(() => {
      void Promise.resolve(onComplet(premier)).then((ok) => {
        if (ok === false) recommencer();
      });
    }, FIN_MS);
  }

  const valeur = etape === "nouveau" ? premier : second;

  return {
    etape,
    premier,
    second,
    /** Valeur de l'écran en cours. */
    valeur,
    /** Code complet et bon : ses points sont verts, la suite arrive. */
    valide,
    saisir,
    ajouterChiffre: (c: string) => saisir(valeur + c),
    effacerChiffre: () => {
      if (valide) return;
      effacer();
      if (etape === "nouveau") setPremier(premier.slice(0, -1));
      else setSecond(second.slice(0, -1));
    },
    /** Retour depuis la confirmation : on revient choisir le code. Faux si on est déjà au début. */
    retour: () => {
      if (etape === "nouveau") return false;
      recommencer();
      effacer();
      return true;
    },
    recommencer: () => {
      recommencer();
      effacer();
    },
    erreur,
  };
}
