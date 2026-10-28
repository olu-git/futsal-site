# FIS administrator password recovery

Approved for deployment. Apply the URL/template settings only after the live route is verified; the administrator initiates the email and chooses the password privately.

## Implementation

`/admin/reset-password/` is a static-export route using the existing Supabase
provider, public project configuration and `is_fis_admin` RPC. It has no server
endpoint, service key, new dependency or database migration.

The page accepts the current implicit recovery callback (`#type=recovery` with
access and refresh tokens), or a single-use recovery token hash in the query.
Supabase validates the credentials, then the existing admin RPC must authorise
the user. The page does not trust a stored login session or URL type alone.
Identity and admin access are checked again before updating the password through
Supabase Auth. Missing, expired, wrong-type and non-admin links cannot open the
form. Recovery credentials stay in memory rather than browser storage; URL
parameters are removed immediately, the page uses no-referrer/noindex metadata,
and raw provider errors/tokens/passwords are not displayed or logged.

Password updates require matching passwords of at least eight characters; the
hosted Auth password policy remains authoritative. After success the form clears
and the recovery session is signed out locally. Ordinary login stays unchanged.
Reloading the cleaned URL requires a fresh recovery email. A logout-network
failure cannot turn an already successful password change into a reported failure.

This deliberately retains the current implicit Auth configuration. It does not
add a PKCE initiation flow or redeem arbitrary `?code=` sign-in callbacks; the
single-use token-hash email below also works across browsers/devices without a
PKCE verifier. Do not enable PKCE globally as part of this release.

## Exact production changes, after approval and frontend deployment

Project: fis (`gaqevgjgolvndhcycxzt`). Authentication > URL Configuration:

- Site URL: `https://www.futsalindoorsoccer.com.au`
- Add exact Redirect URL: `https://www.futsalindoorsoccer.com.au/admin/reset-password/`
- No wildcard redirect is needed. Do not add localhost to production for this flow.

For the existing dashboard **Send password recovery** action, update only the
Reset Password email link in Authentication > Emails > Reset Password to:

```html
<a href="{{ .SiteURL }}/admin/reset-password/?token_hash={{ .TokenHash }}&amp;type=recovery">Reset password</a>
```

Retain the rest of the existing template. This explicit link is required when
using the dashboard's default email action: setting Site URL to the production
Home page and adding a redirect allowlist does not itself choose the reset route.
Alternatively, a recovery request explicitly specifying `redirectTo` as the exact
reset URL can keep the default ConfirmationURL template; this is not an additional
public email-request form and no email is sent by this implementation.

1. Review/commit the local files and deploy through normal Pages checks.
2. Confirm `/admin/reset-password/` loads and rejects a direct visit.
3. Record old Site URL, redirect allowlist and Reset Password template, then apply
   only the approved configuration/template changes above.
4. Send a new recovery email to the existing administrator. Do not reuse an old
   expired link or put recovery links, tokens or passwords in chat/logs.
5. Open the new link, choose the new password privately, then sign in at
   `/admin/login/`. Confirm dashboard access and normal result-management reads.
6. Verify the old password no longer works. Do not create competition records.

Before frontend deployment, configuration changes must wait to avoid sending users
to a nonexistent route. For rollback, restore only the recorded URL/template
settings and application release. A successfully changed password is not rolled
back to the exposed one. No competition or Auth data restore is required.

## Validation and limits

Local automated checks use synthetic users/tokens and intercepted Auth responses,
never real password-reset emails or production credentials. Hosted email delivery,
link expiry/reuse and the real password change require the separately approved
production run above. Existing published fixtures, scores and admin permissions
are outside this change.

References: [Supabase password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail),
[redirect allowlist](https://supabase.com/docs/guides/auth/redirect-urls).

Completed local verification: 186 automated tests passed, including actual SDK
requests against synthetic Auth responses; lint, TypeScript, static export and
whitespace checks passed. The export contains `out/admin/reset-password/index.html`.
Isolated browser checks passed at 1440px and 320px for valid recovery, confirmation
mismatch, mocked password update/logout, URL cleanup, no persisted recovery session,
reload rejection, expired links, non-admin denial, revocation before save, implicit
callbacks and rejection of an ambient normal login. Existing email/password login
and dashboard access also passed with mocked Auth responses. No overflow or page
errors appeared. Browser harnesses, logs and screenshots remain in ignored cache.
Production email delivery and a real password change remain to be verified by the administrator after deployment and configuration.