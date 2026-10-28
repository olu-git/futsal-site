# Database security and result publication fixes

Status: both focused migrations applied to production with explicit approval on 27 October 2026 (Melbourne). See the deployment evidence below; no frontend release was performed.

## Scope and migration order

1. `supabase/migrations/20261026065901_restrict_rls_auto_enable_execution.sql`
   revokes execution of `public.rls_auto_enable()` from PUBLIC, anon and authenticated.
   It preserves the function body, owner and existing `ensure_rls` event trigger.
   Installations without the optional function are left unchanged; an unexpected
   return type stops the transaction. It does not create or remove tables or policies.
2. `supabase/migrations/20261026065903_repair_publish_result_fixture_lock.sql`
   introduces `private.lock_fixture_for_result_publication(uuid)`, owned by postgres,
   SECURITY DEFINER with an empty search path and an explicit administrator check.
   Only authenticated callers receive execution permission, and non-admin callers
   are rejected before the fixture lookup. The helper locks one existing fixture
   row; it cannot update fixtures or results. Missing fixtures are rejected.
   The migration replaces exactly one legacy lock statement in `publish_result`
   with the helper call. It preserves the remaining body, SECURITY INVOKER mode,
   existing execution grants, ownership, identity and transaction boundaries.
   Unexpected signatures/security attributes or lock statements stop the transaction.

Both migrations are transactional and can be repeated safely on the tested baseline.
Do not routinely rerun installed migrations or apply the whole historical migration
directory to production: the hosted migration ledger does not fully describe the
older installed schema. A future approved release must reconcile its ledger first.

## Effects and risks

- Public fixtures, standings and registration require no application changes.
- Dashboard RPC authorisation stays in the database. The new helper also checks
  authorisation independently, including direct calls outside the dashboard.
- Authenticated users retain no fixture UPDATE permission, including column grants.
- Result changes still use existing validation/archive/audit triggers and RLS.
- The helper intentionally obtains a row lock with owner privileges. Contending
  result/fixture transactions may wait as before; concurrency must be preserved.
- Removing the event function's API grants must not disable automatic RLS during
  subsequent table creation. Keep its event trigger and owner privileges intact.
- The result migration transforms trusted catalog DDL, not user-supplied SQL. If a
  future publication implementation no longer has the known lock, stop and review
  rather than broadening its permissions or blindly replacing its entire body.
- These changes do not enable leaked-password protection or alter Auth settings.

## Repeatable disposable verification

Use a complete local PostgreSQL 17 installation, including its `share` files:

```powershell
node scripts/verify-local-database-security.mjs 'C:\path\to\postgresql\bin'
```

The verifier accepts only a binaries directory. It removes inherited PG connection
settings, creates a fresh temporary cluster, binds it to 127.0.0.1 on a temporary
port and uses synthetic users, competition records and results. No hosted URL,
production backup or existing database is accepted. Its temporary trust-authenticated
cluster contains no private data and is stopped and removed afterward. Local Auth
functions model JWT claims; this does not test Supabase token verification.

Verification covers the original publishing failure, unchanged data during migration,
safe repeats, event-hook identity and CREATE TABLE/CREATE TABLE AS/SELECT INTO RLS,
anonymous and non-admin denial, authorised publication/correction, standings,
immutable history, failure rollback including audit writes, and real concurrent
publication. It verifies the old audit records and archived result are retained.

Also run `npm run test:database-package`, `npm run test:admin-results`, lint and
`git diff --check`. No frontend or build configuration changes are involved.
Retain detailed execution logs in ignored local storage; report totals and failures.

Validated on 26 October 2026: PostgreSQL 17.11 passed all 18 verification groups,
including the original pre-fix failure, fail-closed migration guard, committed
code/ACL rollback and reapplication, and two concurrent publishing sessions.
All 20 offline database-package checks and 11 result-service tests passed. Lint
passed; no application/build configuration changed, so no static build was repeated.
Local verifier logs and extracted server tools remain ignored. No production
connection or production record was used by the verifier.

## Before a separately approved production release

- Recheck the production definitions, grants, event-trigger dependency, migration
  ledger and backup availability for drift. These local scripts are not permission
  to execute production writes.
- Compare the installed publisher against the rehearsed source, and record its
  exact definition/owner/grants plus the event function's ACL for recovery.
- Apply only these two reviewed migrations in order, then check helper grants,
  publisher SECURITY INVOKER status, event-trigger identity and public read access.
- Real HTTP/JWT non-admin denial and an authorised dashboard publication remain
  hosted checks. Do not manufacture a production result to perform them.
- Fresh public-table creation is a disposable check, not a production smoke test.

## Rollback

Each migration rolls itself back if any statement fails. For an approved later
rollback, use a new compensating migration rather than editing applied history.

For the fixture-lock fix, restore the exact recorded `publish_result` definition,
then drop the private helper only after dependency inspection. This intentionally
restores the original publishing defect; it must not restore broad fixture writes.
Never revert recorded scores, fixtures or audit history as part of code rollback.

For the event-function grants, restore only the previously recorded ACL if a real
regression requires it. Do not drop the RLS event trigger. Restoring broad execution
also restores the Advisor warning. Rehearse rollback on disposable data first.

## Approved deployment checkpoint - 27 October 2026

Production deployment was authorised, but neither migration has been applied.
The fresh backup connected with certificate and hostname verification enabled,
using the CA from Supabase's official dashboard configuration. No production
configuration was changed.

A full custom archive, password-free roles, source row/metadata evidence and the
existing function definitions/ACLs were encrypted outside Git with the existing
AGE recipient. Each encrypted artifact passed an in-memory decrypt comparison.
The independently saved recovery key remains separate. This new backup has not
passed restore verification and must not be treated as the deployment gate.

Disposable restoration stopped at `permission denied to change owner of event
trigger "ensure_rls"`: local restored role attributes do not allow the managed
platform's event-trigger ownership operation. The disposable server was stopped
and its database cluster removed. No production migration or match-data mutation
was performed. Next: adjust only the disposable restore harness to handle this
platform/local role difference explicitly, rerun restoration and evidence checks,
then continue the two individually approved migrations only after verification.
Vault/platform services and Storage file bytes remain outside the scoped restore
verification; neither prepared migration changes them.
## Backup restore checkpoint passed - 27 October 2026

The existing encrypted archive in protected backup folder
`fis-security-20261027-83835c29-cb62-411e-94a4-0af157d2ed2f` passed a fresh
restore-only rehearsal. Evidence is stored alongside it under
`restore-verification-e2d3510f-de33-49a1-a205-262a5b3f9266/manifest.json`
and encrypted `restore-verification.json.age`. The original failed manifests
remain as historical evidence; they do not describe this successful rehearsal.

Local recovery handling, without production changes:
- Restore using the disposable cluster's supabase_admin superuser.
- Temporarily make local postgres a superuser for PostgreSQL's event-trigger
  ownership requirement; restore its original NOSUPERUSER attribute immediately
  after archive restoration and before comparisons.
- Restore the explicit owner-only private.admin_users ACL from encrypted source
  metadata where pg_dump omits it as redundant. Compare ACL entries without
  depending on their ordering, preserving grantors and grant options.
- Test automatic RLS as the restored postgres DDL role in a rolled-back local
  transaction, rather than creating a table owned by the recovery superuser.

Passed: archive/decrypted checksums; all rows in 46 public/private/auth tables;
47 function definitions and owners; 53 ordinary triggers; 27 RLS policies;
relation owners, ACLs and RLS flags; views; enabled ensure_rls event trigger and
recorded owner; 65 validated foreign keys; automatic RLS on a local probe table.
This includes all 918 saved fixture rows, 360 result-version rows and 4,873 admin
audit rows, plus fixture change history and staging records. The disposable
server was stopped and its cluster removed after verification.

The backup is recoverable for the two planned function/grant changes and the
application schema/data covered above. This is not full Supabase platform
recovery: Vault/platform services, Storage object bytes and external service
configuration were not restored; role passwords are deliberately excluded.
The existing independently saved AGE recovery key remains required. No new
off-site copy or separate-Windows-account rehearsal was performed in this check.

A diagnostic parse error printed private backup content in tool output. The
inspector was corrected to suppress payloads on parsing errors and use a
sufficient buffer; private content is not reproduced in this document. This
incident does not change the archive checks or successful restore result.

STOP checkpoint reached: neither production migration was executed. No production
connection was made by the restore-only verifier, and nothing was pushed or
frontend-deployed. Await further instruction before any production change.
## Production deployment - 27 October 2026 (Melbourne)

Applied individually through the authorised Supabase migration connector, in
reviewed order. Supabase assigned its execution-time ledger versions:

| Reviewed file | Hosted ledger version | Result |
| --- | --- | --- |
| 20261026065901_restrict_rls_auto_enable_execution.sql | 20261026225848 | Applied |
| 20261026065903_repair_publish_result_fixture_lock.sql | 20261026225904 | Applied |

No bulk push or frontend release was performed. Preflight confirmed the verified
encrypted backup, rollback definitions/grants and recovery instructions remained
available. Production schema/function/grant metadata matched the saved baseline,
and all 19 FIS/public-private data tables matched their saved rows exactly.
Post-deployment comparison confirmed only the approved function/ACL changes and
new helper; all competition, staging, result and audit rows remained unchanged.
Protected deployment evidence is alongside the verified backup in
`deployment-check-f436331b-71de-4980-b245-9054010c7127` (before) and
`deployment-check-2d33c089-aafb-43f0-b764-438c2d931a40` (after).

Verified on production:
- ensure_rls remains enabled with the same owner, CREATE TABLE/CREATE TABLE AS/
  SELECT INTO tags and unchanged function definition. Every public table has RLS.
  Actual automatic RLS execution was tested locally; no production probe table
  was created.
- rls_auto_enable is no longer executable by anon or authenticated (nor through
  their PUBLIC inheritance). The owner and search path are unchanged.
- publish_result remains SECURITY INVOKER, admin checked, authenticated-executable
  and unavailable anonymously; it now calls the narrow locking helper.
- Helper owner postgres, SECURITY DEFINER, empty search path; authenticated EXECUTE
  only among API roles. A read-only non-admin role/claim probe was rejected with
  the expected administrator-access error before a fixture lookup.
- Authenticated table/column fixture UPDATE remains denied.
- Anonymous Data API reads for competition editions, teams, fixtures, published
  result versions and standings adjustments returned HTTP 200 with rows.
- Public Home displayed fixtures and both league tables. The existing signed-in
  administrator session loaded the dashboard and populated Result Management screen normally.

Remaining: verify a normal publish/correction through the dashboard during the
next legitimate update. No competition result was created or modified for testing.
Local synthetic publication/correction/concurrency/rollback checks remain the
previously completed evidence; this is not a claim of a production publication.

Diagnostic exposure: backup artifacts/diagnostics were not committed or published
by these actions; the diagnostic scripts are ignored. Private Auth material did
appear in conversation tool output and remains in that record. Invalidating the
affected Auth sessions is a separate containment action requiring authorisation;
no sessions, passwords or Auth settings were changed during this deployment.
The backup remains encrypted, with its recovery key separately saved.
## Authentication exposure containment - 28 October 2026

The organiser authorised identifying and invalidating reusable exposed Auth
material. Inspection was performed in memory; only field names and counts were
reported. Treat the diagnostic's truncated source-evidence payload conservatively
as exposing all of its Auth records: one user's password hash, seven session
families and 170 refresh-token records (seven unrevoked at backup time). No
plaintext password, database connection password, AGE identity, MFA secret,
session HMAC key or nonempty user recovery/change token was present in that
payload. This does not assert that hashes or metadata are harmless.

All seven matching session families still existed; six exact backup token values
remained unrevoked. A narrowly scoped transaction deleted only those exposed
sessions. Verified foreign-key cascades removed their refresh-token families and
session MFA claims. Any remaining exact exposed unrevoked token would also have
been revoked; none remained. The initial attempt rolled back on a UUID/text
verification mismatch; explicit casts corrected it before the successful retry.

Independent committed-state verification: zero sessions and zero unrevoked refresh
tokens; the one Auth user and FIS administrator membership remain intact. Digests
for all 19 public/private application tables matched before and after, and all
five anonymous public-data reads returned HTTP 200. No competition, publishing
permission, migration or frontend changes were made by this task.

Remaining user action: replace the FIS website administrator password privately
through the authorised Supabase Auth administration/password recovery process,
then sign in again. The stored password hash cannot itself be submitted as a
normal login password, but exposure permits offline guessing. No new password
was invented, read or changed here. Existing access JWTs are not immediately
invalidated by session deletion and can last until their normal expiry; no JWT
signing keys or API keys were exposed in this diagnostic, so no project-wide key
rotation was performed. Do not claim immediate invalidation of every previously
issued access JWT.

Diagnostic files remain ignored and no private content was committed or uploaded
by these actions. Conversation/tool-output retention is outside repository cleanup;
do not share that transcript, and use available conversation deletion controls if
desired. Legacy diagnostic exception handlers now suppress private payloads.
Preserve the encrypted recovery archive, but a future Auth restore must invalidate
its exposed session/token families before reopening authentication; do not revive
them from the old snapshot. Do not delete the verified backup to contain sessions.