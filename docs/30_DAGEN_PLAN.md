# SportTech Deals — uitvoeringsplan eerste 30 dagen

**Bijgewerkt: 4 november 2026. Eigenaar: samknook.**

**Strategische aanvulling 4 november 2026:** dit oorspronkelijke plan richtte zich op affiliatie. De actuele prioriteitsverdeling is **70% gratis/digitale sporttools en 30% affiliate**. Zie [de recentere 8-weekse validatiestrategie](STRATEGIE_2_VERDIENMODELLEN.md). Het plan hieronder blijft bruikbaar voor het affiliategedeelte, maar heeft niet meer de hoogste prioriteit.


**Richting:** onafhankelijke Nederlandstalige koopgids en daarna een prijsvergelijker, eerst voor Garmin- en Wahoo-fietscomputers. Geen dropshipping, geen voorraad, geen directe klantenservice als kernactiviteit.

## Beslisregels

1. **Geen voorbarige uitgaven:** vóór aankoop van een domein eerst SIDN beschikbaarheidscheck en KVK/BOIP Naamchecker. Geen betaalde advertenties zolang we geen betrouwbare affiliateprogramma's en conversiedata hebben.
2. **Geen nepaanbiedingen:** toon pas winkelprijzen wanneer die afkomstig zijn uit geautoriseerde productfeeds. Vermeld toestemming, datum, totaalkosten en commerciële relatie duidelijk.
3. **Weinig beheer:** statische website op GitHub Pages, automatisering voor feedcontrole en prijsupdates, menselijk eindcontrolepunt voor twijfelgevallen.
4. **Niche eerst:** fietscomputers, niet tegelijkertijd sporthorloges, kleding en algemene sportproducten.
5. **Niet te snel monetiseren:** correcte bedrijfs-/contactinformatie, privacy, affiliatevoorwaarden en productfeedrechten zijn voorwaarden vóór ingebruikname van verdienlinks.

## Week 1 — website en domein
- [x] Openbare introductiesite met Daisycon-verificatietag gepubliceerd.
- [x] Nieuwe gids over fietscomputers voor triatlontraining toegevoegd.
- [x] Nieuwe gids over de beoordeling van fietscomputer-aanbiedingen toegevoegd.
- [x] XML-sitemap en robots.txt toegevoegd.
- [x] Follow-up naar Daisycon over mediaverificatie verstuurd op 4 november.
- [ ] Controleer via SIDN of `sporttechdeals.nl` vrij is. Domeinbeschikbaarheid is **niet bevestigd**.
- [ ] Controleer via KVK/BOIP de naam en belangrijke varianten (`SportTech Deals`, `Sporttech`, `Sportstech`).
- [ ] Neem pas daarna een aankoopbesluit over een domein. GitHub Pages-hosting zelf heeft geen afzonderlijke hostingkosten.

## Week 2 — mediaverificatie en eerste adverteerders
- [ ] Controleer het werkelijke antwoord van Daisycon; geen media-goedkeuring aannemen zonder dashboardstatus of expliciete bevestiging.
- [ ] Voeg het eigen domein toe aan GitHub Pages en stel DNS in, alleen wanneer het domein werkelijk in eigendom is.
- [ ] Controleer dat de publieke homepage en verificatietag via het nieuwe domein werken.
- [ ] Vraag bij geschikte winkeliers/advertisers aan of **prijsvergelijkers** en productfeedgebruik zijn toegestaan. Minimaal twee of drie geschikte aanbieders is wenselijk voor echte vergelijking.

## Week 3 — prijsfeed kwaliteitstoets
- [ ] Sla feed-URL's/tokens uitsluitend op in GitHub Actions-secrets, nooit in openbaar Git.
- [ ] Draai de testworkflow `.github/workflows/feed-test.yml` zonder publicatie.
- [ ] Controleer handmatig minimaal 25 gesamplede aanbiedingen op modelnummer, prijs incl. btw, verzendkosten, voorraad, shop en deep-link.
- [ ] Test dat verschillende generaties, bundels, accessoires en gebruikte apparaten niet worden gemengd.
- [ ] Publiceer alleen als bedrijfsgegevens, transparantie, privacy en commercieel gebruik geregeld zijn.

## Week 4 — distributie en eerste metingen
- [ ] Controleer site in Google Search Console na domeinverificatie.
- [ ] Leg 5–10 concrete zoekvragen van potentiële kopers vast voor aanvullende originele koopgidsen.
- [ ] Meet organische paginaweergaven, unieke zoekqueries en waar toegestaan klikgedrag, met passende privacyinformatie.
- [ ] Evalueer wekelijks: welke pagina's helpen bezoekers, welke vragen ontbreken en zijn de affiliateprogramma's geaccepteerd?

## Minimale succescriteria voor commerciële lancering

- Media bij Daisycon geverifieerd en goedgekeurd.
- Minstens één toegestane affiliate- en productfeedbron, liever meerdere voor zinvolle prijsvergelijkingen.
- 25 handmatig gecontroleerde productfeedregels zonder ernstige matchfouten.
- Definitieve exploitantgegevens, bereikbare contactroute, correcte affiliatevermelding en privacyinformatie.
- Automatische publicatie alleen aanzetten na expliciete gecontroleerde vrijgave.

## Geen aannames over inkomsten

Het aantal bezoekers, de conversieratio, commissietarieven en de omzet zijn op dit moment **onbekend**. Er is geen reden om nu een inkomen of terugverdientijd te beloven. We verzamelen eerst echte data en besluiten dan of uitbreiden zinvol is.
