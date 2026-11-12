-- RaceAtlas: private organizer campaign performance (run as owner / service_role only).
-- Clicks are aggregated action events, NOT unique people or verified registrations.
-- Never expose this report, organizer pricing or organization names to anon clients.
select c.campaign_id, c.organization_name, c.event_id, c.status,
       c.start_day, c.end_day, c.agreed_amount_eur,
       coalesce(sum(d.clicks) filter(where d.kind='promotion'),0)::integer as sponsored_outbound_clicks,
       coalesce(sum(d.clicks) filter(where d.kind='organizer'),0)::integer as regular_organizer_link_clicks,
       coalesce(sum(d.clicks) filter(where d.kind='registration'),0)::integer as regular_registration_link_clicks
from public.raceatlas_commercial_campaigns c
left join public.raceatlas_outbound_click_daily d
  on d.event_id=c.event_id and d.day>=c.start_day and d.day<=c.end_day
group by c.campaign_id,c.organization_name,c.event_id,c.status,c.start_day,c.end_day,c.agreed_amount_eur
order by c.created_at desc;

-- Daily trends for a specific event and campaign period can be queried as:
-- select day,kind,clicks from public.raceatlas_outbound_click_daily
-- where event_id = 'ra-0' and day between date '2026-11-01' and date '2026-11-30' order by day;
