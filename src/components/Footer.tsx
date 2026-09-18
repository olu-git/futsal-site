import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const competitionLinks = [
  { href: "/monday-night", label: "Monday Night" },
  { href: "/wednesday-night", label: "Wednesday Night" },
];

const informationLinks = [
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  {
    href: "https://www.facebook.com/futsalis/",
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/futsalindoorsoccer/",
    label: "Instagram",
  },
  {
    href: "https://www.youtube.com/@futsalindoorsoccer",
    label: "YouTube",
  },
  {
    href: "mailto:contact@futsalindoorsoccer.com.au",
    label: "Email",
  },
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-[var(--fis-red)] bg-[var(--fis-blue)] text-white">
      <div className="fis-container grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.3fr] lg:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Futsal Indoor Soccer home">
            <span aria-hidden="true" className="h-10 w-2 -skew-x-12 bg-[var(--fis-red)]" />
            <span className="max-w-[15rem] text-xl font-black uppercase leading-tight tracking-[0.08em]">
              Futsal Indoor Soccer
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm font-light leading-7 text-white/68">
            Competitive community futsal, currently playing Monday and Wednesday nights at Endeavour Hills Leisure Centre.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {socialLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center border-2 border-white/35 text-white transition-colors hover:border-[var(--fis-red)] hover:bg-[var(--fis-red)]"
              >
                <SocialIcon name={label} />
              </a>
            ))}
          </div>
        </div>

        <FooterLinkColumn title="Competitions" links={competitionLinks} />
        <FooterLinkColumn title="Information" links={informationLinks} />

        <div>
          <h2 className="fis-kicker text-white">Contact</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-white/70">
            <li>
              <a
                href="mailto:contact@futsalindoorsoccer.com.au"
                className="flex items-start gap-3 transition-colors hover:text-white"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fis-red)]" aria-hidden="true" />
                <span className="break-all">contact@futsalindoorsoccer.com.au</span>
              </a>
            </li>
            <li>
              <a href="tel:0402888767" className="flex items-start gap-3 transition-colors hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fis-red)]" aria-hidden="true" />
                <span>0402 888 767</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com/maps/place/Endeavour+Hills+Leisure+Centre/@-37.9780005,145.2550069,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors hover:text-white"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fis-red)]" aria-hidden="true" />
                <span>10 Raymond McMahon Boulevard, Endeavour Hills VIC 3802</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="fis-container flex flex-col gap-2 py-5 text-[0.66rem] uppercase tracking-[0.09em] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Futsal Indoor Soccer</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "Email") {
    return <Mail className="h-5 w-5" aria-hidden="true" />;
  }

  if (name === "Facebook") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 22v-8h2.75l.41-3.12H13.5v-2c0-.9.25-1.52 1.58-1.52h1.69V4.57a22.6 22.6 0 0 0-2.46-.13c-2.43 0-4.1 1.49-4.1 4.22v2.22H7.46V14h2.75v8h3.29Z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.65 4.6 12 4.6 12 4.6s-5.65 0-7.5.5a3 3 0 0 0-2.1 2.1C1.9 9.05 1.9 12 1.9 12s0 2.95.5 4.8a3 3 0 0 0 2.1 2.1c1.85.5 7.5.5 7.5.5s5.65 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.85.5-4.8.5-4.8s0-2.95-.5-4.8ZM10 15.4V8.6l6 3.4-6 3.4Z" />
    </svg>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h2 className="fis-kicker text-white">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
