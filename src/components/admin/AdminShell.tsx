"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { toggleAdminMenu } from "@/lib/admin/mobile-interactions";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Results", href: "/admin/results" },
  { label: "Fixtures", href: "/admin/fixtures" },
  { label: "Teams", href: "/admin/teams" },
  { label: "Seasons", href: "/admin/seasons" },
];

export default function AdminShell({ current, children }: { current: string; children: ReactNode }) {
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen((open) => toggleAdminMenu(open, "escape"));
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);
  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    window.location.replace("/admin/login/");
  }
  return (
    <section className="admin-page">
      <div className="fis-container admin-shell">
        <div className="admin-mobile-bar">
          <div><span>Admin</span><strong>{current}</strong></div>
          <button type="button" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen((open) => toggleAdminMenu(open, "toggle"))}>
            <span>Admin Menu</span>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        <aside className={`admin-sidebar${menuOpen ? " is-open" : ""}`} id="admin-navigation">
          <div><p className="eyebrow">FIS operations</p><h1>Admin</h1></div>
          <nav aria-label="Admin navigation">
            {links.map((link) => (
              <Link aria-current={current === link.label ? "page" : undefined} href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="admin-sign-out"><button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? "Signing Out..." : "Sign Out"}</button></div>
        </aside>
        <div className="admin-workspace">{children}</div>
      </div>
    </section>
  );
}
