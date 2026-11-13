# TriZentro — domein livegang

## Huidige situatie

- Domein `trizentro.com` **nog niet geregistreerd**; geen DNS claimen.
- GitHub Pages gebruikt een custom Actions-deployment vanuit `docs/`.
- `.github/trizentro-domain.json` staat op `enabled: false`, `verifiedByOwner: false`.
- Website blijft bereikbaar op `https://samknook.github.io/sporttech-deals/raceatlas/` zolang het domein niet actief is.

## Na aankoop: handmatige stappen

1. Registreer `trizentro.com` bij een domeinprovider met zelfbeheer voor DNS. Koop **geen hostingpakket**.
2. Volg GitHub's aanbeveling: verifieer het domein voor het GitHub-account als dat mogelijk is, en ga daarna naar [Repository → Settings → Pages](https://github.com/samknook/sporttech-deals/settings/pages).
3. Vul bij **Custom domain** `trizentro.com` in en sla op. Bij de gebruikte GitHub Actions-hosting is het `CNAME`-bestand niet nodig en wordt het genegeerd.
4. Stel DNS in bij de provider: de vier A-records voor `@` plus `CNAME www → samknook.github.io`. Geen wildcard records. Verwijder conflicterende standaardrecords.
5. Controleer DNS, www→apex redirect en HTTPS via Pages, en schakel **Enforce HTTPS** in zodra dat beschikbaar is.
6. Pas **na succesvolle controle** `.github/trizentro-domain.json` aan naar `{ "domain": "trizentro.com", "enabled": true, "verifiedByOwner": true }`.
7. Zet GitHub Actions **repository variable** `TRIZENTRO_DOMAIN_CONFIRMED` op `true` onder Settings → Secrets and variables → Actions → Variables. Geen geheim; dit is uitsluitend een vrijgaveschakelaar.
8. Start [Publish website (GitHub Pages)](https://github.com/samknook/sporttech-deals/actions/workflows/publish-site.yml) opnieuw. De deployment zet de sitecanonicals en sitemap om en genereert wedstrijdpagina's met `https://trizentro.com/...`.
9. Controleer homepage, minimaal 3 wedstrijdpagina's, inschrijflinks, favorieten, mobiele layout en eventtracking met het nieuwe domein.
10. Voeg `https://trizentro.com/sitemap.xml` toe aan Google Search Console en publiceer daarna de officiële Instagram-launchpost.

## DNS-waarden (GitHub Docs)

| Record | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | samknook.github.io |

Bron: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Rollback

Bij onjuiste DNS of certificaat: zet `TRIZENTRO_DOMAIN_CONFIRMED` terug op `false`, zet `.github/trizentro-domain.json` terug op disabled en redeploy. Controleer afzonderlijk GitHub Pages Custom domain. **DNS en GitHub Pages-instellingen worden niet automatisch teruggedraaid.**
