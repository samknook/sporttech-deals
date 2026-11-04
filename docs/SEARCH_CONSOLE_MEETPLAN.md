# TriZentro — Google Search Console: eerste 4 weken

**Start: 4 november 2026 · Status: eigendom geverifieerd door eigenaar.**

**Deel uitsluitend geaggregeerde Search Console-rapportages, geen Google-inloggegevens.**

## Technische basis — bevestigd

- Search Console URL-prefix property: `https://samknook.github.io/sporttech-deals/`.
- Eigenaar bevestigde op 4 november 2026 de succesvolle Google-eigendomsverificatie onder het afzonderlijke zakelijke account.
- Gepubliceerde sitemap: `https://samknook.github.io/sporttech-deals/sitemap.xml`.
- Publieke GitHub Actions-controle: [sitemap en verificatie succesvol](https://github.com/samknook/sporttech-deals/actions/runs/41848025799). Resultaat: 8 bereikbare openbare pagina's, geen `noindex`-headers/meta.
- **Nog niet aangetoond:** dat de eigenaar de sitemap in Search Console heeft ingediend, dat Google de pagina's daadwerkelijk indexeert of dat er al zoekklikken/vertoningen zijn.

## Stap 1 — sitemap versturen

1. Open `https://search.google.com/search-console` ingelogd als de zakelijke TriZentro-identiteit (niet als privéaccount).
2. Selecteer `https://samknook.github.io/sporttech-deals/`.
3. Ga naar **Indexeren → Sitemaps**.
4. Vul `sitemap.xml` in onder **Een nieuwe sitemap toevoegen**, of de volledige URL indien de interface daarom vraagt.
5. Klik **Verzenden**, controleer daarna **Status: Geslaagd** zodra Google de sitemap heeft gelezen. **Geslaagd** betekent niet dat alle URL's zijn geïndexeerd.
6. Bekijk indien nodig de foutdetails. Zie [officiële Google-uitleg](https://support.google.com/webmasters/answer/7451001?hl=nl).

## Stap 2 — inspecteer de belangrijkste pagina's

| Prioriteit | URL | Technisch live | Indexeringsstatus Google |
|---|---|---|---|
| 1 | [Homepage](https://samknook.github.io/sporttech-deals/) | Ja | Nog niet opgevraagd |
| 1 | [Triathlon Eindtijdcalculator](https://samknook.github.io/sporttech-deals/triathlon-calculator.html) | Ja | Nog niet opgevraagd |
| 1 | [Triathlon Race Planner](https://samknook.github.io/sporttech-deals/race-planner.html) | Ja | Nog niet opgevraagd |
| 1 | [Triatlonafstanden-gids](https://samknook.github.io/sporttech-deals/triatlon-afstanden.html) | Ja | Nog niet opgevraagd |
| 2 | [Koopgids](https://samknook.github.io/sporttech-deals/koopgids.html) | Ja | Nog niet opgevraagd |
| 2 | [Fietscomputer voor triatlon](https://samknook.github.io/sporttech-deals/fietscomputer-triatlon.html) | Ja | Nog niet opgevraagd |
| 2 | [Fietscomputeraanbiedingen](https://samknook.github.io/sporttech-deals/fietscomputer-aanbieding.html) | Ja | Nog niet opgevraagd |
| 3 | [Transparantie](https://samknook.github.io/sporttech-deals/transparantie.html) | Ja | Nog niet opgevraagd |

Gebruik de **URL-inspectie** boven in Search Console. Voor elk adres: status geïndexeerd of niet, eventuele reden, door Google geselecteerde canonical en laatste crawl. Indien een pagina crawlbaar is maar nog niet geïndexeerd, kun je éénmaal **Indexering aanvragen**; dat garandeert niets.

## Stap 3 — wekelijkse prestaties (niet invullen zonder Google-data)

Rapport: **Prestaties → Zoekresultaten**, zoektype **Web**, landfilter eerst Nederland of alle landen, periode **7 dagen**. Vergelijk later ook 28 dagen. De gegevens kunnen enige tijd op zich laten wachten.

| Week | Vertoningen | Klikken | CTR | Gem. positie | Beste zoekopdracht / pagina | Opmerkingen |
|---|---:|---:|---:|---:|---|---|
| 4–10 nov 2026 | — | — | — | — | Nog geen rapportgegevens | Property geverifieerd |
| 11–17 nov 2026 | — | — | — | — | Nog geen rapportgegevens | — |
| 18–24 nov 2026 | — | — | — | — | Nog geen rapportgegevens | — |
| 25 nov–1 dec 2026 | — | — | — | — | Nog geen rapportgegevens | — |

**Een gedachtestreep betekent onbekend, niet nul.** De Search Console-data zijn niet beschikbaar via de huidige Google-appverbinding in deze chat. De Google-connector was eerder nog aan het privéaccount gekoppeld; gebruik die niet voor bedrijfsbestanden.

## Welke zoekintenties we willen testen

- `triatlon eindtijd berekenen`: past bij de calculator.
- `triatlon race planner`, `triatlon schema wedstrijddag`: past bij planner.
- `70.3 eindtijd berekenen`, `halve triatlon onder 5 uur`: past bij doeltijdmodus.
- `triatlon afstanden`, `sprint olympische triatlon verschil`: past bij gids.
- `fietscomputer triatlon`: past bij onafhankelijke koopgids.

Dit zijn **hypothesen over zoekintentie**, geen bewezen zoekvolume, rankings of vertoningen.

## Elke week: 15 minuten

1. Check Indexeren → Pagina's, aantal geïndexeerde pagina's en belangrijkste verklaringen van uitgesloten URL's.
2. Check Sitemaps of de sitemap daadwerkelijk gelezen is.
3. Noteer vertoningen, klikken, CTR en gemiddelde positie uit Search Console.
4. Kijk welke *niet-merkgerelateerde* zoekopdrachten de meeste vertoningen krijgen.
5. Kies maximaal één gerichte verbetering: titel, landingspagina, uitleg of interne link. Leg wijzigingsdatum vast.
6. Vraag echte triatleten om specifieke feedback op calculator en planner. Geen verkeer of conversies afleiden uit automatische CI-tests.

## Beslismoment na 4 weken

- **Wel vertoningen, weinig klikken:** beoordeel titel en zoekintentie, zonder CTR te overschatten bij een kleine steekproef.
- **Wel klikken, maar geen gebruikersfeedback:** maak feedbackvragen eenvoudiger, verspreid de tool in relevante netwerken zonder spam.
- **Geen vertoningen:** controleer vooral indexeringsstatus en of de pagina waarde toevoegt; meer functies zonder bezoekers is geen oplossing.
- **Affiliate:** pas na goedgekeurde partner en geautoriseerde feed prijzen tonen.

## Eigenaarschap

Search Console en later YouTube/Drive worden beheerd onder het aparte zakelijke Google-account. De gebruiker heeft die identiteit zelf aangemaakt. ChatGPT heeft geen Search Console API-toegang of schrijfbevoegdheid voor deze property; **geen inlogcodes, wachtwoorden of herstelcodes delen**.

Het huidige GitHub Pages-projectpad blijft actief totdat een eigen domein juridisch en technisch geregeld is.
