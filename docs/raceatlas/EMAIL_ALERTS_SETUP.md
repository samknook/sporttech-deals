# RaceAtlas: automatische wedstrijdmeldingen

Status: prototype met lokale voorkeuren en downloadbare agenda-alarmen. Automatische e-mails zijn NOG NIET ACTIEF.

## Doel en gewenste gebeurtenistypen
1. Officiële wedstrijddatum is voorheen onbekend en wordt bevestigd: één melding aan ingeschreven volgers.
2. Officiële inschrijfopening is bekend geworden: één aankondiging.
3. Zodra de inschrijfopening binnen 7 dagen valt: herinnering 7 dagen vooraf, 1 dag vooraf en op de openingsdag.
4. Zodra de wedstrijd binnen 7 dagen valt: optionele herinnering 7 dagen vooraf, 1 dag vooraf en op de wedstrijddag.

## Huidig beschikbaar
- Bezoeker kiest per wedstrijd lokale voorkeuren (localStorage, geen account).
- Download van .ics voor reeds bekende evenementdatum en eventuele handmatig opgenomen registrationDate.
- Kalenderapp beslist zelf of en hoe meldingen op het apparaat verschijnen.

## Vereisten om echte e-mails te activeren
- Externe database (bijvoorbeeld Supabase/Postgres) met gebruikers, expliciet bevestigde adressen, voorkeuren, evenementen, eventwijzigingen en verzendlog.
- Serverless API (niet GitHub Pages) die e-mailaanvragen afhandelt, adressen bevestigt (double opt-in), identificatie controleert, aanvragen rate-limitt en afmeldlinks verwerkt.
- Transactionele e-mailprovider met SPF/DKIM/DMARC en server-side API-sleutel, uitsluitend in geheime instellingen.
- Een dagelijks of frequenter automatisch proces dat verifieerbare officiële datumwijzigingen verwerkt.
- Idempotente unieke sleutel voor event_id + subscriber_id + notification_type + target_date om dubbel versturen te voorkomen.
- Persoonlijke tijdzone per abonnee; uitgaan van Europe/Amsterdam wanneer expliciet gekozen.
- Bron-URL, updated_at, verificatiestatus en wijzigingshistorie bij ieder evenement.
- Geen persoonsgegevens in openbare GitHub-bestanden of client-side ingebouwde API-sleutels.
- AVG: privacyverklaring, dataminimalisatie, bewaartermijnen, export/verwijderen, verwerkersafspraken.

## Datumstatus
Gebruik expliciet:
- event_date: ISO datum of null
- event_date_status: confirmed | provisional | unknown
- registration_open_at: ISO tijd met tijdzone of null
- registration_status: confirmed | provisional | unknown

Trigger geen e-mail op voorlopige of onbekende datum. Een verschoven datum moet worden behandeld als correctiemelding, niet als nieuwe inschrijving.

## Publicatie
Voor live e-mails is nog een door eigenaar gekozen database-, hosting- en e-mailaccount nodig. Niet claimen dat berichten worden verstuurd voordat ontvangst en afmelding end-to-end zijn getest.
