import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { galleryPhotos } from "../src/data/fis-tv";

test("Basil gallery replaces the old selection with 72 complete, varied photographs", () => {
  assert.equal(galleryPhotos.length, 72);
  assert.equal(new Set(galleryPhotos.map((photo) => photo.id)).size, galleryPhotos.length);
  assert.deepEqual(galleryPhotos.map((photo) => photo.order), Array.from({ length: 72 }, (_, index) => index + 1));
  assert.equal(galleryPhotos.filter((photo) => photo.width > photo.height).length, 24);
  assert.equal(galleryPhotos.filter((photo) => photo.height > photo.width).length, 48);

  let totalBytes = 0;
  for (const photo of galleryPhotos) {
    assert.equal(photo.collectionId, "finals-2026");
    assert.match(photo.src, /^\/media\/basil-finals-2026\/FIS-Finals-\d{3}\.jpg$/);
    assert.ok(photo.alt.length > 20);
    assert.ok((photo.width === 1800 && photo.height === 1200) || (photo.width === 1200 && photo.height === 1800));
    const file = path.join("public", photo.src.slice(1));
    totalBytes += statSync(file).size;
    assert.deepEqual([...readFileSync(file).subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }
  assert.ok(totalBytes < 20 * 1024 * 1024, "the full optimized gallery should stay below 20 MiB");
});

test("gallery preserves full aspect ratios in balanced desktop, tablet and phone grids", () => {
  const css = readFileSync("src/components/fis-tv/FisTv.module.css", "utf8");
  assert.match(css, /\.gallery \{[^}]*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.gallery figure\.landscape \{ grid-column: span 3; \}/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.gallery \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.gallery figure, \.gallery figure\.landscape \{ grid-column: span 1; \}/);
  assert.match(css, /\.photoButton img \{[^}]*height: auto/);
});

test("gallery introduction links to the full photobook without a redundant collection heading", () => {
  const page = readFileSync("src/app/fis-tv/page.tsx", "utf8");
  const gallery = readFileSync("src/components/fis-tv/PhotoGallery.tsx", "utf8");
  assert.match(page, /A selection of moments from our first season, captured by/);
  assert.match(page, /href="http:\/\/instagram\.com\/qyserr"[^>]*>@Qyserr<\/a>/);
  assert.match(page, /aria-label="View all first-season photos in the full photobook">Click here<\/a> to view all photos/);
  assert.match(page, /https:\/\/photobook\.live\/photobook\/b3946a6b-39d8-4ffa-9e7d-14a063c053c2#photos/);
  assert.match(page, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(gallery, /collectionHeading/);
});
