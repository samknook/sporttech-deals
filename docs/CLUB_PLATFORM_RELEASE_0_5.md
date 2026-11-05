# TriZentro Club Platform — release 0.5
Date: 5 November 2026. Source code committed to GitHub. Live CI and production browser checks have **not** been independently verified.

## Delivered — organizer-controlled participant updates
- New deterministic `club-update-notice.js` generates a bilingual NL/EN draft change notice by comparing a previously imported JSON event template against current validated event fields.
- Update notices show the event, race date, new document revision, changed fields in before → after format, official source link and a prominent **draft/not automatically published** statement.
- Editor now exposes **Download wijzigingsbericht (.txt)** and **Kopieer wijzigingsbericht**, guarded by a distinct explicit organizer-review checkbox.
- The export buttons remain disabled if a previous template is absent, no field has changed, any schedule/source warning is unresolved or the organizer has not re-confirmed the change review.
- Editing the form clears review authorization until the revised schedule is regenerated and rechecked.
- Empty or contradictory updates are rejected by the generator itself, not merely hidden by UI state.
- The update generator, interface, tests and guidance support NL/EN.
- Mobile smoke test includes template import, wave time change, review gate and disabled state after another edit.

## Important bounds
- A change notice is a static text draft. TriZentro does **not** mail participants, send push alerts, publish an event website or modify already distributed files.
- No cloud storage, account or automated monitoring. Import/export happens entirely inside the organizer's browser.
- All official information must be supplied and approved by the organizer; source URL presence does not verify it.
- The local version label is not cryptographic audit history or a signed approval record.
- Updating a template in the editor doesn't change previous participant page exports.
- No paid organizer service or registered BV exists yet.

## Manual acceptance checklist
1. Import a prior example JSON template with valid times and an official source URL.
2. Change the third start wave 08:30 → 08:35, set a new version, regenerate the briefing.
3. Read the field comparison and the update notice. Verify all details against the organizer source.
4. Observe that the update export is unavailable before separate review confirmation.
5. Confirm review. The text update can be downloaded or copied locally.
6. Edit the times again. The update export must immediately become unavailable.
7. Try invalid/contradictory wave times; they must block both participant page and update notice exports.
8. Open both NL and EN and ensure dynamic notices match the chosen language.
9. Confirm no participant emails, public website modifications or remote requests occurred.

## Business impact
A repeat organizer can now export a participant page, store a portable event template, compare revisions, and prepare a draft change notice. These support the hypothesis of a paid event communications service with editorial and update support. No first-order buyer demand or price conversion has been established.

## Next engineering
- Unambiguous version metadata across all exports, optional source checked-on date, print-ready participant update format, and better source-review workflows.
- Fix any failing Node or browser checks before external pilots.
