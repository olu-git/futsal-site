import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/app/globals.css", "utf8");

test("responsive typography tokens cover every approved semantic role", () => {
  for (const token of ["display","page-title","section-title","card-title","subheading","body","body-compact","label","input","helper","validation","action","nav","table-heading","table-value","status","caption"]) {
    assert.match(css, new RegExp(`--type-${token}:\\s*clamp\\(`), `missing --type-${token}`);
  }
});

test("long copy and validation use Unbounded while compact accents retain the pixel font", () => {
  assert.match(css, /\.type-body\s*\{[^}]*var\(--font-sans\)/);
  assert.match(css, /\.type-validation\s*\{[^}]*var\(--font-sans\)/);
  assert.match(css, /\.admin-field-error[^}]*font-family:\s*var\(--font-sans\)/);
  assert.match(css, /\.type-label\s*\{[^}]*var\(--font-mono\)/);
  assert.match(css, /\.type-action\s*\{[^}]*var\(--font-mono\)/);
});

test("public and admin supporting copy share the responsive scale", () => {
  for (const selector of ["hero-content > p","prose p","registration-banner p","admin-workspace > p","admin-private-note","admin-season-help"]) assert.match(css, new RegExp(selector.replace(/[>+]/g, "\\$&")));
  assert.match(css, /\.field input[^}]*font-size:\s*var\(--type-input\)/);
  assert.match(css, /\.primary-nav a[^}]*font-size:\s*var\(--type-nav\)/);
  assert.match(css, /\.league-table[^}]*font-size:\s*var\(--type-table-value\)/);
});

test("semantic typography utilities are used by shared public headings", () => {
  const section = readFileSync("src/components/SectionHeading.tsx", "utf8");
  const bracket = readFileSync("src/components/KnockoutBracket.tsx", "utf8");
  assert.match(section, /type-page-title/);
  assert.match(section, /type-body-compact/);
  assert.match(bracket, /type-section-title/);
  assert.match(bracket, /type-card-title/);
});
