import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/app/globals.css", "utf8");

test("global footer exposes the authenticated admin destination", () => {
  const footer = readFileSync("src/components/Footer.tsx", "utf8");
  assert.match(footer, /\["\/admin\/", "Admin"\]/);
});

test("register follows Wednesday in mobile navigation and footer quick links", () => {
  const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
  const footer = readFileSync("src/components/Footer.tsx", "utf8");
  assert.match(navbar, /className="mobile-nav-links"[\s\S]*link\.href === "\/wednesday-night" && <button[\s\S]*>Register<\/span><\/button>/);
  assert.match(navbar, /className="desktop-menu-register"/);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*\.menu-panel \.desktop-menu-register \{ display: none; \}/);
  assert.match(footer, /\["\/wednesday-night", "Wednesday"\][\s\S]*\["\/rules", "Rules"\]/);
  assert.match(footer, /<Link href=\{href\}>\{label\}<\/Link>[\s\S]*href === "\/wednesday-night" && <RegisterButton className="footer-quick-link">Register<\/RegisterButton>/);
  assert.match(css, /\.footer-grid \.footer-quick-link \{[^}]*color: inherit/);
});
