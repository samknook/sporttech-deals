# RaceAtlas — privé verkeer- en evenementenstatistieken

**Ingericht op 12 november 2026.** Metingen beginnen pas wanneer de nieuwe publieke websiteversie is uitgerold en daadwerkelijk door iemand wordt bezocht.

## Wat wordt gemeten?

| Metric | Betekenis | Telt per |
|---|---|---|
| `site_view` | RaceAtlas-pagina geladen op het publieke domein | Paginalading |
| `card_view` | Wedstrijdkaart minimaal 25% zichtbaar in de viewport | Maximaal één keer per evenement per paginalading |
| `detail_view` | Wedstrijddetails geopend | Openen van detailvenster |
| `organizer` | Doorklik naar organisatorsite | Klik |
| `registration` | Doorklik naar inschrijfpagina | Klik |
| `promotion` | Doorklik via betaald gemarkeerd promotieblok | Klik |
| `source` | Doorklik via bronverwijzing met trackingattribuut | Klik |

De metingen kunnen bots, herhaalde bezoeken en herhaalde klikken bevatten. **Er wordt geen unieke bezoeker geteld en geen conversie naar betaalde inschrijving bewezen.** Geen user-ID, cookie, IP of individueel klikrecord wordt in de RaceAtlas-aggregatietabel opgeslagen. Supabase/hosting kunnen eigen technische logs bewaren.

## Geschatte unieke bezoekers per dag (toegevoegd)

Naast de bestaande ruwe interactietellers levert RaceAtlas nu een **dagelijkse schatting van unieke bezoekers**, voor `site_view`, `card_view` en `detail_view`:

- De Supabase Edge Function leidt dagelijks een andere pseudonieme HMAC-code af uit netwerkadres en browserinformatie. Er worden geen trackingcookies of blijvende browser-ID's geplaatst.
- Alleen de korte hash wordt maximaal ongeveer twee kalenderdagen bewaard, om herhaalde acties op dezelfde dag per evenement te ontdubbelen. Het ruwe IP-adres en de volledige User-Agent komen niet in onze analytische tabellen terecht; hostingproviders kunnen wel eigen technische logs bewaren.
- `pg_cron` verwijdert de korte hashes iedere nacht om 03:17 UTC, naast opruimen tijdens dataverwerking.
- De `raceatlas_daily_unique_totals`-tabel houdt uitsluitend **dagtotalen van geschatte unieke bezoekers** bij. Alleen beheerders kunnen deze lezen.
- Als iemand twee keer op dezelfde dag komt, telt dit meestal als één dagelijkse bezoeker. Gedeeld IP + browser kan personen samenvoegen; verschillende apparaten kunnen één persoon meerdere keren tellen.
- **Let op:** `sum(unique_count)` over 7/30 dagen telt dagelijkse unieke bezoeken bij elkaar; dit is **niet** het aantal verschillende mensen over die hele periode.
- De `site_view`-teller kan nog nul tonen voor een dag waarop de backend pas ná eerdere paginabezoeken werd geactiveerd. De nieuwe teller werkt niet met terugwerkende kracht.

De SQL-query's staan in `scripts/raceatlas-traffic-report.sql`. Juridische toetsing van deze serverzijdige, kortstondige pseudonieme gegevensverwerking blijft nodig voor een brede commerciële lancering.

## Inzien (alleen beheerder)

1. Ga naar de [Supabase SQL Editor](https://supabase.com/dashboard/project/lpzndnxloykcthbsqcet/sql).
2. Voer `select * from public.raceatlas_site_traffic_summary;` uit voor bezoeken vandaag, in de laatste 7 dagen en in de laatste 30 dagen.
3. Voer `select * from public.raceatlas_event_traffic_30d order by detail_views desc,card_views desc;` uit voor **elk evenement**, inclusief races zonder gemeten verkeer.
4. Zie `scripts/raceatlas-traffic-report.sql` voor een volledig rapport en daghistorie.

Deze rapportage is bewust niet publiek en niet gekoppeld aan het uitgeschakelde bezoekersaccountsysteem. De views zijn afgeschermd met privileges en RLS. Een betaalde organisator kan later een overeengekomen rapport van zijn eigen campagne ontvangen.

## Implementatie

- Bron: `docs/raceatlas/tracking.js`, `details.js` en wedstrijdkaarten in `index.html`.
- Database: `public.raceatlas_outbound_click_daily` slaat uitsluitend aantallen per dag, evenement en actie op; `ra-site` is het aparte totaal voor paginaladingen.
- Backend: `raceatlas-track-outbound` Supabase Edge Function, server-side schrijfrechten.
- Rapporten: `raceatlas_site_traffic_summary`, `raceatlas_event_traffic_30d`, beide alleen toegankelijk voor bevoegde beheerders.
- Website- en eventstatistieken blijven 0 totdat het publieke script in een productiebezoek is geladen en de API-verwerking geslaagd is.

## Test en opsporing

- Kijk of `tracking.js?v=20261112-traffic1` wordt geladen.
- In browser DevTools → Network controleer verzoeken aan `raceatlas-track-outbound`, inclusief status 202.
- Een bezoek telt als `ra-site/site_view`; een racekaart in beeld als `ra-.../card_view`; het detailvenster als `ra-.../detail_view`.
- 403 betekent dat het verwachte `Origin`-header of domein niet klopt; 503 kan een server- of databaseprobleem betekenen.
- Verifieer daarna dat dagtotalen stijgen met een SQL-query. Een succesvolle GitHub commit is **geen** bewijs van ontvangst door de backend.

**Let op:** er is geen cookieconsent-banner toegevoegd omdat deze meetaanpak geen trackingcookies gebruikt; laat de juridische privacy- en cookie-eisen voor de uiteindelijke lancering beoordelen.
