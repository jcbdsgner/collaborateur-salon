"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

export type JourCalendrier = {
  /** yyyy-MM-dd */
  iso: string;
  /** 1 → 31, seul repère qu'il faut savoir lire (des chiffres). */
  numero: number;
  dansLeMois: boolean;
  /** Avant `min` : non touchable. */
  desactive: boolean;
  aujourdhui: boolean;
  debut: boolean;
  fin: boolean;
  /** Strictement entre le début et la fin — la plage colorée. */
  dansLaPlage: boolean;
};

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * Un seul calendrier pour choisir une plage, sans avoir à lire « début » ou « fin » : on touche
 * le premier jour, puis le dernier. Toucher un jour avant le début le remplace ; toucher encore
 * une fois la plage complète recommence. Toucher le même jour deux fois = un congé d'un jour.
 * Semaines du lundi au dimanche.
 */
export function useCalendrierPlage({ min, debut: debutInitial = "", fin: finInitiale = "" }: { min: string; debut?: string; fin?: string }) {
  const [debut, setDebut] = useState(debutInitial);
  const [fin, setFin] = useState(finInitiale);
  const [mois, setMois] = useState(() => startOfMonth(parseISO(debutInitial || min)));
  const aujourdhui = iso(new Date());

  const semaines = useMemo(() => {
    const jours = eachDayOfInterval({
      start: startOfWeek(startOfMonth(mois), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(mois), { weekStartsOn: 1 }),
    }).map((d): JourCalendrier => {
      const j = iso(d);
      return {
        iso: j,
        numero: d.getDate(),
        dansLeMois: isSameMonth(d, mois),
        desactive: j < min,
        aujourdhui: j === aujourdhui,
        debut: j === debut,
        fin: j === fin,
        dansLaPlage: Boolean(debut && fin) && j > debut && j < fin,
      };
    });
    const out: JourCalendrier[][] = [];
    for (let i = 0; i < jours.length; i += 7) out.push(jours.slice(i, i + 7));
    return out;
  }, [mois, min, debut, fin, aujourdhui]);

  function toucher(j: string) {
    if (j < min) return;
    if (!debut || (debut && fin) || j < debut) {
      setDebut(j);
      setFin("");
    } else {
      setFin(j);
    }
  }

  const premierMois = startOfMonth(parseISO(min));

  return {
    semaines,
    /** Initiales des jours, lundi d'abord : « L M M J V S D ». */
    joursSemaine: ["L", "M", "M", "J", "V", "S", "D"],
    /** « octobre 2026 » */
    libelleMois: format(mois, "MMMM yyyy", { locale: fr }),
    moisPrecedent: () => setMois((m) => addMonths(m, -1)),
    peutReculer: mois > premierMois,
    moisSuivant: () => setMois((m) => addMonths(m, 1)),
    toucher,
    debut,
    fin,
    complet: Boolean(debut && fin),
    /** Nombre de jours de la plage, bornes comprises. */
    nombreJours: debut && fin ? eachDayOfInterval({ start: parseISO(debut), end: parseISO(fin) }).length : 0,
    effacer: () => {
      setDebut("");
      setFin("");
    },
  };
}
