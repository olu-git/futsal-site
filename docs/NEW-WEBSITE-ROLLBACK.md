# New website rollback

The permanent pre-release tag `pre-new-website-2026-09-30` points to
`3780f29743c4e3b0ce238d63c9cce875fea09f3a`, the website deployed by
[successful Pages run 36098026597](https://github.com/olu-git/futsal-site/actions/runs/36098026597).
Keep this tag; never move or delete it. The production URL is
`https://www.futsalindoorsoccer.com.au/` with HTTPS enforced. Preserve the
GitHub Pages custom-domain setting, Actions permissions, `github-pages`
environment, and the `master` push deployment workflow. Do not change DNS.

Rollback is warranted if the deployed site has broken public routes, incorrect
competition data, failed Supabase reads with unusable fallback, broken assets,
or a material registration or admin access failure that cannot be fixed promptly.

## Restore through a new commit

Start with a clean checkout and current `origin/master`. Check whether the
*then-current* Supabase schema and data are compatible with the tagged site's
read paths before proceeding; do not roll back Supabase automatically. This
check is especially important after later database releases.

```powershell
git fetch origin master --tags
git switch -c rollback/pre-new-website origin/master
git restore --source=pre-new-website-2026-09-30 --staged --worktree :/
git diff --cached --exit-code pre-new-website-2026-09-30
git commit -m "revert: restore pre-new-website production site"
git push -u origin rollback/pre-new-website
```

The `git diff --cached --exit-code` command must show no differences from the
tag. Open a pull request from the rollback branch into `master`, review it,
and merge without force-pushing. The existing `master` push workflow rebuilds
and deploys `out/`. Monitor its build and deploy jobs to success. The tagged
workflow previously built and deployed the same static export successfully;
it uses Node 20, `npm ci`, `npm run build`, and Pages artifact deployment.

Verify the Pages deployment commit, the live HTTPS URL, custom domain, Home,
Monday, Wednesday, navigation, fixtures/results and key assets. Compare a
distinctive page element with the tagged site, allowing for Pages/CDN caching.
The old site's public data is its tagged JSON; do not run an import or alter
Supabase to force a rollback. Keep the tag available after future releases.

If a later release changes the Pages workflow or Supabase compatibility,
repeat this review against the latest `master` before using the same tag. A
recovery commit is always made on top of current `master`, never by resetting
or rewriting it. If the old site cannot work with the current Supabase state,
stop and prepare a separately reviewed compatibility fix or a newer safe
rollback target.
