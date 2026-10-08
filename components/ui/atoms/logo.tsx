import Image from "next/image";
import { cn } from "@/lib/utils";

/** Le logo Beauty and Co en version horizontale (même fichier que point-de-vente). La hauteur se règle par `className`. */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/brand/logo-bc-footer.svg"
      alt="Beauty and Co"
      width={497}
      height={230}
      unoptimized
      priority
      className={cn("h-10 w-auto", className)}
    />
  );
}
