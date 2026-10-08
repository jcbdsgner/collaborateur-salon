"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useErreur } from "@/hooks/use-async-action";
import type { MessageVocal } from "@/lib/data/types";

/** Durée maximale d'un vocal : l'enregistrement s'arrête tout seul. */
export const VOCAL_MAX_SEC = 60;

export type EtatVocal = "vide" | "enregistrement" | "enregistre";

/** Safari enregistre en mp4, Chrome/Android en webm. */
function formatSupporte(): string | undefined {
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
}

/** Nombre de barres de la forme d'onde affichée à la réécoute. */
const BARRES = 32;

/** Réduit les niveaux relevés pendant l'enregistrement à `BARRES` barres (le pic de chaque tranche), de 0 à 1. */
function formeOnde(niveaux: number[]): number[] {
  if (!niveaux.length) return Array(BARRES).fill(0);
  const barres = Array.from({ length: BARRES }, (_, i) => {
    const a = Math.floor((i * niveaux.length) / BARRES);
    const b = Math.max(a + 1, Math.floor(((i + 1) * niveaux.length) / BARRES));
    return Math.max(...niveaux.slice(a, b));
  });
  const max = Math.max(...barres) || 1;
  return barres.map((v) => v / max);
}

function versDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/**
 * Enregistrer un message vocal au micro : appuyer pour démarrer, appuyer pour arrêter (ou arrêt
 * auto à 60 s), réécouter, recommencer. Le vocal est gardé en data URL (pas de backend), en
 * qualité « voix » pour rester léger. Micro refusé ⇒ erreur `micro_refuse` (picto du micro barré).
 * Le niveau du micro est relevé en direct (`niveau`, pour montrer qu'il entend) et donne la forme
 * d'onde de la réécoute (`ondes`), comme une note vocale WhatsApp.
 */
export function useEnregistrementVocal(initial: MessageVocal | null = null) {
  const [etat, setEtat] = useState<EtatVocal>(initial ? "enregistre" : "vide");
  const [vocal, setVocal] = useState<MessageVocal | null>(initial);
  const [secondes, setSecondes] = useState(0);
  const [lecture, setLecture] = useState(false);
  /** 0 → 1 : le niveau du micro pendant l'enregistrement. */
  const [niveau, setNiveau] = useState(0);
  const [ondes, setOndes] = useState<number[]>(() => formeOnde([]));
  /** 0 → 1 : où en est la réécoute. */
  const [avancement, setAvancement] = useState(0);
  const { erreur, signaler, effacer } = useErreur();

  const recorder = useRef<MediaRecorder | null>(null);
  const flux = useRef<MediaStream | null>(null);
  const morceaux = useRef<Blob[]>([]);
  const debutRef = useRef(0);
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const contexte = useRef<AudioContext | null>(null);
  const niveaux = useRef<number[]>([]);
  const image = useRef(0);

  const libererMicro = useCallback(() => {
    if (minuteur.current) clearInterval(minuteur.current);
    minuteur.current = null;
    flux.current?.getTracks().forEach((t) => t.stop());
    flux.current = null;
    void contexte.current?.close().catch(() => {});
    contexte.current = null;
    setNiveau(0);
  }, []);

  const arreterLecture = useCallback(() => {
    audio.current?.pause();
    cancelAnimationFrame(image.current);
    setLecture(false);
    setAvancement(0);
  }, []);

  const arreter = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const demarrer = useCallback(async () => {
    effacer();
    arreterLecture();
    try {
      flux.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return signaler("micro_refuse", "Autorisez le micro pour enregistrer.");
    }
    // Analyse du niveau : facultative (sans elle, le vocal s'enregistre quand même).
    let analyseur: AnalyserNode | null = null;
    try {
      contexte.current = new AudioContext();
      analyseur = contexte.current.createAnalyser();
      analyseur.fftSize = 512;
      contexte.current.createMediaStreamSource(flux.current).connect(analyseur);
    } catch {
      analyseur = null;
    }
    const echantillon = new Uint8Array(analyseur?.fftSize ?? 0);
    niveaux.current = [];
    const mimeType = formatSupporte();
    const rec = new MediaRecorder(flux.current, { mimeType, audioBitsPerSecond: 32_000 });
    morceaux.current = [];
    rec.ondataavailable = (e) => e.data.size && morceaux.current.push(e.data);
    rec.onstop = async () => {
      const dureeSec = Math.max(1, Math.round((Date.now() - debutRef.current) / 1000));
      libererMicro();
      const url = await versDataUrl(new Blob(morceaux.current, { type: rec.mimeType }));
      setOndes(formeOnde(niveaux.current));
      setVocal({ url, dureeSec });
      setEtat("enregistre");
    };
    recorder.current = rec;
    debutRef.current = Date.now();
    setSecondes(0);
    rec.start();
    setEtat("enregistrement");
    minuteur.current = setInterval(() => {
      const s = Math.floor((Date.now() - debutRef.current) / 1000);
      setSecondes(s);
      if (analyseur) {
        analyseur.getByteTimeDomainData(echantillon);
        let somme = 0;
        for (const v of echantillon) somme += ((v - 128) / 128) ** 2;
        const n = Math.min(1, Math.sqrt(somme / echantillon.length) * 4);
        niveaux.current.push(n);
        setNiveau(n);
      }
      if (s >= VOCAL_MAX_SEC) arreter();
    }, 100);
  }, [arreter, arreterLecture, effacer, libererMicro, signaler]);

  const ecouter = useCallback(() => {
    if (!vocal) return;
    if (lecture) return arreterLecture();
    const a = new Audio(vocal.url);
    audio.current = a;
    a.onended = arreterLecture;
    // La durée d'un webm enregistré est souvent inconnue du lecteur : on prend celle mesurée.
    const suivre = () => {
      setAvancement(Math.min(1, a.currentTime / vocal.dureeSec));
      image.current = requestAnimationFrame(suivre);
    };
    void a.play();
    image.current = requestAnimationFrame(suivre);
    setLecture(true);
  }, [vocal, lecture, arreterLecture]);

  const recommencer = useCallback(() => {
    arreterLecture();
    setVocal(null);
    setSecondes(0);
    setEtat("vide");
  }, [arreterLecture]);

  // Quitter l'écran coupe le micro et la lecture.
  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      libererMicro();
      audio.current?.pause();
      cancelAnimationFrame(image.current);
    },
    [libererMicro],
  );

  return {
    etat,
    vocal,
    /** Secondes écoulées pendant l'enregistrement (pour la jauge vers 60 s). */
    secondes,
    max: VOCAL_MAX_SEC,
    niveau,
    ondes,
    avancement,
    /** Un seul gros bouton micro : démarre ou arrête selon l'état. */
    basculer: () => (etat === "enregistrement" ? arreter() : demarrer()),
    ecouter,
    lecture,
    recommencer,
    erreur,
  };
}
