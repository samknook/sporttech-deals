# TriZentro — GitHub Pages publication and first-customer QA
Updated: 4 November 2026

## Public publication status
The assistant has confirmed the website files are stored in the connected GitHub repo, under `docs/`. External fetches for the expected Pages site have failed from the available web environment. This **does not prove** that the site is offline for everyone, but public availability is not confirmed.

Expected homepage: https://samknook.github.io/sporttech-deals/
Expected free guide: https://samknook.github.io/sporttech-deals/first-70-3-race-week-checklist.html

## Publish the actual public site (repository owner)
1. Open https://github.com/samknook/sporttech-deals/settings/pages
2. Under **Build and deployment**, check **Source**.
3. If it is already **Deploy from a branch**, verify **main** and **/docs** are selected. Save changes if necessary.
4. If Source is **GitHub Actions**, don't enable the older `.github/workflows/publish.yml` just to make the Pages site appear. That workflow is for a legacy optional pricefeed build, not for `/docs`. First make a deliberate choice between branch publishing and a separate dedicated Pages deployment workflow.
5. Open https://github.com/samknook/sporttech-deals/actions and inspect the most recent Pages build/deploy run and the Race Tools check. Record any errors instead of guessing the deployment status.
6. Open homepage in an ordinary browser, ideally an iPhone Safari private tab. Verify CSS/logo, main navigation, Race Dashboard and mobile numeric inputs.
7. Check https://samknook.github.io/sporttech-deals/sitemap.xml and submit the correct sitemap URL in the verified Google Search Console property once the site is reachable.
8. If the page is stale, distinguish browser cache from an actual missing deploy; inspect the Pages build status and the published page source.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

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
