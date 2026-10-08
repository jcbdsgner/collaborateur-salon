/**
 * Une liasse de billets en éventail — plus parlante qu'un billet seul pour dire « argent » sans
 * lire. Même grille (24) et mêmes props qu'une icône lucide. Chaque billet est rempli de
 * `--fond` (la couleur de la tuile) pour masquer celui de derrière.
 */
export function IconeBillets({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="var(--fond, #fff)"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="5" y="5.5" width="17" height="10" rx="1.5" transform="rotate(-12 13.5 10.5)" />
      <rect x="3.5" y="8.5" width="17" height="10" rx="1.5" transform="rotate(-5 12 13.5)" />
      <rect x="2" y="12" width="17" height="10" rx="1.5" />
      <circle cx="10.5" cy="17" r="2.5" />
      <path d="M5.5 17h.01M15.5 17h.01" />
    </svg>
  );
}
