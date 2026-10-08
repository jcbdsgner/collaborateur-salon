import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = { photoUrl?: string | null; initiale: string; taille: number; className?: string };

/** Photo du collaborateur en rond (comme point-de-vente) ; sans photo, l'initiale du prénom. */
export function Avatar({ photoUrl, initiale, taille, className }: Props) {
  const style = { width: taille, height: taille };
  if (photoUrl) {
    return (
      <span className={cn("block shrink-0 overflow-hidden rounded-full", className)} style={style}>
        <Image src={photoUrl} alt="" width={taille} height={taille} unoptimized className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold", className)}
      style={style}
    >
      {initiale}
    </span>
  );
}
