## Nieuwe volledige beeldserie — 10 november 2026

- Alle **70 als `major` gemarkeerde evenementen** hebben nu een eigen gebruikte afbeeldingsbron.
- **69 originele RaceAtlas-beelden** zijn als afzonderlijke SVG-bestanden opgeslagen in `docs/raceatlas/images/featured/ra-N.svg`.
- **Marathon Rotterdam** behoudt de bestaande CC BY-SA-foto met vermelding van fotograaf, bron en licentie.
- De illustraties combineren deelnemers in actie met locatiegebonden decors (stad, kust/haven, historische binnenstad, heuvels). Ze zijn originele beelden, **geen foto's of authentieke registraties** van de betreffende edities.
- De evenementendata koppelen ze expliciet via `imageUrl`, `imageRights:'original'` en `imageCredit`. `raceArtwork()` gebruikt deze bestanden zowel op kaarten als in details, met een gegenereerd vangnet als een locatieafbeelding niet aanwezig is.
- Deze aanpak is geschikt als voorlopige standaard. Voor een volledige fotorealistische reeks of officiële wedstrijdfoto's zijn aparte uitgewerkte assets en verificatie van beeldrechten nodig.
- De evenementendatabase bevat nog steeds 420 unieke ID's en 70 `major`-markeringen.

# RaceAtlas — grote evenementen en beeldgebruik

## Curatie van evenementen

Het publieke filter **Grote evenementen** gebruikt voorlopig uitsluitend `major: true`.
Het interne veld `featuredTier` onderscheidt:
- `major`: internationaal of nationaal bekend evenement met sterke publieke aantrekkingskracht of omvang (bijv. TCS Amsterdam Marathon, Rotterdam Marathon, Dam tot Damloop, Challenge Roth)
- `championship`: nationaal kampioenschap of leeftijdsgroepkampioenschap dat sportief belangrijk kan zijn, maar niet automatisch een massaevenement is
- `regional`: bekende lokale of regionale wedstrijd of toertocht
- geen waarde: nog niet gecureerd, geen uitspraak over omvang

Een internationale merknaam kan aanleiding zijn om een wedstrijd opnieuw te beoordelen, maar vormt op zichzelf geen onafhankelijke verificatie van deelnemersaantal.

## Amsterdam Marathon 2027

- `ra-418` is **major**; naam **TCS Amsterdam Marathon**
- Marathon: zondag **31 oktober 2027**
- Evenementweekend: zaterdag **30** en zondag **31 oktober 2027**
- Inschrijving 2027: vanaf **19 december 2026**
- Officiële pagina's: https://www.tcsamsterdammarathon.nl/programma en https://www.tcsamsterdammarathon.eu/registration
- Laatst in de evenementendatabase gecontroleerd: 10 november 2026
- Prijzen voor 2026 zijn nadrukkelijk **niet** overgenomen als prijzen voor 2027.

## Unieke evenementenafbeeldingen

- Elk `major`-evenement krijgt standaard een **zelfgemaakte RaceAtlas-vectorillustratie**, afgeleid van naam, plaats en sport. De illustratie wordt niet als evenementfoto gepresenteerd.
- Voor echte wedstrijdfoto's gelden minimaal `imageUrl`, `imageRights:'licensed'`, `imageCredit`, `imageSourceUrl`; bij voorkeur ook `imageLicenseUrl` en bewijs van toestemming.
- Foto's en bijbehorende credit worden alleen na verificatie geplaatst. Een publieke foto op een organisatorsite betekent **niet** dat RaceAtlas die vrij mag gebruiken.
- Organisatoren kunnen via `organisatoren.html` een directe HTTPS-fotolink insturen en hun publicatierechten verklaren. Dit wordt handmatig gecontroleerd, niet automatisch gepubliceerd.
- Vermijd hotlinks naar willekeurige organisatorsites; bij grotere uitrol mogen aangeleverde en gelicenseerde foto's op een eigen gecontroleerd CDN worden opgeslagen.

### Eerste gecontroleerde historische evenementfoto

**Rotterdam Marathon** (`ra-5`): foto van deelnemers tijdens de editie **2013**, maker **Peter van der Sluijs**, Wikimedia Commons. Licentie **CC BY-SA 3.0**.

- Bron: https://commons.wikimedia.org/wiki/File:Hardlopers_marathon_in_Rotterdam.JPG
- Licentie: https://creativecommons.org/licenses/by-sa/3.0/
- In het evenementoverzicht staat een aanklikbare fotografencredit; op de detailpagina staan bron en licentielink.
- Beeld is afkomstig uit 2013; het is **geen** foto van de editie van 2027.

## Uitstaande werkzaamheden

1. Meer werkelijk gelicenseerde, evenement-specifieke foto's verzamelen, met voorkeur voor organisatoren die expliciet toestemming geven.
2. Gebruikersfeedback verzamelen over de indeling `major`, `championship` en `regional` en de lijst periodiek herzien.
3. Controle op mobile-beeldweergave in een echte browser; deze is nog niet onafhankelijk uitgevoerd.
