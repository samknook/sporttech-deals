# Vindbaarheid & bezoekersvalidatie — TriZentro

**Startdatum: 4 november 2026.** Website: https://samknook.github.io/sporttech-deals/

## Wat er nu bestaat
- Online [Triathlon Race Planner](https://samknook.github.io/sporttech-deals/race-planner.html), [eindtijdcalculator](https://samknook.github.io/sporttech-deals/triathlon-calculator.html) en [triatlonafstanden-gids](https://samknook.github.io/sporttech-deals/triatlon-afstanden.html).
- Technische browser-, reken- en publicatietests via GitHub Actions. **Dit is géén bewijs van menselijke bezoekers of organisch zoekverkeer.**
- Openbare [XML-sitemap](https://samknook.github.io/sporttech-deals/sitemap.xml) met canonieke pagina's. De oude /70-3-eindtijd-calculator.html is een redirect en staat niet meer in de sitemap.
- Geen Google Analytics, bezoekerspixel, betaalde advertenties, e-mailtracking of contactformulieren op de site.

## Google Search Console: eigendom geverifieerd, sitemap nog indienen

**Status per 4 november 2026:** eigenaar bevestigt de succesvolle verificatie van de URL-prefix-property onder het **nieuwe zakelijke Google-account**. De Google Search Console-metatag en het meegeleverde HTML-verificatiebestand zijn gepubliceerd, de Daisycon-verificatie is behouden en een onafhankelijke publieke GitHub Actions-controle is geslaagd.

**Nog niet bevestigd:** sitemap ingediend en verwerkt; hoeveel URL's Google ontdekt of geïndexeerd heeft; zoekvertoningen en klikken; of de zakelijke Google-connector in ChatGPT actief is.

### Nu eenmalig in Search Console (zakelijk account)

1. Open [Search Console](https://search.google.com/search-console) als `trizentro.team@gmail.com` en kies de property **`https://samknook.github.io/sporttech-deals/`**.
2. Ga naar **Indexeren → Sitemaps** en vul bij **Een nieuwe sitemap toevoegen** `sitemap.xml` in. Als Google om de volledige URL vraagt, gebruik `https://samknook.github.io/sporttech-deals/sitemap.xml`.
3. Klik **Verzenden**. Dit moet door de ingelogde eigenaar worden gedaan, aangezien de ChatGPT-connector geen Search Console-schrijfpermissies heeft.
4. Controleer later of de sitemap de status **Geslaagd** krijgt. Alleen een ingediende of gelezen sitemap bewijst **niet** dat de pagina's geïndexeerd zijn.
5. Ga naar **URL-inspectie** en controleer de vier belangrijkste adressen afzonderlijk:
   - `https://samknook.github.io/sporttech-deals/`
   - `https://samknook.github.io/sporttech-deals/race-planner.html`
   - `https://samknook.github.io/sporttech-deals/triathlon-calculator.html`
   - `https://samknook.github.io/sporttech-deals/triatlon-afstanden.html`
6. Als een URL toegankelijk is maar nog niet geïndexeerd, kan eventueel **Indexering aanvragen** worden gebruikt. Dit garandeert geen indexering en moet niet herhaaldelijk voor dezelfde URL worden gedaan.
7. Bekijk na verloop van tijd in **Prestaties → Zoekresultaten** de echte vertoningen, klikken, zoekopdrachten en pagina's. Een nieuwe property kan aanvankelijk een leeg rapport hebben.

### Wat wij zelf automatisch controleren

- XML-sitemap bevat alleen geldige URL's onder `/sporttech-deals/` (projectsite, geen rootdomein).
- De sitemap bevat geen oude noindex-redirect of verificatiebestand.
- Alle geïdentificeerde pagina's zijn openbare HTTPS-pagina's die niet op `noindex` staan.
- De Google-metatag, het verificatiebestand en de Daisycon-code blijven publiek bereikbaar.

**Let op het GitHub Pages-projectpad:** `docs/robots.txt` wordt gepubliceerd onder `/sporttech-deals/robots.txt` en is dus niet de host-root-`robots.txt`. De crawlerregels daarin zijn geen garantie dat crawlers hem lezen. Daarom is de rechtstreekse sitemapindiening bij Search Console de aangewezen route.

Bronnen: [Google: Sitemaps beheren](https://support.google.com/webmasters/answer/7451001?hl=nl), [Google: Sitemap maken en indienen](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Eerste distributietest zonder advertentiebudget
- Vraag gericht 5–10 bekenden die zelf triatlon doen of eraan beginnen om de **gratis tool echt uit te proberen**. Geen massaberichten en geen impliciete vraag om positieve beoordelingen.
- Laat ze op telefoon en desktop een eigen afstand kiezen, tempo's veranderen, een doeltijd toevoegen en het raceplan exporteren.
- Vraag vooral welke stap verwarrend is, welke functies missen en of ze het opnieuw zouden gebruiken.
- Verzamel antwoorden alleen vrijwillig, zonder ongevraagde trainings- of persoonsgegevens over te nemen. Noteer geanonimiseerde conclusies.

Voorbeeldbericht (aanpassen voordat je het verzendt):

> Ik werk aan een gratis triatlonplanner voor Sprint, Olympisch, 70.3 en Full distance. Je kunt je finish inschatten, doorkomsttijden maken en je raceplan printen, zonder account. Zou je hem eens willen proberen? Wat is het eerste dat niet duidelijk is of ontbreekt? https://samknook.github.io/sporttech-deals/race-planner.html

## Wekelijks overzicht (pas invullen met echte data)
| Meting | Bronsysteem | Stand |
|---|---|---|
| Google vertoningen | Search Console, zakelijk account | Eigendom geverifieerd, nog geen data opgevraagd |
| Google zoekklikken | Search Console, zakelijk account | Eigendom geverifieerd, nog geen data opgevraagd |
| Zoekopdrachten die bezoekers tonen | Search Console, zakelijk account | Nog geen data opgevraagd |
| Best presterende pagina | Search Console, zakelijk account | Nog geen data opgevraagd |
| Feedback van echte testers | Vrijwillige feedback | Nog niet verzameld |
| Affiliate-goedkeuring | Daisycon / Odyssey | Niet bevestigd |
| Werkelijke verkoopopbrengsten | Verkoopplatform | Geen betaalproduct |

**Geen verzonnen resultaten of omzet.** Search Console meet hoe je via Google gevonden wordt, niet hoe bezoekers intern klikken. Om werkelijk toolgebruik te meten is in de toekomst een aparte, privacy- en wetgevingsbewuste oplossing nodig.

## Beslismoment na 4–8 weken
- Hebben we echte zoekvertoningen, testen of nuttige feedback?
- Wordt de tool daadwerkelijk opnieuw gebruikt?
- Heeft een betaalde uitbreiding onderscheidende waarde?
- Worden affiliateprogramma's en productfeeds officieel goedgekeurd?

Als er nog geen verkeer is, zoek eerst het distributieprobleem uit. Ga niet automatisch een duur product bouwen.
