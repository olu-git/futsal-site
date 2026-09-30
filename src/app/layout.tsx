import type { Metadata } from "next";
import { Press_Start_2P, Unbounded } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationProvider from "@/components/RegistrationProvider";
import { site } from "@/lib/site-content";

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
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  ...(site.favicon ? { icons: { icon: site.favicon } } : {}),
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
        <RegistrationProvider>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <Navbar />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </RegistrationProvider>
      </body>
    </html>
  );
}
