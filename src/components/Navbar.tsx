"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRegistration } from "./RegistrationProvider";
import { site } from "@/lib/site-content";

const links = [{ href: "/", label: "Home" }, { href: "/monday-night", label: "Monday" }, { href: "/wednesday-night", label: "Wednesday" }, { href: "/rules", label: "Rules" }];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openRegistration } = useRegistration();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", keyboard); };
  }, [open]);
  const navLink = ({ href, label }: typeof links[number]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>;
  return <header className="site-header">
    <div className="fis-container header-inner">
      <Link href="/" className="brand" aria-label="Futsal Indoor Soccer home" onClick={() => setOpen(false)}><Image src={site.logo} alt="Futsal Indoor Soccer" width={138} height={57} priority /></Link>
      <div className="nav-cluster"><nav className="primary-nav" aria-label="Primary navigation">{links.map(navLink)}</nav>
        <div ref={menuRef} className="menu-wrap" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
          <button ref={buttonRef} className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}><span>Menu</span><span className="hamburger" aria-hidden="true"><i /><i /><i /></span></button>
          {open && <nav id="site-menu" className="menu-panel" aria-label="More navigation">
            <div className="mobile-nav-links">{links.map(navLink)}</div>
            <button onClick={() => { openRegistration("team", buttonRef.current); setOpen(false); }}>Register</button>
            {navLink({ href: "/contact", label: "Contact" })}{navLink({ href: "/about-us", label: "About Us" })}
          </nav>}
        </div>
      </div>
    </div>
  </header>;
}
