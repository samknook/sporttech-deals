# TriZentro Volunteer Operations — Release 0.1
Date: 5 November 2026
Status: committed to GitHub. Full CI and latest public deployment not independently confirmed.

## Product
New `volunteer-roster.html` is a usable offline volunteer shift roster generator for sports event organizers. It uses anonymous volunteer codes, availability windows, optional skill flags, and shift staffing requirements from CSV text inputs.

The deterministic matching engine:
- sorts scarce shifts ahead of less constrained shifts;
- only assigns eligible volunteers with the required skill, within their declared availability;
- never assigns the same person to overlapping duties;
- produces staffing coverage metrics and a per-shift shortage table;
- exports assignments as a CSV file and offers a printable result;
- supports a **no-show scenario**: exclude one volunteer by ID and generate an updated plan;
- explains unfilled duties as skill shortage, insufficient availability or conflicting/fully used capacity.

**Example data:** ten staffing places across four roles; nine filled and one missing at FINISH. Remove alias `VOL-03`: six filled and four missing across SWIM, COURSE, FINISH. This illustrates real roster replanning rather than hiding coverage gaps.

## Practical / ethical boundaries
- This is a deterministic greedy heuristic, not a guaranteed globally optimal staffing plan; a different feasible matching might exist.
- One day only, same event-local timezone. No automatic breaks, minimum ages, labor or medical qualification verification.
- Example skill `water` is a generic tag and **does not certify swim rescue or lifeguard competency**. An organizer must verify qualifications and emergency coverage.
- Browser-local, no accounts or network requests. Users should enter anonymous aliases, not names or email addresses.
- No live sign-up, messaging, cancellation notification, volunteer check-in, cloud collaboration or payments.
- No claim that a fully staffed algorithmically suggested roster makes an event safe.

## Business positioning
Competitor pricing research: Volteer ($29/event), Volunteo (per-volunteer above free tier), SignUpGenius (free and monthly plans), MOOV ($149/month plus volunteer credits) demonstrates a paying market and substantial competition. See `VOLUNTEER_OPERATIONS_RESEARCH_2026.md`.

A future defensible service might import existing rosters, resolve cancellations and produce coordinator action lists with real time savings. Do not activate a payment flow or advertise a ready service merely because a demo exists.

## Evidence
- Isolated JavaScript syntax checks passed for core, HTML, translations and test scripts.
- Isolated scheduling checks passed for basic staffing, a single-volunteer absence, skill shortage and availability shortage.
- Added `tests/volunteer-roster.test.cjs`, mobile Chromium smoke coverage and expanded 20-page bilingual-site assertions.
- New page is added to homepage, global menu, products and sitemap.
- Not yet verified: full GitHub Actions Node test suite, live Pages fetch, desktop/mobile browser UX and user-data accessibility.

## Next engineering priority
Use measurable results from realistic event staffing datasets to improve matching quality, create non-sensitive import templates, and add a **replacement recommendations** queue that explains which missing positions can be covered without creating new conflicts. Then productize only value that genuinely saves the coordinator time.
