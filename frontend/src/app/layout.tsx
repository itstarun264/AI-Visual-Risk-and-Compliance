import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export const metadata: Metadata = {
  title: "AI Visual Risk & Compliance Intelligence",
  description: "Advanced intelligence monitoring, risk scoring, behavioral compliance, and visual analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased relative min-h-screen">
        <BackgroundEffects />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
