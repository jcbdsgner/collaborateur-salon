/**
 * Connexion biométrique (Face ID, Touch ID, empreinte digitale) via WebAuthn, avec
 * l'authentificateur intégré à l'appareil. Sans backend, le défi est tiré côté client et seul
 * l'identifiant de la clé est gardé : l'appareil fait la vérification biométrique, l'app la croit.
 *
 * WebAuthn exige un contexte sécurisé : localhost, ou HTTPS sur le téléphone
 * (`next dev --experimental-https`, ou un déploiement).
 */

const RP_NAME = "Beauty and Co";

function toBase64Url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): ArrayBuffer {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

const challenge = () => crypto.getRandomValues(new Uint8Array(32));

/** L'appareil sait-il vérifier l'utilisateur (Face ID, empreinte…) ? */
export async function biometrieDisponible(): Promise<boolean> {
  try {
    return (
      typeof window !== "undefined" &&
      window.isSecureContext &&
      "PublicKeyCredential" in window &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

/**
 * Nom du moyen à afficher, deviné d'après l'appareil — le navigateur ne dit pas lequel il
 * utilisera. Apple ⇒ « Face ID » (les iPhone récents), sinon « l'empreinte digitale ».
 */
export function libelleBiometrie(): string {
  if (typeof navigator === "undefined") return "la biométrie";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return "Face ID";
  if (/Android/.test(ua)) return "l'empreinte digitale";
  return "le déverrouillage de l'appareil";
}

/** Crée la clé de l'appareil pour ce collaborateur (déclenche Face ID / l'empreinte). */
export async function enregistrerBiometrie(user: { id: string; name: string; phone: string }): Promise<string> {
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: challenge(),
      rp: { name: RP_NAME, id: location.hostname },
      user: { id: new TextEncoder().encode(user.id), name: user.phone, displayName: user.name },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("Activation annulée.");
  return toBase64Url(cred.rawId);
}

/** Demande Face ID / l'empreinte pour la clé enregistrée sur cet appareil. */
export async function verifierBiometrie(credentialId: string): Promise<void> {
  const cred = await navigator.credentials.get({
    publicKey: {
      challenge: challenge(),
      rpId: location.hostname,
      allowCredentials: [{ type: "public-key", id: fromBase64Url(credentialId), transports: ["internal"] }],
      userVerification: "required",
      timeout: 60_000,
    },
  });
  if (!cred) throw new Error("Connexion annulée.");
}

/** Message lisible pour un échec WebAuthn (annulation, délai dépassé…). */
export function messageErreurBiometrie(e: unknown): string {
  if (e instanceof DOMException && e.name === "NotAllowedError") return "Vérification annulée.";
  return e instanceof Error ? e.message : "La vérification a échoué.";
}
