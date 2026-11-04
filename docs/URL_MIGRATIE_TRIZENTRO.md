# TriZentro — URL-migratie van GitHub Pages (voorbereid)

**Beoogde URL:** https://samknook.github.io/trizentro/
**Huidige URL:** https://samknook.github.io/sporttech-deals/
**Status:** codewijzigingen klaar op branch `migration/trizentro-pages-url`, maar **nog niet live of samengevoegd**.

## Eerst repository hernoemen

De website draait onder een GitHub Pages-*projectrepository*. Het pad in de URL is de repositorynaam. Alleen HTML, redirects of SEO-metadata wijzigen kan dat pad niet wijzigen.

1. Open https://github.com/samknook/sporttech-deals/settings als eigenaar.
2. Ga naar **General → Repository name** en verander `sporttech-deals` naar `trizentro`. GitHub vraagt bevestiging en controleert of de naam beschikbaar is.
3. Controleer https://github.com/samknook/trizentro en **Settings → Pages**. Zorg dat dezelfde `main`-branch en `/docs`-publicatiemap actief blijven.
4. Laat daarna de voorbereide migratie-PR samenvoegen in `main`. **Niet mergen vóór de rename**, anders veranderen canonicals en sitemap naar een nog niet bestaande URL.
5. Controleer succesvolle Pages-publicatie en https://samknook.github.io/trizentro/ inclusief calculator, planner en sitemap.

De bestaande `/sporttech-deals/`-site kan bij een repositoryrename ophouden te werken. GitHub Pages-project-URL's worden niet betrouwbaar automatisch omgeleid. Voor oude links kan later opnieuw een minimale repository `sporttech-deals` gemaakt worden die naar de nieuwe site doorstuurt. Dit is nog niet geregeld.

## Daarna Search Console en partners

- Voeg onder het **zakelijke Google-account** een **nieuwe URL-prefix-property** toe voor `https://samknook.github.io/trizentro/`; de oude geverifieerde property migreert niet automatisch. Nieuwe verificatie kan nodig zijn.
- Dien `https://samknook.github.io/trizentro/sitemap.xml` in en controleer Google-indexering apart. De Google- en Daisycon-metatags blijven in de code bewaard, maar dat garandeert geen eigendom van de nieuwe property.
- Verbind de nieuwe Search Console-property in Windsor.ai. De oude property blijft historisch voor vergelijking.
- Werk de media-URL bij Daisycon en vraag indien nodig om herverificatie.
- Actualiseer toekomstige socials/biografieën, Canva, Google/YouTube en externe links zodra de nieuwe URL echt werkt.
- Het `trizentro.com`-domein, handelsnaamrechten en een formele BV-registratie zijn hiermee **niet** aangetoond of geregeld.

## Technische voorbereiding

De migratie-PR vervangt oude GitHub Pages-projectlinks in publieke HTML, sitemap, robots.txt, SEO-tests en Actions-workflows. Relatieve assetpaden en de bestaande Google- en Daisycon-verificatiebestanden blijven gelijk. Bestaande oudere SEO-meetrapporten beschrijven nog de **oude** geverifieerde property; ze mogen niet als bewijs voor de nieuwe URL worden gebruikt.

**Geen kosten of officiële registraties uitgevoerd.**