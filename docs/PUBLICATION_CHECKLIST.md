# TriZentro — GitHub Pages publication and first-customer QA
Updated: 4 November 2026

## Public publication status
The assistant has confirmed the website files are stored in the connected GitHub repo, under `docs/`. External fetches for the expected Pages site have failed from the available web environment. This **does not prove** that the site is offline for everyone, but public availability is not confirmed.

Expected homepage: https://samknook.github.io/sporttech-deals/
Expected free guide: https://samknook.github.io/sporttech-deals/first-70-3-race-week-checklist.html

## New dedicated deployment workflow (created 4 November 2026)
A separate workflow now exists at `.github/workflows/deploy-trizentro.yml`:
- Runs the Node regression tests on each relevant push.
- Publishes **only `docs/`** to GitHub Pages if tests pass and GitHub Pages is configured for Actions.
- Leaves the legacy pricefeed workflow in `.github/workflows/publish.yml` disabled and unchanged.
- Does not enable any affiliate pricefeeds, checkout, payment or analytics.

**Required one-time owner action (only if Pages is not already using Actions):**
1. Open https://github.com/samknook/sporttech-deals/settings/pages
2. Under **Build and deployment → Source**, select **GitHub Actions**. This matters: the new workflow needs the GitHub Actions publishing source, not `main /docs` branch source.
3. Open https://github.com/samknook/sporttech-deals/actions/workflows/deploy-trizentro.yml
4. Select **Run workflow** on `main` if a new push did not initiate deployment automatically.
5. Open the deployment job. If a step failed, inspect that exact step before changing settings.
6. After a success, visit https://samknook.github.io/sporttech-deals/ and the product pages from your phone.

**Important:** do not flip the legacy `STD_PUBLICATION_ENABLED` variable to `true` simply to deploy TriZentro. The legacy job uploads `./site` and can replace the new `docs` website. GitHub Pages deployment should have one deliberate owner. If branch publication is already working correctly, you may instead keep `main /docs` as the source and disable the dedicated Actions workflow; do not run both competing publishing approaches.

GitHub Docs: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Smoke-test checklist for iPhone
- [ ] Landing page opens over HTTPS and the brand icon is visible.
- [ ] All top-navigation links work.
- [ ] Race Dashboard: entering `530` in target calculates the same as `05:30` **before blur**.
- [ ] Pace: `445` normalizes to `4:45` after leaving the field.
- [ ] Race morning: `830` normalizes to `08:30`.
- [ ] A 70.3 Race Pack sample shows three scenarios and checkpoint tables.
- [ ] 70.3 Readiness Check shows the right number of unfinished planning tasks.
- [ ] New 70.3 race-week article opens and its free-tool links work.
- [ ] Buttons download local files, where supported; print view is readable.
- [ ] Text remains legible and controls reachable at common phone widths.
- [ ] No checkout/payment claims, fake reviews, or unsupported affiliate offers are shown.

## Before paid launch / Daisycon reconsideration
- Website publicly accessible and verified in normal browser.
- Business contact, required registration/operator details, correct legal notices, suitable privacy and e-commerce information.
- Editable and downloadable paid deliverables actually produced, validated and reviewed for safety/accuracy.
- Paid checkout, delivery, invoicing and support deliberately configured; no customer funds collected before then.
- Affiliate disclosures, authorized feeds and visible unique content.
- Ten genuine users asked for voluntary, anonymized feedback and findings summarized; no fabricated conversion metrics.

## Technical assurance
Automated checks under `tests/*.test.cjs` cover some calculations and internal links. Test files being committed is not proof that GitHub CI passed. Read actual workflow results.
