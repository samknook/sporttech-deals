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
