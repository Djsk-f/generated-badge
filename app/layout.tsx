import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/**
 * Fonts essentielles chargées dans le layout (5 fonts les plus utilisées).
 * Les autres fonts sont chargées dynamiquement dans le template editor.
 */
const BADGE_FONTS_ESSENTIALS_URL =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Bebas+Neue&display=swap";

export const metadata: Metadata = {
  title: "BadgeGen - Badges événementiels",
  description: "Créez et générez des badges professionnels pour vos événements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={BADGE_FONTS_ESSENTIALS_URL} rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
