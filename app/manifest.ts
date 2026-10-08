import type { MetadataRoute } from "next";

/** L'app installée sur l'écran d'accueil du téléphone : plein écran, sans barre du navigateur. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Collaborateur — Beauty and Co",
    short_name: "B&Co",
    description: "Espace collaborateur Beauty and Co.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f8f6f9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
