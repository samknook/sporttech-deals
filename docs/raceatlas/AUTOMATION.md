# RaceAtlas — automatic official-source event maintenance

**Implemented 12 November 2026.** This is an operational description, not proof that the first scheduled GitHub Actions run has succeeded.

## Schedule (GitHub Actions, UTC)
- **05:15 daily** — `.github/workflows/raceatlas-auto-discovery.yml`: read official sources, scan structured event metadata, publish narrowly verified new race editions and date updates; retain manual-review artifacts.
- **06:25 daily** — `.github/workflows/raceatlas-source-health.yml`: reachability checks for up to 22 urgent provisional races.
- **07:05 daily** — `.github/workflows/raceatlas-organizer-review.yml`: whole-catalog list of organizer links to verify, including 423 original race records.

Dutch winter time: UTC +1. Summer time: UTC +2. GitHub scheduled workflow start times are approximate; queued runs may be delayed.

## What auto-publication DOES
1. Check explicitly approved organizer pages in `scripts/raceatlas-official-source-seeds.json`.
2. Also check database links tagged **verified** and rotate known official pages for upcoming races.
3. Discover same-domain race pages, rate- and volume-limited.
4. Read actual `schema.org/Event` or `SportsEvent` JSON-LD with a future ISO date, a named place, a valid event URL on the organizer's own hostname, and a nonempty name.
5. Compare against existing race records (name, year and location), avoid duplicate editions.
6. Publish new events to `docs/raceatlas/auto-events.json` with a stable numeric `ra-8xxxxxxx` identifier.
7. Change a known race date automatically **only** when the same exact organizer-specific event URL, name and year match uniquely. Unclear/conflicting dates generate review items, not changes.
8. Detect changes in visible HTML of scanned official sites via `scripts/raceatlas-official-source-state.json`, and report those needing manual interpretation.
9. Commit changes using the GitHub Actions bot. On a verified public feed change, explicitly dispatch `publish-site.yml`, whose tests must pass before GitHub Pages deployment.
10. Browser code `docs/raceatlas/auto-events.js` adds qualified races or applies dates when loading the site, with a static offline fallback.

## What is NEVER automatically claimed
- Current ticket availability, prices, registration dates or registration status inferred from ordinary site text.
- Precise dates derived from past editions or general calendar listings.
- Organizer partnership, licensed images or the actual current availability of entries.
- Data quality of events without direct organizer sources.

Unknown or disputed data remain in reports under the **raceatlas-official-discovery** GitHub Actions artifact. Review queues and source health artifacts are also available in their respective workflows.

## Safeguards
- Read-only public Supabase API. No service-role key is used.
- No public browser-facing API write privileges or automatic user accounts.
- HTTPS only, exact organizer hostname on followed links; no redirects to arbitrary hosts.
- 9.5-second per-page timeout, 350 KB response cap, a maximum of 85 pages per run.
- Published event dates must be within the next 730 days; only future races are shown.
- Duplicate IDs or ambiguous event matches are not published.
- Site publication is protected by unit and smoke tests.
- On fetch errors the previous public feed is preserved.

## Operator checklist
- After the first run, open **GitHub Actions → RaceAtlas official organizer auto-discovery** and confirm a successful run. The code being committed is NOT proof of execution.
- Download the discovery artifact and review content-change and ambiguous-match reports.
- Confirm the subsequent **Publish website** workflow succeeds when the public feed changes.
- Review source legitimacy/robots policy before adding a new seed URL. Do not add competitor event aggregators.
- Periodically confirm official URLs, race names and dates. Automated checks cannot guarantee complete accuracy.
- If GitHub bot pushes or workflow_dispatch are blocked by repository permissions or branch rules, update permissions/configuration before relying on unattended publication.

## Coverage limitations
The curated seed list now contains **25 first-party organizer and public-authority pages** (expanded from 10 on 12 November 2026), plus verified organizer links already held by RaceAtlas. Initial automated runs have written 66 source-page fingerprints; this confirms page checks occurred, not that newly discovered races have been published. Recurring series with multiple dates per year are preserved as separate editions. Non-race club activities, unrelated news, sponsors and results are excluded from automated event publication. It does **not** search the entire Internet, index every race organizer, or detect every change on an unstructured website. More seed sources and verified organizer links will expand coverage. Manual review is still required for conflicting dates, entry fees, registration availability and missing event information.
