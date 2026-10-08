"use client";

import { useEffect } from "react";
import { ecouterInstallation } from "@/hooks/use-installation";

/** Garde l'invitation « Installer l'application » du navigateur, quel que soit l'écran d'arrivée. */
export function EcouteInstallation() {
  useEffect(ecouterInstallation, []);
  return null;
}
