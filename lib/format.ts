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

/** « 2026-10-15 » → Date locale à minuit (sans décalage de fuseau). */
export function dateLocale(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Ajoute `n` jours à une date ISO (yyyy-MM-dd). */
export function ajouterJours(iso: string, n: number): string {
  const d = dateLocale(iso);
  d.setDate(d.getDate() + n);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const JOUR_COURT = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

/** « 2026-10-15 » → « jeu. ». */
export function formatJourCourt(iso: string): string {
  return JOUR_COURT.format(dateLocale(iso));
}

/** « 09:00 » → « 9h », « 14:30 » → « 14h30 ». */
export function formatHeure(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}
