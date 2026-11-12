# RaceAtlas — live launch and continuous development

**Decision:** soft-launch the public calendar while testing all substantial updates in an independent staging branch.

## Environments

| Environment | Git branch | URL | Audience |
|---|---|---|---|
| LIVE | `main` | https://samknook.github.io/sporttech-deals/raceatlas/ | Sporters |
| TEST | `raceatlas-staging` | https://samknook.github.io/sporttech-deals/raceatlas-preview/ | Internal testers and reviewers |

The production GitHub Pages workflow builds the live site from `main` and the preview from `raceatlas-staging` as two distinct directories. **Both are publicly accessible URLs:** staging has a noindex directive and prominent warning, but not authentication. Do not add confidential information, secrets or real customer data to staging.

Staging analytics are replaced with a non-sending stub to keep the live traffic totals clean. Form submissions are prevented on staging, to avoid test submissions reaching organizers or the business mailbox. External links can still lead to real organizer websites; testers must not treat them as safe sandbox checkouts.

## Change process

1. Build a new feature on the `raceatlas-staging` branch (only under `docs/raceatlas/**` where applicable).
2. A staging branch update requests the main Pages publishing workflow and refreshes the preview URL.
3. Test desktop and mobile: search, filters, saved season, event details, language switching, accessibility and regressions.
4. Review the diff and merge **only the intended files** from staging to `main` via a pull request. The main branch is the source of truth for production.
5. The production workflow runs automated tests before deploying both live and preview.
6. Verify the live feature and the private usage dashboard. If there is a regression, revert the offending production commit and redeploy.

**Important:** production data source automations run on main and should continue working independently of staging. Never merge outdated event datasets from a stale staging branch into main; refresh staging from main before each new substantial feature.

## Initial 30-day visitor growth plan

### Week 1 — Discovery and reliability
- Verify production homepage and preview URLs; test forms separately on production without unsolicited mail.
- Submit the updated sitemap at Google Search Console (the site's existing sitemap now lists RaceAtlas).
- Share the free calendar directly with 10–20 relevant runners, cyclists and triathletes. Ask what event they wanted to find and where the experience failed.
- Record baseline: page loads, estimated **daily** unique visitors, event detail opens, organizer clicks and missing-event reports.

### Week 2 — Useful distribution
- Publish 2–3 genuinely helpful posts about upcoming Dutch running, cycling and triathlon calendars, linking to RaceAtlas.
- Offer clubs and local event organizers a free link to their accurate listing; ask them to share the calendar only if they find it useful.
- Improve broken dates, event links and mobile confusion found by visitors.

### Week 3 — Retention
- Encourage athletes to save events and plan a season, without requiring an account.
- Publish a short useful reminder-oriented post focused on upcoming registration dates rather than generic ads.
- Measure whether people view details, save races and click out, not merely homepage traffic.

### Week 4 — First organizer pilot
- Shortlist organizers whose events have legitimate measured interest.
- Offer a small, clearly labeled promotional experiment with a written agreement.
- Keep base listings free, no public price packages, no false guarantees of confirmed registrations.
- Report paid campaign clicks and event-detail views only, distinguishing them from actual tickets sold.

## Weekly KPIs

- Page loads and approximate daily unique visitors, **separately**.
- Top 10 event cards by impressions and detail opens.
- Organizer / registration outbound clicks.
- Broken registration links, missing events and unconfirmed upcoming dates.
- Number of return visits cannot yet be reliably calculated, since there is no long-term visitor identifier.
- 7-day unique people and 30-day unique people are **not available**; summing daily uniques does not produce them.

## Before broad paid promotion

- Confirm brand availability / trademark risks for the provisional name RaceAtlas, plus the appropriate independent domain.
- Have privacy and cookies/legal notices reviewed.
- Validate real form delivery, and current registration dates on key events.
- Avoid paid acquisition before basic conversion and reliability baseline exists.
