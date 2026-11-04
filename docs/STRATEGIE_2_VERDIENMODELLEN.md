# Strategische herijking — SportTech Deals
**Besluitdatum: 4 november 2026. Status: experiment, niet bewezen businessmodel.**

## Update 4 november 2026 — multi-distance v2

- [x] Sprint (750 m / 20 km / 5 km), Olympisch (1,5 / 40 / 10), 70.3 (1,9 / 90 / 21,0975), Full (3,8 / 180 / 42,195) en instelbare afstanden.
- [x] Twee pagina's in Swim–Bike–Run-thema, met disciplinekleuren en interactieve afstandskeuze.
- [x] Oude 70.3-calculatorlink leidt naar de nieuwe calculator.
- [x] Elf Node-rekentests en publieke GitHub Pages-controle geslaagd.
- [ ] Echte gebruikservaring en mobiele bediening testen; er zijn nog geen bezoekers- of conversiecijfers.

## Het besluit

**Niet vijf losse bedrijven starten. Wel twee verdienmodellen testen voor één doelgroep.**

SportTech Deals wordt een Nederlandstalig platform voor wielrenners en triatleten met:
1. **Digitale tools en producten (70% van de ontwikkeltijd)**: gratis calculators als kennismaking; op termijn een eenmalig te kopen, selfservice digitaal trainings-/wedstrijddocument als de vraag blijkt.
2. **Affiliate-vergelijking (30%)**: onafhankelijk advies en alleen goedgekeurde Garmin/Wahoo-productfeeds. Geen commissies of toegestane feeds claimen voordat dat bevestigd is.

**Wat we uitstellen:** betaald verkeer, voorraad, verkopen van tweedehands elektronica, individuele coaching, veel klantgesprekken, breed generiek nieuws, een app met kostbare externe API's, en het oprichten van een bv vóór bewijs van terugkerende vraag.

## Waarom dit past

- De oprichter kan ongeveer 4–6 uur per week aan het project besteden naast voltijdwerk.
- Voorkeur: online producten, weinig startkapitaal, geen bellen of afspraken, hoogstens incidentele e-mail.
- Ervaring en interesse: wielrennen, triatlon, techniek en financiële analyses/rekenmodellen.
- Risicospreiding binnen dezelfde doelgroep: als affiliateprogramma's traag zijn, kunnen nuttige sporttools apart worden getest; als digitale verkoop niet aanslaat, kunnen goede koopgidsen en toegestane affiliates nog waarde hebben.
- Het is niet bewezen dat deze combinatie winstgevend zal worden. Dit is een **begrensd experiment**.

## Marktfeiten en risico's

- Nederlandse online productverkopen groeiden in 2025; online elektronica is een gevestigde markt. Bron: https://www.thuiswinkel.org/nieuws/meer-online-productaankopen-minder-uitgaven-aan-reizen-en-evenementen-in-2025/
- De markt voor Garmin/Wahoo-prijsvergelijkingen heeft bestaande concurrenten. Voorbeeld: https://www.beslist.nl/p/garmin-edge-850-gps-fietscomputer-kleurentouchscreen-compact/38000/0753759356651/
- Google waarschuwt voor 'thin affiliate'-websites zonder eigen toegevoegde waarde. Bron: https://developers.google.com/search/docs/essentials/spam-policies
- Google vraagt om originele praktijkkennis, onderzoek en aantoonbare inhoudelijke toegevoegde waarde. Bron: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Een Amerikaans Pew-onderzoek (maart 2025) vond bij AI-samenvattingen lagere uitgaande klikpercentages, maar dit is **geen** directe voorspelling voor Nederland. Bron: https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/
- Er worden al digitale triatlonplanners aangeboden; een generieke PDF is daarom zwak onderscheidend. Bron: https://www.etsy.com/market/triathlon_training_templates
- Affiliatevoorwaarden, kanaalacceptatie, verkeer, productconversies en willingness-to-pay zijn **nog niet bewezen**.

## Eerste producthypothese

**Gratis:** [Triathlon Eindtijdcalculator](../docs/triathlon-calculator.html) en [Triathlon Race Planner](../docs/race-planner.html). Beide ondersteunen Sprint, Olympisch, 70.3, Full en eigen afstanden, en verwerken de gegevens lokaal. De planner biedt dynamische checkpoints, een doelvergelijking, een materiaalchecklist, printweergave en een exporteerbaar tekstplan. Dit zijn geen gegarandeerde voorspellingen, persoonlijke coaching of betaalde producten.

**Mogelijk betaald:** een `70.3 Race Planner` met zelfstandig in te vullen wedstijdpacing, materiaallijst, reis-/racedagplanning, scenariovergelijking en een aanpasbare Excel/Google Sheets-template. Richtprijs als **testhypothese** €19–€29 eenmalig, niet nu gepubliceerd of verkocht. Een concrete prijs en aanbod pas kiezen na marktfeedback en kosten-/belastingcontrole.

**Niet verkopen als:** gepersonaliseerde medische adviezen, gegarandeerde finishtijden of professionele coaching.

## 8-weekse validatiesprint

**Week 1–2**
- [x] Gratis 70.3 calculator gemaakt en op de homepage gelinkt.
- [x] Zes Node-tests voor raceplannerberekeningen en JavaScript-syntaxiscontroles uitgevoerd via GitHub Pages-workflow.
- [ ] Controleer in een echte browser de interface en mobiele weergave.
- [ ] Kies een privacyvriendelijke manier om bezoeken/toolgebruik te meten; zonder meting niet suggereren dat er vraag is.
- [ ] Affiliatecontacten monitoren (Daisycon en Odyssey).

**Week 3–4**
- [ ] Verzamel feitelijke zoek- en interessegegevens via Search Console of passende privacyvriendelijke analytics na eventuele verificatie.
- [ ] Formuleer 2–3 concrete betaalde productproblemen die niet door gratis calculators worden opgelost.
- [x] Gratis interactieve Race Planner-preview gemaakt, zonder betaalcheckout of verzameling van gebruikersgegevens.
- [ ] Onderzoek verkoopprovider en Nederlandse verplichtingen voor digitale leveringen; nog geen betaalde verkoop.

**Week 5–6**
- [ ] Controleer echte belangstelling: vrijwillige klikken op de productpreview en/of aantoonbare geïnteresseerden, zonder fictieve statistieken.
- [ ] Als juridische/publisher-voorwaarden geregeld zijn: probeer een kleine betaalde pilot met een zelfstandig te downloaden product; documenteer echte omzet, kosten en supporttijd.
- [ ] Bij officiële affiliatefeed: importeer en controleer handmatig minimaal 25 aanbiedingen, anders geen prijsvergelijking publiceren.

**Week 7–8**
- [ ] Vergelijk beide modellen op **echte gegevens**, niet op bezoekaannames.
- [ ] Noteer: unieke gebruikers, engagement van de tool, product-/affiliatiekliks, eventuele echte verkopen, brutomarge en onderhoudsminuten.
- [ ] Behoud het best presterende onderdeel; leg het zwakste stil als er geen onderscheidend signaal is.

## Beslisregels

- **Stop of herpositioneer een model** als er na acht weken actieve, gedocumenteerde distributie geen bruikbare signalen zijn. Te weinig verkeer is eerst een distributieprobleem, niet automatisch een oordeel over productkwaliteit.
- **Schaal pas op** wanneer gebruikers aantoonbaar waarde krijgen, de omzet na kosten positief is en het onderhoud past binnen 4–6 uur/week.
- **Gebruik één publiek:** triatleten en wielrenners. Daardoor versterken koopgidsen, tools en marketing elkaar.
- **Uitgaven:** houd extra variabele kosten minimaal; koop geen domein of softwareabonnement alleen omdat het professioneel klinkt. Bij aankoop eerst naamrechten, voorwaarden en expliciete autorisatie verifiëren.

## Alternatief in de wachtkamer

Selfservice **financiële spreadsheet- en automatiseringstemplates** passen bij de administratieve/financiële vaardigheden en kunnen een aantrekkelijkere prijs per klant hebben. Maar het vergt een andere doelgroep en een apart distributiekanaal. Test dit pas als de 8-weekse sportpilot geen tractie toont of als er direct, onafhankelijk aantoonbare vraag is. Gebruik nooit werkgeversgegevens, vertrouwelijke processen of intellectueel eigendom.

## Juridische noot

Een plan voor een **bedrijf** is geen reden om nu een besloten vennootschap (bv) op te richten. Bespreek bij daadwerkelijke commerciële activiteiten de juiste ondernemingsvorm, fiscale registratie en aansprakelijkheid met KVK/Belastingdienst of een adviseur. Geen automatische aannames over belastingvrij bijverdienen.
