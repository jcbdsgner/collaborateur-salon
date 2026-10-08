/** Formats et validations partagés — voir CONTEXT.md (Connexion, Code secret, Avance sur salaire). */

export const PHONE_LENGTH = 9;
export const CODE_LENGTH = 4;
/** Montant d'avance : 7 chiffres au plus (9 999 999 FCFA). */
export const MONTANT_MAX_CHIFFRES = 7;

/** Ne garde que les chiffres. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Saisie du numéro : chiffres seulement, tronqué à 9. */
export function normalizePhone(value: string): string {
  return digitsOnly(value).slice(0, PHONE_LENGTH);
}

/** « 771234567 » → « 77 123 45 67 » ; fonctionne aussi sur une saisie partielle. */
export function formatPhone(value: string): string {
  const d = normalizePhone(value);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

export function isValidPhone(value: string): boolean {
  return normalizePhone(value).length === PHONE_LENGTH;
}

/** Saisie du code secret : chiffres seulement, tronqué à 4. */
export function normalizeCode(value: string): string {
  return digitsOnly(value).slice(0, CODE_LENGTH);
}

export function isValidCode(value: string): boolean {
  return /^\d{4}$/.test(value);
}

/** Saisie du montant : entier en francs CFA, sans zéro de tête, 7 chiffres au plus. */
export function normalizeMontant(value: string): number | null {
  const d = digitsOnly(value).replace(/^0+/, "").slice(0, MONTANT_MAX_CHIFFRES);
  return d ? Number(d) : null;
}

const FCFA = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 150000 → « 150 000 FCFA ». */
export function formatFCFA(montant: number): string {
  return `${FCFA.format(montant)} FCFA`;
}

/** Date du jour en ISO local (yyyy-MM-dd), pour les champs date. */
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
