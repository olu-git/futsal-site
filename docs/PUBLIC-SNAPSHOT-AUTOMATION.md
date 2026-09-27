# Published competition snapshot automation

## Flow and boundaries

After `public.publish_result()` succeeds for a regular-season result (including a correction), Admin Results calls the `trigger-snapshot-refresh` Supabase Edge Function. The function verifies the user's Supabase JWT, then checks `public.is_fis_admin()` in that caller's session before requesting the GitHub `Refresh Public Competition Snapshot` workflow. The GitHub credential stays in the Edge Function's secrets; it is never sent to the browser. The browser cannot securely call the GitHub API itself from a static GitHub Pages site.

The workflow anonymously reads published Monday and Wednesday regular-season data through Supabase RLS using the public URL and publishable key. Its read-only preparation job validates and regenerates `src/data/public-competition-snapshot.json`; a separate job receives only that validated artifact and gains Contents write permission to commit it if its bytes changed. A changed snapshot on `master` starts the Pages workflow via `workflow_run`: commits made with `GITHUB_TOKEN` do not themselves start `push` workflows. The workflow is also configured for ordinary pushes to `master`. Refreshes on `feature/new-website` do not deploy.

Supabase remains the live primary source. A failed dispatch or workflow does **not** undo a published result; it only leaves the static fallback stale. The admin warning provides a retry action. Finals, grading and knockout data stay exclusively in `src/data/season-2026-s1.json` and are not generated or changed by this process.

The old `src/data/teams.json`, Monday/Wednesday fixture JSON and standing-adjustment JSON remain intact for legacy scripts and historical comparison. The separate generated snapshot prevents refreshes from overwriting hand-maintained finals data.

## Future configuration (not activated by this change)

Set GitHub repository **Variables** on the target repository:

- `NEXT_PUBLIC_SUPABASE_URL`: the public project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the publishable key. This key is public by design; RLS still controls read access.

Set Supabase **Edge Function secrets** for `trigger-snapshot-refresh`:

- `SUPABASE_URL`: the same public project URL.
- `SUPABASE_PUBLISHABLE_KEY`: the same publishable key, not a secret/service-role key.
- `FIS_ALLOWED_ORIGINS`: comma-separated exact website origins (for example, the production origin and `http://localhost:3000` only while local browser review is needed). Do not include a trailing slash or `*`; remove temporary local origins after review.
- `GITHUB_TOKEN`: fine-grained personal access token scoped to this repository with **Actions: Read and write**; no Contents write permission is needed on this token. The workflow's own `GITHUB_TOKEN` has job-scoped Contents write permission for its snapshot commit.
- `GITHUB_OWNER`, `GITHUB_REPOSITORY`: the target repository coordinates.
- `GITHUB_WORKFLOW_FILE`: `refresh-public-snapshot.yml`.
- `GITHUB_WORKFLOW_REF`: `master` after release. `feature/new-website` is permitted for pre-release testing only.

Do not put the GitHub token, service-role key or any password in `NEXT_PUBLIC_*`, source code, repository Variables, or browser-accessible configuration. Do not log them. Restrict access to the Edge Function secret and rotate the token if exposed. Deploy the function later using the Supabase CLI or Dashboard with JWT verification enabled; do not disable JWT verification. `supabase/functions/trigger-snapshot-refresh/deno.json` pins its Supabase JS dependency.

## Validation and safe operation

Local, read-only snapshot commands:

```text
npm run snapshot:validate
npm run snapshot:check
```

`snapshot:check` queries public Supabase data anonymously and fails when the checked-in snapshot is stale. `snapshot:generate` refreshes only the local snapshot file. Run it only when a snapshot update is intended. Both remote-reading commands need the public environment values set locally; `snapshot:validate` is offline. No command in this group writes to Supabase.

After activation, test authentication without changing competition data: try the Edge endpoint with no JWT (401), a valid non-admin JWT (403), and a verified admin JWT (202). The admin request queues a workflow, so use the approved feature branch first and review the generated diff before enabling the production ref. A browser CORS preflight is allowed only from the configured origins. The Edge Function never accepts a caller-supplied user ID or Git ref.

To manually retry, use **RETRY SNAPSHOT REFRESH** in Admin Results after a dispatch failure, or dispatch **Refresh Public Competition Snapshot** in GitHub Actions on the intended branch. Check the Edge Function logs for a rejected dispatch, the workflow run for query/validation/commit errors, and the Pages workflow for deployment errors. No-change runs do not commit. A failed generation leaves the previous snapshot intact. A retry does not republish or alter the result.

## Disable and rollback

To stop automatic dispatch without changing competition data, disable the Edge Function or remove its `GITHUB_TOKEN` secret. Result publication continues in Supabase; admins will see a non-blocking fallback-refresh warning. Disable the dedicated GitHub workflow as well if manual dispatches must also stop. Keep the public Supabase configuration intact so live competition pages continue to load. If the generated fallback must be rolled back, review the last known-good snapshot commit and restore **only** `src/data/public-competition-snapshot.json` through the normal reviewed Git process, then rebuild Pages. Do not revert published Supabase results or edit finals JSON as part of this rollback. Remove the `workflow_run` deploy hook only through a separate reviewed code change if retiring the automation permanently.

## Review checklist before activation

- [ ] Review the generated snapshot against public Monday/Wednesday standings, results, kit colours and team status; confirm no draft, grading or knockout records.
- [ ] Confirm `npm test`, lint, TypeScript, static build, finals check, snapshot validation and `git diff --check` pass; inspect exported public and admin routes.
- [ ] Review the Edge Function's JWT/admin check, CORS origins and GitHub token scope. Use an exact allowed origin list.
- [ ] Confirm the dedicated workflow exists on the repository's default branch; GitHub requires this for `workflow_dispatch` and `workflow_run` activation.
- [ ] Configure public repository Variables and the Edge secrets; review branch-protection rules for the workflow's snapshot-only push.
- [ ] Deploy the Edge Function with JWT verification and test 401/403 before the first authorised 202 request.
- [ ] Trial the refresh on `feature/new-website`, inspect the sole generated-file diff, and confirm it does not deploy.
- [ ] After merging the reviewed code to `master`, set `GITHUB_WORKFLOW_REF=master`, confirm the dispatch commits only the snapshot on `master`, and confirm the successful `workflow_run` produces the Pages build.
- [ ] Check failure visibility and retry on the admin screen. Keep the existing JSON finals workflow separate.
