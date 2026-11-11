-- Internal only: run in Supabase SQL Editor as a privileged administrator.
-- Never embed this query or its results in GitHub Pages or share the email list with third parties.
-- Eligible marketing contacts: verified account email + current explicit marketing permission.
select u.email,
       p.consented_at as consent_given_at,
       p.consent_version
from public.raceatlas_marketing_preferences p
join auth.users u on u.id=p.user_id
where p.email_opt_in=true
  and p.consented_at is not null
  and p.revoked_at is null
  and u.email_confirmed_at is not null
  and u.deleted_at is null
order by p.consented_at desc;

-- Dashboard counts only, without exposing email addresses:
select (select count(*) from auth.users where email_confirmed_at is not null and deleted_at is null) as verified_accounts,
       (select count(*) from public.raceatlas_marketing_preferences
        where email_opt_in and consented_at is not null and revoked_at is null) as opted_in_marketing;
