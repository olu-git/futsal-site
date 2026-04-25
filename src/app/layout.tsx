import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Endeavour Hills Futsal | Monday & Wednesday Night Competition",
  description:
    "Endeavour Hills Futsal — league tables, fixtures, results, and standings for Monday and Wednesday night divisions at Endeavour Hills Leisure Centre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
