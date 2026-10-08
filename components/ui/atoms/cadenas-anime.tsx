import { cn } from "@/lib/utils";

/**
 * - `ferme` : le cadenas fermé (le code actuel à taper) ;
 * - `ouvert` : l'anse se soulève et pivote (code bon, ou nouveau code à choisir) ;
 * - `fleches` : le cadenas se change en deux flèches qui tournent (« tapez-le encore une fois »).
 */
export type EtatCadenas = "ferme" | "ouvert" | "fleches";

const ressort = "cubic-bezier(.34,1.56,.64,1)";
const anseOuverte = "translateY(-2px) rotate(-28deg)";

/**
 * Le cadenas qui raconte le parcours du code, d'un écran à l'autre : il s'ouvre quand le code
 * actuel est bon, devient des flèches pour la confirmation, puis redevient un cadenas qui se
 * referme (`succes` + `ferme`, animation `cadenas-fermeture`). `succes` le passe au vert.
 */
export function CadenasAnime({ etat, succes = false }: { etat: EtatCadenas; succes?: boolean }) {
  const fleches = etat === "fleches";
  const transition = `transform 450ms ${ressort}, opacity 250ms ease-out`;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-16 items-center justify-center rounded-full transition-colors duration-300",
        succes ? "bg-success-soft text-success" : "bg-accent text-secondary",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="size-8 overflow-visible">
        {/* Le cadenas */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transition,
            opacity: fleches ? 0 : 1,
            transform: fleches ? "scale(.5) rotate(-90deg)" : "none",
          }}
        >
          <path
            d="M8 11V7a4 4 0 0 1 8 0v4"
            className={cn(succes && etat === "ferme" && "anim-cadenas-fermeture")}
            style={{
              transformBox: "view-box",
              transformOrigin: "8px 11px",
              transition: `transform 500ms ${ressort}`,
              transform: etat === "ouvert" ? anseOuverte : "none",
            }}
          />
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </g>
        {/* Les flèches */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transition,
            opacity: fleches ? 1 : 0,
            transform: fleches ? "none" : "scale(.5) rotate(90deg)",
          }}
        >
          <path d="m17 2 4 4-4 4" />
          <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
          <path d="m7 22-4-4 4-4" />
          <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </g>
      </svg>
    </span>
  );
}
