# TriZentro Club Brief — business model & sales hypothesis
Date: 5 November 2026. **Exploratory, not a commercial offer.** No registered BV, no paying customers and no payment processing are in place.

## Why this route
Consumer race planning is crowded. Existing products include RackSide (free first race), FORM Endurance (free race workspace) and BELITE (individual race plans advertised from €9.99). Simple calculators and generic PDFs are poor standalone differentiation.

Instead, target small triathlon clubs, event organizers and volunteer race directors who repeatedly need to prepare and communicate correct schedules.

## The problem and buyer
- **Buyer:** race director or club event coordinator, not necessarily the athlete.
- **Problem:** scattered race rules and start group times must become a coherent, readable, correctly checked race-day briefing.
- **Outcome:** fewer manual copy/paste steps, a printable NL/EN communication template, and visible flags for contradictory timing inputs.
- **Important boundary:** TriZentro does not certify race safety, regulations, course facts or organizers' official times. The organization must provide and approve information before any external use.

## Product architecture
**Free demonstrator, built now:** club-race-brief.html. Manually entered event, date, location and official guide URL. Registration, bike check-in, transition close, briefing, two wave starts and notes. The tool sorts events, warns for possible contradictions, and provides Dutch/English text, clipboard and print. Runs in browser; no data is sent to a TriZentro server.

**Potential paid service — not operational:** tailor an event briefing for the organizer, including their brand colors/logo (rights-cleared), official times supplied by organizer, up to an agreed number of waves, one print-ready participant PDF, source references and two feedback revisions. Obtain explicit final sign-off before publishing. Do not offer official verification or safety expertise we lack.

**Possible later SaaS licensing:** organization accounts, multiple events and wave groups, versioning, team approvals, access control and pre-publication review. These are not implemented. Do not collect personal contact lists without a lawful workflow.

## Proposed commercial tests (not active prices)
- **One-event pilot service:** €149 excluding any applicable VAT, as a willingness-to-pay hypothesis. This assumes a tightly scoped manual deliverable, not an automatic SaaS license.
- **Annual organization package:** €399 per year for up to four event briefings *as a later hypothesis*, subject to workload and actual client demand.
- **Personal race planning:** keep core tools free; don't prioritize €19.95 digital guides without differentiated editorial value.

Example gross sales **only if** 10 organizers each voluntarily purchase one hypothetical €149 service: €1,490 before VAT, costs, refunds and taxes. This is not a forecast.

Unit economics gate: record real preparation and revision hours. If a pilot takes longer than four work hours, revise price/scope instead of subsidizing delivery without limit.

## Lean buyer discovery and sales path
1. Publish an accurate, working demo and an educational landing section for organizers.
2. Collect a list of 15 relevant clubs/organizers from publicly available organization websites, without scraping personal contact addresses.
3. Prepare a one-page sample based on a clearly marked fictional event. Do not claim current official race rules.
4. Invite **individual organizers** to request a demo or provide opt-in feedback. No bulk unsolicited outreach.
5. For interest, agree deliverables, price, legal operator details, terms, payment and organizer approval workflow before offering or collecting payment.
6. A founding client can be served manually before developing full SaaS if compliant commercial setup exists.

## Product decision thresholds
- One real organizer confirms they spend material staff/volunteer time assembling race communication.
- Two distinct organizations request a usable event-specific output or a documented pilot.
- Three customer interviews identify repeatable needs.
- The demo passes automated tests and physical phone/print QA.
- Unit economics and legal setup support delivery.

No fabricated testimonials, organizations, letters of intent, sales, partnerships or revenue.

## Legal and data caution
Before any paid client agreement, confirm registration, legal identity and invoices, applicable VAT, B2B contract scope and liability, copyright of logos/athlete guide material, accessibility and support. Do not represent TriZentro as a registered BV yet. Data entered into the demo stays in the browser; user-generated text can contain confidential information, so avoid uploading unapproved event or participant data.

Sources for competitor context:
https://rackside.app/
https://formendurance.com/race-planner/
https://belite.app/
Dutch business information: https://business.gov.nl/running-your-business/legal-matters/consumer-law-your-rights-and-obligations-as-a-seller/

## Immediate release acceptance
- The new page is reachable through global navigation, product catalog and sitemap.
- NL/EN content and export are both understandable.
- Invalid times, dates and untrusted URLs are handled safely.
- No network submission, account, storage or payment endpoint exists.
- GitHub Action tests pass before inviting organizers.

## Internet-first business decision — 5 November 2026
The owner delegated market research and product prioritization rather than manually recruiting a fixed pilot panel. Updated external research is archived in `REVENUE_MARKET_EVIDENCE_2026.md`.

An observable external comparator is Absurd Running's race partnership offer at **€250 per event (limited offer), with €500 thereafter** for a significantly richer route, branding, editor and support service. This is a marketed offer, not verified unit sales. TrainingPeaks confirms real checkout prices for 70.3 plans, but that category is crowded. Community discussions highlight paid convenience (device syncing, changing training schedules) and dislike opaque subscription locks.

**Priority:** evolve the working Club Race Brief demo into a differentiated, organizer-approved, branded event communication deliverable. Avoid spending the next build cycle on generic 70.3 PDFs, training subscriptions or more calculators. Keep €149 only as an initial low-scope manual service hypothesis; do not present a €249–€499 event portal as available until built and reviewed. No clients, payment capability or live sales are currently verified.

Market research can direct priorities without burdening the owner with repeated tester recruitment. It cannot establish TriZentro-specific purchase conversion or replace QA before publishing deadline-sensitive guidance. Owner input should be limited to business decisions, payments, contracts, account settings and legal formation.

## Product milestone — standalone event portal export (5 November 2026)
Implemented `club-event-portal.js` and integrated it into `club-race-brief.html`:
- Builds a **self-contained, downloadable HTML page** for participants, readable on a phone, with a NL/EN switch, times, organizer-entered notes, official source link, document generation date, and static-snapshot disclaimer.
- Organizer must first resolve every input warning and explicitly confirm reviewing the source and schedule.
- Editing inputs invalidates the confirmation until another review is performed.
- User-generated text is HTML-escaped to prevent script or markup injection. No analytics, external JS, cookies, uploads or participant tracking.
- It is a local **file download**, not a hosted event portal or live information service. The organizer decides if/where the file is distributed and remains responsible for correctness and future updates.
- Fictional preview: `event-portal-demo.html`, prominently labeled as a **fictional event** and excluded from the public sitemap.
- Tests in `tests/club-event-portal.test.cjs` and mobile smoke cover validation, gating, safe output and NL/EN language.

**Differentiation hypothesis:** an organizer-approved participant artifact is more useful than a plain text brief alone. It remains free to demonstrate value; paid customization, client support and a reliable update/distribution process are not yet operational.

**Next engineering milestones:** versioned, reusable event templates, clearly marked update history, organizer approval workflow and safe static hosting guidance. Do not claim automatic updates, hosted accounts, user authentication, or official verification until actually built.
