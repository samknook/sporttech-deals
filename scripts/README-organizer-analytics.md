# TriZentro – interne organisatorenrapportage

## Uitvoer

De rapportgenerator maakt met één commando:
- `trizentro-intern-dashboard.html`: privé/offline overzicht met KPI's, dagelijkse uitgaande klikken, zoeken en links naar individuele rapporten.
- `trizentro-rapport-ra-XXXX.html`: één deelbaar rapport per wedstrijd.
- `trizentro-organisatoren-overzicht.csv`: overzicht voor Excel/Sheets.

Er worden **geen unieke bezoekers, inschrijvingen of omzet** gemeten. De getallen zijn geaggregeerde browseracties. Een klik naar de organisator is geen bevestigde inschrijving. Een bezoeker kan meerdere keren klikken.

## Gegevens exporteren

Haal een JSON-object op met de velden `periodStart`, `periodEnd`, `events`, `daily`. De periode moet expliciet worden ingesteld; aggregaten in `events` moeten op dezelfde periode gebaseerd zijn als `daily`.

Voorbeeld:

```json
{
  "periodStart":"2026-11-01",
  "periodEnd":"2026-11-30",
  "events":[
    {"event_id":"ra-423","event_name":"Voorbeeldwedstrijd",
     "card_views":15,"detail_views":5,
     "organizer_clicks":3,"registration_clicks":0,"sponsored_clicks":0}
  ],
  "daily":[
    {"day":"2026-11-14","event_id":"ra-423","kind":"organizer","clicks":3}
  ]
}
```

Gebruik bij voorkeur de interne Supabase-query op `raceatlas_outbound_click_daily`. Controleer dat eventnamen overeenkomen met `raceatlas_event_intelligence` en dat alleen aggregaten worden geëxporteerd. Voeg geen e-mailadressen, sessies, IP-adressen, toegangstokens of service-role keys toe.

## Genereren

```bash
node scripts/build-trizentro-organizer-report.cjs organizer-input.json organizer-output
```

Open `organizer-output/trizentro-intern-dashboard.html` lokaal. De zoekfunctie werkt zonder internet. De interne pagina wordt **niet** automatisch op de openbare website gepubliceerd, omdat de generator in `scripts/` staat en de uitvoer buiten de GitHub Pages-map wordt geschreven.

Open voor een organisator uitsluitend zijn eigen `trizentro-rapport-ra-XXXX.html` en gebruik de printknop om een PDF te maken. Deel niet de interne totaaldashboard-export.

## Privacy en betrouwbaarheid

Kaartweergaven zijn geen unieke personen. Detailweergaven zijn gemeten acties en kunnen door browserblokkeringen ontbreken. Het overzicht met uitgaande klikken gebruikt alleen `organizer` en `registration`-acties. Tijdvakken moeten identiek zijn bij vergelijkingen. Bij 0 detailweergaven is een klikratio niet toepasbaar.

## Automatische tests

```bash
node tests/test-trizentro-organizer-report.cjs
node tests/test-trizentro-organizer-dashboard.cjs
```
