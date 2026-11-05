# TriZentro Club Platform — Release 0.6

Date: 5 November 2026  
Status: Code committed. Independent live browser verification / full CI result not confirmed.

## Product addition: printable participant update

A club coordinator can now import a previous version of an event template, edit event times, compare changed fields, record when the official source was checked, and prepare a bilingual update for participants.

The updated workflow offers:
- Existing plain-text update for copying or downloading.
- **New fully self-contained HTML participant update sheet**, with the event name, race date, revision, before/after comparison table, source link and the official-source review date.
- **NL/EN language switch** and a built-in **Print / PDF** control, with mobile styling and print-friendly CSS.
- A distinct, explicit review checkbox required after the latest changes and source-check date are entered.
- All export actions stay blocked when the schedule has warnings, no template is loaded, there are no differences, or review has not been confirmed.
- No participant data upload, email sending, hosting, analytics, payment or background publication.

## Source and safety

The tool does not retrieve, verify or authenticate organizer information. An official source link is supplied by the operator and is not automatically checked by TriZentro. The **checked-on date is entered by the human operator**, not a record of a real site visit.

Downloaded HTML is a static draft. Previous versions do not update themselves. The organizer remains responsible for signing off information, distribution, and later corrections. The output uses HTML escaping for event content and excludes external scripts.

## Quality evidence

- Source modules and inline JS passed isolated syntax evaluation.
- The generated HTML passed isolated checks for bilingual controls, revision and checked-on date, print button and embedded script syntax.
- Attempts to generate an unchanged notice or a notice with an invalid review date were rejected.
- Added `tests/club-update-page.test.cjs`, including untrusted input, invalid date, conflicting waves, and UI enforcement.
- The Chromium mobile smoke script now requires the source-check date before enabling the formatted update.

**Not verified:** full GitHub Actions Node suite, latest deployed website, physical mobile browser UX, and how a real club would approve and distribute the artifact.

## Commercial implication

The Organizer Event Briefing has evolved from a calculator into a repeatable workflow: event templates, six waves, versioned participant HTML, field comparison and print-ready update notices. It remains a **free demonstrator**. Any paid service should add actual hands-on source preparation, layout, customer support, approval and delivery rather than simply placing the demo behind a paywall. No customers or revenue have been established.

## Next release gate

Prioritize QA and a credible, concise business landing page over adding more similar functions. Determine legal operator and payment/contract setup only when a real sale is feasible and authorized.
