# RaceAtlas — beeldgebruik en grote evenementen

## Actuele beeldstatus — 10 november 2026

- **73 grote evenementen**, ieder met een unieke afbeeldings-URL; de algemene evenementencatalogus telt **423** evenementen.
- **Batch 1, tien evenement-specifieke AI-fotobeelden (lokaal WebP):** TCS Amsterdam Marathon (ra-418), Marathon Rotterdam (ra-5), Dam tot Damloop (ra-8), IRONMAN 70.3 Westfriesland (ra-11), Egmond Halve Marathon (ra-0), EK/AGK Triatlon Lang Almere (ra-292), Berlin Marathon (ra-17), London Marathon (ra-14), New York City Marathon (ra-19), Boston Marathon (ra-13). Bestanden: `images/featured/ra-N.webp`; geoptimaliseerd voor de kaarten. De beelden zijn geen echte racefoto's.
- **Batch 2: tien nieuwe, eigen AI-beelden als lokale WebP** voor Tokyo, Chicago, Kaapstad, Sydney, Amstel Gold Race, CPC Den Haag, Challenge Roth, IRONMAN Frankfurt, IRONMAN Hamburg en IRONMAN Austria. Historische Wikimedia-links zijn bij deze tien vervangen; bronvermelding bij Details luidt nu RaceAtlas AI-sfeerbeeld.
- **Batch 3: tien nieuwe AI-beelden als lokale WebP** voor ASICS Marathon de Paris, IRONMAN 70.3 Valencia, Irish Life Dublin Marathon, IRONMAN Copenhagen, Athens Marathon – The Authentic, IRONMAN 70.3 Nice, IRONMAN 70.3 Westfriesland, IRONMAN Lanzarote, IRONMAN France Nice en IRONMAN 70.3 Venice-Jesolo. Deze foto's zijn illustratief en tonen niet noodzakelijk het officiële parcours.
- **Drie nieuwe marathons toegevoegd aan de catalogus:** Parijs (4 april 2027 officieel), Dublin (24 oktober 2027 officieel, loting opent 12 november 2026), Athene (exacte wedstrijddatum 2027 nog niet bevestigd). De officiële bronnen staan in de eventgegevens.
- **30 verschillende grote evenementen** hebben inmiddels een zorgvuldig gekozen evenement-specifiek AI-beeld; **43** andere grote evenementen tonen nog hun eerdere AI-sfeerbeelden. Midwinter Marathon (ra-1) heeft ook een aparte winterfoto. Westfriesland (ra-11) is in batch 3 opnieuw verbeterd.
- **Bronvermeldingen alleen bij de details**: niet op de overzichtskaarten. De huidige 73 hoofdevenementen gebruiken lokale JPEG- of WebP-bestanden, zonder externe foto-hotlinks.
- AI-sfeerbeelden worden bij Details expliciet als gegenereerde beelden aangeduid; ze zijn geen echte evenementopnames.
- Dit is een fasegewijze kwaliteitsverbetering; er is nog geen volledige live-browsercontrole op alle 73 lokale afbeeldings-URL's uitgevoerd.

## Grote evenementen

`major:true` is een inhoudelijk gecureerde markering voor nationaal en internationaal grote, aansprekende evenementen. Een `featuredTier:'championship'` is niet automatisch een groot massaevenement. Het bestaande overzicht van 420 evenementen blijft behouden.

## Beeldkwaliteit en verificatie

- Lokale JPEG's en WebP-bestanden zijn geoptimaliseerd voor snel laden op mobiel. De nieuwe WebP-bestanden zijn 960 × 448 pixels.
- De 73 grote evenementen verwijzen naar lokale WebP/JPEG-assets, inclusief unieke bestandspaden per evenement.
- Tijdens de eerste volledige echte browsercontrole moet worden nagegaan of alle afbeeldingen correct laden en goed worden uitgesneden.
- Later kan de site evenement-specifieke authentieke foto's gebruiken die organisatoren direct aanleveren, zonder de overzichtskaarten met credits te belasten.

## Batch 4 — voorbereid, nog niet gepubliceerd (10 november 2026)

Tien nieuwe fotorealistische AI-sfeerbeelden zijn gegenereerd en lokaal geoptimaliseerd als 960 × 448 WebP. **De assets zijn nog niet geüpload naar GitHub en de website verwijst nog naar de bestaande JPG's**; beschouw deze batch daarom niet als live.

Te vervangen event-ID's: `ra-2` Groet uit Schoorl Run, `ra-4` Venloop, `ra-6` Enschede Marathon, `ra-7` Leiden Marathon, `ra-10` Limburgs Mooiste, `ra-213` IRONMAN 70.3 Vilamoura-Algarve, `ra-216` Challenge Mogán-Gran Canaria, `ra-222` IRONMAN 70.3 Alcúdia-Mallorca, `ra-224` Challenge Salou-Costa Daurada en `ra-227` Challenge Cesenatico.

De publicatiestap vereist upload van de tien WebP-bestanden naar `docs/raceatlas/images/featured/ra-ID.webp`, wijziging van de tien `imageUrl`-velden in `docs/raceatlas/index.html`, en verificatie op de live site. De beelden zijn illustratief; controleer per evenement of de achtergrond voldoende plaats-specifiek is voordat ze worden gepubliceerd.

## Batch 5 — volgende tien evenementen (selectie 10 november 2026)

Nog te vervangen bestaande JPG's (geen live wijziging):

| Event-ID | Evenement | Gewenste visuele signatuur |
|---|---|---|
| ra-232 | IRONMAN 70.3 Aix-en-Provence | Provence, kalksteenheuvels en triatlonfiets |
| ra-233 | IRONMAN 70.3 Kraichgau | Duitse glooiende wijngaarden, renner |
| ra-234 | IRONMAN 70.3 St. Pölten | Oostenrijkse meren, zwemstart |
| ra-241 | IRONMAN 70.3 Bolton | Noord-Engelse heuvels, uitdagende racefietsroute |
| ra-242 | IRONMAN 70.3 Switzerland | Alpenmeer en Zwitserse bergachtergrond |
| ra-243 | IRONMAN 70.3 Tours Métropole | Loiregebied, Franse architectuur, lopers |
| ra-255 | Challenge Gdańsk | Baltische kust, Poolse kuststad, triatlon |
| ra-258 | Challenge Kaiserwinkl-Walchsee | Walchsee, Tiroler bergdecor, zwemmen |
| ra-259 | IRONMAN 70.3 Elsinore | Deens kasteel, haven, triatlon |
| ra-261 | IRONMAN Les Sables d'Olonne | Atlantische kust, strandboulevard, triatlon |

Batch 5: tien afzonderlijke illustratieve AI-beelden zijn gegenereerd en lokaal verpakt als geoptimaliseerde 960×448 WebP-bestanden. Hun sitekoppeling is voorbereid met automatische upgrade en JPG-fallback. **De afbeeldingen staan nog niet op de live site, omdat binaire GitHub-upload ontbreekt.** De gegenereerde decors zijn impressies en niet gecontroleerd als exact raceparcours. Voor batch 4 ontbreekt een geautoriseerde binaire uploadroute van lokale WebP naar de gekoppelde GitHub-repository; daarom géén verwijzingen naar nog niet bestaande assets in de publieke HTML instellen.

## Batch 6 — gecontroleerde shortlist (10 november 2026)

De volgende tien grote evenementen hebben inmiddels een eigen lokaal WebP-sfeerbeeld, naast hun eerdere JPG als reserve: **Batch 6 gepubliceerd op 11 november 2026:** tien unieke AI-sfeerbeelden als lokale WebP; GitHub Actions-run 42993724548 heeft de assets gecontroleerd, gecommit en GitHub Pages succesvol gedeployed. Dit zijn sfeerbeelden, geen foto's van de officiële raceparcoursen.

| ID | Evenement | Vereist herkenbaar onderwerp |
|---|---|---|
| ra-266 | IRONMAN Switzerland Thun | Thunersee, Berner Alpen, fietsonderdeel |
| ra-268 | IRONMAN 70.3 Jönköping | Zweedse Vättern-oever, triatlon |
| ra-269 | IRONMAN 70.3 Luxembourg | Moezelwijngaarden, triatlonfiets |
| ra-270 | IRONMAN 70.3 Swansea | Welsh kust en maritieme sfeer |
| ra-271 | IRONMAN 70.3 Vitoria-Gasteiz | Baskisch stadscentrum, halve afstand |
| ra-272 | IRONMAN Vitoria-Gasteiz | Baskische groene heuvels, volledige afstand |
| ra-274 | IRONMAN Tallinn | Estse oude stad, langeafstandtriatlon |
| ra-275 | IRONMAN 70.3 Leipzig | Duitse meren en groene parkroute |
| ra-276 | IRONMAN 70.3 Tallinn | Baltische kust en triatlonzwemmen |
| ra-278 | IRONMAN Leeds | Noord-Engelse heuvels en uitdagende fietsrit |

De beeldworkflow is uitgebreid voor `raceatlas-assets/batch*.zip` en valideert per ZIP exact tien WebP's en unieke bestanden voordat de assets worden geïnstalleerd en Pages gepubliceerd. De installatie is succesvol hergetest. De overzichtspagina zoekt voor alle grote evenementen automatisch naar een specifieke `.webp` bij een bestaande `.jpg`, met behoud van het bestaande beeld als de upgrade nog niet bestaat.
