import Link from "next/link";
import { cn } from "@/lib/utils";

type Ton = "doux" | "plein" | "nu";

const TONS: Record<Ton, string> = {
  doux: "bg-base-200 text-base-content",
  plein: "bg-primary text-primary-content",
  /** Sans fond : l'icône seule, la zone de toucher reste de 56px. */
  nu: "text-base-content active:bg-base-content/5",
};

type Commun = {
  /** Obligatoire : il n'y a pas de texte visible, c'est ce que lisent les lecteurs d'écran. */
  "aria-label": string;
  ton?: Ton;
  className?: string;
  children: React.ReactNode;
};

type Props = Commun &
  (
    | { href: string; onClick?: undefined }
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

/** Bouton rond à icône seule, 56px — même taille et même place d'un écran à l'autre (barre du haut). */
export function BoutonIcone(props: Props) {
  const { ton = "doux", className, children } = props;
  const classes = cn(
    "relative inline-flex size-14 shrink-0 items-center justify-center rounded-full transition active:scale-90",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--button-2-color)]",
    TONS[ton],
    className,
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} aria-label={props["aria-label"]} className={classes}>
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- retirés pour ne pas finir sur le <button>
  const { ton: _t, className: _c, children: _ch, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
