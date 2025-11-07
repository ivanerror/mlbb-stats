import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLBB Hero Intelligence",
  description: "Live Mobile Legends hero performance, bans, and win rates.",
  metadataBase: new URL("https://mlbb-stats.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsla(261,72%,30%,0.35),_transparent_55%)]" />
          <div className="pointer-events-none fixed inset-x-0 top-1/3 -z-10 h-[40rem] bg-[conic-gradient(from_140deg,_hsla(200,80%,60%,0.25),_transparent)] blur-3xl" />
          <div className="relative">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
