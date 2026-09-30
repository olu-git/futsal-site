# Seasons and competitions implementation plan

1. Draft-first workflow implemented with private season, competition and returning-team records plus versioned save/resume.
2. Category, location, weekday and division remain explicit relationships and support future competition combinations without Monday/Wednesday hard-coding.
3. Active teams are selectable and receive new season-specific IDs. Core profile and kit colour copy by default; preferences and private notes are reviewable, addable, editable, removable, clearable, resettable to source and optional as one private-profile unit.
4. Fixtures, results, standing adjustments and season-specific audit history are excluded.
5. Atomic activation validates and locks the draft, archives each matching active edition and publishes the new season structure. Existing archived-data guards preserve history.
6. Browser mutations reconfirm administrator access and call narrow `SECURITY DEFINER` RPCs through authenticated RLS sessions. No service-role credential is used.
7. Disposable schema, rollback, zero-record and genuine two-session concurrency verification passed. The production preflight, migration and postflight also passed without creating a season draft or changing existing business-data counts or public visibility.

## Future enhancements

These are planned enhancements, not blockers for the current release:

- Return a team from any historical season, not only the immediate source season.
- Add a brand-new team during season setup.
- Support mid-season team joining or withdrawal.
- Support mid-season team replacement while preserving historical results.
- Regenerate only affected future fixtures.
- Add more flexible scheduling and round generation.

Until these workflows exist, exceptional changes will be planned and reviewed manually with Codex.
