import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const form = readFileSync("src/components/EnquiryForm.tsx", "utf8");
const registration = readFileSync("src/components/RegistrationContent.tsx", "utf8");
const modal = readFileSync("src/components/RegistrationProvider.tsx", "utf8");
const page = readFileSync("src/app/register/page.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("registration uses the tested response handler and invalidates it on unmount", () => {
  assert.match(form, /await settleEnquiryResponse\(/);
  assert.match(form, /\(\) => mounted\.current/);
  assert.match(form, /return \(\) => \{ mounted\.current = false; \}/);
  assert.match(form, /onSuccess\?\.\(\)/);
});

test("player label is concise while its submission field name stays stable", () => {
  assert.match(form, /name: "player_name", label: "Full Name"/);
  assert.doesNotMatch(form, /Player Full Name/);
});

test("completed registration replaces the form until a tab is chosen", () => {
  assert.match(registration, /submitted \? <div className="registration-confirmation"/);
  assert.match(registration, /Registration submitted/);
  assert.match(registration, /<EnquiryForm kind=\{value\} onSuccess=\{\(\) => setSubmitted\(true\)\}/);
  assert.match(registration, /function selectTab\(next: RegistrationTab\) \{\s*setTab\(next\);\s*setSubmitted\(false\)/);
  assert.match(registration, /onClick=\{\(\) => selectTab\(value\)\}/);
  assert.match(registration, /confirmationHeading\.current\?\.focus/);
  assert.match(modal, /<RegistrationContent/);
  assert.match(page, /<RegistrationContent/);
});

test("mobile confirmation stays prominent and respects reduced motion", () => {
  assert.match(css, /\.registration-confirmation \{[^}]*border-top: 5px solid var\(--fis-red\)/);
  assert.match(css, /\.registration-body\.is-submitted \.registration-tabs \{[^}]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.registration-confirmation \{ animation: none/);
});
