# RaceAtlas — Brand system (working name)
Updated: 2026-11-12

## Brand status — important

**RaceAtlas is currently a working product name, not a cleared international trademark.**
An initial web review found already active products using RaceAtlas or Race Atlas, including `raceatlas.com` (event photography), `raceatlas.org` (race courses/calendar) and `race-atlas.com` (race trip planning). These products overlap with endurance sports, race discovery and event organizers.

**Do not purchase an expensive domain, order merchandise, launch paid campaigns or apply for trademarks under RaceAtlas without professional availability checks.** Check BOIP / EUIPO / WIPO and relevant markets and domains, especially the Netherlands, EU, UK and US. The web review is not legal clearance. A decision to rename the brand should be taken before scale.

## Product promise

**Discover. Plan. Race.**

- Discover: Find running, cycling, duathlon and triathlon events in one place.
- Plan: Save and organize a personal race season without an account.
- Race: Link directly to organizers and their official registration and race details when available.

## Brand values

1. **Athlete-first**: Fewer clicks, better filters, fast mobile access.
2. **Organizer-first sources**: Prefer official organizer links. Never claim real-time availability without evidence.
3. **Transparent confidence**: Distinguish organizer-confirmed from listed, historic or unverified dates.
4. **Global outlook, local quality**: Start with strong Netherlands coverage; expand internationally without inventing data.

## Visual identity

- Background ink: `#071A25`; secondary ink: `#0E3341`.
- Energy lime: `#C7FF37`; off-white: `#F7FAF7`; separators `#DCE5E3`.
- Identity concept: orbit/start-line glyph and bold RACEATLAS wordmark.
- Typography: system sans/Inter fallback; strong, athletic headings. Avoid stock imagery presented as actual event photos.
- Accessibility: WCAG contrast where possible, visible focus rings, responsive 44px touch targets.

## Writing and naming

- Main English tagline: **Discover. Plan. Race.**
- Dutch proposition: **Vind jouw volgende startlijn.**
- English proposition: **Find your next start line.**
- Consistent product naming: RaceAtlas (working name), not RACE HOUSE / Sporttech Deals in visitor-facing copy.
- Never imply a formal partnership with IRONMAN, World Marathon Majors, or event organizers unless confirmed.
- Prefer `official website` for organizer links, `registration information` for sourced entries, and `date unconfirmed` where applicable.

## Localization

- Dutch `nl` and English `en` are visitor-selectable on homepage, organizer and data-quality pages.
- Language preference is persisted locally; `?lang=en` opens English and internal RaceAtlas links retain that preference.
- Filters, form values and event IDs must remain independent of visible language.
- Country and sport labels are translated; event proper names should not be changed.
- Upcoming locales should be added only with translations and regression tests.

## International go-to-market

1. Confirm brand/legal/domain clearance **before committing to the final product name**.
2. Establish a distinctive primary domain and consistently named social profiles only after clearance.
3. Build English-facing SEO landing pages by sport, country and event once organizer data is robust.
4. Add organizer claim/correction workflow, direct source updates, and quality tracking.
5. Launch locally with strong Dutch event data, then prioritize the UK, Belgium, Germany and other popular endurance destinations.

## Public assets and implementation

- `brand.css`: shared identity, mobile header and NL/EN toggle.
- `favicon.svg`: orbit glyph.
- `i18n.js`: bilingual interface and persistent language preference.
- `over.html`: bilingual mission and trust page.
- `tests/test-raceatlas-i18n.cjs`: regression test for language switching and stable form values.

The name, logo treatment and tagline are **reversible until legal and domain checks are complete**.
