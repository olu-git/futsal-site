import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

const informationLinks = [
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Contact Us" },
  { href: "/about-us", label: "About Us" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

const socialLinks = [
  { href: "https://www.facebook.com/futsalis/", label: "Facebook" },
  { href: "https://www.instagram.com/futsalindoorsoccer/", label: "Instagram" },
  { href: "https://www.youtube.com/@futsalindoorsoccer", label: "YouTube" },
  { href: "mailto:contact@futsalindoorsoccer.com.au", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-[var(--fis-red)] bg-[var(--fis-blue)] text-white">
      <div className="fis-container grid gap-12 py-12 sm:py-14 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:py-16">
        <Link href="/" className="inline-flex h-fit w-fit" aria-label="Futsal Indoor Soccer home">
          <Image
            src="/logos/FIS-01-Primary-Black.svg"
            alt="Futsal Indoor Soccer"
            width={280}
            height={114}
            className="h-16 w-auto brightness-0 invert"
          />
        </Link>

        <FooterLinkColumn title="Information" links={informationLinks} />
        <FooterLinkColumn title="Legal" links={legalLinks} />

        <div>
          <h2 className="fis-kicker text-white">Social</h2>
          <div className="mt-5 flex flex-wrap gap-2">
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
      </div>

      <div className="border-t border-white/20">
        <div className="fis-container flex flex-col gap-2 py-5 text-[0.66rem] uppercase tracking-[0.09em] text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Futsal Indoor Soccer</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "Email") return <Mail className="h-5 w-5" aria-hidden="true" />;

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
            <Link href={link.href} className="text-sm font-medium text-white/75 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
