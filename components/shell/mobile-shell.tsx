import { EcranOrdinateur } from "@/components/shell/ecran-ordinateur";

/**
 * Cadre mobile : colonne centrée (max 480px sur grand écran), marges de sécurité iOS. Sur
 * ordinateur, l'app est masquée au profit de l'invitation à l'ouvrir sur le téléphone.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EcranOrdinateur />
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-base-100 pt-safe pb-safe ordinateur:hidden">
        {children}
      </div>
    </>
  );
}
