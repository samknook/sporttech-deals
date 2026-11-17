# TriZentro — officiële wedstrijdbronnen, controlelijst (17 november 2026)

## Publicatieregels
- Officiële evenementpagina bestaat: evenement mag in kalender, ook als 2027-datum nog niet officieel bekend is.
- Zonder 2027-bevestiging: `date: null`, `status: date_pending`, `dateEvidence: unconfirmed`, `expectedYear: 2027`. Een vorige-editiedatum is nooit een bevestigde nieuwe datum.
- Officiële datum: alleen `dateEvidence: official` wanneer de bron editie en datum ondubbelzinnig noemt.
- Gegevens en links voor elke wedstrijd toetsen; organisatorenpagina en expliciete registratie niet verwarren.
- Eigen evenementdetailpagina controleren vóór publicatie. Verwijder of pauzeer wedstrijden zonder controleerbare officiële organisator- of inschrijfpagina.
- E-mail voor nieuw bevestigde datum is pas operationeel na verificatie van server-side wijzigingsdetectie en verzending.

## Geverifieerde 2027-kandidaten (nog niet automatisch gepubliceerd)
| Wedstrijd | Datum 2027 | Officiële bron | Actie |
| --- | --- | --- | --- |
| Triathlon Epe | 2027-08-22 | https://www.triathlonepe.nl/ | Voeg toe met officiële datum; kwart en halve triatlon; eigen detailpagina maken |
| Wintertriathlon Enschede (NK) | 2027-03-13 | https://www.triathlonbond.nl/over-ntb/nieuws/nk-en-agk-kalender-2027-grotendeels-bekend/ | Organisator-evenementpagina nog controleren |
| Duathlon Rotterdam (NK) | 2027-04-03 | idem | Organisator-evenementpagina nog controleren |
| Duathlon Almere (NK) | 2027-04-18 | idem | Organisator-evenementpagina nog controleren |
| Duathlon Sittard (NK) | 2027-04-24 | idem | Organisator-evenementpagina nog controleren |
| Triathlon Stein (NK) | 2027-05-30 | idem | Organisator-evenementpagina nog controleren |
| Triathlon Amsterdam (AGK) | 2027-06-06 | idem | Organisator-evenementpagina nog controleren |
| Triathlon Rotterdam (NK) | 2027-06-20 | idem | Organisator-evenementpagina nog controleren |
| Crosstriathlon Renkum (NK) | 2027-08-28, onder voorbehoud | idem | Datum niet als definitief presenteren |
| Challenge Almere lange afstand (NK/EK) | 2027-09-11 | idem | Controleer bestaande race/duplicaten |

**Let op:** de NTB-artikelkop en de hoofdtekst vermelden 2027, maar de overzichtssectie in datzelfde artikel heeft verwarrend het onderschrift '2026'. Beoordeel de editie per bron; geef voorwaardelijke datums apart weer.

## Eerstvolgende acceptatiechecks
1. Standaardfilter 'alleen aankomende' laat officiële, nog ongedateerde toekomstige evenementen zien.
2. Inschrijfradar toont zulke evenementen en linkt naar 'Officiële wedstrijddatum bekend'.
3. Kalender-ICS maakt geen fictieve datum aan voor wedstrijden zonder officiële datum.
4. Bekijk alle evenementen zonder officiële HTTPS-pagina en controleer links handmatig; geen bulk-publicatie op basis van zoekresultaten.
5. Test dat account-gebonden e-mailmeldingen bij overgang van onbekende naar officiële datum echt precies één keer worden afgeleverd.

## Inventarisatie huidig catalogusbestand (17 november 2026)
- 168 records in de ingebedde `EVENTS`-dataset van `docs/raceatlas/index.html`.
- 168 hebben een syntactisch geldige HTTPS-`officialEventUrl`; dit is **geen bewijs dat elke link werkt of naar de juiste editie verwijst**.
- 61 evenementen hebben `dateEvidence: official`; 107 niet.
- Van die 107 hebben 100 toch een ingevulde `date` en zeven geen exacte `date`.
- De kaartweergave op deze branch toont alleen bij `dateEvidence: official` het dagnummer en de maand als wedstrijddatum. Onbevestigde datums krijgen `N.T.B.` of uitsluitend een verwachte maand.
- De dynamische datum- en inschrijfdetectie van de e-mailbackend is nog niet end-to-end gevalideerd; er is geen garantie op automatische e-mail.
- Evenementpagina's die door `eventPage()` worden aangemaakt, moeten in de daadwerkelijke deploybestemming bestaan; alleen aanwezigheid in de index is onvoldoende.

**Publicatieblokkade:** syntactische URL-aanwezigheid is niet hetzelfde als een geslaagde HTTP-/inhoudscontrole. Controleer alle 168 uitgaande bestemmingen en de detailpagina's voordat de volledige kalender als geverifieerd wordt gepubliceerd.

## Aanvullende verificatie (17 november 2026)
- OOG Edam Kermisloop toegevoegd als `ra-434`: https://kermisloopedam.nl/ is door AV Edam als officiële bron bevestigd. De website toont uitsluitend de editie 2026; 2027 is **nog niet bevestigd** en blijft `date: null`.
- Dijkloop Edam toegevoegd als `ra-435`: AV Edam publiceert 7 februari 2027 expliciet op https://www.avedam.nl/agenda/meeuwen.php. Dit is niet de Kermisloop.
- De embedded catalogus telt na beide toevoegingen 170 evenementen. Hiervan hebben 108 nog geen als officieel bevestigde datum gemarkeerd, acht hebben geen exacte datum en acht hebben een datum vóór 17 november 2026. Dit zijn datasetstatussen, geen HTTP-linkcontroles.
- De kalenderkaarten én de detailweergave zijn aangepast zodat niet-officieel bevestigde `date`-velden niet als definitieve datum worden gepresenteerd.
- **Nog geen livegang:** voor de volledige catalogus is nog geen individuele HTTP- en broninhoudcontrole van alle 170 bestemmingen uitgevoerd; ook detailpagina's en de e-mailketen zijn niet volledig end-to-end getest.

## Extra ontdekte evenementen en geautomatiseerde linkcheck
- DTS Ouderkerk (30 mei), DTS Haarlemmermeer (18 juli), DTS GP Zandvoort (14 augustus), DTS Bosbaan (25 september) en Triathlon Epe (22 augustus) zijn toegevoegd met bron op officiële organisatiepagina.
- GO Triathlon Brouwersdam (5 juni), Herkingen (4 september), Zierikzee (25 september) toegevoegd met officiële bron via GO Sport Events. De evenementpagina van Brouwersdam bevestigt ook de 2027 inschrijfopening.
- Triathlon Veenendaal (28 augustus), Maasmarathon (2 mei) en RUNFORESTRUN Drentsche Aa (27 februari) kregen een officieel bevestigde datum na controle van de eigen organisator.
- Dublin Marathon organisatorlink specifieker gemaakt; 2027-datum (24 oktober) in officiële informatie bevestigd.
- De publieke race-index op main bevatte **al 168** evenementen. Een deel van de bestaande regressietests eist 423 en is niet afgestemd op de huidige gecureerde kalender; het testverschil is niet veroorzaakt door het verwijderen van records in deze branch.
- Eerste GitHub Actions HTTP-audit bij 175 evenementen: **169 bereikbaar, zes aandachtspunten**. Vier van deze zes kregen bij officiële bronzoekopdrachten een pagina terug. HTTP 403/502 of verbreking kan anti-botbeleid of tijdelijke problemen zijn; het is niet automatisch bewijs dat een evenement ongeldig is.
- Nieuwe GitHub Actions audit wordt opnieuw uitgevoerd na toevoeging van de drie GO-evenementen en linkwijzigingen.
- Stand branch na aanvullingen: **178 unieke evenementen**; 73 datum als officieel gemarkeerd, 105 niet, acht records zonder exacte datum en acht historische records vóór 17 november 2026. Syntactisch zijn 178 officiële HTTPS-URLs aanwezig.
- **Release blijft geblokkeerd:** HTTP-bereikbaarheid controleert niet dat de bron inhoudelijk het evenement ondersteunt, dat exacte editie en datum juist zijn of dat de detailpagina en email-automatisering werken. Eerdere regressiesuite faalt ook voor deels verouderde aannames.
