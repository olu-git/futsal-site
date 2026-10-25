import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { galleryPhotos } from "../src/data/fis-tv";

test("gallery assets have unique ordering, accessible descriptions and downloadable JPEG files", () => {
  assert.ok(galleryPhotos.length > 0);
  assert.equal(new Set(galleryPhotos.map((photo) => photo.id)).size, galleryPhotos.length);
  assert.deepEqual(galleryPhotos.map((photo) => photo.order), Array.from({ length: galleryPhotos.length }, (_, index) => index + 1));

  let totalBytes = 0;
  for (const photo of galleryPhotos) {
    assert.equal(photo.collectionId, "finals-2026");
    assert.match(photo.src, /^\/media\/basil-finals-2026\/FIS-Finals-\d{3}\.jpg$/);
    assert.ok(photo.alt.length > 20);
    assert.ok(Number.isInteger(photo.width) && photo.width > 0);
    assert.ok(Number.isInteger(photo.height) && photo.height > 0);
    const file = path.join("public", photo.src.slice(1));
    totalBytes += statSync(file).size;
    assert.deepEqual([...readFileSync(file).subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }
  assert.ok(totalBytes < 20 * 1024 * 1024, "the full optimized gallery should stay below 20 MiB");
});

test("gallery introduction links to the full photobook without a redundant collection heading", () => {
  const page = readFileSync("src/app/fis-tv/page.tsx", "utf8");
  const gallery = readFileSync("src/components/fis-tv/PhotoGallery.tsx", "utf8");
  assert.match(page, /href="http:\/\/instagram\.com\/qyserr"[^>]*>@Qyserr<\/a>/);
  assert.match(page, /https:\/\/photobook\.live\/photobook\/b3946a6b-39d8-4ffa-9e7d-14a063c053c2#photos/);
  assert.match(page, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(gallery, /collectionHeading/);
});
