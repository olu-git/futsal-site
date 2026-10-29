# FIS administrator password recovery

The reset page is deployed. The organiser reports the production Site URL and redirect allowlist are configured. Keep the default email template unchanged; request emails with the explicit destination below.

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
optional single-use token-hash callback also works across browsers/devices without a
PKCE verifier. Do not enable PKCE globally as part of this release.

## Exact production changes, after approval and frontend deployment

Project: fis (`gaqevgjgolvndhcycxzt`). Authentication > URL Configuration:

- Site URL: `https://www.futsalindoorsoccer.com.au`
- Add exact Redirect URL: `https://www.futsalindoorsoccer.com.au/admin/reset-password/`
- No wildcard redirect is needed. Do not add localhost to production for this flow.

## Use the unchanged default recovery email

Keep the Reset Password template using `{{ .ConfirmationURL }}`. Custom SMTP
and a custom email template are not required for this implementation.

Request the email through Supabase Auth with an explicit destination:

```ts
const { error } = await supabase.auth.resetPasswordForEmail(
  "contact@futsalindoorsoccer.com.au",
  { redirectTo: "https://www.futsalindoorsoccer.com.au/admin/reset-password/" },
);
```

This example sends an email when executed. Run it only after the administrator
explicitly authorises sending a fresh recovery email. Use the existing public
Supabase configuration and implicit flow; no service key is required. The current
website does not expose a reset-email request form.

The default ConfirmationURL points to Supabase's verification endpoint, including
`redirect_to`. After verifying the one-use email token, Supabase redirects to the
reset page with `type=recovery`, access token and refresh token in the fragment.
The existing page explicitly calls `setSession`, validates the user and existing
admin authorisation, and only then displays the new-password form. Automatic URL
detection is deliberately disabled on this isolated client because the page handles
these parameters itself and immediately clears them from the address bar.

Without an explicit destination, requests use the Site URL (the homepage), not the
reset page. Do not rely on the dashboard's default recovery action unless it lets
you specify this exact destination. Do not change Site URL to the reset page.
An allowlist entry permits a destination; it does not select it.

1. Retain the deployed reset page and the production URL settings listed above.
2. Keep the existing default Reset Password email template unchanged.
3. When authorised, request a fresh email with the explicit `redirectTo` above.
4. Open the email link privately and choose the new password. Never share the link,
   tokens or password in chat/logs. Do not reuse an expired link.
5. Sign in at `/admin/login/` and confirm normal dashboard access.

No deployment or database change is needed to use the default email with the
already deployed handler. A successfully changed password must not be rolled back
to the exposed one. No competition or Auth data restore is required.

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
## Password-update rejection diagnosis (30 October 2026)

Read-only production Auth logs showed two HTTP 422 `same_password` responses.
The previous handler incorrectly described these as possible session expiry.
The handler now asks for a password different from the current one and keeps
the verified form open for retry. No session or authorisation changes are needed.
The recovery callback establishes the session before the admin check; credentials
remain in the isolated client until successful update/logout. Strict Mode uses one
cached recovery attempt. No production password update or email was used to test
this fix. Regression coverage checks the authenticated request, same-password
retry, and removal of the local session after success.
