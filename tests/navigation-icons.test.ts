import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("hero and navigation arrows are decorative vector graphics rather than emoji glyphs", () => {
  const hero = readFileSync("src/components/HomeHero.tsx", "utf8");
  const nav = readFileSync("src/components/Navbar.tsx", "utf8");
  for (const source of [hero, nav]) {
    assert.doesNotMatch(source, /[\u25b6\u2197]/);
    assert.match(source, /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
  }
  assert.match(hero, /recap-action-label">Register/);
  assert.match(hero, /recap-action-label">Fill-ins/);
  assert.equal((nav.match(/nav-label">Register/g) ?? []).length, 2);
  assert.match(nav, /nav-pointer[\s\S]*nav-label/);
});
