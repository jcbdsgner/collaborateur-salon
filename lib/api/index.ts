import { fermerSession, ouvrirSession, useAppStore } from "@/lib/store/app-store";
import { isValidCode, isValidPhone, normalizePhone, todayISO } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { Collaborateur, DecisionConge, DemandeAvance, DemandeConge, MessageVocal } from "@/lib/data/types";

/**
 * L'API simulée — la seule porte des écrans vers les données. Chaque appel est asynchrone avec
 * une petite latence, et échoue avec une `ApiError` dont le `code` permet à l'écran de montrer
 * l'erreur sans texte (picto, vibration — voir CONTEXT.md, Erreur). Pour brancher la vraie API,
 * seul ce fichier change.
 */

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiErrorCode =
  | "numero_inconnu"
  | "identifiants_invalides"
  | "code_invalide"
  | "ancien_code_incorrect"
  | "photo_requise"
  | "dates_invalides"
  | "vocal_requis"
  | "montant_invalide"
  | "lien_invalide"
  | "non_connecte";

const LATENCE_MS = 400;
const wait = () => new Promise((r) => setTimeout(r, LATENCE_MS));
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;


const get = () => useAppStore.getState();
const set = useAppStore.setState;

function moi(): Collaborateur {
  const { sessionId, collaborateurs } = get();
  const c = collaborateurs.find((x) => x.id === sessionId);
  if (!c) throw new ApiError("non_connecte", "Votre session a expiré, reconnectez-vous.");
  return c;
}

function majCollaborateur(id: string, patch: Partial<Collaborateur>) {
  set((s) => ({ collaborateurs: s.collaborateurs.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
}

function majCode(id: string, code: string) {
  set((s) => ({ comptes: { ...s.comptes, [id]: { code } } }));
}

function parNumero(phone: string): Collaborateur | undefined {
  const numero = normalizePhone(phone);
  return isValidPhone(numero) ? get().collaborateurs.find((x) => x.phone === numero) : undefined;
}

// ── Connexion ────────────────────────────────────────────────────────────

export type ResultatIdentification = {
  /** Compte sans code (tout nouveau, ou code remis à zéro par le salon) : la session s'ouvre. */
  premiereConnexion: boolean;
  /** Pour savoir si la clé biométrique de cet appareil est la sienne (Code secret oublié). */
  collaborateurId: string;
};

/**
 * 1er temps de la Connexion : le numéro. Un compte sans code secret ⇒ première connexion : la
 * session s'ouvre et le collaborateur passe à la photo (s'il n'en a pas encore) puis au code. Sinon,
 * le code secret est demandé.
 */
export async function identifier(phone: string): Promise<ResultatIdentification> {
  await wait();
  const c = parNumero(phone);
  if (!c) throw new ApiError("numero_inconnu", "Ce numéro n'est pas reconnu. Rapprochez-vous du salon.");
  const premiereConnexion = get().comptes[c.id]?.code == null;
  if (premiereConnexion) ouvrirSession(c.id);
  return { premiereConnexion, collaborateurId: c.id };
}

/** 2e temps de la Connexion : le code secret. */
export async function connexion(phone: string, code: string): Promise<void> {
  await wait();
  const c = parNumero(phone);
  const compte = c ? get().comptes[c.id] : undefined;
  if (!c || !compte?.code || compte.code !== code) {
    throw new ApiError("identifiants_invalides", "Code secret incorrect.");
  }
  ouvrirSession(c.id);
}

/** Connexion par Face ID / empreinte, une fois la vérification faite par l'appareil. */
export async function connexionBiometrie(): Promise<void> {
  await wait();
  const b = get().biometrie;
  const compte = b ? get().comptes[b.collaborateurId] : undefined;
  if (!b || !compte?.code) throw new ApiError("non_connecte", "Connectez-vous avec votre numéro.");
  ouvrirSession(b.collaborateurId);
}

export async function deconnexion(): Promise<void> {
  await wait();
  fermerSession();
}

// ── Première connexion ───────────────────────────────────────────────────

/**
 * Termine le parcours en une fois : photo + code, et la clé biométrique de l'appareil si le
 * collaborateur l'a activée (null ⇒ « Plus tard » ou appareil incompatible).
 */
export async function terminerPremiereConnexion(photoUrl: string | null, code: string, credentialId: string | null = null): Promise<void> {
  await wait();
  const c = moi();
  if (!photoUrl) throw new ApiError("photo_requise", "Ajoutez une photo de profil.");
  if (!isValidCode(code)) throw new ApiError("code_invalide", "Le code secret doit faire 4 chiffres.");
  majCollaborateur(c.id, { photoUrl });
  majCode(c.id, code);
  if (credentialId) set({ biometrie: { collaborateurId: c.id, credentialId } });
}

// ── Accueil ──────────────────────────────────────────────────────────────

export type Accueil = {
  collaborateur: Collaborateur;
  /** Contenu du Code QR : l'id lu par le scanner de point-de-vente. */
  qrValue: string;
  /**
   * Réponse à la dernière demande de congé, avec ses dates — null tant qu'il n'y a pas de décision,
   * ou une fois que le collaborateur l'a fermée.
   */
  dernierConge: { id: string; debut: string; fin: string; decision: DecisionConge } | null;
};

export async function getAccueil(): Promise<Accueil> {
  await wait();
  const c = moi();
  const derniere = get()
    .demandesConge.filter((d) => d.collaborateurId === c.id)
    .sort((a, b) => b.envoyeeLe.localeCompare(a.envoyeeLe))[0];
  return {
    collaborateur: c,
    qrValue: c.id,
    dernierConge:
      derniere?.decision && !derniere.reponseFermee
        ? { id: derniere.id, debut: derniere.debut, fin: derniere.fin, decision: derniere.decision }
        : null,
  };
}

/** Le collaborateur ferme la réponse à son congé (croix ou glissement) : elle ne reparaît plus à l'Accueil. */
export async function fermerReponseConge(demandeId: string): Promise<void> {
  await wait();
  set((s) => ({ demandesConge: s.demandesConge.map((d) => (d.id === demandeId ? { ...d, reponseFermee: true } : d)) }));
}

// ── Paramètres ───────────────────────────────────────────────────────────

export async function changerPhoto(photoUrl: string): Promise<void> {
  await wait();
  majCollaborateur(moi().id, { photoUrl });
}

/** Premier écran de « Changer le code secret » : l'ancien code est-il le bon ? */
export async function verifierCode(code: string): Promise<void> {
  await wait();
  if (get().comptes[moi().id]?.code !== code) {
    throw new ApiError("ancien_code_incorrect", "Code secret incorrect.");
  }
}

export async function changerCode(ancien: string, nouveau: string): Promise<void> {
  await wait();
  const c = moi();
  if (get().comptes[c.id]?.code !== ancien) throw new ApiError("ancien_code_incorrect", "Code secret incorrect.");
  if (!isValidCode(nouveau)) throw new ApiError("code_invalide", "Le code secret doit faire 4 chiffres.");
  majCode(c.id, nouveau);
}

/**
 * Code secret oublié, après Face ID / l'empreinte : l'appareil a prouvé l'identité, le nouveau
 * code remplace l'ancien sans le demander.
 */
export async function remplacerCodeOublie(nouveau: string): Promise<void> {
  await wait();
  const c = moi();
  if (get().biometrie?.collaborateurId !== c.id) throw new ApiError("non_connecte", "Allez voir le salon.");
  if (!isValidCode(nouveau)) throw new ApiError("code_invalide", "Le code secret doit faire 4 chiffres.");
  majCode(c.id, nouveau);
}

/** Un lien « nouveau code » reste valable ce nombre de minutes. */
export const LIEN_CODE_DUREE_MIN = 30;

/**
 * Code secret oublié : envoie par SMS, au numéro du compte, un lien pour choisir un nouveau code
 * (un seul lien valable à la fois). Simulé : aucun SMS ne part, le lien est rendu (`lienDemo`)
 * pour que la démo l'affiche — la vraie API ne le rendra pas.
 */
export async function envoyerLienCode(phone: string): Promise<{ lienDemo: string }> {
  await wait();
  const c = parNumero(phone);
  if (!c) throw new ApiError("numero_inconnu", "Ce numéro n'est pas reconnu. Rapprochez-vous du salon.");
  const jeton = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const expireLe = new Date(Date.now() + LIEN_CODE_DUREE_MIN * 60_000).toISOString();
  set((s) => ({
    liensCode: {
      ...Object.fromEntries(Object.entries(s.liensCode).filter(([, l]) => l.collaborateurId !== c.id)),
      [jeton]: { collaborateurId: c.id, expireLe },
    },
  }));
  return { lienDemo: `${location.origin}${ROUTES.nouveauCode(jeton)}` };
}

function lienValide(jeton: string) {
  const lien = get().liensCode[jeton];
  if (!lien || new Date(lien.expireLe).getTime() < Date.now()) {
    throw new ApiError("lien_invalide", "Ce lien ne marche plus. Demandez-en un nouveau.");
  }
  return lien;
}

/** Ouverture du lien reçu par SMS : est-il encore bon ? */
export async function verifierLienCode(jeton: string): Promise<void> {
  await wait();
  lienValide(jeton);
}

/** Le nouveau code choisi depuis le lien : il remplace l'ancien, la session s'ouvre, le lien est usé. */
export async function definirCodeParLien(jeton: string, code: string): Promise<void> {
  await wait();
  const lien = lienValide(jeton);
  if (!isValidCode(code)) throw new ApiError("code_invalide", "Le code secret doit faire 4 chiffres.");
  majCode(lien.collaborateurId, code);
  set((s) => ({ liensCode: Object.fromEntries(Object.entries(s.liensCode).filter(([j]) => j !== jeton)) }));
  ouvrirSession(lien.collaborateurId);
}

/** Active Face ID / l'empreinte sur cet appareil (remplace la clé d'un autre compte s'il y en a une). */
export async function activerBiometrie(credentialId: string): Promise<void> {
  await wait();
  set({ biometrie: { collaborateurId: moi().id, credentialId } });
}

export async function desactiverBiometrie(): Promise<void> {
  await wait();
  const id = moi().id;
  if (get().biometrie?.collaborateurId === id) set({ biometrie: null });
}

// ── Demandes ─────────────────────────────────────────────────────────────

export type NouvelleDemandeConge = { debut: string; fin: string; raison: MessageVocal | null };

export async function demanderConge({ debut, fin, raison }: NouvelleDemandeConge): Promise<void> {
  await wait();
  const c = moi();
  if (!debut || !fin || debut < todayISO() || fin < debut) {
    throw new ApiError("dates_invalides", "Vérifiez les dates : la fin ne peut pas précéder le début.");
  }
  if (!raison?.url) throw new ApiError("vocal_requis", "Enregistrez la raison du congé.");
  const demande: DemandeConge = {
    id: nextId("dc"),
    collaborateurId: c.id,
    debut,
    fin,
    raison,
    envoyeeLe: new Date().toISOString(),
    decision: null,
  };
  set((s) => ({ demandesConge: [...s.demandesConge, demande] }));
}

export async function demanderAvance(montant: number): Promise<void> {
  await wait();
  const c = moi();
  if (!Number.isInteger(montant) || montant <= 0) {
    throw new ApiError("montant_invalide", "Indiquez un montant.");
  }
  const demande: DemandeAvance = { id: nextId("da"), collaborateurId: c.id, montant, envoyeeLe: new Date().toISOString() };
  set((s) => ({ demandesAvance: [...s.demandesAvance, demande] }));
}
