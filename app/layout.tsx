import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { EcouteInstallation } from "@/components/shell/ecoute-installation";
import { MobileShell } from "@/components/shell/mobile-shell";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Poppins-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Collaborateur — Beauty and Co",
  description: "Espace collaborateur Beauty and Co.",
  // Installée sur l'écran d'accueil d'un iPhone : plein écran, nommée comme l'icône.
  appleWebApp: { capable: true, title: "B&Co", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f6f9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">
        <EcouteInstallation />
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
