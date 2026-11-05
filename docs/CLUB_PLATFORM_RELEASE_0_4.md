# TriZentro Club Platform — release 0.4
Date: 5 November 2026. **Committed, not yet independently verified with live browser/CI.**

## Delivered
- Club briefing engine supports up to **six start waves (A–F)**, all displayed chronologically.
- A start group earlier than or equal to its preceding populated group now triggers an explicit NL/EN warning, and the reviewed participant HTML export remains blocked while any warning exists.
- Reusable **JSON event templates** can be exported and imported manually. Strict schema validation and a 15 KB file size limit protect against invalid data. Inputs stay on-device; no cloud storage or uploads.
- An imported template clears the organizer review confirmation. The participant page is generated only after a new review, with the chosen document revision (v1, v1.1, etc.) and generation date.
- The editor shows a field-by-field **difference list** between imported template and current changes. These changes must be reverified against official documents.
- Updated NL/EN UI labels and product page descriptions.
- New tests for six start waves, ordering conflicts, template roundtrips, malformed files, version metadata, field differences and mobile conflict prevention.

## Expected use
1. Club creates event A with source URL, date, times, group starts and notes.
2. Club downloads a local template JSON (e.g., `trizentro-club-race-v1.json`).
3. On the next revision, club reimports the template and changes the official schedule.
4. The editor highlights changed fields; club checks each change against the organizer's official information.
5. Once all warnings are resolved, the authorized organizer explicitly confirms review.
6. TriZentro downloads a static NL/EN participant HTML file. **The club remains responsible for publishing it and notifying people of changes.**

## Deliberate limitations
- No live synchronization, accounts, access controls, official event feed, approval signatures, edit history stored in the cloud or automatic participant messaging.
- HTML exports remain static snapshots. Previously distributed versions do not update.
- The change list compares only an imported template with the current editor. It is not a tamper-proof audit log.
- A single timeline assumes all entered times fall on the same race day, in the local timezone of the event. For multi-day check-in or rolling waves, organizers must use their official guide and should not enter misleading data into this simple example.
- No paid product, registered BV, customers, revenue or contractual delivery commitment is implied.

## Release verification
Isolated code checks completed for valid six-wave sequence, out-of-order blocking, roundtrip template, rejected invalid template, revision label, change comparison, output escaping and JavaScript syntax.

**Not confirmed:** full Node test suite, on-device Safari/Chrome UX, latest GitHub Pages deployment and production console/errors.

## Business model
The public demo is free. The first monetizable service is a *hypothetical* organizer-specific briefing deliverable with hands-on editorial/design/review support. A richer branded event portal could later be offered per event, but pricing and launch requirements must be grounded in actual operating costs and valid contracts. See `REVENUE_MARKET_EVIDENCE_2026.md`.
