/** Toutes les routes de l'app — voir l'architecture d'information dans CONTEXT.md. */
export const ROUTES = {
  connexion: "/connexion",
  premiereConnexion: {
    photo: "/premiere-connexion/photo",
    /** Créer le code et le confirmer, sur le même écran. */
    code: "/premiere-connexion/code",
    /** Proposée après le code, seulement si l'appareil sait le faire — hors barre de progression. */
    biometrie: "/premiere-connexion/biometrie",
  },
  accueil: "/",
  parametres: "/parametres",
  changerPhoto: "/parametres/photo",
  /** Aussi le parcours « Code secret oublié » une fois Face ID / l'empreinte passé. */
  changerCode: "/parametres/code-secret",
  /** Demander un congé, écran 1 : le calendrier. */
  demanderConge: "/conges",
  /** Demander un congé, écran 2 : la raison, en vocal ou écrite. */
  congeRaison: "/conges/raison",
  demanderAvance: "/avance",
  /** Le lien reçu par SMS (Code secret oublié) : choisir un nouveau code. */
  nouveauCode: (jeton: string) => `/nouveau-code/${jeton}`,
} as const;

/**
 * Les 3 étapes de la Première connexion, dans l'ordre — pilote la barre de progression. Le code
 * et sa confirmation sont deux écrans de la même page.
 */
export const ETAPES_PREMIERE_CONNEXION = [
  { id: "photo", label: "Photo de profil", href: ROUTES.premiereConnexion.photo },
  { id: "code", label: "Code secret", href: ROUTES.premiereConnexion.code },
  { id: "confirmation", label: "Confirmation du code", href: ROUTES.premiereConnexion.code },
] as const;

export type EtapePremiereConnexion = (typeof ETAPES_PREMIERE_CONNEXION)[number]["id"];

/**
 * Position dans la Première connexion (1 → 3), pour la barre de progression. Sans photo à
 * prendre (code remis à zéro par le salon), le parcours n'a que 2 étapes.
 */
export function progression(etape: EtapePremiereConnexion, avecPhoto = true) {
  const etapes = avecPhoto ? ETAPES_PREMIERE_CONNEXION : ETAPES_PREMIERE_CONNEXION.filter((e) => e.id !== "photo");
  return { etape: etapes.findIndex((e) => e.id === etape) + 1, total: etapes.length };
}
