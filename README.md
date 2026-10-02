# Futsal Indoor Soccer

The public FIS site covers Monday and Wednesday competitions at Endeavour Hills. It is a Next.js 16 static export deployed from `master` to GitHub Pages at `https://www.futsalindoorsoccer.com.au/`. Production does not require a Next.js server.

## Data and administration

- Published regular-season fixtures, results, teams, and standings are read from Supabase using the public URL and publishable key under RLS. `src/data/public-competition-snapshot.json` is the generated, checked-in fallback when the read is unavailable.
- Authenticated administrators manage results, fixtures, teams, standing adjustments, and seasons through `/admin/`. Mutations use the logged-in Supabase session, RLS, and the reviewed RPCs. Do not use a service-role key in the site.
- Current finals and grading history remain in `src/data/season-2026-s1.json`, with bracket definitions in `src/lib/finals.ts`. The public Home, Monday, and Wednesday pages show only the knockout bracket; grading results stay recorded in JSON. Do not import finals or grading records into Supabase.
- The older `teams.json`, Monday/Wednesday fixture JSON, and `standings-adjustments.json` remain for historical comparison and repeatable validation. Do not use them as a substitute for the current published Supabase data.
- Team, player, and future-competition registration are tabs in the Home REGISTER dialog and on `/register/`. Contact has its own form.

## Local development

Use Node.js 24. Run `npm ci`, copy the placeholder names from `.env.example` into an ignored `.env.local`, and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser reads. Never commit real environment values. Then run `npm run dev` and open `http://localhost:3000/`.

`npm run build` writes the static site to `out/`; `npm start` previews that export locally without a Next.js server. GitHub Actions runs offline checks and the build with the two repository variables, then deploys `out/` on pushes to `master`. Keep the custom domain and rollback procedure in [docs/NEW-WEBSITE-ROLLBACK.md](docs/NEW-WEBSITE-ROLLBACK.md).

## Checks and operations

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run finals:check
npm run snapshot:validate
npm run snapshot:check
npm run season:import:validate
npm run season:import:check
npm run build
git diff --check
```

`snapshot:check` reads anonymous published Supabase data and compares it with the fallback; it does not write to Supabase. Import generation and checks do not execute SQL. Use [docs/PUBLIC-COMPETITION-DATA.md](docs/PUBLIC-COMPETITION-DATA.md), [docs/PUBLIC-SNAPSHOT-AUTOMATION.md](docs/PUBLIC-SNAPSHOT-AUTOMATION.md), and [supabase/README.md](supabase/README.md) for operating details. Run `finals:freeze` only for a separately reviewed seed refresh; routine score entry must preserve existing match IDs and feeder relationships.

The four public forms use a shared public Web3Forms access-key fallback unless an optional per-form `NEXT_PUBLIC_WEB3FORMS_*_KEY` is configured. Keep `.env.example` as the configuration template; `.env.local` is machine-specific and ignored. Keep the source and export variants in `brand-assets/fis-logo-pack/` for future design work; the running site serves its selected logos from `public/logos/`.

The original pre-new-website production commit remains permanently tagged `pre-new-website-2026-09-30`. Never move or delete that tag.
