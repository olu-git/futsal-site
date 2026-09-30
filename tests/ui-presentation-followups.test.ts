import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/app/globals.css", "utf8");

test("global footer exposes the authenticated admin destination", () => {
  const footer = readFileSync("src/components/Footer.tsx", "utf8");
  assert.match(footer, /\["\/admin\/", "Admin"\]/);
});

test("competition metadata uses outlined items and moves the venue on narrow screens", () => {
  assert.match(css, /\.competition-stats span\s*\{[^}]*border:\s*1px solid/);
  assert.match(css, /@media \(max-width: 540px\)[\s\S]*\.competition-stats span:last-child\s*\{[^}]*flex-basis:\s*100%/);
  assert.doesNotMatch(css, /\.competition-stats span\s*\{[^}]*(?:border-radius|box-shadow|gradient)/);
});

test("fixture editor reserves its header and groups workflow controls", () => {
  const manager = readFileSync("src/app/admin/fixtures/FixturesManager.tsx", "utf8");
  assert.match(manager, /className="admin-fixture-panel-header"[\s\S]*fixture-panel-title[\s\S]*admin-panel-close/);
  assert.match(manager, /className="admin-fixture-workflow"/);
  assert.match(manager, /className="admin-fixture-validation"/);
  assert.match(css, /\.admin-fixture-panel-header\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\) 42px/);
  assert.match(css, /\.admin-fixture-panel-header \.admin-panel-close\s*\{[^}]*position:\s*static/);
  assert.match(css, /\.admin-change-fields select,\.admin-add-existing select\s*\{[^}]*padding-right:\s*34px/);
});

test("new season fields align on desktop and remain stacked on mobile", () => {
  assert.match(css, /\.admin-season-create > form\s*\{[^}]*gap:\s*14px 12px/);
  assert.match(css, /\.admin-season-create button\[type="submit"\]\s*\{[^}]*margin-top:\s*18px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.admin-season-create > form\s*\{[^}]*grid-template-columns:\s*1fr/);
});
