# RaceAtlas — optionele accounts en e-mailmeldingen (implementatieplan)

## Werkelijke projectstatus — 10 november 2026

- Supabase-project **RaceAtlas** is aangemaakt binnen organisatie Raceplan in **eu-central-1 (Frankfurt)**.
- Projectdashboard: https://supabase.com/dashboard/project/lpzndnxloykcthbsqcet
- SQL-migratie `raceatlas_private_season_and_alerts` is toegepast; beide tabellen zijn aanwezig en RLS is ingeschakeld.
- Zowel `anon` als `authenticated` toegangsrechten zijn gecontroleerd: anonieme bezoekers hebben geen SELECT-recht; ingelogde gebruikers wel, met RLS-beperking tot eigen rijen.
- Supabase security advisors gaven **geen waarschuwingen** tijdens de eerste controle. Dit vervangt geen praktijktest met twee verschillende gebruikers.
- `docs/raceatlas/account-config.js` bevat nu uitsluitend de **publieke** project-URL en publishable key. `enabled:false` blijft staan totdat authenticatie en e-mail zijn getest.
- De accounttabellen bevatten nog geen echte gebruikersgegevens.

## Update — meldingsvoorkeuren voorbereid

- `account.js` bevat nu een accountscherm met **aparte opt-in per opgeslagen evenement** voor inschrijfopeningen, datumwijzigingen en wedstrijdherinneringen.
- Meldingsvoorkeuren worden opgeslagen in `raceatlas_alert_preferences`, nooit in lokale browseropslag; het geverifieerde e-mailadres komt uit Supabase Auth.
- **Nog geen mails:** de UI vermeldt expliciet dat automatische e-mailverzending niet actief is.
- De database heeft nu ook een samengestelde foreign key van meldingsvoorkeur naar bewaarde wedstrijd met `ON DELETE CASCADE`, plus een check dat een ingeschakelde melding minimaal één type bevat.
- Na de aanvullende migratie zijn de beveiligingsadviezen opnieuw geraadpleegd en gaven ze geen waarschuwingen.
- De 20 accountregressiecontroles zijn direct op de repositorycode uitgevoerd; browsertests en echte twee-account-toegangstests blijven verplicht.

## Nog vereist voor activatie

1. Ga naar [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/lpzndnxloykcthbsqcet/auth/url-configuration) en stel **Site URL** in op `https://samknook.github.io/sporttech-deals/raceatlas/`; voeg dezelfde exacte URL toe aan de redirect-allowlist.
2. Stel een geverifieerde SMTP-afzender in via de [Supabase Auth-instellingen](https://supabase.com/dashboard/project/lpzndnxloykcthbsqcet/auth/providers). Zonder betrouwbare mailverzending niet publiek inschakelen.
3. Test het e-mailinloggen daadwerkelijk op een toestel en controleer na opnieuw laden de sessie.
4. Test met **twee afzonderlijke accounts** dat gebruiker A geen gegevens van gebruiker B kan lezen, bijwerken of verwijderen.
5. Test favorietenimport, snel bewaren/verwijderen, statuswijziging, uitloggen, export en verwijderen van het seizoen.
6. Voer accountverwijdering en privacyverklaring uit vóór publieke lancering; schakel daarna pas `enabled:true` in.

Opmerking: de connector biedt nu project-, migratie- en SQL-beheer, maar geen directe wijzigingsactie voor gehoste Auth Site URL/redirect-allowlist of custom SMTP-configuratie. Die instellingen moeten in het dashboard worden bevestigd.


## Productbesluit
- **Geen account verplicht** voor zoeken, bekijken, lokaal bewaren en kalenderexport.
- Gratis account met e-mail magic link, geen wachtwoord en geen publieke gebruikersprofielen.
- Met account: bewaarde wedstrijden synchroniseren tussen apparaten, zelf inschrijfstatus kiezen, notificaties per wedstrijd beheren.
- E-mailmeldingen **apart en standaard uit**; alleen na expliciete keuze. Geen marketing zonder aparte toestemming.
- De huidige lokale favorieten blijven bestaan; bij eerste login een expliciete keuze om ze naar het account te importeren, met deduplicatie.
- Toon pas een echte login-UI nadat backend, mailverzending, privacydocumentatie en accountverwijdering werken. Geen schijnfunctionaliteit.

## Aanbevolen stack
- Bestaande statische GitHub Pages-frontend behouden.
- Supabase Auth (magic link), Postgres en Row Level Security.
- Supabase Edge Function/vertrouwde server voor het verwerken van gewijzigde eventdata en verzenden van notificaties.
- Resend of andere geverifieerde e-mailprovider voor login- en eventmail. Configureer custom SMTP voor Supabase Auth; de ingebouwde provider is niet voor publieke productie.
- Publieke project-URL en **publishable/anon key** mogen in frontendconfiguratie, mits RLS getest is. Nooit service-role secrets of mailprovider-API-sleutels in de frontend.

## Gegevens
- Supabase auth.users beheert e-mailadressen (geen eigen publieke e-mailtabel).
- raceatlas_saved_events: user_id, event_id, status (interested, registered, completed).
- raceatlas_alert_preferences: per evenement en meldingstype, expliciet opt-in, consented_at.
- Alleen minimale gegevens, geen geboortedatum of postadres nodig.
- Een race-event-ID is een verwijzing naar de publieke kalender; backend controleert bij wijzigingen of het event nog bestaat.

## Meldingsmomenten
1. Inschrijving opent: alleen bij officieel bevestigde exacte datum; herinnering optioneel 7 dagen tevoren en op openingsdag.
2. Datum of locatie gewijzigd: alleen bij geverifieerde inhoudelijke wijziging, met link naar organisator.
3. Wedstrijd nadert: optioneel 7 dagen of 1 dag vooraf, niet dubbel verzenden.
4. Prijs/inschrijfstatus onzeker: **geen** bericht dat de inschrijving officieel open is.
5. Eventuele wekelijkse samenvatting pas als optionele nieuwe voorkeur, niet direct inschakelen.

## Veiligheid en compliance
- E-mailadres verifiëren via magic link en specifieke redirect allowlist.
- Zorg voor anti-abuse/rate limiting, privacyverklaring, bewaartermijnen, export en volledige accountverwijdering.
- Implementatie via SQL-migratie `docs/raceatlas/account-schema.sql`. Test dat gebruiker A nooit de data van B kan lezen of aanpassen (RLS).
- Afmelden moet met één klik mogelijk zijn vanuit elke melding, zonder inlogdrempel; token veilig server-side valideren.
- Voorkom dat een algemeen GitHub Pages-script een server-side secret bevat.
- Uitgaande e-mails vereisen een gecontroleerd afzenderdomein en SPF/DKIM/DMARC-configuratie.
- Bij accountverwijdering verwijderen cascade-regels opgeslagen evenementen en meldingsvoorkeuren.

## Uitrolvolgorde
1. Eigen domein en redirect-URL vaststellen; Supabase-project aanmaken en Auth + SMTP inrichten.
2. SQL toepassen, RLS met twee testaccounts controleren.
3. Frontend-inlog, loguit, synchronisatie en expliciete import vanaf localStorage bouwen.
4. Beveiligde verzender implementeren; eerst testmail naar gecontroleerd adres, daarna opt-in en afmeldlink end-to-end testen.
5. Accountverwijdering, privacyverklaring, foutafhandeling en mobiele browserproeven afronden.
6. Pas dan accounts publiek activeren.

## Kosten
Kleinschalig starten kan vaak binnen de gratis quotumgrenzen, maar exacte kosten hangen af van gebruikersaantallen en e-mailvolume. Supabase's ingebouwde Auth-mailservice is niet geschikt voor openbare productie; eigen SMTP/provider is vereist.
