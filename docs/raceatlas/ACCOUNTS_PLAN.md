## Accountdiagnose en uitgevoerde reparatie — 10 november 2026

- De Supabase Auth-logboeken bevestigen dat er een inlogmail is verzonden en daarna een e-mailverificatie/login is verwerkt. De login werd echter teruggeleid met een **referer op `http://localhost:3000`** in plaats van de RaceAtlas-website.
- De Supabase-browserbibliotheek was geladen via een niet-gedocumenteerde bestandslocatie `@supabase/supabase-js@2/dist/umd/supabase.min.js`; dit is hersteld naar de [officiële CDN-URL](https://supabase.com/docs/reference/javascript/installing) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`.
- De accountpagina toont nu specifiekere berichten bij mailfouten, rate limiting en niet-toegestane redirects. Ook worden fouten uit de terugkeerlink getoond.
- In Supabase bestaat inmiddels een geverifieerd account dat ten minste eenmaal heeft ingelogd (zonder gebruikerse-mailadressen hier te publiceren). **Dat is geen bewijs dat het GitHub Pages-accountscherm werkt.**
- **Dashboardactie vereist**, want deze connector biedt geen ondersteuning voor Hosted Auth URL Configuration:
  1. Open https://supabase.com/dashboard/project/lpzndnxloykcthbsqcet/auth/url-configuration
  2. Site URL: `https://samknook.github.io/sporttech-deals/raceatlas/`
  3. Voeg bij Redirect URLs **exact** toe: `https://samknook.github.io/sporttech-deals/raceatlas/?ra_account_preview=1`
  4. Voeg ook toe: `https://samknook.github.io/sporttech-deals/raceatlas/`
  5. Sla op en vraag **een nieuwe** inloglink aan. Oude inloglinks behouden hun oorspronkelijke redirect.
- Indien de e-mailtemplate zelf hardcodeert naar `{{ .SiteURL }}`, pas die aan naar `{{ .RedirectTo }}` voor het gebruik van de exacte door de client opgegeven redirect (zie Supabase-docs). Gebruik bij voorkeur de standaard Supabase magic-linktemplate.
- **Niet publiek inschakelen** totdat een nieuwe login landt op GitHub Pages en bewaring van een wedstrijd in Supabase na een reload beschikbaar blijft.

## Testtoegang accounts — 10 november 2026

- Publieke login staat bewust **uit** (`enabled:false`), maar gebruikers kunnen een expliciete **QA-preview** openen via:
  `https://samknook.github.io/sporttech-deals/raceatlas/?ra_account_preview=1`.
- `previewEnabled:true` in `account-config.js` activeert alleen voor deze link de bestaande UI. Dit is **geen toegangsbeveiliging**: iedereen met de testlink kan de login proberen. De Supabase RLS beveiligt echte gebruikersgegevens.
- Magic-link-login behoudt de queryparameter `ra_account_preview=1` in het callbackadres, zodat testers na terugkomst nog toegang hebben.
- De geconfigureerde toegestane Supabase Auth-redirect moet de URL **inclusief eventuele queryparameter** accepteren. Gebruik bijvoorbeeld `https://samknook.github.io/sporttech-deals/raceatlas/**` als passende toegestane redirect, en beperk overige origins. Stel als site-URL `https://samknook.github.io/sporttech-deals/raceatlas/` in.
- Controleer de e-mailtemplate en verzending voordat de publieke vlag op `enabled:true` wordt gezet. De huidige toolkoppeling kan de hosted Supabase Auth-configuratie niet wijzigen.
- Test eerst met een eigen testadres: e-maillink, geldige sessie na refresh, lokale import, cloud-sync, uitloggen, meldingsvoorkeuren en accountverwijdering.
- Geef de testlink **niet als productieaccount** aan bezoekers totdat een volledige twee-gebruikers-RLS-test is geslaagd.

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

## Update — accountverwijdering (10 november 2026)

- Edge Function `raceatlas-delete-account` is **actief gedeployed** in het EU-Supabase-project met `verify_jwt: true`.
- De functie accepteert uitsluitend POST, eist een exacte bevestigingszin, verifieert de ingelogde gebruiker tegen Supabase Auth en verwijdert uitsluitend **die** Auth-gebruiker. De bestaande on-delete-cascade-regels verwijderen daardoor zijn/haar seizoen en meldingsvoorkeuren.
- Service-role-sleutels komen alleen uit de serveromgeving en worden niet naar de browser gestuurd.
- Accountscherm heeft nu `Verwijder mijn account definitief` met expliciete tekstbevestiging.
- **Nog niet end-to-end getest** met een echt testaccount. Gebruik de functie niet als volledig gevalideerd totdat een testaccount is verwijderd en gekoppelde gegevens zijn verdwenen.
- De accountmodule blijft uitgeschakeld voor het publiek totdat Auth redirects en mail zijn gecontroleerd.
- 22 accountgerelateerde codechecks uitgevoerd; alle 22 geslaagd. Dit is geen vervanging voor de echte gebruikers- en beveiligingstests.

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
