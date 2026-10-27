# SportTech Deals — publisheraanmelding en productfeeds

**Status 27 oktober 2026: niet live; geen goedgekeurde productfeeds of affiliatepartners bevestigd.**
Dit bestand bevat de directe vervolgstappen, zonder verzonnen bezoekersaantallen of partners.

## De eerste stap: affiliate-publisheraccount

### Aanbevolen: Daisycon (Nederlandstalig, gratis registratie)

Registratie: https://login.daisycon.com/nl/register
Productpagina voor publishers: https://daisycon.com/nl/publishers/

- Kies **publisher**, niet advertiser.
- Gebruik je **echte** identiteit en alleen bestaande/geverifieerde ondernemingsgegevens.
- Vul uitsluitend jouw eigen bereikbare e-mailadres en echte website/socialmediakanalen in.
- De GitHub-repository is **broncode**, nog geen live vergelijkingswebsite. Geef dat eerlijk aan: de site is in ontwikkeling.
- Daisycon vermeldt dat een aangemelde website als medium geverifieerd moet worden. Beoordeling en campagneacceptatie zijn niet gegarandeerd.
- Vraag na accountacceptatie per relevante winkelcampagne toestemming aan; niet elke campagne heeft geschikte productfeeds.

### Alternatief: Awin

Nederlandse informatie: https://www.awin.com/nl/faqs
Registratie-instructies: https://success.awin.com/s/article/How-do-I-join-Awin-as-a-Publisher?language=en_US
- Awin vraagt om een **promotional space**, bijvoorbeeld een site of bestaand relevant socialmediakanaal. De locatie hoeft nog niet live te zijn als je de ontwikkelstatus in de omschrijving uitlegt, maar acceptatie is niet gegarandeerd.
- Awin kan een **eenmalige verificatieborg** rekenen. Controleer het actuele bedrag op het aanmeldscherm; betaal niet via links van derden.
- Na publisheracceptatie moet je ook per winkel/advertiser geaccepteerd worden.
- Vraag toegang aan tot geldige **CSV-productfeeds met toegestane publicatie**, correcte affiliatelinks, EUR-prijzen en heldere leveringsvoorwaarden.

## Tekst voor omschrijving promotieruimte (Nederlands)

SportTech Deals is een onafhankelijke Nederlandse sportelektronica-vergelijker in ontwikkeling, gericht op wielrenners en triatleten. De eerste categorie bestaat uit fietscomputers van Garmin en Wahoo. Bezoekers kunnen straks modellen vergelijken, actuele prijzen van geautoriseerde webshops bekijken en prijzen lokaal volgen. We publiceren alleen daadwerkelijk ontvangen en gecontroleerde feedprijzen, met duidelijke affiliatevermelding. We zoeken passende retailpartners die productfeed- en deep-linkgebruik expliciet toestaan. De website is momenteel nog niet publiek gelanceerd; de technische prototypecode staat op https://github.com/samknook/sporttech-deals. Bezoekers- en verkoopcijfers zijn nog niet beschikbaar.

## Beschrijving voor een Engelstalig formulier

SportTech Deals is a Dutch-language, independent sports electronics comparison platform in development, initially focused on cycling computers for cyclists and triathletes. We plan to compare verified merchant prices and offer price-tracking features, using only authorised product feeds and clearly disclosed affiliate links. We have not launched commercially and do not yet have traffic or sales figures. Source code for the prototype: https://github.com/samknook/sporttech-deals. We are seeking relevant retail partners who permit use of product feeds and affiliate deep links.

## Nadat het account is goedgekeurd

1. Zoek in het adverteerdersoverzicht naar Nederlandse/Europese verkopers van fietscomputers, sporthorloges en sensoren.
2. Controleer per programma: commissiepercentage, geldig territorium (NL), productfeed, voorwaarden voor prijsvergelijkers, beeldrechten en publicatiefrequentie.
3. Vraag toestemming aan en bewaar de goedkeuring en voorwaarden.
4. Stel de feed uitsluitend via het GitHub-repositorysecret **STD_FEED_URLS** in. Zet vertrouwelijke tokenbevattende URL's nooit in issues, chats of het openbare GitHub-project.
5. Start daarna **Actions → Controleer affiliate-productfeed (zonder publicatie) → Run workflow**.
6. Controleer minstens 25 gevonden producten handmatig op exacte uitvoering, inclusieve btw, verzendkosten, winkelidentiteit, voorraad en eindprijs.
7. Publicatie blijft UIT; activeer pas na correcte exploitantgegevens, juridische controle, merknaamcontrole en feitelijke kwaliteitstoets.

## Waarop letten bij een feed?

Vereiste minimumvelden: productnaam, winkelnaam, consumentenprijs inclusief btw, verzendkosten (indien beschikbaar), EUR, nieuwstaat, product- of trackinglink, actuele voorraadstatus. De huidige scanner verwacht **CSV of gzip-CSV**. Andere formaten of affiliate-authenticatie kunnen een conversiestap nodig hebben.

**Belangrijk:** met één webshop kun je een productprijs tonen, maar geen onafhankelijk onderbouwd prijsverschilsignaal op basis van meerdere winkels. De huidige dealcontrole vereist minstens drie afzonderlijke winkels met bekende totaalprijzen.

## Bronnen

- https://www.awin.com/nl/faqs
- https://success.awin.com/s/article/How-do-I-join-Awin-as-a-Publisher?language=en_US
- https://daisycon.com/nl/publishers/
- https://faq-publisher.daisycon.com/hc/nl/articles/205611002-Je-bent-publisher-geworden-Wat-nu
- https://faq-publisher.daisycon.com/hc/en-us/articles/24827817954193-Daisycon-API
- https://www.kvk.nl/starten/naamchecker/

Status van deze links en voorwaarden moet bij daadwerkelijke aanmelding opnieuw worden gecontroleerd.
