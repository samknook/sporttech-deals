# TriZentro — Triathlon Race Tools

## Nieuw onafhankelijk ondernemingsexperiment — MKB AI Studio (6 november 2026)

**Strategische pivot:** naast het bestaande TriZentro-experiment wordt een nieuwe onderneming verkend die **AI-werkprocessen implementeert bij kleinere B2B-bedrijven**. MKB AI Studio is uitsluitend een werknaam; er bestaat nog geen geregistreerde BV, klantcontract of geverifieerde verkoop.

- [Conceptwebsite en transparante inboxdemo](docs/ai-studio/index.html) — regelgebaseerd, **geen AI-model**.
- [Volledige fictieve inboxworkflow](docs/ai-studio/inbox-workflow.html) — vier vooraf ingestelde cases met controle, goedkeuring of escalatie; nooit e-mailverzending.
- [Broncontrole-demo](docs/ai-studio/broncontrole.html) — zeven fictieve scenario's (inclusief verouderde bronnen) voor overeenkomende, tegenstrijdige, ontbrekende of toekomstige bronwaarden.
- [Exacte bronwaardenvergelijker](ventures/mkb-ai-studio/api-pilot/source-evidence.cjs) — alleen lokaal aangeleverde gestructureerde data; geen echte bronauthenticatie. Tests: `node tests/test-mkb-ai-source-evidence.js`.
- [Geïntegreerde fictieve pilot](ventures/mkb-ai-studio/api-pilot/review-demo.cjs) — concept → kwaliteitscontrole → exacte bronvergelijking → menselijke beoordeling of escalatie. Alleen Node en testgegevens, geen klantintegratie.
- [AI-modelbatch met testprovider](ventures/mkb-ai-studio/api-pilot/model-batch-demo.cjs) — twee fictieve berichten door een nagebootste Responses API, daarna broncontrole en controle- of escalatiestatus; geen API-kosten of verzending.
- [Acceptatietests met risicoscenario's](ventures/mkb-ai-studio/api-pilot/ACCEPTANCE_CRITERIA.md) — elf fictieve cases voor onterechte zakelijke claims, bronconflicten en indirecte betaalbevestigingen; geen productiecertificering.
- [Batch-evaluatie](ventures/mkb-ai-studio/api-pilot/batch-demo.cjs) — drie fictieve cases, afwijkingen en een voorzichtige scenarioberekening (geen gemeten besparing).
- [Netto pilot-meetmodule](ventures/mkb-ai-studio/api-pilot/measure.cjs) — rekent verwerking, menselijke controle en herstelwerk mee; uitsluitend operator-ingevulde geanonimiseerde tijden.
- [API Inbox pilotadapter](ventures/mkb-ai-studio/api-pilot/README.md) — echte Responses API-aanroep technisch voorbereid; standaard offline, alleen fictieve testdata en expliciete opt-in; nog niet live uitgevoerd.
- [Gratis AI QuickScan](docs/ai-studio/quickscan.html) — scenario voor mogelijke tijdwinst.
- [AI Pilot Intake](docs/ai-studio/pilot-intake.html) — risicogates, scope en lokaal downloadbaar conceptadvies.
- [Betaalde pakketten verkennen](docs/ai-studio/pakketten.html) — transparante indicaties en maatwerkuitzonderingen, geen checkout.
- [Wat krijgt een klant?](docs/ai-studio/wat-krijg-je.html) — concreet AI Inbox Starter-aanbod, opleveringen, prijsgrenzen en uitsluitingen.
- [Eerste AI Inbox-pilot verkennen](docs/ai-studio/pilot.html) — lokale geschiktheidstoets zonder contactgegevens, verzending of opslag.
- [Prospects kwalificeren](docs/ai-studio/prospecten.html) — anonieme, offline verkooptoets met budget-, reviewer- en integratieblokkades. Geen klant- of contactgegevens.
- [Eerste 15 verkoopgesprekken](ventures/mkb-ai-studio/SALES_VALIDATION_15.md) — interne interview- en outreachaanpak, conceptteksten en stopregels; niets verzonden.
- [Zes onderzoeksprospects in Noord-Holland](ventures/mkb-ai-studio/PROSPECT_RESEARCH_NH.md) — openbare B2B-bedrijven, officiële bronlinks en gerichte interviewvragen; geen vastgestelde klantbehoefte of benaderingen.
- [AI Inbox-businesscase](docs/ai-studio/businesscase.html) — lokale scenarioberekening met menselijke review, herstelwerk, licenties, support en terugverdientijd; geen bewezen besparingen.
- [AI Inbox-pilotresultaat meten](docs/ai-studio/pilot-meten.html) — lokale taak-voor-taakmeting met reviewtijd, herstelwerk, uitsluitingen en foutblokkades; geen klantdata-opslag.
- [Website-publicatie](.github/workflows/publish-site.yml) — publiceert uitsluitend `docs/` na twee controles; GitHub Settings → Pages moet bron GitHub Actions gebruiken.
- [Kennismaking voorbereiden](docs/ai-studio/kennismaking.html) — lokaal een zakelijke gespreksaanvraag opstellen, kopiëren of als tekstbestand bewaren; geen ontvanger of verzending.
- [Uitvoeringsprotocol eerste betaalde pilot](ventures/mkb-ai-studio/PAID_PILOT_EXECUTION.md) — discovery, scope, veiligheidsvoorwaarden en metingen.
- [Eerste betaalde klantaanbod](ventures/mkb-ai-studio/FIRST_CUSTOMER_OFFER.md) — intern scope-, kwalificatie- en rendabiliteitskader (nog niet gevalideerd).
- [Publiek/privé releasebeleid](ventures/mkb-ai-studio/PUBLIC_PRIVATE_RELEASE_POLICY.md) — commerciële implementaties en klantgegevens blijven buiten de openbare repository.
- [AI-assistenten voor bedrijven](docs/ai-studio/assistant-configurator.html) — openbaar dienstenoverzicht, zonder gratis configuratiegenerator of template-download.
**Commerciële toegang (6 november 2026):** de gratis configuratiegenerator is uit de publieke website en de huidige GitHub-versie verwijderd. Alleen uitleg, fictieve demo's, QuickScan en Pilot Intake blijven toegankelijk. Eerder gepubliceerde broncode kan nog via commitgeschiedenis toegankelijk zijn; de volledige commerciële assets mogen later uitsluitend in een privéomgeving staan. Er is nog geen betalings- of klanttoegangssysteem.

- [Implementatiehandleiding](ventures/mkb-ai-studio/IMPLEMENTATION_KIT.md) — Inbox, Document Desk, Finance Desk.
- [Unit economics](ventures/mkb-ai-studio/UNIT_ECONOMICS.md) — prijs-/urenhypothesen en margestopregels.
- [Klantoplevertemplate](ventures/mkb-ai-studio/CLIENT_DELIVERY_TEMPLATE.md) — met 8 acceptatietests en menselijk toezicht.
- [Acquisitie- en interviewplan](ventures/mkb-ai-studio/FIRST_CUSTOMERS_PLAYBOOK.md) — gesprekken nog niet uitgevoerd.
- [Commercieel startplan](ventures/mkb-ai-studio/LAUNCH_PLAYBOOK.md).
- Regressietests: `node tests/test-mkb-ai-studio.js`, `node tests/test-mkb-ai-studio-quickscan.js`, `node tests/test-mkb-ai-pilot-intake.js`. GitHub Actions-configuratie in `.github/workflows/mkb-ai-studio-tests.yml`; live CI-uitvoering is nog niet onafhankelijk gecontroleerd.

**Repo-isolatie:** het prototype staat in een afzonderlijke submap van de bestaande `sporttech-deals`-repository. Er is nog **geen afzonderlijke nieuwe repository of eigen domein**. Het nieuwe bedrijf is niet gekoppeld aan of onderschreven door OpenAI; de klanten moeten hun eigen softwarelicenties en veilige werkomgeving regelen.

**Internationale werknaam, 4 november 2026 · voorheen SportTech Deals / TriKoers.**

**TriZentro** maakt gratis triatloncalculators en raceplanners voor Sprint, Olympisch, 70.3, Full en eigen afstanden. De huidige tools werken in de browser; digitale producten en geautoriseerde affiliateprijsvergelijkingen zijn mogelijke toekomstige verdienmodellen. De naam, domeinen en socialmediahandles zijn juridisch en technisch nog niet volledig gecontroleerd. Er zijn nog geen accounts of domeinen onder TriZentro geregistreerd.

[**Merkidentiteit, socialmedia- en Google-accountplan**](docs/BRAND_TRIZENTRO.md) · [**Brand Kit: PNG-avatar en banner**](https://samknook.github.io/sporttech-deals/brand-kit.html) · [**Live website (bestaande GitHub-URL)**](https://samknook.github.io/sporttech-deals/)

## Nieuw: Event Operations Workspace — 5 november 2026

De [organisatorwerkruimte](docs/organizer-workspace.html) combineert links naar de bestaande deelnemersbriefing en vrijwilligersplanner met een lokaal bij te houden 6-stappenworkflow, openstaande acties, evenementbron en notities. Download een tekstoverdracht of importeer/exporteer een JSON-concept. Alle gegevens blijven op het eigen apparaat totdat de gebruiker zelf exporteert. Het overzicht **wisselt nog geen data automatisch uit met de afzonderlijke tools** en is geen officiële vrijgave.

Pure validatie- en rapportagemodule: [docs/organizer-workspace-core.js](docs/organizer-workspace-core.js). Regressietest: `node tests/test-organizer-workspace.js`. JavaScript-syntaxcontrole geslaagd; nog geen volledige live browsertest.

## Strategische koers en organisatorpilot — 5 november 2026

De [marktvergelijking](docs/MARKTSCAN_COMMERCIEEL_2026-11-05.md) toont dat veel consumenten-tools voor triatlonraceplanning al gratis of goedkoop verkrijgbaar zijn. Daarom is een voorgestelde betaalde Race Pack van €19,95 onvoldoende onderscheiden zonder extra bewijs. Consumententools blijven gratis; de potentieel betaalde richting verschuift voorlopig naar [Event Operations Pilot voor clubs en organisatoren](docs/organizer-pilot.html), met briefingtools, versieverschillen en vrijwilligersroostering. Dit is een hypothese en heeft **geen bevestigde klanten, verkopen of omzet**.

## Officiële wedstrijdbronnen — 5 november 2026

In de gratis [Race Pack-preview](docs/race-pack-preview.html#official-sources) kunnen gebruikers optioneel de **HTTPS-link naar de officiële wedstrijdbriefing** en de datum van hun eigen controle vastleggen. Beide verschijnen in het racedossier en Race-Day Passport, en in lokaal opgeslagen concepten. Bestaande concepten worden zonder gegevensverlies gemigreerd. TriZentro haalt de bron niet op en **claimt nooit zelf geverifieerde evenementinformatie**. Regressietests voor de gegevensdoorgifte en compatibiliteit zijn toegevoegd aan [tests/test-race-passport.js](tests/test-race-passport.js).

## Race-Day Passport — 5 november 2026

De [gratis 70.3 Race Pack-preview](docs/race-pack-preview.html#race-passport-section) bevat nu een mobiel **wedstrijdpaspoort** met verwachte finish, doeltijd, vijf doorkomstklokken, ochtendvertrek, zelf ingevoerde sluiting wisselzone en drie persoonlijke noodplannen. Met **Print alleen paspoort** is een compacte print/PDF-weergave beschikbaar. Geen backend of persoonsgegevensoverdracht.

Technische onderdelen: [pure passport-viewmodel](docs/race-passport.js), [11-punts checklist](docs/race-pack-review.js), en [Node regressietest](tests/test-race-passport.js) (uitvoeren: `node tests/test-race-passport.js`). De berekeningen zijn steekproefsgewijs uitgevoerd en de code heeft een syntaxcontrole doorstaan; een echte browsertest en live GitHub Pages-controle zijn nog niet bevestigd.

**Commerciële grens:** het paspoort is beschikbaar als gratis prototype, geen betaalproduct. Nooit als exclusieve premiumfunctie aanprijzen.

## Preparation Review — 5 november 2026

De [70.3 Race Pack-preview](docs/race-pack-preview.html) heeft nu een **Preparation Review** met elf zelfcontrolepunten. Het overzicht onderscheidt ingevulde informatie van openstaande stappen; het is geen officiële wedstrijdverificatie. De punten komen ook in de tekstexport. De onafhankelijke berekeningsmodule staat in [race-pack-review.js](docs/race-pack-review.js). JavaScript-syntax en scriptstructuur zijn gecontroleerd, maar live browserwerking blijft ongeverifieerd.

## Ontwikkeling 5 november 2026 — betere racebeslissingen

- Nieuwe [Goal Feasibility Calculator](docs/goal-feasibility.html) voor Sprint, Olympisch, 70.3, Full en eigen afstand. Rekent benodigd looptempo en tijdverlies door; volledig lokaal, NL/EN.
- Het Race Pack bevat daarnaast een **Race-Day Decisions**-onderdeel voor zelf ingevoerde alternatieve plannen bij weer, materiaalpech en niet-beschikbare voeding. Deze keuzes worden meegenomen in tekstexport en lokaal opgeslagen concepten. Dit is geen automatische advisering.
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
