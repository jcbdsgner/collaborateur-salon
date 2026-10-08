"use client";

import { CalendarDays } from "lucide-react";
import { BoutonProfil } from "@/components/accueil/bouton-profil";
import { CarteQR } from "@/components/accueil/carte-qr";
import { InvitationInstallation } from "@/components/accueil/invitation-installation";
import { ReponseConge } from "@/components/accueil/reponse-conge";
import { IconeBillets } from "@/components/ui/atoms/icone-billets";
import { Logo } from "@/components/ui/atoms/logo";
import { TuileAction } from "@/components/ui/molecules/tuile-action";
import { useAccueil } from "@/hooks/use-accueil";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Accueil : le Code QR en grand, la réponse au dernier congé (bulle) dessous, les deux demandes en
 * bas. Deux dispositions selon la hauteur de l'écran :
 * - petit écran : une ligne d'en-tête au-dessus du QR, logo à gauche, sa photo à droite ;
 * - écran haut (≥ 800px, `ecran-haut:`) : sa photo en badge sur le bloc du QR, comme une carte de
 *   salarié, et le logo en grand dans le blanc du haut.
 * Les tuiles ne bougent jamais : une bulle fait remonter (ou rétrécir) le QR.
 */
export default function AccueilPage() {
  const { data, error, fermerReponseConge } = useAccueil();
  const collaborateur = data?.collaborateur;

  return (
    <main
      // --fixe : hauteur prise autour du QR, hors tuiles et bulle. Petit écran : en-tête (logo de 80px),
      // marges roses, écarts (192px). Écran haut : logo en grand (80px), photo en badge, marges, écarts (252px).
      // --h-tuile : hauteur d'une tuile carrée (au moins ≈ 170px, son contenu), ≈ 122px compacte sur un écran bas.
      className={cn(
        "flex flex-1 flex-col px-4 py-4 [--fixe:192px] ecran-haut:[--fixe:252px]",
        "[--h-tuile:max(170px,calc(min(100vw,480px)/2_-_22px))] ecran-bas:[--h-tuile:122px]",
      )}
      style={
        {
          // Sous les tuiles : 1/3 du vide qui reste SANS bulle (le QR occupe la largeur moins 80px de
          // marges). Calculé sans la bulle, donc les tuiles ne bougent jamais.
          "--bas": "max(0px, calc((100dvh - var(--fixe) - (min(100vw, 480px) - 80px) - var(--h-tuile)) / 3))",
        } as React.CSSProperties
      }
    >
      {/* Le vide du haut absorbe la bulle. Sur un écran haut, il porte le logo en grand. */}
      <div className="flex flex-1 items-center justify-center">
        <Logo className="hidden h-20 ecran-haut:block" />
      </div>

      <div className="flex flex-col gap-5">
        <div className="-mb-2 flex items-center justify-between ecran-haut:hidden">
          <Logo className="h-20" />
          <BoutonProfil collaborateur={collaborateur} taille="petit" />
        </div>

        {error ? (
          <p role="alert" className="text-error">
            {error}
          </p>
        ) : (
          <section className="flex flex-col gap-4">
            {/* Le bloc rose a toujours la largeur des deux tuiles ; c'est le QR dedans qui s'adapte. Sans bulle,
                il le remplit (même marge rose tout autour ; sur un écran haut, 56px en haut pour la photo).
                Avec une bulle, sur un écran bas, il rétrécit (96px de plus réservés) pour que tout tienne. */}
            <div className="relative flex justify-center rounded-[32px] bg-accent p-6 ecran-haut:mt-10 ecran-haut:pt-14">
              <BoutonProfil
                collaborateur={collaborateur}
                taille="grand"
                className="absolute -top-10 left-1/2 hidden -translate-x-1/2 ecran-haut:flex"
              />
              <div
                className={cn(
                  "transition-[width] duration-200",
                  data?.dernierConge
                    ? "w-[clamp(170px,calc(100dvh_-_var(--fixe)_-_96px_-_var(--h-tuile)_-_var(--bas)),100%)]"
                    : "w-[clamp(192px,calc(100dvh_-_var(--fixe)_-_var(--h-tuile)),100%)]",
                )}
              >
                <CarteQR value={data?.qrValue ?? null} />
              </div>
            </div>
            {data?.dernierConge && (
              <ReponseConge
                key={data.dernierConge.id}
                {...data.dernierConge}
                onFermer={() => data.dernierConge && fermerReponseConge(data.dernierConge.id)}
              />
            )}
          </section>
        )}

        <nav aria-label="Demandes" className="grid grid-cols-2 gap-3">
          <TuileAction href={ROUTES.demanderConge} icone={CalendarDays} verbe="Demander" objet="un congé" ton="rose" />
          <TuileAction href={ROUTES.demanderAvance} icone={IconeBillets} verbe="Demander" objet="une avance" ton="rose-doux" />
        </nav>
      </div>
      <div aria-hidden className="shrink-0" style={{ height: "var(--bas)" }} />
      <InvitationInstallation />
    </main>
  );
}
