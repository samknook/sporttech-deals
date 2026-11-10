# RaceAtlas — beeldgebruik en grote evenementen

## Actuele beeldstatus — 10 november 2026

- **70 grote evenementen**, ieder met een unieke afbeeldings-URL; de algemene evenementencatalogus telt **420** evenementen.
- **Batch 1, tien evenement-specifieke AI-fotobeelden (lokaal WebP):** TCS Amsterdam Marathon (ra-418), Marathon Rotterdam (ra-5), Dam tot Damloop (ra-8), IRONMAN 70.3 Westfriesland (ra-11), Egmond Halve Marathon (ra-0), EK/AGK Triatlon Lang Almere (ra-292), Berlin Marathon (ra-17), London Marathon (ra-14), New York City Marathon (ra-19), Boston Marathon (ra-13). Bestanden: `images/featured/ra-N.webp`; geoptimaliseerd voor de kaarten. De beelden zijn geen echte racefoto's.
- **Batch 2, tien verschillende Wikimedia Commons-fotobronnen:** Tokyo Marathon (2019), Chicago Marathon (2011), Cape Town Marathon (2026), Sydney Marathon (2025), Amstel Gold Race (2023), CPC Loop Den Haag (2017), Challenge Roth (2005), IRONMAN Frankfurt (2013), IRONMAN Hamburg (foto van de andere Hamburg Triathlon in 2012) en IRONMAN Austria (2012). De detailweergave bevat de fotoherkomst, licentielink en waar bekend de fotograaf. **Controleer bron-URL en licentie vóór commercieel hergebruik of eigen CDN-hosting**; voor drie Commons-items wordt de exacte fotograaf/licentie op de bronpagina vermeld in plaats van expliciet in de metadata.
- **50 overige major-events** behouden voor nu hun bestaande lokale AI-JPEG-bestand. Die worden in latere batches vervangen.
- **Bronvermeldingen alleen bij de details**: niet op de overzichtskaarten. Bij kapotte externe fotolinks valt de kaart/detailweergave terug op de eerdere lokale JPG.
- De twee verschillende soorten beelden worden niet door elkaar gepresenteerd als authentiek: een AI-sfeerbeeld blijft als AI herkenbaar bij Details; een historische evenementfoto vermeldt de bron en editie.
- Dit is een fasegewijze kwaliteitsverbetering; er is nog geen volledige browser- en publicatiecontrole op alle externe foto-URL's uitgevoerd.

## Grote evenementen

`major:true` is een inhoudelijk gecureerde markering voor nationaal en internationaal grote, aansprekende evenementen. Een `featuredTier:'championship'` is niet automatisch een groot massaevenement. Het bestaande overzicht van 420 evenementen blijft behouden.

## Beeldkwaliteit en verificatie

- Lokale JPEG's en WebP-bestanden zijn geoptimaliseerd voor snel laden op mobiel. Externe Wikimedia-thumbnails gebruiken een maximum-breedte van 960 px.
- De beeldgegevens bevatten lokale WebP/JPEG-assets en specifieke Wikimedia Commons-fotobronnen.
- Tijdens de eerste volledige echte browsercontrole moet worden nagegaan of alle afbeeldingen correct laden en goed worden uitgesneden.
- Later kan de site evenement-specifieke authentieke foto's gebruiken die organisatoren direct aanleveren, zonder de overzichtskaarten met credits te belasten.
