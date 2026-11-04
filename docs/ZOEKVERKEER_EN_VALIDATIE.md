# Vindbaarheid & bezoekersvalidatie — SportTech Deals

**Startdatum: 4 november 2026.** Website: https://samknook.github.io/sporttech-deals/

## Wat er nu bestaat
- Online [Triathlon Race Planner](https://samknook.github.io/sporttech-deals/race-planner.html), [eindtijdcalculator](https://samknook.github.io/sporttech-deals/triathlon-calculator.html) en [triatlonafstanden-gids](https://samknook.github.io/sporttech-deals/triatlon-afstanden.html).
- Technische browser-, reken- en publicatietests via GitHub Actions. **Dit is géén bewijs van menselijke bezoekers of organisch zoekverkeer.**
- Openbare [XML-sitemap](https://samknook.github.io/sporttech-deals/sitemap.xml) met canonieke pagina's. De oude /70-3-eindtijd-calculator.html is een redirect en staat niet meer in de sitemap.
- Geen Google Analytics, bezoekerspixel, betaalde advertenties, e-mailtracking of contactformulieren op de site.

## Eerste meetstap: Search Console (eenmalige accountactie)
1. Ga naar https://search.google.com/search-console en kies **Property toevoegen → URL-voorvoegsel**.
2. Vul **exact** de volgende URL in, inclusief HTTPS en slash:
   `https://samknook.github.io/sporttech-deals/`
3. Kies verificatie via **HTML-tag** (of via het door Google aangeboden HTML-bestand).
4. Geef alleen de door Google gegenereerde **verificatie-metatag** (of het unieke verificatiebestand) door aan de ontwikkelaar. Geen accountwachtwoorden, OAuth-tokens of persoonlijke herstelcodes versturen.
5. De metatag komt in de `<head>` van `docs/index.html`, of het bestand komt in `docs/`. De bestaande Daisycon-metatag blijft staan. GitHub Pages publiceert de wijziging.
6. Klik in Search Console **Verifiëren**. Zonder officiële bevestiging mag dit punt niet als geslaagd worden afgevinkt.
7. Dien bij **Sitemaps** in: `https://samknook.github.io/sporttech-deals/sitemap.xml`.
8. Gebruik URL-inspectie voor de homepage, calculator, planner en triatlonafstanden-gids. Google kan dagen of langer nodig hebben om pagina's te indexeren; indexering en rankings zijn niet gegarandeerd.

Bronnen:
- https://support.google.com/webmasters/answer/34592?hl=nl
- https://support.google.com/webmasters/answer/9008080?hl=nl
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

**Let op:** het bestand `docs/robots.txt` wordt gehost onder een *projectpad*. Een robots.txt-bestand geldt bij reguliere crawlers alleen vanaf de root van de host; het is hier dus geen garantie voor crawlerregels of automatische sitemapontdekking. De sitemap is wél rechtstreeks beschikbaar en kan via Search Console worden ingediend.

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
| Google vertoningen | Search Console | Nog niet gekoppeld |
| Google zoekklikken | Search Console | Nog niet gekoppeld |
| Zoekopdrachten die bezoekers tonen | Search Console | Nog niet gekoppeld |
| Best presterende pagina | Search Console | Nog niet gekoppeld |
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
