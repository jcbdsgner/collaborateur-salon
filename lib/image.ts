/**
 * Photo de profil choisie sur le téléphone → data URL JPEG carrée et réduite, assez légère pour
 * tenir dans `localStorage` (pas de backend, pas d'upload réel).
 */
export async function photoToDataUrl(file: File, size = 512): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(size, side);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de lire la photo.");
  // Recadrage centré en carré.
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
