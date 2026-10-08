import type { Collaborateur, Compte, DemandeConge, Role } from "@/lib/data/types";

/**
 * L'équipe — reprise de point-de-vente (`lib/data/praticiennes.ts`) : mêmes ids, noms, rôles et
 * photos. Téléphones, codes et demandes sont inventés pour la démo.
 *
 * Comptes de démo (code entre parenthèses) :
 * - Bineta 77 123 45 67 (1234) : congé accepté
 * - Fatou 77 234 56 78 (1234) : congé refusé
 * - Gnagna 78 345 67 89 (1234) : pas de décision
 * - Michelle 76 456 78 90 (pas encore de code) : première connexion
 * - Henry 70 567 89 01 (code remis à zéro par le salon) : nouveau code, sans repasser par la photo
 */
export const COLLABORATEURS: Collaborateur[] = [
  { id: "bineta", name: "Bineta", role: "coiffeuse", phone: "771234567", photoUrl: "/images/equipe/bineta.jpg" },
  { id: "fatou", name: "Fatou", role: "coiffeuse", phone: "772345678", photoUrl: "/images/equipe/fatou.jpg" },
  { id: "gnagna", name: "Gnagna", role: "estheticienne", phone: "783456789", photoUrl: "/images/equipe/gnagna.jpg" },
  { id: "henry", name: "Henry", role: "coiffeuse", phone: "705678901", photoUrl: "/images/equipe/henry.jpg" },
  { id: "marie-dominique", name: "Marie Dominique", role: "estheticienne", phone: "776789012", photoUrl: "/images/equipe/marie-dominique.jpg" },
  { id: "adja", name: "Adja", role: "estheticienne", phone: "787890123", photoUrl: "/images/equipe/adja.jpg" },
  { id: "michelle", name: "Michelle", role: "coiffeuse", phone: "764567890", photoUrl: null },
  { id: "aissatou", name: "Aïssatou", role: "menage", phone: "778901234", photoUrl: "/images/equipe/aissatou.jpg" },
];

/** Comptes de départ, par `Collaborateur.id`. */
export const COMPTES: Record<string, Compte> = {
  bineta: { code: "1234" },
  fatou: { code: "1234" },
  gnagna: { code: "1234" },
  henry: { code: null },
  "marie-dominique": { code: "1234" },
  adja: { code: "1234" },
  michelle: { code: null },
  aissatou: { code: "1234" },
};

/** Dernières demandes de congé déjà tranchées (ou non), pour la démo de l'Accueil. */
export const DEMANDES_CONGE: DemandeConge[] = [
  { id: "dc-1", collaborateurId: "bineta", debut: "2026-10-20", fin: "2026-10-24", raison: null, envoyeeLe: "2026-10-01T09:12:00.000Z", decision: "accepte" },
  { id: "dc-2", collaborateurId: "fatou", debut: "2026-10-11", fin: "2026-10-12", raison: null, envoyeeLe: "2026-10-02T15:40:00.000Z", decision: "refuse" },
  { id: "dc-3", collaborateurId: "gnagna", debut: "2026-11-02", fin: "2026-11-06", raison: null, envoyeeLe: "2026-10-05T11:03:00.000Z", decision: null },
];

/** Libellés au masculin, comme point-de-vente : la fonction, pas la personne. */
export const ROLE_LABEL: Record<Role, string> = {
  coiffeuse: "Coiffeur",
  estheticienne: "Esthéticien",
  menage: "Ménage",
  accueil: "Accueil",
};
