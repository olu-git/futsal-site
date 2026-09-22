# FIS Website Implementation Checklist

**Branch:** `feature/new-website`  
**Checkpoint date:** 23 September 2026

Status key:

- `[x]` Decision approved or reference prepared.
- `[ ]` Still requires implementation, verification or final approval.
- `[~]` Partially complete or provisional.

## 1. Foundation

- [x] Brand name is Futsal Indoor Soccer.
- [x] Primary palette approved: blue `#003B9B`, red `#F22124`, cream `#F4EFE3`.
- [x] Navy footer approved: `#001B4F`.
- [x] Unbounded approved as main family.
- [x] Press Start 2P approved as retro/game family.
- [x] Device default sans-serif approved as fallback; Barlow removed.
- [x] Primary, secondary and badge logo hierarchy agreed.
- [x] FIS-04 secondary profile artwork selected as favicon source.
- [ ] Verify final production logo asset paths in the repository.
- [ ] Add self-hosted or correctly loaded WOFF2 fonts with appropriate fallbacks.
- [ ] Add global colour and typography tokens.

## 2. Global components

- [x] Sticky header structure approved.
- [x] Desktop navigation approved: Home, Monday, Wednesday, Rules, Menu.
- [x] Smooth hamburger-to-X animation approved.
- [x] Homepage-only red REGISTER placement approved.
- [x] Global navy footer structure approved.
- [ ] Build one reusable Header component.
- [ ] Build one reusable Footer component.
- [ ] Verify header and footer on every route and breakpoint.
- [ ] Add active-page navigation states.
- [ ] Replace placeholder social links with final Facebook, Instagram and YouTube URLs.
- [ ] Add clickable map, phone and email footer links.

## 3. Homepage

- [x] General visual direction approved.
- [x] Press Start 2P hero title approved.
- [x] Monday, Wednesday and Fill-ins hero actions approved.
- [x] Standings-preview structure approved.
- [x] Next-scheduled-round fixture section approved.
- [x] Navy footer approved.
- [x] REGISTER white outline approved.
- [x] VIEW TABLE underline approved.
- [x] Square/rectangular registration checkboxes approved.
- [ ] Select and optimise the final hero action photo/video.
- [ ] Replace prototype data with real data access-layer queries.
- [ ] Make Monday and Wednesday table previews navigate correctly.
- [ ] Automatically determine the next competition night and round.
- [ ] Verify multi-division behaviour.
- [ ] Connect Fill-ins to the final Facebook group URL.
- [ ] Test mobile hero spacing and register-button placement.

## 4. Registration modal

- [x] Modal design and content restored to approved reference.
- [x] Team, Player and Future Competitions tabs approved.
- [x] All field sets approved.
- [x] Required asterisk behaviour approved.
- [x] Success and error copy approved.
- [x] Square/rectangular checkboxes approved.
- [ ] Build production modal component.
- [ ] Implement focus trapping and return focus on close.
- [ ] Implement field validation and accessible errors.
- [ ] Create/configure separate Web3Forms forms.
- [ ] Add spam protection.
- [ ] Connect Privacy Policy and Terms & Conditions links.
- [ ] Connect Fill-ins Facebook link.
- [ ] Test all three forms on mobile.
- [ ] Test real successful and failed submissions.

## 5. Monday competition page

- [x] Overall page design approved.
- [x] Hero content approved.
- [x] Content order approved: hero, standings, results, fixtures.
- [x] Full table immediately approved.
- [x] Most recent results round expanded by default.
- [x] Upcoming fixtures round expanded by default.
- [x] Shirt-only team icons approved.
- [ ] Calculate team count from active Monday team data.
- [ ] Connect standings, results and fixtures to the data layer.
- [ ] Verify collapsed/expanded round controls.
- [ ] Verify mobile tables and fixture rows.

## 6. Wednesday competition page

- [x] Use the same approved design as Monday.
- [x] Current expected team count is 16 until calculated from data.
- [ ] Calculate team count from active Wednesday team data.
- [ ] Connect Wednesday standings, results and fixtures.
- [ ] Verify collapsed/expanded round controls.
- [ ] Verify mobile tables and fixture rows.

## 7. Contact Us page

- [x] Use a different, community-focused hero image.
- [x] Remove game-night/start-time information.
- [x] Contact enquiry categories approved.
- [x] Registration links belong in explanatory copy, not enquiry categories.
- [x] Phone and message are optional.
- [ ] Select final community photograph.
- [ ] Redesign page in the current FIS theme.
- [ ] Correct all contact-icon colours.
- [ ] Build the light/cream contact form.
- [ ] Configure separate Web3Forms submission.
- [ ] Test clickable email, phone and map links.

## 8. About Us page

- [x] Short SOJI-inspired structure approved.
- [x] One Touch Arena content was used only as an information reference.
- [x] Champion photo and descriptive caption concept approved.
- [ ] Finalise short About Us copy.
- [ ] Select current league-winner photos.
- [ ] Build winner sections from maintainable data/content.
- [ ] Verify captions and mobile image cropping.

## 9. Rules page

- [x] New visual approach approved in principle.
- [x] Remove temporary knockout match-fee rule.
- [x] Move participation/media content to Terms & Conditions.
- [ ] Transcribe and reconcile every current live rule.
- [ ] Add approved missing rules.
- [ ] Verify competition is described as 18+.
- [ ] Review final rules wording with Olu.
- [ ] Build responsive expandable/card layout.

## 10. Privacy Policy

- [x] Identify operator as Futsal Indoor Soccer only.
- [x] Assume Google Analytics is active.
- [x] Anticipate the future admin database.
- [x] Exclude transaction, medical and emergency-contact data.
- [x] Seven-year captain-form retention approved.
- [x] No CTA or embedded registration collection-notice panel.
- [ ] Add/update `Last updated` date.
- [ ] Finalise wording against implemented analytics and database behaviour.
- [ ] Build and link the page globally.

## 11. Terms & Conditions

- [x] Page structure approved in principle.
- [x] Core subject areas identified.
- [~] Draft wording exists but Olu will review it later.
- [ ] Complete wording review.
- [ ] Obtain professional legal review where appropriate.
- [ ] Build and link the page globally.

## 12. Captain onboarding form

- [x] Two-page structure accepted.
- [x] Core team, captain and roster fields settled.
- [x] Eight player rows required.
- [x] Black logo/text printing requirement settled.
- [x] Insurance sentence settled.
- [ ] Apply the final wording and layout changes to the production PDF/DOCX.
- [ ] Render and inspect both pages at print size.
- [ ] Prepare the final email/physical-signing workflow.

## 13. Data layer

- [x] JSON-first replaceable data layer approved.
- [x] Entire season published upfront.
- [x] VS Code/Codex remains the complex fixture-reorganisation tool.
- [ ] Define canonical schemas for teams, team constraints, fixtures, results and seasons.
- [ ] Add schema validation.
- [ ] Implement data repository/adaptor interfaces.
- [ ] Refactor pages to use the data layer rather than direct JSON imports.
- [ ] Support active/inactive teams and future divisions/locations/genders.
- [ ] Document JSON import/export workflow.

## 14. Admin area — first release

- [x] `/admin` should not appear in public navigation.
- [x] Authentication required.
- [x] Score entry included in first release.
- [x] Review-and-publish workflow required.
- [x] Referee access may be added later.
- [ ] Select the free-tier backend/auth implementation.
- [ ] Build sign-in and authorisation.
- [ ] Build score-entry interface.
- [ ] Preview calculated results and standings before publication.
- [ ] Build review/publish process.
- [ ] Add audit metadata for changes.
- [ ] Test rollback/recovery.

## 15. Deployment and quality assurance

- [x] Keep the current domain.
- [x] Prefer GitHub Pages/free operation while feasible.
- [ ] Confirm final build/export compatibility with GitHub Pages.
- [ ] Confirm custom-domain and HTTPS configuration remains intact.
- [ ] Add analytics only after consent/privacy behaviour is aligned.
- [ ] Test Chrome, Safari and Firefox.
- [ ] Test representative iPhone and Android widths.
- [ ] Run accessibility checks.
- [ ] Check colour contrast and keyboard navigation.
- [ ] Optimise images and fonts.
- [ ] Verify favicon and social metadata.
- [ ] Verify all forms and links in production.

## 16. Deferred

- [ ] Online payments.
- [ ] Team-facing portal.
- [ ] Automatic captain notifications.
- [ ] Referee accounts beyond the initial admin need.
- [ ] Full public multi-location navigation.
- [ ] Broader use of the internally lined FIS logo.

## 17. Immediate next sequence

1. Commit this checkpoint documentation to `feature/new-website`.
2. Finalise the Contact Us page design using a community image.
3. Finalise About Us page copy and champion-photo structure.
4. Reconcile Rules, Privacy Policy and Terms & Conditions pages.
5. Define the data schemas and data access layer.
6. Implement and verify the public pages.
7. Build the protected admin score-entry workflow.
8. Complete full responsive, accessibility and deployment QA.
