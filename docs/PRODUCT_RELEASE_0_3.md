# TriZentro 0.3 — official race constraints in the planning flow
Date: 5 November 2026
Status: changes committed; public browser run and latest CI not independently verified.

## Added
- Optional race-morning transition closure time, entered **by the athlete** from the official athlete guide.
- Comparison with the personal plan's estimated time of leaving the transition setup area.
- Clear warning for a late plan, positive estimate with a limited interpretation for an earlier plan, and explicit uncertainty for invalid/ambiguous event times.
- English and Dutch messages, including a visible caution that the tool does not retrieve official times.
- An appendix to the exported race dossier describing the user-supplied deadline and potential conflict.
- Explicit local draft saving/loading includes the new field.
- Older Race Pack drafts without a closing time load with the new field blank. User data is not discarded.
- Automated time-check tests and backward-compatibility tests.

## Interpretation and limitations
- The entered time is **not verified** and may refer to transition closure, bike check-in, bag drop, or another distinct race deadline. This tool assumes the relevant transition area closes before the athlete's start on race morning.
- Some events require bike and bags to be checked in the day before; leave the optional field blank if the assumed rule does not apply.
- An estimated positive margin does not establish that the athlete has arrived, completed registration, can access transition or will start safely.
- All clock times are based on user/device local context. For a race in another timezone, the athlete must verify event-local time and daylight saving rules.
- This is not a safety, medical or fitness certification.
- No external API calls, official organizer data, user accounts or payments were added.

## Test cases
1. 08:00 wave, 30-minute warm-up, 07:00 close => planned to finish transition setup at 07:30, **30 minutes late**.
2. 08:00 wave, 45-minute warm-up, 07:30 close => ready at 07:15, **15 minutes early** under user estimates.
3. Empty close => no claim about an official deadline.
4. Invalid time like 7:00 => explicit validation message; mobile field can normalize on blur.
5. Close after athlete wave => needs manual review, not an invented automatic conclusion.
6. Old saved draft without new field => new value blank and existing inputs preserved.

## Go/no-go for user testing
- GitHub Pages deployment and external browser confirmation.
- Node test suite and mobile Chromium smoke checks green.
- Real Safari/Chrome mobile QA with keyboard input, scrolling and download.
- At least one official athlete guide manually checked for a real event to make sure language and workflow are understandable.
- Then recruit genuine opt-in testers and observe confusion, corrections and feature demand.
