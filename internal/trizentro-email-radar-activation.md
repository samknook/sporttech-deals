# TriZentro Inschrijfradar — activatie en veiligheid

Status op 12 november 2026: infrastructuur gedeployed, **e-mailaanmeldingen uitgeschakeld** tot verzending en domein zijn geverifieerd.

## Vereisten voor livegang

1. Controleer dat `trizentro.com` live is en dat `https://trizentro.com/raceatlas/alerts-beheren.html` werkt.
2. Verifieer `trizentro.com` in **Resend** volgens de verstrekte DNS-records (SPF en DKIM). Maak vervolgens een beperkte API-sleutel voor verzenden.
3. Voeg in **Supabase → Edge Functions → Secrets** de volgende waarden toe:
   - `RESEND_API_KEY`: je Resend API-sleutel.
   - `RESEND_FROM`: bijvoorbeeld `TriZentro <meldingen@trizentro.com>` **alleen nadat het domein en afzender zijn geverifieerd**.
   - `RADAR_CRON_SECRET`: sterke willekeurige geheime waarde, niet in GitHub-code of publiek JavaScript.
4. Voeg in **GitHub → Settings → Secrets and variables → Actions** de repository secret `TRIZENTRO_RADAR_CRON_SECRET` toe met **exact dezelfde** waarde.
5. Test eerst handmatig de GitHub workflow **TriZentro daily verified registration alerts**. De eerste geslaagde run vult slechts de beginsituatie en verstuurt geen wijzigingsmails.
6. Controleer vervolgens met een eigen testmailbox een aanmelding, bevestiging, een officieel geverifieerde wijziging, levering, afmelding en het uitblijven van dubbele berichten.
7. Activeer **pas na deze tests** `RADAR_EMAIL_LIVE=true` in Supabase Secrets. Laat de waarde oningesteld of `false` zolang de tests niet zijn afgerond.

## Gedrag

- Zonder verzend- en cronconfiguratie toont de website uitsluitend een eerlijke melding dat e-mails binnenkort komen.
- Aanmelding vereist een bevestigingslink die door de sporter actief wordt bevestigd (geen automatische activatie bij openen).
- Ieder adres is alleen voor gekozen evenementen ingeschreven; geen marketingtoestemming.
- Alleen geverifieerde wijzigingen in wedstrijdinfo leveren notificaties op. De eerste snapshot genereert geen mail.
- De dispatch is idempotent per event/geverifieerde wijziging/abonnee.
- E-mailadressen en tokens staan in RLS-beveiligde tabellen zonder anon/authenticated toegang.
- Dagelijkse rate-limit-digests verdwijnen na ongeveer 48 uur; onbevestigde aanvragen na 7 dagen.
- Doel is dagelijks rond 08:20 UTC; GitHub Actions schedule kan enige vertraging hebben.

## Belangrijk

Zonder een geldig Resend-domein en de hierboven genoemde secrets kan en mag de e-maildienst geen productieaanmeldingen accepteren. In de tussentijd blijven agenda-exports en lokaal opgeslagen meldingsvoorkeuren beschikbaar. De workflow-sleutel mag nooit in code worden gezet.
