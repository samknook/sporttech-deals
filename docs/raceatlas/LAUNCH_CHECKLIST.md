# RaceAtlas — launch readiness
Date: 2026-11-12

## Verdict
**Ready for a controlled Dutch-language soft-launch once the public production and form-delivery checks pass.**
Not yet ready for a major international marketing launch.

## Static review (performed)
- [x] 423 unique races in the published website dataset.
- [x] Race discovery and saved season functionality present in public website code.
- [x] Discover -> My Season -> NL/EN -> For Organizers in header.
- [x] Registration radar positioned below event cards, with compact preview.
- [x] NL/EN source loaded on all four primary pages.
- [x] JavaScript syntax check succeeded for core modules.
- [x] Disabled account feature remains disabled; no broken login promises.
- [x] Both event submission and organizer contact forms exist.
- [x] Automated launch smoke-check added to GitHub Pages deployment workflow.
- [x] Technical quality scores removed from primary visitor homepage.

## Hard gates still requiring end-to-end verification
- [ ] Confirm GitHub Pages production deployment succeeds (GitHub Actions run success).
- [ ] Test homepage in a real desktop browser: search, filtering, event details, organizer outbound links, saved races, language switching.
- [ ] Test mobile (approx. 390 px): header order, filters, cards, registration radar, bottom nav, no horizontal overflow.
- [ ] Submit one controlled test message through each of the two forms and confirm receipt in Trizentro.team@gmail.com. FormSubmit activation may be required.
- [ ] Validate shared race-season export (.ics), backup and restoration with a sample event.
- [ ] Check registration radar with live Supabase read permissions, empty state and timeout handling.
- [ ] Spot-check upcoming race dates and verified-source labels against organizer website, including one case with an unconfirmed date.
- [ ] Review privacy/cookie notice and contact-page disclosure, especially external FormSubmit processing.
- [ ] Decide launch name/domain before spending on ads or international brand acquisition. RaceAtlas overlaps with other active services and needs trademark checks.

## Soft-launch plan
1. Keep logins disabled.
2. Promote to a small Dutch tester audience (e.g. runners, cyclists, triathletes, clubs) after all hard-gate tests pass.
3. Collect reports on outdated dates, missing organizer URLs, and mobile issues.
4. Maintain weekly organizer-data quality updates and monitor errors.
5. Launch wider/internationally only after brand clearance, organizer-link completeness improvements and confirmed production reliability.

## Notes
An automated static pass is not proof of successful public deployment or delivery of contact email. Do not mark those checks complete without actual evidence.
