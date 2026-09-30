# Futsal Indoor Soccer Website Specification

**Status:** Approved design checkpoint  
**Last updated:** 23 September 2026  
**Repository:** `https://github.com/olu-git/futsal-site.git`  
**Working branch:** `feature/new-website`

## 1. Purpose and authority

This document is the source of truth for the new Futsal Indoor Soccer (FIS) website. It records the decisions approved during the design interview and should be read before changing the website.

When sources disagree, use this order:

1. The latest written instruction from Olu.
2. This specification.
3. The approved interactive reference in `docs/reference/homepage-approved.html`.
4. Existing code in the branch.
5. The old live website.

The interactive reference is a design prototype, not production code. Rebuild its approved behaviour cleanly within the existing application architecture.

## 2. Product direction

Futsal Indoor Soccer must be the primary identity. Endeavour Hills is the current competition location, not the brand name.

The site should feel:

- Competitive but welcoming.
- Community-led rather than corporate.
- Inspired by 1990s football games, FIFA 98, Championship Manager 93/94 and France 98.
- Influenced by the structured retro styling of Recess without copying it.
- Clear enough for players to find fixtures, results and tables quickly.

Avoid:

- Gradients.
- Generic SaaS styling.
- Excessively rounded cards.
- Decorative effects that reduce readability.
- White or very pale blue text on cream.
- Making Endeavour Hills look like the permanent extent of the brand.

## 3. Brand system

### Colours

| Role | Value | Usage |
|---|---|---|
| FIS Blue | `#003B9B` | Header, primary structure, links and strong headings |
| FIS Red | `#F22124` | Calls to action, selected states and small highlights |
| Website Cream | `#F4EFE3` | Main website background |
| Footer Navy | `#001B4F` | Global footer and dark overlays |
| Deep text navy | Approximately `#082456` | Body copy on cream and white |
| White | `#FFFFFF` | Text on blue/navy and form surfaces |

Use flat colours. Do not introduce gradients.

### Typography

- **Unbounded:** main brand and website family.
- **Unbounded ExtraLight 200:** long-form paragraph copy where it remains comfortably readable.
- **Heavier Unbounded weights:** headings, labels and important information.
- **Press Start 2P:** retro football-game accent type.
- **Fallback:** the device's default sans-serif. Do not use Barlow as a technical fallback.
- **Logo lettering:** custom artwork, not an identified or installable font.

Press Start 2P should be used for:

- Homepage hero title.
- Short gaming-style labels.
- Team names, times, courts and competition-night labels in fixture and result displays.
- League table and result table typography where readability permits.

Do not use three or four competing typefaces on one page.

### Logos

The active logo hierarchy is:

1. `FIS-01` — Primary logo.
2. `FIS-04` — Secondary logo.
3. `FIS-02` — Badge logo.

Use the proper vector or transparent PNG assets from the brand kit. Do not recreate the logo with live text. The internal-lined FIS variation remains available for appropriate larger applications but is not automatically the default everywhere.

### Favicon

Use the approved `FIS-04-Secondary-Profile-Colour` artwork as the favicon source.

## 4. Global website structure

### Desktop header

- Sticky across every page.
- FIS primary logo on the left, slightly smaller than the earlier implementation.
- Right-aligned visible links in this order: `HOME`, `MONDAY`, `WEDNESDAY`, `RULES`, `MENU`.
- The MENU control uses the approved smooth three-line-to-X animation.
- The menu contains `REGISTER`, `CONTACT` and `ABOUT US`.
- The red floating REGISTER button is a homepage-hero element only. It is not a global header button.

### Mobile header

- Same global header identity and height principles.
- Preserve the logo on the left.
- Collapse navigation into the animated hamburger where necessary.
- Maintain large, non-overlapping tap targets.
- Do not let the red homepage REGISTER button overlap the header.

### Global footer

- Use Footer Navy `#001B4F`, not black.
- Red top border.
- Same footer across every page.
- All section headings in capitals.
- Three principal columns:
  - `QUICK LINKS`
  - `LEGAL`
  - `CONTACT`
- Quick links should include Home, Monday, Wednesday, Rules, Contact Us and About Us.
- Legal should include Privacy Policy and Terms & Conditions.
- Contact should include clickable:
  - Venue address → map directions.
  - `0402 888 767` → telephone link.
  - `contact@futsalindoorsoccer.com.au` → email link.
- Social icons below the columns: Facebook, Instagram, YouTube and Email.
- Display the Futsal Indoor Soccer logo at the lower right at a restrained size.
- Copyright line: `© 2026 Futsal Indoor Soccer. All rights reserved.`
- Do not add unnecessary marketing copy or repeat full contact paragraphs.

## 5. Homepage

### Hero

- Use a real futsal action photograph or video.
- Use a flat navy/blue image treatment rather than a gradient.
- Display `FUTSAL INDOOR SOCCER` in the approved Press Start 2P treatment.
- Remove `COMPETITIVE AND SOCIAL FUTSAL`.
- Remove `VIEW COMPETITIONS`.
- Provide clickable hero buttons:
  - `MONDAY NIGHT`
  - `WEDNESDAY NIGHT`
  - `FILL-INS`
- The Monday and Wednesday buttons link directly to their competition pages.
- The Fill-ins button links directly to the FIS Fill-ins Facebook group.
- Display the red `REGISTER` button toward the top-right of the hero, below and clear of the sticky navigation.
- REGISTER uses a complete white outline on all four sides. Do not use a blue bottom edge or offset blue shadow on this button.

### Homepage registration interaction

- Clicking the red REGISTER button opens the registration form as a modal/pop-up.
- Do not show a separate intermediate menu before the form.
- The registration form itself contains TEAM, PLAYER and FUTURE COMPETITIONS tabs.
- TEAM REGISTRATION is the initial visible form.

### Standings preview

- Show previews of both Monday and Wednesday tables immediately after the hero.
- Make the full Monday and Wednesday table areas or their headings clearly clickable.
- Underline `VIEW TABLE` so the interaction is obvious.
- Use team shirt icons coloured from each team's stored kit colour.

### Upcoming fixtures

- After the table previews, show only the next scheduled round.
- Automatically determine whether Monday or Wednesday is the next competition night using fixture data.
- If a night later contains multiple divisions, preview each division's table and show that night's fixtures by division.
- Use a shirt-only pixel kit icon:
  - Home kit on the left of the home team.
  - Away kit on the right of the away team.
- Keep kit artwork one colour throughout and derive the colour from team data.

## 6. Competition pages

Create matching Monday and Wednesday competition pages using the same structure and global components.

### Hero

- Use a futsal action image.
- Centre the night name horizontally and vertically: `MONDAY NIGHT` or `WEDNESDAY NIGHT`.
- Below the night name display:
  - Active team count, calculated from active team data.
  - `FROM 7PM`.
  - `ENDEAVOUR HILLS LEISURE CENTRE`.
- Place the location on a second row if required for good responsive layout.
- Do not show the current season name.
- Do not show `ROAD TO FINALS`.
- Do not add a directions link in the hero. The address/directions link belongs in the footer.

### Content order

1. Hero.
2. Full standings table immediately.
3. Results.
4. Fixtures.

### Standings

- Show the full table immediately rather than a shortened preview.
- Use Press Start 2P for table content where approved.
- Include each team's stored one-colour shirt icon.

### Results

- Most recent result round expanded by default.
- Older result rounds collapsed and expandable.
- Use team-coloured shirt icons with home on the left and away on the right.

### Fixtures

- Upcoming scheduled round expanded by default.
- Other rounds collapsed and expandable.
- Use Press Start 2P for team names, time, court and night labels.
- Use team-coloured shirt icons with home on the left and away on the right.

## 7. Registration modal

The approved visual reference is represented inside `homepage-approved.html`.

### Shared interaction and design

- Navy REGISTER banner with cream content area.
- Introductory copy:
  - `Team and player registrations are for the current Endeavour Hills competitions. Future competitions help us plan where and what to open next.`
- Tabs:
  - `TEAM`
  - `PLAYER`
  - `FUTURE COMPETITIONS`
- Selected tab uses blue with a red offset accent.
- Fields use a two-column desktop grid and a single-column mobile grid.
- Dropdowns must not preselect a choice.
- Only phone number, email address and preferred start date may show example or placeholder content.
- Required fields display a red asterisk.
- Do not write `optional`; simply omit the asterisk from optional fields.
- All checkboxes must be square/rectangular, never circular.
- All action buttons say only `SUBMIT`.
- Missing required fields show: `Please fill in all required fields.`
- Successful submission shows: `Thanks. We’ll be in touch shortly about your enquiry.`
- Use three separate Web3Forms submissions/endpoints where practical so Team, Player and Future Competition enquiries remain distinct in the inbox.

### Team registration

Intro explains that it is for the current Endeavour Hills competition and links to Future Competitions for another location.

Fields:

- Team Name — required.
- Captain Full Name — required.
- Mobile Number — required.
- Email Address — required.
- Postcode — required.
- Gender — required: Male, Female, Other.
- Preferred Night — required: Monday, Wednesday, Both.
- Division Preference — required: Division A, Division B.
- Preferred Start Date — required, calendar input.
- Message — optional without displaying the word optional.
- One confirmation checkbox acknowledging accurate details, Privacy Policy and Terms & Conditions — required.

### Player registration

The form should focus on players who want to fill in for a team.

Include a visible prompt and link to the FIS Fill-ins Facebook group for quick player/team posts.

Fields:

- Player Full Name — required.
- Postcode — required.
- Mobile Number — required.
- Email Address — required.
- Gender — required: Male, Female, Other.
- Preferred Night — required: Monday, Wednesday, Both.
- Division Preference — required: Division A, Division B.
- Preferred Start Date — required, calendar input.
- Message — optional without displaying the word optional.
- One confirmation checkbox acknowledging accurate details, Privacy Policy and Terms & Conditions — required.

### Future competitions

Explain that this form helps FIS understand where and what to open next. Link back to Team or Player for the current Endeavour Hills competition.

Fields:

- Full Name — required.
- Registering As — required: Team, Individual.
- Gender — required: Male, Female, Other. Do not request extra details after Other.
- Postcode — required. Do not collect a street address or suburb.
- Mobile Number — required.
- Email Address — required.
- Preferred Nights — required multi-select checkboxes from Monday through Sunday.
- Message — optional without displaying the word optional.
- One confirmation checkbox acknowledging accurate details, Privacy Policy and Terms & Conditions — required.

## 8. Contact Us page

### Hero

- Use a different community-focused photograph from the competition pages.
- Prefer an authentic team huddle, sideline interaction, group celebration or similar FIS community moment.
- Do not use a generic office or customer-service stock image.

### Page content

- Update the page fully to the approved cream, blue, red and navy theme.
- Remove the game-night information box and any `starting from 7PM` section.
- Provide clickable email, phone and venue information.
- The email icon must use the same red/orange treatment as the other contact icons.
- The form container must not retain the dark styling of the old website.
- Contact form categories:
  - General Enquiry.
  - Partnerships.
  - Other.
- Do not include Team Registration or Individual Registration as enquiry types.
- Instead, add concise text above the form that links the phrases `Team Registration` and `Individual Registration` to the correct registration modal tabs.
- Phone number is optional and should have no required asterisk.
- Message is optional and should have no required asterisk.
- Submission button: `SUBMIT`.
- Use a separate Web3Forms form/end-point from each registration form.

## 9. About Us page

- Keep the structure short and simple, taking layout inspiration from SOJI's About page.
- Use One Touch Arena only as a reference for the type of useful information to communicate, not its length or premium-facility claims.
- Explain succinctly:
  - What Futsal Indoor Soccer is.
  - Its competitive and social/community purpose.
  - The current Endeavour Hills competition.
  - The ambition to grow into new locations and competition formats.
- Use one strong community or competition photo.
- The photo caption describes the image, for example `2026 Champions`.
- Show the active winner of each league with the relevant team photo.
- Do not make the page long or repetitive.

## 10. Rules page

- Preserve all relevant rules currently published at `https://www.futsalindoorsoccer.com.au/rules/`.
- Add approved new rules that are missing from the old page.
- Use the existing expandable/card-style presentation as a reference, updated to the new brand.
- Use capitalised headings and subheadings as the current design convention.
- Remove the temporary knockout match-fee rule because it applied only to the season ending at the time of planning.
- Participation and media policy content belongs in Terms & Conditions, not the competition rules.
- The competition is 18+. Do not add a 16+ checkbox to registration.
- Final knockout operational rules already discussed should be retained where relevant, including eligible shootout participants and referee discretion around timekeeping.

## 11. Privacy Policy

- Identify the operator publicly as `Futsal Indoor Soccer`.
- Do not mention SOJI AU PTY. LTD.
- Include a `Last updated` date.
- Present the policy as information only: no calls to action and no registration collection-notice panel within the policy page.
- Assume Google Analytics is active and disclose its use.
- Assume the future admin database is implemented and disclose the applicable collection, storage and administration of league information.
- Expected information may include:
  - Registration and enquiry information.
  - Team and player names.
  - Contact information.
  - Postcode, gender and competition preferences.
  - Team details, fixtures, results, tables and team availability/preferences.
  - Signed captain onboarding forms.
- Do not claim the database contains transaction history, medical information or emergency contacts.
- Financial records and cashflow tracking remain in the separate spreadsheet/accounting process rather than the website database.
- Signed captain forms may be emailed back or physically signed, scanned and uploaded. Retain them for seven years.
- Include access/correction, complaints and contact information.

## 12. Terms & Conditions

The page layout is approved in principle, but the detailed legal wording remains subject to Olu's later review.

It should ultimately cover:

- Adult 18+ participation.
- Competition participation terms.
- Code of conduct.
- Agreement to competition rules.
- Voluntary participation and inherent sporting risk.
- Players' responsibility for assessing personal fitness.
- Emergency medical-treatment authorisation where appropriate.
- FIS does not provide player personal accident or injury insurance.
- Players should consider private health or personal accident cover.
- Players remain responsible for medical and emergency costs.
- Public liability cover is different from personal injury benefits and does not guarantee reimbursement of medical expenses.
- Photography and videography consent associated with participation.
- Players who do not consent to photography or videography should identify themselves to FIS staff before their fixture.
- Privacy acknowledgement.

Do not make an absolute or legally unsustainable statement that FIS can never be liable in any circumstance. Final liability wording should be professionally reviewed before reliance.

## 13. Team captain onboarding form

This is separate from online registration and is completed when a team is about to begin playing.

Key requirements already approved:

- Black FIS primary logo and black text for printing.
- Same centrally aligned logo size on both pages.
- One consistent font throughout, using size and weight for hierarchy.
- Two-column Team and Captain details where space permits.
- Team details:
  - Team Name.
  - Competition Night.
  - Division.
  - Preferred Team Colour.
- Captain details:
  - Captain Full Name.
  - Captain Date of Birth.
  - Captain Mobile Number.
  - Captain Email.
- Alternative Contact Name and Alternative Contact Mobile can be included without the word optional if layout permits.
- Initial player roster has eight spaces.
- Do not collect player addresses, phone numbers or individual signatures.
- First reference must be `Futsal Indoor Soccer (FIS)`.
- The roster wording should state that a player agrees to the FIS Terms & Conditions.
- Use normal square tick boxes.
- Remove the line beginning `Keep a copy of the signed form...`.
- Insurance wording:
  - `FIS does not provide player personal accident or injury insurance. Players should consider their own private health or personal accident cover. Public liability cover is different from personal injury benefits and does not guarantee reimbursement of a player’s medical expenses.`

## 14. Data and administration architecture

### Current hosting

- Continue using GitHub Pages and the existing domain unless a future feature genuinely requires a change.
- Preserve `futsalindoorsoccer.com.au`.
- The website should remain inexpensive or free to operate where practical.

### Data access layer

- Keep page components separate from the underlying data storage.
- Read fixtures, results, teams and standings through a data access layer rather than importing JSON directly throughout UI components.
- The first implementation may use JSON, but adapters should allow JSON to be replaced by a database later without rebuilding every page.

### Fixtures workflow

- Publish the entire season's fixtures upfront.
- Continue using VS Code and Codex for complex fixture reorganisation because team constraints can change mid-season.
- Support:
  - Multiple fixture changes in one round.
  - Multiple reasons for changes.
  - Teams joining or leaving during a season.
  - Team constraints appearing or changing mid-season.
- Codex may generate a validated JSON file that is uploaded/imported through the future admin workflow.
- Require review and publish rather than publishing fixture changes immediately.

### Admin area

- Provide a non-navigation URL such as `/admin`.
- Do not advertise the admin area in public navigation.
- Password-protect it.
- First release must allow Olu to:
  - Enter scores.
  - Save results without committing and redeploying the site.
  - Preview updated results and tables.
  - Review and publish changes.
- Referee score entry may be supported later, even if Olu is initially the only active user.
- Do not build a team-facing portal in the first release.
- Keep transaction/cashflow data in the existing spreadsheet rather than the website database.

### Fixture-change reminders

- The system may prepare a WhatsApp change summary as a reminder.
- Olu decides whether it should be sent.
- Provide a way to disable this reminder if it becomes distracting.
- Do not automatically notify captains for every edit because rapid corrections could create confusion.

## 15. Expansion-ready information model

The current public website is night-based because there is one active location and men's competition. The underlying data model should support this future hierarchy:

1. Competition category: Men's, Women's or Mixed.
2. Location.
3. Night.
4. Competition type or division.

Night comes before competition type/division.

Do not expose this full hierarchy prematurely. For the current site, the competition pages remain Monday and Wednesday at Endeavour Hills, while Future Competitions collects demand for new locations, genders and nights.

## 16. Forms and integrations

- Web3Forms is the current submission provider.
- Keep inboxes neat by using distinct forms for:
  - Contact Us.
  - Team Registration.
  - Player Registration.
  - Future Competitions.
- Do not commit secret keys or credentials to Git.
- Use appropriate environment/configuration handling supported by the deployment architecture.
- Add spam protection/honeypot features where Web3Forms supports them.
- Preserve a clear error and success state for every form.

## 17. Responsive and accessibility requirements

- Support desktop, tablet and modern phones down to approximately 320 px wide.
- No overlapping header, hero, registration modal or footer controls.
- Maintain high contrast:
  - Deep blue/navy text on cream.
  - White text on blue/navy.
- Use visible keyboard focus states.
- Use semantic links, buttons, labels and headings.
- Modal requirements:
  - Close button.
  - Escape-key close.
  - Backdrop close where safe.
  - Appropriate dialog labelling.
- Touch targets should be approximately 44 px high where practical.
- Tables may scroll horizontally on small screens rather than shrinking text to illegibility.
- Respect reduced-motion preferences for the hamburger and other non-essential animations.

## 18. Deferred or out-of-scope items

- Online payments in the first release.
- Automated captain notifications.
- Team-facing login/portal.
- Public transaction or balance information.
- Player medical details and emergency contacts in the website database.
- Full multi-location navigation before additional competitions exist.
- Final legal approval of Terms & Conditions and liability wording.
- Final decision on broader use of the internally lined FIS logo.

## 19. Implementation rule for Codex

Before implementing a page or feature:

1. Read this specification.
2. Inspect existing code and data structures.
3. Preserve unrelated user changes.
4. Implement one coherent page or system at a time.
5. Test desktop and mobile layouts.
6. Confirm interactions and validation.
7. Summarise what changed before asking Olu to approve a commit or push.

Do not treat a visual prototype as production-ready code. Reuse the approved design, content hierarchy and behaviour while maintaining clean components, accessible markup and a replaceable data layer.
