# RaceAtlas — praktische activering e-mailmeldingen

**Status:** backendbroncode is gebouwd, **niet geïnstalleerd of geactiveerd**. GitHub Pages alleen kan geen achtergrondmails sturen. Er zijn geen publieke mailinglijsten en er worden nog geen mailadressen verzameld.

## Wat er gebouwd is
- `worker.js` met POST `/subscribe`, GET `/verify` en GET `/unsubscribe`
- Cloudflare Turnstile-controle (verplicht op het inschrijfformulier)
- Bevestiging per e-mail voordat herinneringen mogen worden verzonden
- E-mailprovider via Resend met sleutel **alleen server-side**
- D1-database met unieke inschrijving per e-mail en evenement en een log om dubbele e-mails te vermijden
- Geplande controle elke 15 minuten; alleen bevestigde officiële data komen in aanmerking voor definitieve datum- en wedstrijddagmeldingen
- Exacte inschrijfopening alleen wanneer een ISO-tijdstip inclusief tijdzone is opgeslagen
- Herinneringen 7 en 1 dag vooraf en op de wedstrijddag, of de inschrijfopening

## Nodig voor livegang
1. Cloudflare-account (Workers + D1) en een eigen domein/subdomein voor de API.
2. Resend-account en geverifieerd verzenddomein met SPF/DKIM/DMARC.
3. Cloudflare Turnstile-sitekey en secret. Zonder werkende CAPTCHA kan een openbaar formulier worden misbruikt.
4. Een privacyverklaring en verwerkersafspraken, plus een proces om gegevens te verwijderen/exporteren.
5. Cloudflare D1 aanmaken, `schema.sql` uitvoeren, en de echte D1-id in `wrangler.toml` invoeren.
6. Secrets `TOKEN_SECRET`, `TURNSTILE_SECRET`, `RESEND_API_KEY` instellen op de Worker, **niet** in GitHub of HTML.
7. `PUBLIC_ORIGIN`, `BASE_URL`, `MAIL_FROM` en `EVENTS_URL` goed instellen.
8. E2E-tests: dubbele inschrijving, bevestiging, afmelding, gewijzigde datum, exact openingsmoment, tijdzones, mislukte provider, rate limiting, abuse monitoring.
9. Pas daarna het e-mailinschrijfformulier in RaceAtlas activeren. Tot die tijd blijven de huidige lokale meldingsvoorkeuren en agenda-alarmen beschikbaar.

## Belangrijke beperking
De wekelijkse GitHub bronchecker controleert **alleen URL-bereikbaarheid**, geen wedstrijddatum of daadwerkelijke inschrijvingsopening. Een link met HTTP 200 bewijst geen datum. De cronmailmodule kijkt voor definitieve datummeldingen uitsluitend naar `dateEvidence: "official"`. Er moet dus een apart redactioneel of geautoriseerd proces zijn dat een officiële datum inclusief bewijs goedkeurt.

Dit is een ontwikkelimplementatie. Voor productie moeten vooral herhaalde aanvragen, eventwijzigingen, datakwaliteit, opt-in en securitytests aantoonbaar functioneren.

## Doorverwijsklikken meten — voorbereid, niet actief

De site bevat een optionele tracker in `docs/raceatlas/tracking.js`. De `ENDPOINT` is bewust leeg. Zolang dat zo is, worden **geen klikmetingen naar deze backend verzonden**.

Na goedgekeurde livegang kunnen `POST /track` en `GET /stats` worden gebruikt:
- `POST /track` accepteert een event-ID `ra-N` en één linksoort (`registration`, `organizer`, `source`); een geldige `Origin` is verplicht.
- Alleen dagelijkse totalen per evenement en linksoort worden in D1 bijgehouden. Geen namen, e-mails, IP-adressen, trackingcookies of individuele bezoekrecords worden door deze app opgeslagen.
- De hostingpartij kan wel technische verzoeklogs hebben; beoordeel bewaartermijnen en privacyinformatie voor activering.
- `GET /stats?from=YYYY-MM-DD&to=YYYY-MM-DD` is afgeschermd met een server-side `STATS_ADMIN_TOKEN` (max. 93 dagen).
- **Klikken zijn geen unieke bezoekers, geen geverifieerde inschrijvingen en geen aantoonbare conversies.** Automatische bots en misbruik zijn zonder aanvullende beveiliging niet volledig uitgesloten.
- Zet `STATS_ADMIN_TOKEN` via `wrangler secret put STATS_ADMIN_TOKEN`, nooit als JavaScript-constante of in GitHub.
- Activeer alleen nadat Worker, D1, abuse-preventie, analyticsvalidatie en privacyinformatie zijn getest. Controleer de `Origin` en CORS-configuratie vóór livegang.
- Voor externe rapportages: noem de meetperiode, definitie (uitgaande klik), hoeveel data beschikbaar is en geen claims over unieke deelnemers of registratieconversies.

## Organisatoren opvolgen

Inzendingen en vragen komen via FormSubmit op `trizentro.team@gmail.com` terecht **pas na succesvolle activatie en werkende aflevering**. Organisatoren kunnen zonder GitHub-account inzenden. Correcties vanuit de evenementdetailpagina vullen nu het privé contactformulier met naam en evenement-ID voor. Publicatie van correcties en nieuwe evenementen gebeurt pas na redactionele controle.

Aanbevolen eenvoudige inbox-werkwijze zonder extra klantgegevensbank:
1. Label binnenkomende berichten `RaceAtlas / Nieuwe aanmelding`, `RaceAtlas / Correctie` of `RaceAtlas / Samenwerking`.
2. Controleer link, naam, locatie, datum, inschrijftarieven en doublures vóór publicatie.
3. Bevestig ontvangst, vraag ontbrekende details op en houd commerciële voorwaarden buiten de publieke website.
4. Verwijder onnodige persoonsgegevens volgens een vastgestelde bewaartermijn; leg die termijn vast voordat aanmeldingen op schaal worden verwerkt.
