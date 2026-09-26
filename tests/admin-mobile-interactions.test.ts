import assert from "node:assert/strict";
import test from "node:test";
import { shouldCloseResultPanel, toggleAdminMenu, transitionResultPanel, usesDesktopResultPanel } from "../src/lib/admin/mobile-interactions";

const closed = { selectedId: null, published: false };

test("fixture selection opens the mobile result state", () => {
  assert.deepEqual(transitionResultPanel(closed, { type: "select", fixtureId: "fixture-24", published: false }), {
    selectedId: "fixture-24", published: false,
  });
});
test("a selected published result is immediately identified", () => {
  const state = transitionResultPanel(closed, { type: "select", fixtureId: "published-24", published: true });
  assert.equal(state.selectedId, "published-24");
  assert.equal(state.published, true);
});
test("closing and browser Back restore the closed list state", () => {
  const open = transitionResultPanel(closed, { type: "select", fixtureId: "fixture-24", published: false });
  assert.deepEqual(transitionResultPanel(open, { type: "close" }), closed);
  assert.deepEqual(transitionResultPanel(open, { type: "back" }), closed);
});
test("opening and closing produce no mutation action", () => {
  const open = transitionResultPanel(closed, { type: "select", fixtureId: "fixture-24", published: false });
  const result = transitionResultPanel(open, { type: "close" });
  assert.deepEqual(Object.keys(result).sort(), ["published", "selectedId"]);
});
test("mobile admin menu toggles and closes after navigation", () => {
  assert.equal(toggleAdminMenu(false, "toggle"), true);
  assert.equal(toggleAdminMenu(true, "toggle"), false);
  assert.equal(toggleAdminMenu(true, "navigate"), false);
});
test("desktop widths retain the side panel while phone widths use the sheet", () => {
  assert.equal(usesDesktopResultPanel(1024), true);
  assert.equal(usesDesktopResultPanel(768), true);
  assert.equal(usesDesktopResultPanel(390), false);
});
test("Escape is the keyboard close command for panel and menu", () => {
  assert.equal(shouldCloseResultPanel("Escape"), true);
  assert.equal(shouldCloseResultPanel("Enter"), false);
  assert.equal(toggleAdminMenu(true, "escape"), false);
});
