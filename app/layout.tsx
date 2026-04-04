import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { TeamProvider } from "@/lib/TeamContext";
import { Footer } from "@/components/Footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s — SidelineCEO",
    default: "SidelineCEO — The Coach's Playbook for Team Success",
  },
  description: "SidelineCEO helps flag football coaches manage rosters, build fair-play lineups, track player awards, and print professional game cards — all in one free platform.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "SidelineCEO — The Coach's Playbook for Team Success",
    description: "SidelineCEO helps flag football coaches manage rosters, build fair-play lineups, track player awards, and print professional game cards — all in one free platform.",
    url: 'https://www.sidelinemgmt.space',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "SidelineCEO — The Coach's Playbook for Team Success",
    description: "SidelineCEO helps flag football coaches manage rosters, build fair-play lineups, track player awards, and print professional game cards — all in one free platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <TeamProvider>
            {children}
            <Footer />
          </TeamProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
