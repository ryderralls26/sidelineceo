import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "FlagFooty - Pro Flag Football Management",
  description: "Professional roster management, fair-play lineups, and game cards for flag football coaches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#0f172a] text-slate-100`}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}