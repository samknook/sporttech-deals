# TriZentro Volunteer Operations — market evidence and build decision
Date: 5 November 2026. Research based on publicly presented competitor offerings; prices are not proof of paid TriZentro demand.

## Business problem
Sports event coordinators must cover marshals, registration, swim safety support and finish operations with people whose availability and skills differ. Unfilled positions and shift overlaps are directly operational, unlike cosmetic race-briefing edits.

## Current market / observed offerings
- **Volteer**: official website advertises $29/event, $39/month club, and $89/month Club Pro tiers, with signups, scheduling, notifications and check-in. https://volteer.org/
- **Volunteo**: organizer-oriented volunteer management, free up to 10 people and pricing per volunteer thereafter. Promotes availability checking and staffing fill rates, and states thousands of events served. https://volunteo.com/en/
- **SignUpGenius**: genuine free signup tier, Silver $8.99/month, Gold $22.49/month and Platinum $44.99/month on displayed annual-billing rate; includes richer messaging, administration and event signup features. https://www.signupgenius.com/pricing
- **MOOV**: official website advertises $149/month for a race operations platform and $1.50 per checked-in volunteer, sold in packs. Includes mapping, roles and event communication beyond staffing. https://moovevents.ai/pricing

## Decision
The market is competitive and already includes lower-priced solutions. A simple CSV roster is not a defensible €149 product. It is a focused, zero-login **demo of automated work**, and a basis for examining operational complexity and service willingness to pay.

**Do not claim:** live volunteer signup, automatic email/SMS, legal compliance, optimized scheduling, verified emergency qualifications, attendance recording, cloud sync or existing paying users.

## Built in this release
`volunteer-roster.html` and `volunteer-roster-core.js`:
- CSV volunteer aliases with same-day availability windows and skills; CSV shifts with start/end, required staffing and skill.
- Deterministic, skill-aware greedy assignment and hard prevention of a single person covering overlapping shifts.
- Coverage dashboard: required / filled / unfilled places / people utilized.
- Per-shift shortages, CSV export and printable table.
- **What-if no-show scenario**, re-planning with one volunteer removed.
- All computation in browser without an account, tracking or cloud submission. UI strongly advises aliases instead of personal data.
- NL/EN interface, mobile CSS, Node regression tests and mobile Chromium smoke steps.
- Demo data intentionally show 1 uncovered shift place before no-show and 4 uncovered places after removing volunteer alias VOL-03.

## Limits and risks
- The allocation is a deterministic heuristic, **not a mathematically guaranteed optimal assignment**. Complex cases may have feasible schedules that it misses.
- One event-local day only; no multi-day shift plans, break enforcement, legal working-hour regulation or individual load preferences.
- No direct emergency qualification/certification validation. 'water' is a sample label and does not imply a lifeguard or swim rescue qualification.
- Never import or paste real identifiable information into public demonstrations without a privacy assessment and authority.
- Missing staff might be resolvable by the organizer; the tool must not imply an event is safe or unsafe solely from its counts.
- CSV inputs are manually entered and require accurate times and skill flags.

## Commercial direction
Our potential value is not 'a signup form'. A higher-value offer would be **last-mile roster repair**: import organizer-approved volunteer availability and shift requirements, flag unavoidable staffing gaps, suggest replacements after dropouts, and produce an actionable staffing/shortage report. It becomes compelling only if it demonstrably saves coordinator hours and integrates existing volunteer lists. Managed setup and data cleanup could become a one-off paid service if client agreements, secure handling and operator registration are properly established.

## What to build next
1. Stronger assignment algorithm with repeatable optimization and fairness, without promising mathematical optimality before validation.
2. Import/export examples for organizers' existing spreadsheets (without transmitting files).
3. Clear shift-shortage remediation suggestions and printable leader briefing.
4. Move privacy-sensitive information behind secure infrastructure only if there is a legitimate business and approved data processing basis.
5. Benchmark task completion against free competitors, not just pricing.

## Owner actions reserved
Authorization for entity setup, payment account, contracts, domain costs, identifiable volunteer data, third-party paid integrations, and actual outbound sales proposals. No expenditure authorized by this research alone.
