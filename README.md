# SportTech Deals — MVP
**Status: prototype. Niet commercieel gepubliceerd.**

Een Nederlandstalige prijsvergelijker voor sportelektronica, te beginnen met Garmin- en Wahoo-fietscomputers. De site toont **geen verzonnen live winkelprijzen**. De prijsscanner gebruikt uitsluitend door de eigenaar geautoriseerde CSV-productfeeds; er wordt niet gescrapet en nooit automatisch gekocht.

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
