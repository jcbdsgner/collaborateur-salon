/**
 * Barre du haut de chaque écran, à places fixes : retour à gauche, titre au centre, action de
 * l'écran à droite. Qui ne lit pas retrouve les boutons de mémoire.
 */
export function BarreHaut({ gauche, titre, droite }: { gauche?: React.ReactNode; titre?: string; droite?: React.ReactNode }) {
  return (
    <header className="grid grid-cols-[56px_1fr_56px] items-center px-4 pt-2">
      {gauche ?? <span aria-hidden className="size-14" />}
      {titre ? <h1 className="text-center text-lg font-semibold">{titre}</h1> : <span aria-hidden />}
      {droite ?? <span aria-hidden className="size-14" />}
    </header>
  );
}
