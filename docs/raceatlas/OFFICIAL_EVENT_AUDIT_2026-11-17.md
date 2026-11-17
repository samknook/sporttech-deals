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
