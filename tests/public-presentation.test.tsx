import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import KnockoutBracket from "../src/components/KnockoutBracket";
import { historicalFinals, historicalKitColours, previousSeasonLabel } from "../src/lib/historical-finals";
import { publicMetadata, publicOrigin, socialCover } from "../src/lib/public-metadata";

const archive = "08dce649-66b8-5d32-9c9e-d07a180cf591";

test("only the recorded archive receives finals, with independent night results", () => {
  for (const id of ["current", "ba8c0e2f-7f8a-41be-8ddb-65b320cebaa2", "unknown"]) {
    assert.equal(historicalFinals(id, "monday"), undefined);
    assert.equal(historicalFinals(id, "wednesday"), undefined);
  }
  const monday = historicalFinals(archive, "monday")!;
  const wednesday = historicalFinals(archive, "wednesday")!;
  assert.deepEqual(monday.results.gf, { scoreA: 6, scoreB: 5 });
  assert.deepEqual(wednesday.results.gf, { scoreA: 4, scoreB: 8 });
  for (const [night, data, date] of [["monday", monday, "Mon, 5 Oct 2026"], ["wednesday", wednesday, "Wed, 7 Oct 2026"]] as const) {
    const markup = renderToStaticMarkup(<KnockoutBracket night={night} data={data} kitColours={{}} />);
    assert.match(markup, new RegExp(`${night} knockout bracket`));
    assert.ok(markup.includes(date));
    assert.match(markup, /Goldlink Up/);
    assert.doesNotMatch(markup, /team-form/);
  }
});

test("archive display preserves historical names and the renamed team's kit", () => {
  assert.equal(previousSeasonLabel("2026 Season 1"), "2026 Season 1 — Previous Season");
  const colours = { "King ADL": "#27AE60", AFG: "#2F80ED" };
  assert.equal(historicalKitColours(colours).Toss, "#27AE60");
  assert.deepEqual(colours, { "King ADL": "#27AE60", AFG: "#2F80ED" });
  assert.equal(historicalKitColours({ ...colours, Toss: "#111111" }).Toss, "#111111");
});

test("shared social metadata retains page-specific canonical, title and description", () => {
  const metadata = publicMetadata("Monday Night", "Monday fixtures and results.", "/monday-night/");
  assert.equal(metadata.alternates?.canonical, `${publicOrigin}/monday-night/`);
  assert.equal(metadata.openGraph?.title, "Monday Night | Futsal Indoor Soccer");
  assert.equal(metadata.openGraph?.description, "Monday fixtures and results.");
  assert.deepEqual(metadata.openGraph?.images, [{ url: socialCover, width: 1640, height: 624, alt: "Futsal Indoor Soccer branding on FIS blue" }]);
  assert.deepEqual(metadata.twitter?.images, [socialCover]);
  assert.deepEqual(publicMetadata("Futsal Indoor Soccer", "Home.").title, { absolute: "Futsal Indoor Soccer" });
});

test("social cover is the unmodified approved Facebook brand asset", () => {
  const image = readFileSync("public/fis-social-cover.png");
  assert.deepEqual(image, readFileSync("brand-assets/fis-logo-pack/Facebook-Cover/FIS-01-Primary-Facebook-Cover-1640x624.png"));
  assert.equal(image.readUInt32BE(16), 1640);
  assert.equal(image.readUInt32BE(20), 624);
});
