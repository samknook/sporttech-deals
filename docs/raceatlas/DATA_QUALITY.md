# RaceAtlas — kwaliteitscontrole van evenementen

Stand van de repository: 10 november 2026. Dit is een **interne werknotitie**, geen claim dat de vermelde wedstrijden of inschrijfdata vandaag live zijn bevestigd.

## Huidige basis
- 420 evenementrecords, 420 unieke ID's.
- 30 records met `dateEvidence: official`.
- 34 records met een `officialEventUrl`.
- 6 records met een directe `registrationUrl`.
- 8 records met een numerieke `priceEur`.
- 18 records met een inschrijfdatum of verwachte inschrijfperiode.
- Een algemene `source` (bijvoorbeeld een kalenderoverzicht) is **niet hetzelfde** als een officiële organisatorbron.

## Redactionele regels
1. Verzamel eerst een evenement-URL op de **eigen website van de organisator**. Controleer dat de pagina bij hetzelfde jaar én onderdeel hoort.
2. Noteer een volledige wedstrijddatum pas als de dag officieel vindbaar is. Gebruik anders `expectedMonth` met eventueel `expectedYear` en maak de status expliciet onzeker.
3. Zet `dateEvidence: official` uitsluitend wanneer de specifieke datum aantoonbaar op een officiële bron staat. Verwijs niet naar een algemene kalender om deze status te rechtvaardigen.
4. Registreer exacte openingsdata van inschrijving alleen met een concrete publicatie; anders uitsluitend een periode of 'onbekend'.
5. Vermeld een prijs pas bij aantoonbare bron en duidelijk onderdeel of afstand. Leg toeslagen of prijsvariatie uit via `priceNote`; geen afgeleide of gegokte prijzen.
6. Vul `registrationUrl` uitsluitend met een specifieke inschrijfpagina, niet een algemene website.
7. Controleer bij import op dubbelingen, oude jaren, gewijzigde namen, geografische plaats en een geldige bron.
8. Publiceer correcties na redactionele controle. Organisatorinzendingen worden **niet automatisch gepubliceerd**.

## Werkvolgorde
- Prioriteit A: 2027-wedstrijden met veel zoekvraag en bestaande officiële site; ontbrekende prijs, inschrijving en link aanvullen.
- Prioriteit B: regionale Noord-Hollandse wedstrijden en kleinere triatlons, duatlons, toertochten en loopwedstrijden.
- Prioriteit C: overige Nederlandse en internationale kalendervermeldingen.

## Uitrol en kwaliteitsbewaking
- Test scriptsyntaxis en regressietests vóór publicatie.
- Controleer de gepubliceerde GitHub Pages-URL via echte browser, op desktop én mobiel.
- Test zoeken, jaarfilter, datumstatus, radius, details, bewaren, formulieren en links.
- Gebruik alleen feitelijk bevestigde datum- en prijsgegevens in gebruikersgerichte claims.
- Automatische e-mailmeldingen blijven uit totdat opt-in, beveiligd verzenden en afmelden zijn geïmplementeerd.

## Commerciële uitgangspunten
- Gratis zoeken en opslaan voor bezoekers.
- Gratis basisaanmeldingen voor organisatoren.
- Nog geen publieke pakketprijzen of betaalde plaatsingen als die niet werkelijk operationeel zijn.
- Eventuele toekomstige sponsoring herkenbaar labelen en niet vermengen met organische ranking.
