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
