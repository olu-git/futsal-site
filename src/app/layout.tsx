import type { Metadata } from "next";
import { Press_Start_2P, Unbounded } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const unbounded = Unbounded({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-unbounded",
  fallback: ["Arial", "sans-serif"],
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-press-start",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "Futsal Indoor Soccer",
    template: "%s | Futsal Indoor Soccer",
  },
  description:
    "Futsal Indoor Soccer competitions, fixtures, results and standings at Endeavour Hills Leisure Centre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--fis-cream)] text-[var(--fis-blue)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
