# MKB AI Studio — public/private releasebeleid
**Versie 0.1 · 6 november 2026**

## Publiek zichtbaar: marketing en simulaties
- Website, overzicht van pakketten en voorlopige richtprijzen.
- Demo's met fictieve data zonder connectie met klantaccounts.
- QuickScan, Pilot Intake en pakketverkenner met downloadbaar **eigen intake- of scopeverslag**, nooit volledige werkende AI-configuraties.
- Uitleg over de soorten assistenten, hun beperkingen en de noodzaak van menselijke controle.
- Algemene veiligheidsprincipes zonder bedrijfsspecifieke gegevens.

## Privé per opdracht
- Volledige, geteste GPT-/AI-instructies, bedrijfsconfiguraties en versiegeschiedenis.
- Systeemkoppelingen, toegangsrollen, klantbeleid, interne FAQ, referentiedocumenten.
- Klantspecifieke acceptatietests en uitkomsten.
- Supportdossiers, incidenten, contracten, commerciële voorstellen en prijsafspraken.
- Alle klantgegevens of persoonsgegevens, ook wanneer klant toestemt met verwerking.

**Never use this public repository to store customer secrets or client assets.** A private GitHub repository alone is not a substitute for data access agreements, retention controls, audit logs or security assessment.

## Betaalflow
MKB AI Studio is geen webwinkel. Er is geen live checkout of accountbeheer. Echte implementatie start uitsluitend na:
1. intake met bevoegd vertegenwoordiger;
2. schriftelijke opdracht en afspraken over prijs/scope;
3. passende geheimhoudings-/privacy- en gegevensverwerkingsafspraken;
4. bevestiging van beschikbaarheid en rechten voor gekozen AI-dienst;
5. klantbeheerde accounts en minimaal noodzakelijke rechten;
6. acceptatie en overdracht na uitvoering.

## Automatische controle in publieke repository
Een CI-test moet voorkomen dat de eerder verwijderde openbare configuratiegenerator terugkeert. Dit is slechts een eenvoudige guardrail. Het kan niet garanderen dat gegevens via andere bestanden, oude commits of geschiedenis niet toegankelijk zijn.

## Technische restpunten
- Live browsertest van alle publieke pagina's, inclusief mobiele weergave.
- Domein, KvK, contactgegevens, zakelijke privacyverklaring en contracten ontbreken.
- Private opslag voor implementatie-assets nog op te zetten.
- Geen betalende klanten of bewezen implementaties.
- GitHub Pages deploy/caching en oude git-geschiedenis kunnen eerdere exports tijdelijk zichtbaar houden.
