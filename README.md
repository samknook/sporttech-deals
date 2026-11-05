# TriZentro — Triathlon Race Tools
**Internationale werknaam, 4 november 2026 · voorheen SportTech Deals / TriKoers.**

**TriZentro** maakt gratis triatloncalculators en raceplanners voor Sprint, Olympisch, 70.3, Full en eigen afstanden. De huidige tools werken in de browser; digitale producten en geautoriseerde affiliateprijsvergelijkingen zijn mogelijke toekomstige verdienmodellen. De naam, domeinen en socialmediahandles zijn juridisch en technisch nog niet volledig gecontroleerd. Er zijn nog geen accounts of domeinen onder TriZentro geregistreerd.

[**Merkidentiteit, socialmedia- en Google-accountplan**](docs/BRAND_TRIZENTRO.md) · [**Brand Kit: PNG-avatar en banner**](https://samknook.github.io/sporttech-deals/brand-kit.html) · [**Live website (bestaande GitHub-URL)**](https://samknook.github.io/sporttech-deals/)

## Ontwikkeling 5 november 2026 — betere racebeslissingen

- Nieuwe [Goal Feasibility Calculator](docs/goal-feasibility.html) voor Sprint, Olympisch, 70.3, Full en eigen afstand. Rekent benodigd looptempo en tijdverlies door; volledig lokaal, NL/EN.
- De [70.3 Race Pack-preview](docs/race-pack-preview.html) heeft nu een aparte **Race Stress Test** voor vertraging tijdens zwemmen, fietsen, wissels en lopen. De uitkomsten zijn scenario's, geen sportmedische voorspellingen.
- Beide functies hebben een ontwikkelcommit; de publieke GitHub Pages-publicatie en browserwerking zijn nog niet onafhankelijk geverifieerd.
- Verdienmodel blijft hypothetisch: er is nog geen betaalproduct, klantbetaling of gevalideerde betalingsbereidheid.

## Historische SportTech Deals-prijsscanner

**Status: prototype. Niet commercieel gepubliceerd.**

Een Nederlandstalige prijsvergelijker voor sportelektronica, te beginnen met Garmin- en Wahoo-fietscomputers. De site toont **geen verzonnen live winkelprijzen**. De prijsscanner gebruikt uitsluitend door de eigenaar geautoriseerde CSV-productfeeds; er wordt niet gescrapet en nooit automatisch gekocht.

## Strategie 2026/27 — twee verdienmodellen, één doelgroep

**Status 4 november 2026:** we houden de affiliateprijsvergelijker aan, maar verminderen de afhankelijkheid van één extern netwerk.

- **70% ontwikkeltijd: gratis en eventueel betaalde sporttools** voor wielrenners en triatleten. De [gratis Triathlon Eindtijdcalculator](docs/triathlon-calculator.html) en de [gratis Triathlon Race Planner](docs/race-planner.html) draaien in de browser en ondersteunen **Sprint, Olympisch, 70.3, Full en eigen afstanden**. De planner toont 12 dynamische checkpoints, een materiaalchecklist, een doelvergelijking en een lokaal downloadbaar raceplan. Een zelfstandig betaald product is er nog niet. Er is nog **geen betaald digitaal product** en er zijn geen gemeten verkoopcijfers.
- **30% ontwikkeltijd: affiliate-vergelijkingen en koopgidsen** voor goedgekeurde Garmin- en Wahoo-productfeeds. Nog geen bevestigde partner of geldige prijsfeed.
- **Geen verspreiding over vijf bedrijven:** beide proeven richten zich op dezelfde doelgroep. Zelfstandige financiële automatiseringstemplates blijven een alternatief voor later.

Het is een **8-weekse validatiesprint**, geen toezegging van opbrengsten: [volledig plan en stopcriteria](docs/STRATEGIE_2_VERDIENMODELLEN.md).

## Zoekverkeer en validatie — 4 november 2026

De eerste SEO- en distributieversie is opgesteld:
- [Praktische gids triatlonafstanden](docs/triatlon-afstanden.html) met Sprint, Olympisch, 70.3, Full en pacing.
- Canonical-links en deelmetadata op homepage en beide gratis tools; WebApplication-gegevens met werkelijke prijs €0, **zonder fictieve beoordelingen**.
- De sitemap bevat alleen eigen, bruikbare pagina's; de oude 70.3-redirect is eruit verwijderd.
- De tools kunnen vrijwillig via WhatsApp worden gedeeld. Alleen de openbare paginalink wordt gedeeld, nooit persoonlijke tempo's of notities.
- [Handleiding Google Search Console en testplan](docs/ZOEKVERKEER_EN_VALIDATIE.md) · [Vierweeks Search Console-meetplan](docs/SEARCH_CONSOLE_MEETPLAN.md) en [open actie #5](../../issues/5).

**Nog ontbrekend:** het eigendomsbewijs voor Google Search Console en echte menselijke bezoekdata. De GitHub Pages-tests zijn géén gebruikersstatistieken. Eerst zoekverkeer en echte feedback vastleggen, dan pas nieuwe betaalfuncties overwegen.

## Affiliatealternatieven — 4 november 2026

We volgen nu meerdere officiële routes naar geautoriseerde winkeldata. Voorzichtigheid blijft belangrijk: **een openbaar winkelassortiment is geen bewijs van feedrechten of commissie.**

- **Decathlon/Odyssey:** officieel programma met downloadbare productfeeds. Relevante Garmin/Wahoo-producten staan in de webshop; er is nog geen toestemming of feedtoegang. Op 4 november is een gerichte vraag naar Odyssey Support gestuurd.
- **TradeTracker:** back-up voor meerdere winkels, productfeeds en API.
- **Awin:** CSV-productfeeds en advertentieprogramma's na toelating.
- **Adtraction:** productzoekfunctie en XML-feeds; onze huidige importer verwerkt uitsluitend CSV.
- **Daisycon:** account bestaat en handmatige verificatie is aangevraagd, maar nog niet bevestigd.

Zie [de uitgebreide, bronvermelde afweging](docs/AFFILIATE_ALTERNATIEVEN.md) en [de open actie](../../issues/3). **Nog geen live winkelprijzen, affiliatepartners of commissies geclaimd.**

## Volgende stap — 27 oktober 2026

De code staat daadwerkelijk in deze openbare repository, maar **de website is nog niet als commerciële dienst gepubliceerd**. Er is nog geen aangesloten, toegestane winkelproductfeed, geen goedgekeurde affiliatepartner en geen omzet.

1. Meld je als publisher aan bij [Daisycon](https://login.daisycon.com/nl/register) of [Awin](https://www.awin.com/nl/faqs). De precieze, eerlijke aanvraagtekst staat in [docs/PUBLISHER_AANMELDEN.md](docs/PUBLISHER_AANMELDEN.md).
2. Vraag bij minstens één winkelcampagne expliciete toestemming voor productfeeds, prijsvergelijking en affiliate-deeplinks.
3. Sla een geautoriseerde HTTPS CSV-feed-URL **uitsluitend** op als GitHub Actions-secret `STD_FEED_URLS`. Deel nooit wachtwoorden of feedtokens in publieke issues.
4. Test de feed zonder te publiceren met [Actions → Controleer affiliate-productfeed](../../actions/workflows/feed-test.yml).
5. Controleer eerst exploitantgegevens, privacy, affiliatevermelding en merknaam, en kies daarna pas bewust voor publieke uitrol.

**De standaardinstelling blijft: geen automatische publicatie en geen automatische aankopen.**

## Bestanden
- `site/`: responsieve website, categorieoverzicht, koopgids en voorlopige juridische informatie.
- `config/`: productcatalogus en controlegrenzen.
- `app/`: veilige CSV-importer, prijsvergelijking en tweedehands rekenmodule.
- `data/`: prijshistorie zonder persoonsgegevens.
- `tests/`: standaardbibliotheek-tests.
- `.github/workflows/`: tests en **uitgeschakelde** publicatie.
- `docs/`: benodigde vervolgstappen.

## Lokaal starten
```bash
python -m unittest discover -s tests -v
python app/build.py
python -m http.server 8000
```
Open daarna `http://localhost:8000/site/`.

Een officiële CSV-feed importeren (met toestemming van de aanbieder):
```bash
python app/build.py --feed /pad/naar/goedgekeurde-feed.csv
```
Kolommen: `title,shop,price,shipping,url,condition,currency,stock`. Ondersteund worden ook enkele Awin-achtige aliassen. Een prijs zonder bekende verzendkosten mag **niet** worden bestempeld als bewezen deal. Alle bedragen dienen consumentenprijzen in EUR inclusief btw te zijn.

### GitHub Pages (nog niet inschakelen)
De workflow `publish.yml` publiceert uitsluitend als de repositoryvariabele `STD_PUBLICATION_ENABLED` gelijk is aan `true`. Zet die pas aan nadat exploitantgegevens, contactgegevens, privacy-informatie, affiliate-disclosures en bedrijfsnaam juridisch zijn gecontroleerd en een geautoriseerde feed is aangesloten. Pages vereist vervolgens als publicatiebron GitHub Actions bij **Settings → Pages**.

Productfeed-URL's kunnen als secret `STD_FEED_URLS` worden vastgelegd (één HTTPS-URL per regel). **Nooit API-tokens, privé- of klantgegevens committen.**

De browser-prijsdoelen zijn alleen lokaal; er worden nog geen e-mails aan websitebezoekers verstuurd. Affiliate-accounts, live prijzen en opbrengsten zijn nog niet beschikbaar.

## Grenzen
- Nieuwe producten worden alleen gekoppeld bij een eenduidige modelmatch; accessoires, Solar-, refurbished- en bundelvarianten worden uitgesloten.
- Een signaal vereist minstens 3 afzonderlijke winkels met bekende totale prijzen, een actuele bron en minimaal 15% onder de mediaan van de andere winkels. Dit signaal **bewijst geen doorverkoopwinst**.
- Tweedehands handel is een losse interne berekening; geen autokoop.
- Verkooprechten, feedlicenties, intellectuele eigendom en Nederlandse e-commerceverplichtingen blijven verantwoordelijkheid van de exploitant.

De naam **SportTech Deals** is voorlopig. Geen affiliatie met Garmin, Wahoo of andere genoemde merken.
