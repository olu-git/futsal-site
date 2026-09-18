import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "About Us",
  description: "Learn about Futsal Indoor Soccer and its community competitions.",
};

export default function AboutUsPage() {
  return (
    <div className="bg-[var(--fis-cream)] text-[var(--fis-blue)]">
      <section className="relative isolate overflow-hidden border-b-4 border-[var(--fis-red)] py-24 text-white sm:py-32">
        <Image src="/hero-bg.png" alt="Futsal players competing indoors" fill sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,23,68,0.95),rgba(0,36,105,0.72))]" />
        <div className="fis-container">
          <p className="fis-kicker text-white/70">Futsal Indoor Soccer</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase tracking-[-0.05em] sm:text-7xl">About Us</h1>
        </div>
      </section>

      <section className="fis-container py-20 sm:py-28">
        <SectionHeading title="Competitive and social futsal" subtitle="A league built for players, teams and the wider community." />
        <div className="mx-auto mt-12 max-w-3xl space-y-6 text-sm font-light leading-8 text-[var(--fis-ink)]">
          <p>Futsal Indoor Soccer is an adult futsal competition designed to give teams a reliable place to compete, stay active and enjoy the game.</p>
          <p>Our current competitions run on Monday and Wednesday nights at Endeavour Hills Leisure Centre. We aim to keep the league competitive while making it welcoming for new teams, individual players and fill-in players.</p>
          <p>FIS is starting in Endeavour Hills, with the structure designed to grow into additional locations, nights, divisions and competition formats as demand develops.</p>
        </div>
      </section>
    </div>
  );
}
