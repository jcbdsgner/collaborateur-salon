"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

/** L'évènement de Chrome / Android qui permet d'ouvrir sa fenêtre « Installer l'application ». */
type InvitationNavigateur = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/**
 * L'invitation du navigateur arrive tôt, dès le chargement, quel que soit l'écran : elle est
 * gardée ici par `EcouteInstallation` (layout racine) jusqu'à ce que l'Accueil la propose.
 */
const useInvitation = create<{ invitation: InvitationNavigateur | null }>(() => ({ invitation: null }));

export function ecouterInstallation() {
  const garder = (e: Event) => {
    e.preventDefault();
    useInvitation.setState({ invitation: e as InvitationNavigateur });
  };
  const oublier = () => useInvitation.setState({ invitation: null });
  window.addEventListener("beforeinstallprompt", garder);
  window.addEventListener("appinstalled", oublier);
  return () => {
    window.removeEventListener("beforeinstallprompt", garder);
    window.removeEventListener("appinstalled", oublier);
  };
}

const CLE_PLUS_TARD = "collaborateur-bco:installation-plus-tard";
/** « Plus tard » : l'invitation revient après ce nombre de jours. */
const PLUS_TARD_JOURS = 3;

function repousseeJusquA(): number {
  try {
    return Number(localStorage.getItem(CLE_PLUS_TARD)) || 0;
  } catch {
    return 0;
  }
}

function dejaInstallee() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

/** iPhone / iPad (iPadOS se présente comme un Mac, mais tactile) : pas d'invitation, on montre les gestes. */
function estIOS() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export type ModeInstallation = "invitation" | "ios" | null;

/**
 * Proposer d'installer l'app sur l'écran d'accueil, pour l'ouvrir d'un geste comme une vraie app.
 * - Chrome / Android : un bouton ouvre la fenêtre d'installation du navigateur ;
 * - iPhone : Safari n'en a pas, on montre les deux gestes (Partager, puis « Sur l'écran d'accueil ») ;
 * - déjà installée, repoussée (« Plus tard ») ou autre navigateur : rien.
 */
export function useInstallation() {
  const invitation = useInvitation((s) => s.invitation);
  const [ios, setIos] = useState(false);
  const [masquee, setMasquee] = useState(true);

  useEffect(() => {
    if (dejaInstallee() || repousseeJusquA() > Date.now()) return;
    // Lu après le montage (navigateur seulement), comme localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIos(estIOS());
    setMasquee(false);
  }, []);

  const mode: ModeInstallation = masquee ? null : invitation ? "invitation" : ios ? "ios" : null;

  function plusTard() {
    setMasquee(true);
    try {
      localStorage.setItem(CLE_PLUS_TARD, String(Date.now() + PLUS_TARD_JOURS * 86_400_000));
    } catch {}
  }

  async function installer() {
    if (!invitation) return;
    await invitation.prompt();
    const { outcome } = await invitation.userChoice;
    // Une invitation ne sert qu'une fois.
    useInvitation.setState({ invitation: null });
    if (outcome === "dismissed") plusTard();
  }

  return { mode, installer, plusTard };
}
