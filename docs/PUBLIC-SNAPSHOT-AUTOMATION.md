# Published competition snapshot refresh

Supabase remains the live source for published regular-season data. Public pages prefer an anonymous live Supabase read after hydration and use `src/data/public-competition-snapshot.json` when that read fails or times out. The checked-in snapshot is a fallback; regular-season results, fixtures, teams and adjustments are not copied into finals data.

## Scheduled and manual operation

`.github/workflows/refresh-public-snapshot.yml` runs at minutes 17 and 47 of each UTC hour and also supports `workflow_dispatch`. Both paths run on `master`. There is intentionally no Supabase Edge Function in this scheduled-only design. Results publication saves to Supabase immediately; the Results screen explains that the static fallback refreshes separately. Do not tell administrators a refresh is queued or complete based solely on publication.

GitHub scheduled runs can start late during heavy Actions load or be dropped. Scheduled workflows run only from the repository's default branch; GitHub may disable schedules in public repositories after 60 days without repository activity. Monitor the workflow's Actions history and failure notifications. If the last successful run is stale or failed, inspect its logs, correct any configuration or validation problem, then use **Run workflow** on `master` for a manual recovery. Do not create a competition data change to test the workflow.

The workflow reads published rows anonymously through the production project's public URL and publishable key. It generates the snapshot in an isolated runner, validates it, and checks that it still matches published data before committing. A clean run skips tests/finals checks that are needed only for changed output. Unexpected file changes fail the run. No-change runs do not commit. Only the dedicated commit job has `contents: write`, and it commits only `src/data/public-competition-snapshot.json` after successful preparation. A failed generation or check cannot change the repository's prior snapshot: the runner is isolated, and the commit job runs only after preparation succeeds.

A changed snapshot commit uses the workflow's `GITHUB_TOKEN`. GitHub does not start a push-triggered workflow from such a token, so `.github/workflows/deploy.yml` listens for a successful `workflow_run` on `master` and builds the refreshed commit. A failed refresh leaves the previous Pages fallback deployed. A no-change run does not start a Pages deployment because the published fallback has not changed.

## Configuration and secret handling

Set repository Actions **Variables** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the production `fis` project. Before enabling or relying on the schedule, verify the URL's project ref is `gaqevgjgolvndhcycxzt` and that the publishable key is present and belongs to that project. A publishable key is public by design, but never print it in logs or diagnostic output. Keep RLS enabled and ensure anonymous reads expose only published public competition records. The workflow needs no Supabase secret/service-role key and no GitHub PAT or Edge Function secret.

The refresh workflow checks both Variables are present before reading data, and the Pages build verifies that the public URL hostname is the production `fis` project before exporting assets. These checks never print either value. A successful Actions configuration step verifies the configured project target; local `.env.local` settings do not verify Actions configuration. The previous `trigger-snapshot-refresh` function implementation is not called by the site and is not required for this scheduled-only baseline. Do not deploy it as part of routine snapshot operations.

## Local read-only checks and manual recovery

From a checkout whose ignored `.env.local` points to production, first run:

```text
npm run snapshot:check
```

This compares anonymous published Supabase data to the local fallback without writing Supabase or files. When an update is intended and the check reports a difference, run:

```text
npm run snapshot:generate
npm run snapshot:validate
npm run snapshot:check
```

Generation writes the local JSON only after successfully reading and validating the complete published dataset; it writes a temporary file and renames it into place. A failed read or validation leaves the existing local snapshot in place. Review `git diff -- src/data/public-competition-snapshot.json`; only the generated public regular-season fallback should change. Follow the usual review, commit and release process to publish a local recovery.

For a remote manual recovery, open **Actions → Refresh Public Competition Snapshot → Run workflow**, select `master`, then inspect the run. This will automatically commit and push a changed snapshot to `master`, which triggers the Pages workflow through `workflow_run`. Treat it as a release action. Do not manually push or deploy a second snapshot while the workflow is running.

Verify these outcomes in order:

1. The refresh run passes its public-data read, snapshot validation, freshness check and conditional tests.
2. If data changed, the commit job succeeds and its commit changes only `src/data/public-competition-snapshot.json`. If no change was needed, confirm the prepare job passed and the commit job was correctly skipped; no Pages deployment is expected from this run.
3. For a changed snapshot, the Pages `workflow_run` build and deploy succeed for the refreshed commit.
4. Fetch `master`, compare the committed snapshot with `npm run snapshot:check`, and inspect the live Pages export directly. A hydrated browser can show live Supabase data and mask a stale static fallback, so verify the exported snapshot asset/content as well.

On any failure, the prior repository and Pages fallback remain available. Review the failed step and Actions logs, fix only its cause, and retry the workflow on `master`. `snapshot:check` and the workflow only read Supabase; no refresh step mutates database data. Results, fixtures, teams, standing adjustments and season changes remain published in Supabase even if a snapshot run fails. Finals and grading remain in `src/data/season-2026-s1.json` and are excluded from the generated fallback.

## Validation checklist

- [ ] Verify the two public Actions Variables target the production project without printing the key.
- [ ] Run the workflow on `master` and confirm the no-change path skips expensive checks and the commit job.
- [ ] Exercise a changed-snapshot path only when production data naturally differs; never alter data to manufacture a test change.
- [ ] Confirm a failed read or validation cannot push or deploy a changed snapshot.
- [ ] For a changed production snapshot, verify the snapshot-only commit, successful Pages run, and deployed static fallback.
- [ ] Preserve the `pre-new-website-2026-09-30` rollback tag and custom domain.
