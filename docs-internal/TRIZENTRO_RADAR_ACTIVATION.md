# TriZentro Inschrijfradar — activatiechecklist
Status: **veilig voorbereid, e-mailverzending uitgeschakeld** totdat alle checks groen zijn.

## Doel
Een sporter kan zich per wedstrijd aanmelden met een e-mailadres, moet dit bevestigen en kan zich uit iedere mail afmelden. Dit is **geen toestemming voor commerciële e-mails**.

## Productievoorwaarden
1. Koppel eerst de eigen domeinnaam via GitHub Pages en valideer HTTPS voor `https://trizentro.com/raceatlas/` en de beheerpagina `/raceatlas/alerts-beheren.html`.
2. Verifieer `trizentro.com` bij een transactionele mailprovider zoals Resend met de gevraagde DNS-records. Controleer DKIM/SPF en kies een geldig afzenderadres, bijvoorbeeld `meldingen@trizentro.com` (alleen na domeinverificatie).
3. Zet in **Supabase Edge Function secrets**:
   - `RESEND_API_KEY` — actieve provider API-sleutel
   - `RESEND_FROM` — geverifieerd afzenderadres
   - `RADAR_CRON_SECRET` — lange, willekeurige secret (niet publiceren)
   - `RADAR_EMAIL_LIVE=true` **pas nadat alles is getest**.
4. Zet dezelfde secret als repository Actions secret `TRIZENTRO_RADAR_CRON_SECRET` in GitHub. Controleer de dagelijkse workflow `.github/workflows/trizentro-radar-email.yml`.
5. Start een handmatige cron-test om snapshots van huidige wedstrijdinformatie te vullen. **Eerste run is een baseline; geen nieuwsbericht.** Controleer dat de functie `ok:true` meldt.
6. Test met een eigen mailbox: aanvraag, ontvangst, bevestiging, één officiële bronwijziging, één meldingsmail, afmelden vanuit die mail. Controleer dat een tweede run dezelfde melding niet opnieuw stuurt en dat oude afmeldlinks bruikbaar blijven.
7. Controleer bounce/spamverwerking bij de provider, de verzendlimieten en de beveiligde database-tabellen. Promoot de functie pas na een geslaagde end-to-end-test.

## Beveiliging
- Alleen de vertrouwde website-origin is toegestaan.
- Nieuwe adressen staan privé, niet publiek uitleesbaar; geen marketing-opt-in impliciet.
- Verzoeken zijn beperkt per dag. Na 48 uur vervalt een onbevestigde confirmatielink.
- De cronfunctie vereist `x-radar-secret`, heeft geen publieke, onbeveiligde lijst van abonnee-adressen en is fail-closed wanneer e-mail uitstaat.
- De automatische verzending is beperkt tot nieuw gecontroleerde informatie op basis van officiële organisatorbronnen. Onbevestigde hints en alleen een inschrijflink leveren geen alert op.
- De eerste cronrun bouwt alleen de referentiestatus op. Veranderingen worden daarna gededupliceerd.
- Zonder actieve mailconfig blijven bestaande kalenderherinneringen beschikbaar, maar wordt het aanmeldformulier niet getoond.

## Huidige beperkingen
- De UI en backend zijn gebouwd, maar de echte bezorging is **nog niet geverifieerd**; claim geen actieve e-mailmeldingen.
- De websitecode kan pas volledig geverifieerd worden nadat het eigen domein en HTTPS werken.
- De privacyverklaring moet voor activering melden hoe lang e-mailadressen, bevestigingsgegevens en uitschrijvingen bewaard blijven.
- Unieke bezoekersstatistieken en e-mailadressen mogen niet voor andere doelen worden samengevoegd zonder passende grondslag en toestemming.
