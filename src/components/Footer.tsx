import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site-content";

export default function Footer() {
  return <footer className="site-footer"><div className="fis-container">
    <div className="footer-grid">
      <nav aria-label="Quick links"><h2>Quick Links</h2>{[
        ["/", "Home"], ["/monday-night", "Monday"], ["/wednesday-night", "Wednesday"], ["/rules", "Rules"], ["/contact", "Contact Us"], ["/about-us", "About Us"],
      ].map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
      <nav aria-label="Legal"><h2>Legal</h2><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link></nav>
      <div className="footer-contact"><h2>Contact</h2>
        <a href={`mailto:${site.email}`}><span className="footer-contact-icon"><Mail aria-hidden="true" /></span><span>{site.email}</span></a>
        <a href={site.telephone}><span className="footer-contact-icon"><Phone aria-hidden="true" /></span><span>{site.phone}</span></a>
        <a href={site.directions} target="_blank" rel="noopener noreferrer"><span className="footer-contact-icon"><MapPin aria-hidden="true" /></span><span>{site.venue}<br />{site.address}</span></a>
      </div>
    </div>
    <nav className="social-links" aria-label="Social media">{site.socials.map(({ name, href }) => <a key={name} href={href} aria-label={name} title={name} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}><SocialIcon name={name} /></a>)}</nav>
    <div className="footer-bottom"><p>&copy; 2026 Futsal Indoor Soccer. All rights reserved.</p><Link href="/" aria-label="Futsal Indoor Soccer home"><Image src={site.logo} alt="Futsal Indoor Soccer" width={106} height={44} /></Link></div>
  </div></footer>;
}

function SocialIcon({ name }: { name: string }) {
  if (name === "Email") return <Mail size={20} aria-hidden="true" />;
  if (name === "Instagram") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  if (name === "Facebook") return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.75l.41-3.12H13.5v-2c0-.9.25-1.52 1.58-1.52h1.69V4.57a22.6 22.6 0 0 0-2.46-.13c-2.43 0-4.1 1.49-4.1 4.22v2.22H7.46V14h2.75v8h3.29Z" /></svg>;
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.65 4.6 12 4.6 12 4.6s-5.65 0-7.5.5a3 3 0 0 0-2.1 2.1C1.9 9.05 1.9 12 1.9 12s0 2.95.5 4.8a3 3 0 0 0 2.1 2.1c1.85.5 7.5.5 7.5.5s5.65 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.85.5-4.8.5-4.8s0-2.95-.5-4.8ZM10 15.4V8.6l6 3.4-6 3.4Z" /></svg>;
}
