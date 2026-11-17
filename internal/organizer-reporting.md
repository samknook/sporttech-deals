# TriZentro — rapportages voor organisatoren

## Wat wordt gemeten?
- card_view: een wedstrijdkaart is zichtbaar in de browser.
- detail_view: een evenementdetailpagina of detailweergave is geopend.
- organizer: klik naar een link van de organisator.
- registration: klik naar een afzonderlijk gemarkeerde inschrijflink.
- promotion: klik naar een promotielink.

Deze gegevens tellen acties, **geen unieke bezoekers of bevestigde inschrijvingen**. Dezelfde bezoeker kan meermaals klikken. Browserinstellingen kunnen aantallen onderschatten. De indicatieve klikratio is geen conversiepercentage.

## Gegevens exporteren (uitsluitend intern)
Voer onderstaande SQL uit in het beveiligde Supabase-project. De outputkolom report_json is de JSON-invoer voor het script. Het rapport kijkt naar de laatste 30 kalenderdagen inclusief vandaag.

```sql
with bounds as (select (current_date-29)::date as start_day,current_date::date as end_day),
daily as (
 select d.day,d.event_id,d.kind,d.clicks from public.raceatlas_outbound_click_daily d,bounds b
 where d.day between b.start_day and b.end_day and d.event_id ~ '^ra-[0-9]{1,8}$'
 and d.kind in ('card_view','detail_view','organizer','registration','promotion','source')
), agg as (
 select event_id,
 coalesce(sum(clicks) filter(where kind='card_view'),0) card_views,
 coalesce(sum(clicks) filter(where kind='detail_view'),0) detail_views,
 coalesce(sum(clicks) filter(where kind='organizer'),0) organizer_clicks,
 coalesce(sum(clicks) filter(where kind='registration'),0) registration_clicks,
 coalesce(sum(clicks) filter(where kind='promotion'),0) sponsored_clicks
 from daily group by event_id
)
select jsonb_build_object(
 'periodStart',to_char(b.start_day,'YYYY-MM-DD'),
 'periodEnd',to_char(b.end_day,'YYYY-MM-DD'),
 'events',coalesce((
 select jsonb_agg(jsonb_build_object(
 'event_id',a.event_id,'event_name',coalesce(i.event_name,a.event_id),
 'card_views',a.card_views,'detail_views',a.detail_views,
 'organizer_clicks',a.organizer_clicks,'registration_clicks',a.registration_clicks,
 'sponsored_clicks',a.sponsored_clicks) order by a.event_id)
 from agg a left join public.raceatlas_event_intelligence i on i.event_id=a.event_id
 ),'[]'::jsonb),
 'daily',coalesce((
 select jsonb_agg(jsonb_build_object(
 'event_id',d.event_id,'day',to_char(d.day,'YYYY-MM-DD'),
 'kind',d.kind,'clicks',d.clicks) order by d.day,d.event_id,d.kind) from daily d
 ),'[]'::jsonb)
) as report_json from bounds b;
```

Bewaar uitsluitend de waarde van report_json als organizer-input.json (geen SQL-wrapper, geen geheime sleutels).

```bash
node scripts/build-trizentro-organizer-report.cjs organizer-input.json organizer-output
```

De uitvoermap bevat een HTML-rapport per evenement en een CSV-overzicht. Open het HTML-rapport en kies Print of bewaar als pdf. Deel alleen het rapport van de betreffende organisator. Alle tellingen zijn geaggregeerd, niet-persoonlijk.

**Niet claimen:** unieke bezoekers, daadwerkelijke registraties, omzet of gegarandeerde conversies. Lage aantallen zijn geen bewijs van gebrek aan interesse. Controleer voor verzending de periode, event-identiteit en actie-tags op organisatorlinks.