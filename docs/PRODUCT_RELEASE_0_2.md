# TriZentro Product Release 0.2 — 70.3 Race Pack usability
Date: 5 November 2026
Release status: **Committed to main, not independently verified in a public browser.**

## What changed
- One visible NL/EN navigation system across the existing website.
- Clearer mobile route from Readiness Check to Dashboard to free Race Pack.
- The free 70.3 Race Pack now has explicit **Save on this device**, **Load saved draft**, **Delete saved draft** buttons. No automatic saving, signup or server submission.
- Personal data is stored only when a user deliberately clicks Save, under the single localStorage key `trizentro.racePackDraft.v1`. Fields: race name/date, pace assumptions, transitions, travel and preparation timing, notes and eight checklist flags.
- Invalid or incompatible stored data is refused, with readable NL/EN status messages.
- Privacy disclosure updated for shared-device and local-storage behavior.
- Product page describes what the prototype actually offers, without a payment claim.
- Added targeted Node tests, browser-smoke coverage for save/reload/delete and tests checking local JS/CSS/image references.

## Scope and honest limits
- **Free preview only.** No paid product is available.
- There is no user account, cloud sync, live event or course feed, weather forecast, payment flow, coaching, nutrition prescription or medical/safety certification.
- A saved plan is not encrypted. Anyone with access to the same browser profile may be able to view it.
- Private browsing, storage clearing or switching devices can remove or make the saved draft inaccessible; users should download their own text export.
- The draft is designed for the eight current checkbox items. A future schema change must include an explicit migration strategy; never silently discard the user's work.

## Acceptance tests to confirm before inviting real users
- [ ] GitHub Actions Node suite passes on latest commit.
- [ ] Deployment is green, including public homepage content check.
- [ ] Independent public load verified for both `?lang=nl` and `?lang=en`.
- [ ] Mobile Chromium smoke test passes with save/reload/delete.
- [ ] Physical iPhone Safari: menu, language, inputs, draft and export.
- [ ] Physical Android Chrome: menu, language, inputs, draft and export.
- [ ] Save, reload, edit and delete tested in NL and EN.
- [ ] Browser with disabled localStorage gracefully shows an understandable error.
- [ ] Print layout readable with long notes and smaller screen width.
- [ ] Event rules, cut-off and safety disclaimers stay visible.
- [ ] No misleading checkout, fake reviews or unapproved affiliate tracking.
- [ ] No added client-side network requests or silent user data collection.

## Next steps without user intervention
1. Keep the Race Pack editable and self-contained; fix any failed workflow tests.
2. Prepare first-user observation checklist and no-cost invite copy.
3. Consolidate real tester needs into product requirements; do not promise features until validated.
4. Implement only clearly differentiated premium functions after genuine evidence.

## Actions reserved for owner
Only when ready for commercial launch: choose legal form and sign notarial or registration paperwork as relevant, authorize any domain purchase, approve costs and service accounts, accept payment processor agreements, set legal operator/contact details, and approve outreach to personal contacts.

Document status and test outcomes as evidence, not assumptions.
