-- RaceAtlas account foundation — apply only after creating and configuring a Supabase project.
-- No service-role key may ever be placed in GitHub Pages or committed to this repository.
create table if not exists public.raceatlas_saved_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null check (event_id ~ '^ra-[0-9]{1,8}$'),
  season_status text not null default 'interested'
    check (season_status in ('interested','registered','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.raceatlas_alert_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null check (event_id ~ '^ra-[0-9]{1,8}$'),
  email_enabled boolean not null default false,
  registration_open boolean not null default false,
  date_change boolean not null default false,
  race_reminder boolean not null default false,
  consented_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id),
  constraint consent_required check (not email_enabled or consented_at is not null)
);

alter table public.raceatlas_saved_events enable row level security;
alter table public.raceatlas_alert_preferences enable row level security;

drop policy if exists "saved_select_own" on public.raceatlas_saved_events;
create policy "saved_select_own" on public.raceatlas_saved_events
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "saved_insert_own" on public.raceatlas_saved_events;
create policy "saved_insert_own" on public.raceatlas_saved_events
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "saved_update_own" on public.raceatlas_saved_events;
create policy "saved_update_own" on public.raceatlas_saved_events
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "saved_delete_own" on public.raceatlas_saved_events;
create policy "saved_delete_own" on public.raceatlas_saved_events
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "alerts_select_own" on public.raceatlas_alert_preferences;
create policy "alerts_select_own" on public.raceatlas_alert_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "alerts_insert_own" on public.raceatlas_alert_preferences;
create policy "alerts_insert_own" on public.raceatlas_alert_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "alerts_update_own" on public.raceatlas_alert_preferences;
create policy "alerts_update_own" on public.raceatlas_alert_preferences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "alerts_delete_own" on public.raceatlas_alert_preferences;
create policy "alerts_delete_own" on public.raceatlas_alert_preferences
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Email sending must be server-side. Never expose auth.users email addresses through public tables.
-- Server-side notifier should validate explicit consent, handle deduplication and secure unsubscribe.
