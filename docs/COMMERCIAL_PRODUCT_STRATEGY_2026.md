# TriZentro — commercial product strategy and prelaunch gates
Date: 4 November 2026. Draft for decision-making; prices and targets are hypotheses, not sales forecasts.

## Positioning
**Race-day decisions for real-world triathletes.**
TriZentro combines an approachable education layer (Blueprint) with hands-on tools (free Race Dashboard) and specific race preparation deliverables (Race Pack).
Target customer: English-speaking first-time or developing Sprint, Olympic and 70.3 age-group racers who prefer structured, practical support without assuming individualized coaching.

## Why two products rather than four e-books immediately?
The broad Blueprint establishes knowledge and can be repurposed into swim, bike and run guides only after we validate demand. The Race Pack tests whether users value applying that knowledge to *their* race.
Avoid overlapping offers: the Blueprint should teach principles and exercises; the Race Pack should help produce a usable personal race-day document.
Do not charge for copies of existing free tools, charge only for clear additional value.

## Initial offers and test prices
| Offer | Status now | Proposed price incl. VAT | Distinct value |
| --- | --- | --- | --- |
| Free tools and guides | Existing code; live status separately verify | €0 | Calculators, pacing, race-day logistics, basic nutrition arithmetic |
| Complete Triathlon Blueprint | Working manuscript v0.1 and free web sample | €19.95 one-time | Professionally reviewed expanded chapters, original exercises, printable worksheets and updated examples |
| Your First 70.3 Race Pack | Free interactive prototype live status unverified | €19.95 one-time | A polished printable race dossier and differentiated scenario decisions, checklists, event-ready exports |
| Blueprint + 70.3 Race Pack bundle | Concept only | €29.95 one-time | Combined knowledge and practical application without duplicated material |
| Swim / Bike / Run advanced guides | Only future concepts | €12.95 each | Deeper discipline-specific, original content not already in Blueprint |
| TriZentro Pro | Not being built | No price yet | Only if repeat usage and demand justify ongoing costs |

Avoid introducing a subscription until there is a recurring problem to solve. Avoid claims of individually coached plans unless actual qualified professional involvement is arranged.

## Blueprint editorial architecture
1. One sport, three disciplines; transitions count.
2. Choose distance and realistic goals.
3. Swim: pool transfer to safe open-water situations.
4. Bike: sustainable effort, terrain, bike-run interactions.
5. Run: controlled off-bike pacing and readiness.
6. Transition preparation.
7. Flexible training organization, recovery and warning signals.
8. Tested fueling and safe hydration: user variability and overdrinking risks.
9. Race-week and race-day logistics.
10. Build a decision sheet using free TriZentro tools.
11. Worksheets, case examples and cited resources.

Draft source: `products/COMPLETE_TRIATHLON_BLUEPRINT_v0_1.md`. Public free sample: `docs/blueprint-preview.html`.
**To do before sale:** edit for factual accuracy and English consistency, qualified review of training and nutrition claims, accessibility, image permissions, references, proofread and format downloadable PDF/ePub.

## Race Pack — differentiation from free dashboard
Free preview already shows three arithmetic scenarios, basic split comparison and a checklist. These are NOT future chargeable differentiators by themselves.
Potential paid additions for validation:
- Fully structured, nicely typeset PDF race dossier, with multiple printable pages.
- Data-rich course-specific checkpoints with manual course notes and contingency branches.
- Editable milestone timeline and clear warm/cold/windy scenario tradeoffs.
- Separate week-before, day-before, and race-morning checklists with user notes.
- Event-specific personal inventory and a rehearsed fueling worksheet with safety caveats.
- Reusable templates and version comparisons for multiple events.
- Offline export with reliable, accessible printing and clear provenance of calculations.

**Do not claim** course data, GPS routes, real-time weather, professional coaching or integrations that do not exist.

## Sales funnel (no paid ads initially)
1. Free SEO guide: race distances, pacing, how to plan transitions, first 70.3 checklist.
2. Free Race Dashboard and 70.3 prototype; internal links lead to the product catalog without blocking free tools.
3. Free sample chapters that demonstrate quality, not just a contents page.
4. Ask voluntary testers if they understand the value, what they would pay, and which differentiated deliverables they need. Do not collect personal athlete details without a privacy-aware process.
5. Only launch payment after delivery and legal compliance are ready.

## Research context
As of 4 Nov 2026:
- Scientific Triathlon advertises a beginner half-distance PDF training plan at €46 and TrainingPeaks version at $69; this is a different coaching/training-plan product, not a direct apples-to-apples comparison.
- MyProCoach advertises training plans priced $24–$159 and subscriptions from $24/month; a different service model.
- TrainingPeaks says marketplace training plans have a 30% commission and minimum marketplace price of $4.95. Do not assume an external marketplace is a fit until requirements are reviewed.

Sources:
https://scientifictriathlon.com/plans/
https://www.myprocoach.net/training-plans/
https://help.trainingpeaks.com/hc/en-us/articles/204072494-How-to-sell-your-Training-Plans-in-the-TrainingPeaks-Store
https://triathlon.org/agegroup
https://bjsm.bmj.com/content/early/2022/09/23/bjsports-2022-105942

## Validation experiment
Recruit 10–20 voluntary testers (not automated spam), ideally mixed beginner/intermediate and mobile/desktop.
Questions: (a) What decision did the product help you make? (b) What did you miss? (c) What feels duplicative of free tools? (d) Would you pay €19.95 for the completed format and why? (e) Which pack features would you actually use?
Target first: at least 10 real completions of the free preview, 5 usable qualitative feedback responses, and **evidence of willingness to buy**, ideally actual purchases only after legal/payment readiness.
Avoid a fabricated 'conversion rate' until there is genuine traffic and tracked sales.

## Payment/legal launch gate
- Trademark/trade-name/domain availability checked; no unverified claims of exclusive rights.
- Working custom domain and verified website; legal operator and contact details, applicable registration data.
- Compliant commerce disclosures: total price including VAT (as applicable), digital content delivery terms, checkout, refund/withdrawal and statutory consumer-rights information, privacy and data security.
- Payment processor, fulfillment, invoicing, tax handling and an accessible support/refund workflow tested.
- Qualified content review complete, licenses verified, no ungrounded health or performance promises.
- Preview clearly labeled; no fake urgency, reviews, testimonials, purchases, checkout buttons or expected income figures.

## 4-week execution sequence
**Week 1:** verify public Pages deployment and basic mobile UX; conduct content QA; obtain feedback from 3 testers.
**Week 2:** finish Blueprint chapters and worksheets, commission/arrange qualified review; improve PDF preview.
**Week 3:** enrich Race Pack exports with testable user value and run 10-person validation.
**Week 4:** decide whether buyer interest warrants the legal/payment setup; postpone launch if evidence is weak.

None of these milestones are guarantees. Never present roadmap as completed work.

## Product update — 4 November 2026, follow-up
- The free 70.3 Race Pack prototype now has a customizable race-morning schedule, separate bike/run checkpoints, event notes, text dossier export and print layout. Calculations and inline JavaScript were evaluated successfully in isolated code checks; browser and production deployment checks remain outstanding.
- A six-question privacy-first tester scorecard is available at `docs/tester-feedback.html`. It downloads answers locally and does **not** automatically send or collect responses. Do not count page views or downloads as completed testers.
- Next decision: recruit real testers, gather voluntary feedback and determine whether the paid offer needs substantially stronger event-specific and PDF functionality than this free prototype. If not, do not launch the proposed paid pack at the same price.
- The public GitHub Pages address remained inaccessible to the assistant's web fetch, so external go-live is **unverified**. Source file existence is not evidence of a functioning public site.

## Acquisition update — 4 November 2026
A new free `70-3-readiness-check.html` offers a twelve-question planning self-check and a downloadable, locally generated action list. Linked from homepage, product catalog and Race Pack preview. This is **not** a health/physical readiness certification. The score should not be presented as a safety guarantee.

**Customer path under test**
1. A visitor discovers the readiness checklist through an organic query or a shared link.
2. The visitor identifies a practical gap (event rules, pace estimate, fueling, morning schedule).
3. The visitor follows a link to the relevant free tool and, if useful, the Race Pack preview.
4. The visitor may voluntarily complete the private tester-feedback scorecard, downloading their answers and optionally sharing them with the business in a separately agreed channel.
5. Only after real feedback and compliance checks consider a commercial launch.

**Measurement limitation:** No analytics or feedback submission is currently active. Therefore no claims about funnel traffic, completions, leads, conversion or revenue are supportable. The public GitHub Pages URL remains unverified via the available web access. The site owner should check Pages publication source in repository Settings and inspect the site in a regular browser before recruiting testers.

**Next concrete marketing tasks:** Write two original search-intent guides ("first 70.3 checklist" and "70.3 race day schedule"), avoid keyword-stuffed duplicates, confirm Search Console sitemap indexing, and invite a small panel of genuine volunteer users to review both the mobile experience and the product proposition.
