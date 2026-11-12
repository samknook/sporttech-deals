# RaceAtlas — commerciële pilot (intern)

## Commerciële uitgangspunten

- De wedstrijdkalender blijft gratis voor bezoekers en standaard vermeldingen blijven gratis voor organisatoren.
- Betaalde campagnes worden alleen na een afspraak geactiveerd. Op de publieke website staan **geen standaardtarieven of pakketten**.
- De eerste pilot is een kortlopende, expliciet als gesponsord gemarkeerde wedstrijdpromotie.
- Organische zoekresultaten en filters worden niet voor betalende klanten aangepast.
- Noem in een voorstel altijd het bereik als hypothese; garandeer geen deelnemers of inschrijvingen zonder betrouwbare partner-conversiedata.

## Hoe activeren?

1. Beantwoord de samenwerkingsaanvraag via de bestaande organisatorenpagina.
2. Controleer de officiële racepagina en identiteit van de organisator.
3. Leg afspraak, periode, evenement-ID en eventuele vergoeding intern vast in `raceatlas_commercial_campaigns`.
4. Voeg alleen na akkoord een record toe aan `docs/raceatlas/campaigns.json`: `{"eventId":"ra-0","status":"active","start":"2026-12-01","end":"2026-12-14"}`. **Dit is een voorbeeld, geen bestaande overeenkomst.**
5. Het blok verschijnt automatisch zolang de campagne actief is. De link gaat naar de reeds gecontroleerde officiële organisatorwebsite.
6. Lees het vertrouwelijke campagnerapport met `scripts/raceatlas-commercial-report.sql` als databasebeheerder.

## Rapportagegrenzen

- `promotion` telt klikken vanuit de expliciet gesponsorde plaatsing.
- `organizer` en `registration` zijn gewone doorklikken, geen verkopen.
- De statistieken bevatten geen personen, bezoeker-ID's of cookies en zijn daardoor niet geschikt voor unieke bezoekers of conversie-attributie.
- Botverkeer of herhaalde klikken kunnen de aantallen beïnvloeden. Valideer bij grotere commerciële afspraken aanvullend met de inschrijfpartner.
- Een klikmeter kan niet betrouwbaar functioneren zolang de browser-naar-Edge-API nog niet end-to-end is getest.

## Commerciële go/no-go

Begin met gesprekken; voer pas een betaalde campagne uit als de contactformulieren werken, de klikmeter end-to-end gecontroleerd is en de organiserende partij toestemming geeft voor de promotie.

## Data en toegang

- Campagnevoorwaarden staan in een private Supabase-tabel met RLS aan en geen rechten voor anon/authenticated.
- De klikmeter schrijft via een serverfunctie naar dagtotalen. De publieke website kan de private campagnerapportage niet opvragen.
- `campaigns.json` bevat alleen publiek zichtbare actieve promotie-instellingen, nooit contactgegevens of tarieven.
