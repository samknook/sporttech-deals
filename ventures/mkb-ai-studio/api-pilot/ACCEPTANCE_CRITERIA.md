# MKB AI Studio — acceptatiecriteria AI Inbox

**Status:** ontwikkelprototype, 6 november 2026. Dit document is een technisch testprotocol, geen commerciële garantie, auditrapport of productiecertificering.

## Geteste fictieve scenario's

Automatisch testbaar via `node tests/test-mkb-ai-acceptance.js`. De proef bevat momenteel 12 handmatig geconstrueerde cases:
- één correct bron-gelinkt concept, dat **alleen** naar menselijke beoordeling mag;
- elf potentieel onjuiste of ongedekte gevallen: onterechte betaalstatus, ongekoppeld refundbedrag, ongekoppelde levering, datum, gewijzigde bankgegevens, bronwaarde die niet bij het citaat past, ontbrekende bron, verouderde bron, tegenstrijdige bronnen, indirecte betalingsbevestiging en een te breed citaat dat een losse terugbetaling verbergt.

De eerste run vóór verbetering miste de indirecte betalingsbevestiging: **9/10** risicogevallen gemarkeerd. Na verbetering: **11/11 bekende fictieve risico's gemarkeerd**. De veilige controlcase ging naar menselijke review, nooit naar automatische verzending.

**Dit percentage is géén verwachte productieprestatie.** Het meet alleen of de vooraf vastgelegde voorbeelden door de huidige trefwoorden en exacte bronvergelijking worden herkend. De test is te klein en te kunstmatig om real-world foutkansen te schatten.

## Afwijzingscriteria voor een productiepilot
- Een hoogrisicoscenario passeert zonder waarschuwing.
- Een niet-onderbouwde zakelijke bewering kan zonder expliciete medewerkercontrole extern worden verstuurd.
- Het systeem kan van zichzelf geen betrouwbare bronidentiteit, rollen, versies, logging en gegevensrechten aantonen.
- Het leveranciersaccount en verwerkingsafspraken zijn niet schriftelijk goedgekeurd.
- De evaluatie gebruikt onveilig echte persoonsgegevens, of het beheer van API-sleutels is niet ingericht.
- Brongegevens zijn verouderd, tegenstrijdig of ontbreken.
- Er is geen kwantitatieve pilotmeting van kwaliteitsfouten, menselijke controle- en correctietijd.

## Openstaande foutenrisico's
De volledigheidscontrole kan variaties, sarcasme, ontkenningen, indirecte semantiek, andere valuta, verborgen implicaties of instructie-injecties missen. Het AI-model kan onvolledige claims opgeven. Het broncontract kan een exact overeenkomende waarde bevatten maar nog steeds onwaar of onbevoegd zijn. Een beoordeeld concept heeft geen verzendautorisatie. De testomgeving heeft nog geen echte inbox, ERP, persoonlijke accounts of gebruikersidentiteitscontrole.

## Opleverlat voor een eerste betalende pilot
Vóór ingebruikname: een private klantomgeving, expliciete schriftelijke scope en gegevensverwerkingsafspraken, least-privilege bronrechten, authenticatie voor reviewers, volledig auditspoor, handmatige goedkeuring, incidentprocedure, bron-owner, retentiebeleid, reproduceerbare regressietests en een representatieve proef met echte modeluitvoer op goedgekeurde fictieve data.

De publieke code en deze acceptatieset zijn **geen betaalde klantconfiguratie**. Klantspecifieke instructies en toegang moeten apart in een beveiligde private omgeving komen.
