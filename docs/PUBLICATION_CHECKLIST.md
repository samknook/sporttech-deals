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

## Automated mobile browser QA (added 5 November 2026)

A separate real-browser smoke test now lives in `tests/mobile-smoke.cjs` and `.github/workflows/mobile-smoke.yml`. It serves `docs/` locally, launches Chromium in a 390px touch-enabled viewport, and checks:
- Dutch homepage and mobile navigation; selecting a tool category and opening Race Dashboard
- Raw target entry `530` calculates without error and formats as `05:30`
- Clicking the brand returns to the homepage (language preserved)
- Switching NL to EN; navigating to the Readiness Check in English
- Dutch and English product page headings
- No unhandled browser JavaScript exceptions

It runs on pull requests that touch website files and can be started manually from **Actions → TriZentro mobile browser smoke test → Run workflow**:
https://github.com/samknook/sporttech-deals/actions/workflows/mobile-smoke.yml

The workflow installs Playwright Chromium on GitHub Actions and uploads `mobile-smoke-failure.png` if a browser test fails. **Creating the workflow is not evidence that it ran or passed.** For full confidence, verify a green run and test Safari on a physical iPhone separately. This workflow does not deploy the website and does not alter checkout, feeds, or analytics.

### Regression resolved
An internal `./` homepage link on subpages could previously be turned into an empty path while appending `?lang=nl` or `?lang=en`. That empty path could keep visitors on the same subpage instead of returning home. The i18n link rewriting now preserves `./`, with a regression test.


## Post-deployment public verification — 5 November 2026
The dedicated Pages deployment workflow now checks the actual public homepage **after** `actions/deploy-pages` completes. It requests the deployment URL and confirms that the response contains both the TriZentro brand and the consolidated language bundle. On an absent page, failed request, or unexpected content, it produces a visible workflow failure rather than silently treating deployment as successful.

An English race dossier test had an unnecessarily case-sensitive warning check. That regression assertion is now case-insensitive.

**Current evidence limit:** the assistant can read and update the connected public GitHub repository, but the GitHub Pages public URL could not be opened from the available external web environment and the latest Actions run status could not be retrieved. GitHub Pages publication settings still need owner verification; do not claim the site is live based only on commits or passing syntax checks.

One-time verification:
1. Open https://github.com/samknook/sporttech-deals/settings/pages and confirm Source is **GitHub Actions**.
2. Open https://github.com/samknook/sporttech-deals/actions/workflows/deploy-trizentro.yml and inspect the latest run.
3. A successful run should now include the green step **Verify public homepage after deployment**.
4. Open https://samknook.github.io/sporttech-deals/?lang=nl in an ordinary browser and verify that content, navigation, and mobile layout render.
5. If any step fails, capture the error from that exact job; no need to reconfigure a legacy feed workflow.
