/** Mêmes rôles que point-de-vente (`lib/data/types.ts`). */
export type Role = "coiffeuse" | "estheticienne" | "menage" | "accueil";

/** La réponse à une demande de congé — jamais « en attente » (voir CONTEXT.md). */
export type DecisionConge = "accepte" | "refuse";

/**
 * Un collaborateur, tel que l'app le voit. `id` est le même que `Praticienne.id` de point-de-vente :
 * c'est aussi le contenu de son Code QR, que le scanner de point-de-vente reconnaît tel quel.
 */
export type Collaborateur = {
  id: string;
  name: string;
  role: Role;
  /** 9 chiffres, sans indicatif ni espaces — affiché « 77 777 77 77 ». */
  phone: string;
  /** Absente ⇒ première connexion pas encore faite (la photo y est obligatoire). */
  photoUrl: string | null;
};

/** Le compte de connexion d'un collaborateur — données simulées. */
export type Compte = {
  /** Code secret, 4 chiffres. Null ⇒ première connexion : le collaborateur le définit lui-même. */
  code: string | null;
};

/** Un message vocal enregistré sur le téléphone (data URL, gardée en local — pas de backend). */
export type MessageVocal = { url: string; dureeSec: number };

export type DemandeConge = {
  id: string;
  collaborateurId: string;
  /** ISO date (yyyy-MM-dd). */
  debut: string;
  /** ISO date (yyyy-MM-dd), ≥ debut. */
  fin: string;
  /** La raison, enregistrée en vocal (pas de texte : l'app doit servir à qui ne lit pas). */
  raison: MessageVocal | null;
  /** ISO datetime. */
  envoyeeLe: string;
  /** Absente ⇒ pas encore de décision : rien ne s'affiche à l'Accueil. */
  decision: DecisionConge | null;
  /** Le collaborateur a fermé la réponse à l'Accueil : elle n'y reparaît plus. */
  reponseFermee?: boolean;
};

export type DemandeAvance = {
  id: string;
  collaborateurId: string;
  /** En francs CFA, entier > 0. */
  montant: number;
  /** ISO datetime. */
  envoyeeLe: string;
};
