import assert from "node:assert/strict";
import test from "node:test";
import { selectAdminEditions } from "../src/lib/admin/competition-editions";

test("admin data keeps both divisions on each night and prefers active seasons", () => {
  const edition = (id: string, weekday: number, division: string, lifecycle = "active", ends_on = "2026-10-01") =>
    ({ id, lifecycle, competitions: { weekday, division }, seasons: { ends_on } });
  const rows = [edition("ma", 1, "A"), edition("mb", 1, "B"), edition("wa", 3, "A"), edition("wb", 3, "B"),
    edition("archived", 1, "A", "archived", "2027-01-01"), edition("old", 1, "A", "archived", "2025-01-01")];
  assert.deepEqual(selectAdminEditions(rows).map(row => row.id), ["ma", "mb", "wa", "wb"]);
  assert.equal(rows.length, 6);
  assert.deepEqual(selectAdminEditions([]), []);
});

test("admin selection handles joined arrays and the newest archived edition", () => {
  const row = (id: string, ends_on: string) => ({ id, lifecycle: "archived", competitions: [{ weekday: 1, division: "A" }], seasons: [{ ends_on }] });
  assert.deepEqual(selectAdminEditions([row("old", "2025-01-01"), row("new", "2026-01-01")]).map(value => value.id), ["new"]);
});
