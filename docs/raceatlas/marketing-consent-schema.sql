-- Live schema applied to Supabase project RaceAtlas on 2026-11-11.
-- Record of explicit commercial opt-in, separate from authentication and race alerts.
create table if not exists public.raceatlas_marketing_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email_opt_in boolean not null default false,
 consent_version text not null default '2026-11',
 consented_at timestamptz,
 revoked_at timestamptz,
 updated_at timestamptz not null default now(),
 constraint marketing_explicit_consent check ((email_opt_in and consented_at is not null and revoked_at is null) or not email_opt_in)
);
alter table public.raceatlas_marketing_preferences enable row level security;
drop policy if exists marketing_select_own on public.raceatlas_marketing_preferences;
create policy marketing_select_own on public.raceatlas_marketing_preferences for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists marketing_insert_own on public.raceatlas_marketing_preferences;
create policy marketing_insert_own on public.raceatlas_marketing_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists marketing_update_own on public.raceatlas_marketing_preferences;
create policy marketing_update_own on public.raceatlas_marketing_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists marketing_delete_own on public.raceatlas_marketing_preferences;
create policy marketing_delete_own on public.raceatlas_marketing_preferences for delete to authenticated using ((select auth.uid()) = user_id);
grant select,insert,update,delete on public.raceatlas_marketing_preferences to authenticated;
revoke all on public.raceatlas_marketing_preferences from anon;

-- Server clock is authoritative for opt-in and revocation time (not browser clock).
create or replace function public.raceatlas_stamp_marketing_consent()
returns trigger language plpgsql set search_path = '' as $$
begin
 new.updated_at:=now();
 if tg_op='INSERT' then
  if new.email_opt_in then new.consented_at:=now();new.revoked_at:=null;
  else new.consented_at:=null;new.revoked_at:=null;end if;
 elsif new.email_opt_in is distinct from old.email_opt_in then
  if new.email_opt_in then new.consented_at:=now();new.revoked_at:=null;
  else new.consented_at:=old.consented_at;new.revoked_at:=now();end if;
 else
  new.consented_at:=old.consented_at;new.revoked_at:=old.revoked_at;new.consent_version:=old.consent_version;
 end if;
 return new;
end
$$;
drop trigger if exists raceatlas_stamp_marketing_consent_trigger on public.raceatlas_marketing_preferences;
create trigger raceatlas_stamp_marketing_consent_trigger
before insert or update on public.raceatlas_marketing_preferences for each row
execute function public.raceatlas_stamp_marketing_consent();
