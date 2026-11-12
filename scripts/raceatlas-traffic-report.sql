-- RaceAtlas PRIVATE analytics: run in Supabase SQL Editor as project owner.
-- Counts page loads, visible race cards, detail opens and outbound interactions.
-- These are NOT unique visitors, confirmed registrations or bot-filtered analytics.

-- 1. Overview today, rolling 7 days and rolling 30 days.
select * from public.raceatlas_site_traffic_summary;

-- 2. Every race (including those with 0 activity in the last 30 days).
select event_id,coalesce(event_name,'Automatic event '+event_id) as event_name,
       sport,race_date,card_views,detail_views,
       organizer_clicks,registration_clicks,sponsored_clicks,total_outbound_clicks
from public.raceatlas_event_traffic_30d
order by detail_views desc,card_views desc,event_id asc;

-- 3. Daily RaceAtlas page loads, last 30 days.
select day,clicks as pageviews
from public.raceatlas_outbound_click_daily
where event_id='ra-site' and kind='site_view'
  and day>=(now() at time zone 'UTC')::date - 29
order by day desc;

-- 4. Daily event interaction timeline (replace ra-0 with any real event ID).
select day,
 coalesce(sum(clicks) filter (where kind='card_view'),0)::integer as card_views,
 coalesce(sum(clicks) filter (where kind='detail_view'),0)::integer as detail_views,
 coalesce(sum(clicks) filter (where kind in ('organizer','registration')),0)::integer as organizer_or_registration_clicks
from public.raceatlas_outbound_click_daily
where event_id='ra-0'
group by day order by day desc limit 90;

-- 5. Estimated daily unique visitors (site overall), per-day, NOT cross-day people.
select day,unique_count as estimated_daily_unique_visitors
from public.raceatlas_daily_unique_report
where event_id='ra-site' and kind='site_view'
order by day desc limit 30;

-- 6. Unique viewers estimated per event and view type, today / last 30 days.
-- Rolling 30-day totals sum daily uniques: one returning person on two days counts twice.
select e.event_id,e.event_name,
 coalesce(sum(u.unique_count) filter(where u.kind='card_view'),0)::integer as sum_daily_unique_card_viewers_30d,
 coalesce(sum(u.unique_count) filter(where u.kind='detail_view'),0)::integer as sum_daily_unique_detail_viewers_30d
from public.raceatlas_event_intelligence e
left join public.raceatlas_daily_unique_report u
 on e.event_id=u.event_id and u.day >= (now() at time zone 'UTC')::date - 29
group by e.event_id,e.event_name
order by sum_daily_unique_detail_viewers_30d desc,e.event_name;

-- 7. Daily site total, estimated uniques and views to compare repeated visits.
select m.day,
 max(m.clicks) filter(where m.event_id='ra-site' and m.kind='site_view') as pageviews,
 max(u.unique_count) filter(where u.event_id='ra-site' and u.kind='site_view') as estimated_unique_visitors
from public.raceatlas_outbound_click_daily m
left join public.raceatlas_daily_unique_report u
 on u.day=m.day and u.event_id='ra-site' and u.kind='site_view'
where m.event_id='ra-site' and m.kind='site_view'
group by m.day order by m.day desc limit 30;
