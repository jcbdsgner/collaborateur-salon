import type { Creneau, Salon } from "@/lib/data/types";

export const SALON_LABEL: Record<Salon, string> = {
  almadies: "Almadies",
  "sea-plaza": "Sea Plaza",
};

const ALMADIES: Creneau = { salon: "almadies", debut: "09:00", fin: "18:00" };
const SEA_PLAZA: Creneau = { salon: "sea-plaza", debut: "10:00", fin: "19:00" };
const COUPEE: Creneau[] = [
  { salon: "almadies", debut: "09:00", fin: "13:00" },
  { salon: "sea-plaza", debut: "14:00", fin: "19:00" },
];

/**
 * Le planning simulé : deux semaines types qui alternent, indexées par jour de la semaine
 * (0 = dimanche). Le même pour tous les collaborateurs.
 */
export const SEMAINES_TYPES: Creneau[][][] = [
  [[], [ALMADIES], COUPEE, [SEA_PLAZA], [ALMADIES], COUPEE, [SEA_PLAZA]],
  [[], [], [SEA_PLAZA], [ALMADIES], COUPEE, [ALMADIES], [SEA_PLAZA]],
];
