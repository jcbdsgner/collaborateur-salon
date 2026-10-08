import Link from "next/link";
import { cn } from "@/lib/utils";

type Ton = "plein" | "doux" | "danger";

const TONS: Record<Ton, string> = {
  /** L'action principale de l'écran : le rose de marque, encre sombre (jamais de blanc sur le rose). */
  plein: "bg-primary text-primary-content shadow-brand",
  /** Une action secondaire. */
  doux: "bg-base-200 text-base-content",
  /** Se déconnecter : rouge doux, pas d'alarme. */
  danger: "bg-error-soft text-error",
};

type Commun = { ton?: Ton; icone?: React.ReactNode; className?: string; children: React.ReactNode };

type Props = Commun &
  (
    | { href: string; onClick?: undefined; disabled?: undefined }
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

/** Grand bouton pleine largeur (56px de haut), icône + texte : l'icône porte le sens pour qui ne lit pas. */
export function Bouton(props: Props) {
  const { ton = "plein", icone, className, children } = props;
  const classes = cn(
    "flex h-14 w-full items-center justify-center gap-2.5 rounded-full px-6 text-[17px] font-semibold transition active:scale-[0.97]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]",
    "disabled:pointer-events-none disabled:opacity-50",
    TONS[ton],
    className,
  );
  const contenu = (
    <>
      {icone}
      {children}
    </>
  );
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {contenu}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- retirés pour ne pas finir sur le <button>
  const { ton: _t, icone: _i, className: _c, children: _ch, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {contenu}
    </button>
  );
}
