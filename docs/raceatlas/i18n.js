/* RaceAtlas bilingual interface. Data names and dates are kept as source records. */
(()=>{
'use strict';
const KEY='raceatlas-language-v1';
const strings={
'Ontdek':'Discover','Voor organisatoren':'For organizers','Mijn seizoen':'My season',
'Jouw wedstrijdkalender':'YOUR RACE CALENDAR','Vind jouw volgende':'Find your next',
'uitdaging.':'challenge.','Vind jouw volgende uitdaging.':'Find your next challenge.',
'Ontdek hardloop-, wieler- en triatlonevenementen in Nederland en daarbuiten. Van lokale klassiekers tot grote internationale races.':'Explore running, cycling and triathlon events across the Netherlands and beyond. From local favorites to iconic international races.',
'☆ Plan mijn wedstrijdseizoen':'☆ Build my race season',
'geselecteerde evenementen':'curated events','sportdisciplines':'sports','wedstrijdseizoen':'race season',
'Hardlopen':'Running','Fietsen':'Cycling','Triatlon':'Triathlon','Triatlons':'Triathlons','Duatlon':'Duathlon',
'Zoek een evenement':'Find an event','Zoek op wedstrijd, plaats of afstand':'Search by event, location or distance','Sport':'Sport',
'Alle sporten':'All sports','Maand':'Month','Alle maanden':'All months','Sorteren':'Sort by','Datum: eerstvolgende':'Date: soonest first','Naam: A-Z':'Name: A-Z','Afstand: dichtbij eerst':'Distance: nearest first',
'⚙ Meer filters':'⚙ More filters','Land, jaar, afstand en inschrijving':'Country, year, distance and registration',
'Land':'Country','Alle landen':'All countries','Jaar':'Year','Alle jaren':'All years',
'Afstand / racevorm':'Distance / event type','Alle afstanden':'All distances',
'5 km of korter':'5 km or shorter','Halve marathon':'Half marathon','Marathon / langer':'Marathon / longer',
'70.3 / middenafstand':'70.3 / middle distance','Hele triatlon':'Full-distance triathlon',
'Duatlon / run-bike-run':'Duathlon / run-bike-run','Inschrijfstatus':'Registration status','Alle inschrijfstatussen':'All registration statuses',
'Directe inschrijflink beschikbaar':'Direct registration link available','Startdatum/inschrijfperiode bekend':'Opening date / registration window known',
'Inschrijving opent later':'Registration opens later','Deadline binnen 30 dagen':'Deadline within 30 days',
'Uitverkocht / gesloten volgens bron':'Sold out / closed according to source','Startdatum onbekend':'Opening date unknown',
'Prijs bekend':'Price known','Prijs onduidelijk':'Price unclear','Wanneer?':'When?','Alle datums':'All dates',
'Komende 30 dagen':'Next 30 days','Komende 90 dagen':'Next 90 days','Komend weekend':'This weekend',
'Datumstatus':'Date confidence','Alle datumstatussen':'All date statuses',
'Officieel bevestigd':'Officially confirmed','Datum vermeld (controleer)':'Date listed (verify)',
'Verwachte maand':'Expected month','Datum onbekend':'Date unknown',
'Alle evenementen':'All events','★ Grote evenementen':'★ Major events','☆ Mijn opgeslagen':'☆ My saved races',
'Marathons':'Marathons','Evenementen':'Events','Deel selectie':'Share selection','Wis filters':'Clear filters',
'Alleen aankomende evenementen':'Upcoming events only','Alleen officieel bevestigde datums':'Officially confirmed dates only',
'▦ Kaarten':'▦ Cards','☷ Lijst':'☷ List',
'▣ Mijn wedstrijdseizoen':'▣ My race season','Bekijk mijn seizoen →':'View my season →',
'Plan je seizoen gratis':'Plan your season for free',
'Bewaar wedstrijden zonder account op dit apparaat. Exporteer bevestigde datums naar je agenda.':'Save races on this device without an account. Export confirmed race dates to your calendar.',
'✦ VOOR ORGANISATOREN':'✦ FOR ORGANIZERS','Organiseer jij een sportevenement?':'Organizing a sports event?',
'Voeg jouw evenement gratis toe, werk informatie bij of neem contact met ons op over RaceAtlas.':'List your event for free, update its details or get in touch with RaceAtlas.',
'Voor organisatoren ↗':'For organizers ↗',
'Mijn wedstrijdseizoen':'My race season','Jouw opgeslagen wedstrijden op dit apparaat':'Your saved races on this device',
'Agenda-export (.ics) ↓':'Export calendar (.ics) ↓','Inschrijfdatums (.ics) ↓':'Registration dates (.ics) ↓',
'Bewaar back-up ↓':'Download backup ↓','Importeer seizoen ↑':'Import season ↑',
'Je seizoen staat op dit apparaat. Met een back-upbestand kun je het zonder account op een ander apparaat overzetten. Bevestigde datums zijn apart naar je agenda te exporteren.':'Your season is stored on this device. A backup file lets you transfer it to another device without an account. Confirmed dates can be exported to your calendar.',
'Mijn seizoensdoel':'My season goal','Kies hoeveel wedstrijden je wilt plannen. Dit doel blijft op dit apparaat bewaard.':'Choose how many races you want to plan. This goal stays saved on this device.',
'Doel':'Goal','Bewaar evenementen om je doel te bereiken.':'Save events to reach your goal.',
'Mijn seizoen per maand':'My season by month','Bevestigde wedstrijddatums en voorlopige maanden staan apart aangegeven.':'Confirmed race dates and provisional months are shown separately.',
'Inschrijfmonitor':'Registration tracker','Actuele status blijft afhankelijk van de organisator. RaceAtlas toont alleen eerder geverifieerde gegevens en deadlines.':'Current availability is determined by organizers. RaceAtlas shows previously verified information and deadlines.',
'Seizoenscheck':'Season health check','Controleer wedstrijdspreiding en datumbetrouwbaarheid.':'Review your race spacing and date reliability.',
'Misschien ook interessant':'You may also like','Aanbevolen wedstrijden met bevestigde datums.':'Recommended races with confirmed dates.',
'Hoe betrouwbaar zijn onze wedstrijdgegevens?':'How reliable is our race data?',
'Bekijk welke datums nog bevestiging nodig hebben en help informatie actueel te houden.':'See which dates still need confirmation and help keep event details up to date.',
'Bekijk gegevenskwaliteit en meld een correctie →':'Review data quality and submit a correction →',
'Organiseer jij een wedstrijd?':'Organizing a race?','Gratis aanmelden, gegevens aanpassen of contact opnemen.':'List your event for free, update details or contact us.',
'Transparantie:':'Transparency:',
'⌕':'⌕','Mijn wedstrijdkalender':'My race calendar','Filters':'Filters',
'INSCHRIJFRADAR':'REGISTRATION RADAR','Mis geen belangrijke inschrijfdatum':'Never miss an important registration date',
'We tonen alleen bekende inschrijfdatums uit gepubliceerde brongegevens. Dit is geen live controle van vrije startbewijzen.':'We show known registration dates from published sources. This is not a live check of available places.',
'Gebaseerd op eerder gepubliceerde informatie van organisatoren. Een verstreken openingsdatum betekent niet dat er nog startbewijzen beschikbaar zijn.':'Based on previously published organizer information. A past opening date does not mean places are still available.',
'Alleen mijn opgeslagen wedstrijden':'Only my saved races','Wedstrijddetails':'Race details','Controleer bron ↗':'Check source ↗',
'INSCHRIJVEN':'REGISTER',
'Gegevenskwaliteit en correcties':'Data quality and corrections',
'← Wedstrijden':'← Events','OPEN GEGEVENSKWALITEIT':'OPEN DATA QUALITY',
'Help de wedstrijdkalender actueel te houden.':'Help keep the race calendar up to date.',
'RaceAtlas toont welke gegevens nog bevestiging of een nieuwe broncontrole nodig hebben. Een vermelde datum zonder officiële bevestiging is geen toezegging van de organisator. Een controledatum zegt niets over de actuele beschikbaarheid van startbewijzen.':'RaceAtlas shows which information still needs confirmation or a fresh source check. An unconfirmed date is not a promise by the organizer. A review date does not indicate live availability.',
'Kwaliteitsstatus':'Data quality','Evenementen in de database':'Events in the database','Officieel gemarkeerde datums':'Dates marked as official',
'Nog te bevestigen datums':'Dates awaiting confirmation','Alleen maand of datum onbekend':'Month only or unknown date',
'Directe organisatielinks':'Direct organizer links',
'We onderscheiden links die nog gevonden moeten worden, mogelijke organisatorsites en links met vastgelegde verificatie. Een kandidaat is niet automatisch gecontroleerd.':'We distinguish missing links, possible organizer websites and links with recorded verification. A candidate is not yet verified.',
'Organisatielinks laden…':'Loading organizer links…',
'Controleer eerst de wedstrijden die binnenkort plaatsvinden':'Review upcoming races first',
'De prioriteit is automatisch berekend met voorlopige wedstrijddatums. Datums en inschrijfmogelijkheden worden niet automatisch bevestigd. Open de bron en geef een correctie door als de organisator nieuwe informatie heeft gepubliceerd.':'Priority is calculated from provisional race dates. Race dates and registration availability are not automatically verified. Open the source and submit an update when an organizer publishes new information.',
'Zoek een wedstrijd voor correctie':'Find an event to correct','Naam of plaats':'Name or location',
'Controlebehoefte':'Review needed','Alle kwaliteitsstatussen':'All quality statuses',
'Datum niet bevestigd':'Date unconfirmed','Alleen verwachte maand':'Expected month only','Datum onbekend':'Date unknown',
'Broncontrole ouder dan 30 dagen':'Source check older than 30 days','Geen controledatum':'No review date',
'Recent gecontroleerd':'Recently checked','Prioriteit':'Priority','Alle prioriteiten':'All priorities',
'Mogelijk binnen 30 dagen':'Possibly within 30 days','Mogelijk binnen 31–90 dagen':'Possibly within 31–90 days',
'Datum ontbreekt':'Date missing','Officiële datum opnieuw controleren':'Recheck official date',
'Overige voorlopige datums':'Other provisional dates','Gegevens laden…':'Loading data…',
'Meer wedstrijden tonen':'Show more races','Bron bekijken ↗':'View source ↗','Correctie melden ↗':'Report correction ↗',
'Correcties worden via het bestaande organisatorenformulier doorgestuurd voor menselijke beoordeling. Er worden geen gegevens zonder controle gepubliceerd.':'Corrections are sent to the organizer form for human review. Changes are never published without verification.',
'Rechtstreeks contact opnemen':'Contact us directly',
'Voor organisatoren — RaceAtlas':'For organizers — RaceAtlas',
'← Terug naar evenementen':'← Back to events','RaceAtlas voor organisatoren':'RaceAtlas for organizers',
'Samen brengen we sporters aan de start.':'Bringing athletes to the start line.',
'Organiseer je een hardloopwedstrijd, fietstocht, duatlon of triatlon? RaceAtlas helpt sporters om wedstrijden te ontdekken, belangrijke datums te volgen en hun seizoen te plannen. Je evenement aanmelden is gratis. Heb je vragen of wil je samenwerken? Neem contact met ons op.':'Organizing a running, cycling, duathlon or triathlon event? RaceAtlas helps athletes discover races, follow important dates and plan their season. Listing your event is free. Have questions or want to collaborate? Get in touch.',
'Evenement aanmelden ↓':'List an event ↓','Contact opnemen ↓':'Contact us ↓',
'Wat RaceAtlas biedt':'What RaceAtlas offers','Vindbaar voor sporters':'Get discovered by athletes','Jouw wedstrijd op één centrale kalender, met sport, locatie en afstanden.':'Your event in one central calendar with sport, location and distances.',
'Actuele wedstrijdinformatie':'Up-to-date race information','Ruimte voor officiële links, inschrijfdatums en wijzigingen.':'Official links, registration dates and updates in one place.',
'Direct naar de organisator':'Direct to the organizer','Bezoekers kunnen doorklikken naar de officiële evenement- of inschrijfpagina.':'Visitors can go straight to the official event or registration page.',
'Contact':'Contact','Stel ons een vraag.':'Ask us a question.',
'Wil je meer weten over RaceAtlas, een samenwerking bespreken of gegevens laten corrigeren? Laat hieronder weten waarover je contact zoekt. Je kunt ook rechtstreeks mailen naar':'Want to learn more, discuss a partnership or correct event information? Get in touch below. You can also email',
'Naam / organisatie *':'Name / organization *','Zakelijk e-mailadres *':'Business email *','Onderwerp *':'Subject *',
'Kies een onderwerp':'Choose a topic','Algemene vraag':'General inquiry','Evenementgegevens aanpassen':'Update event details',
'Samenwerken':'Partnerships','Anders':'Other','Naam evenement / website (optioneel)':'Event name / website (optional)',
'Gegevens van je wijziging':'Your correction details','Vul alleen de onderdelen in die wijzigen. Lege velden worden niet geïnterpreteerd als een nieuwe datum of prijs. We publiceren wijzigingen pas na controle.':'Only enter fields that need changing. Empty fields do not imply a new date or price. Changes are reviewed before publication.',
'RaceAtlas evenement-ID (optioneel)':'RaceAtlas event ID (optional)','Wat wil je corrigeren? *':'What would you like to correct? *',
'Kies een onderwerp':'Choose a topic','Wedstrijddatum':'Race date','Inschrijfopening':'Registration opening',
'Inschrijfdeadline':'Registration deadline','Inschrijfstatus / uitverkocht':'Registration status / sold out',
'Inschrijfprijs':'Entry fee','Afstanden / onderdelen':'Distances / disciplines',
'Officiële website / inschrijflink':'Official website / registration link','Overige informatie':'Other details',
'Nieuwe datum (indien van toepassing)':'New date (if applicable)','Inschrijfstatus':'Registration status',
'Niet van toepassing / onbekend':'Not applicable / unknown','Nog niet geopend':'Not open yet',
'Inschrijven mogelijk volgens bron':'Registration available according to source','Verschilt per afstand':'Varies by distance',
'Uitverkocht':'Sold out','Gesloten':'Closed','Officiële bronlink voor deze wijziging *':'Official source link for this change *',
'Wat is gewijzigd? *':'What has changed? *','Jouw bericht *':'Your message *',
'Bericht versturen ↗':'Send message ↗','Kopieer bericht':'Copy message',
'Evenement aanmelden':'List an event','Jouw wedstrijd op de kalender.':'Your race in the calendar.',
'Geef de officiële evenementgegevens door. We controleren inzendingen voordat ze worden toegevoegd. Een vermelding is gratis.':'Send us official event information. Submissions are reviewed before being published. Listing is free.',
'Naam evenement':'Event name','E-mailadres contactpersoon':'Contact email',
'Vermeld de naam van de organisator':'Please enter the organizer name',
'Gegevens corrigeren':'Correct details','Voorlopige datum':'Provisional date',
'Bekijk organisator ↗':'Official website ↗','Bekijk kalenderbron ↗':'View source calendar ↗',
'Officiële website ↗':'Official website ↗','Inschrijfpagina ↗':'Registration page ↗',
'Details':'Details','🔔 Meldingen':'🔔 Alerts','✓ Bewaard':'✓ Saved','+ Bewaar':'+ Save',
'Bekijk wedstrijd':'View race','Controleer details altijd bij de organisator.':'Always verify details with the organizer.'
};
Object.assign(strings,{
  "startlijn.": "start line.",
  "Rechtstreeks naar organisatoren": "Direct organizer links",
  "Persoonlijk wedstrijdseizoen": "Personal race season",
  "Wereldwijd ontdekken": "Explore worldwide",
  "Wielrennen": "Cycling",
  "Duatlon / RBR": "Duathlon / RBR",
  "dit is een publieke bèta. Bij enkele lokale wedstrijden tonen we uitsluitend de maand op basis van de vorige editie, zonder een fictieve 2027-dag. Deze worden apart gemarkeerd en kunnen niet naar een agenda worden geëxporteerd. De extra toertochten zijn gebaseerd op gepubliceerde Fietssport-kalenders; andere vermeldingen uit eerdere versies moeten nog individueel bevestigd worden. Bekijk altijd de officiële organisator voor inschrijving en actuele datums. De sportfoto’s op de kaarten zijn sfeerbeelden, geen afbeeldingen van de genoemde wedstrijden. Een kalenderbron is niet automatisch een inschrijflink. Als er geen specifieke bron is, tonen we dat expliciet.": "this is a public beta. Some local events only show an expected month based on previous editions, not an invented date. These are clearly marked and cannot be exported to your calendar. Some events still need individual confirmation. Always check the official organizer for current dates and entry details. Race images are illustrative, not photographs of the actual event. A calendar listing is not automatically a registration link.",
  "Ontdek. Plan. Race. · Onafhankelijke bèta zonder betaalde plaatsingen.": "Discover. Plan. Race. · Independent beta with no paid placements.",
  "Website (niet invullen)": "Website (leave blank)",
  "Je bericht wordt via FormSubmit rechtstreeks doorgestuurd naar trizentro.team@gmail.com, zonder je e-mailprogramma te openen. FormSubmit verwerkt hiervoor je naam, zakelijke e-mailadres en bericht als externe formulierdienst. Na de eerste aanvraag moet ons ontvangstadres mogelijk een eenmalige activatielink bevestigen. Deel geen gevoelige gegevens.": "Your message is sent to our contact address through FormSubmit without opening your email app. FormSubmit processes your name, business email and message as an external service. The receiving address might need to activate the form once. Do not share sensitive information.",
  "Kies sport": "Choose a sport",
  "Afstand / onderdeel": "Distance / event",
  "Plaats": "City / location",
  "Nederland": "Netherlands",
  "België": "Belgium",
  "Duitsland": "Germany",
  "Wedstrijddatum (leeg als onbekend)": "Race date (leave blank if unknown)",
  "Start inschrijving (indien bekend)": "Registration opening (if known)",
  "Inschrijfprijs per persoon (€)": "Entry fee per person (€)",
  "Directe inschrijfpagina (indien beschikbaar)": "Direct registration page (if available)",
  "Officiële website": "Official website",
  "Bron voor datum, inschrijving en prijs (indien anders dan officiële website)": "Source for date, registration and fee (if different from official website)",
  "Officiële evenementfoto (optioneel, directe HTTPS-link)": "Official event photo (optional, direct HTTPS link)",
  "Bij grote evenementen tonen we graag een echte wedstrijdfoto. Deel alleen een afbeelding waarvoor je toestemming hebt.": "For major events we prefer an authentic race photograph. Only share images you have permission to use.",
  "Ik bevestig dat ik de rechthebbende ben of toestemming heb om deze afbeelding op RaceAtlas te laten publiceren, inclusief bronvermelding.": "I confirm I own the rights or have permission to publish this image on RaceAtlas, including credit.",
  "Ik bevestig dat ik de opgegeven gegevens bij de organisatie heb gecontroleerd en dat onbekende datums en prijzen leeg zijn gelaten. *": "I confirm that I checked the submitted information with the organizer and left unknown dates and fees blank. *",
  "Aanvullende informatie": "Additional information",
  "Je aanmelding gaat via FormSubmit naar trizentro.team@gmail.com. Je contact-e-mailadres gebruiken we om vragen over de aanmelding te beantwoorden; we publiceren het niet op de evenementpagina. Aanmelden kan direct via dit formulier. Wij controleren alle gegevens voor publicatie. FormSubmit is een externe dienst.": "Your submission is delivered to our contact address through FormSubmit. We only use your contact email for questions about your listing, and will not publish it on the event page. Every submission is reviewed before publication. FormSubmit is an external service.",
  "Ik verklaar dat de gegevens kloppen voor zover bij mij bekend en dat ik de officiële informatie mag doorgeven.": "I confirm that the details are accurate to the best of my knowledge and that I may submit the official information.",
  "Evenement aanmelden ↗": "Submit event ↗",
  "Kopieer gegevens": "Copy details",
  "Veelgestelde vragen": "Frequently asked questions",
  "Goed om te weten.": "Good to know.",
  "Kan ik mijn evenement gratis aanmelden?": "Can I list my event for free?",
  "Ja. Het aanmelden van een evenement en een basisvermelding in RaceAtlas zijn gratis. We controleren gegevens en behouden de mogelijkheid om een aanmelding te corrigeren of niet te plaatsen.": "Yes. Submitting an event and getting a basic RaceAtlas listing is free. We review all information and may request corrections or decline a listing.",
  "Wanneer staat mijn evenement online?": "When will my event appear online?",
  "We beoordelen inzendingen handmatig voordat ze op de kalender verschijnen. Er is op dit moment geen gegarandeerde publicatietermijn. Een bevestiging van het formulier is dus niet hetzelfde als publicatie.": "We review submissions manually before they appear in the calendar. There is currently no guaranteed publication timeframe. Form submission confirmation does not mean the event is published.",
  "Wat als de datum of inschrijving verandert?": "What if the date or registration details change?",
  "Klik op Gegevens corrigeren in het evenementdetail. Het formulier neemt evenementnaam en -ID over. Vermeld de officiële bronlink; we passen de kalender pas aan na controle.": "Choose Correct details on the event page. The form automatically includes the event name and ID. Add the official source URL; changes are published only after review.",
  "Kan RaceAtlas mijn evenement extra onder de aandacht brengen?": "Can RaceAtlas help promote my event?",
  "Voor vragen over samenwerkingen kun je rechtstreeks contact opnemen. We delen eventuele mogelijkheden en afspraken persoonlijk en publiceren geen standaardpakketten op deze pagina.": "Contact us to discuss partnerships. We share options and terms individually rather than publishing standard packages here.",
  "Wat gebeurt er met mijn formuliergegevens?": "What happens to my form data?",
  "Het formulier gebruikt de externe dienst FormSubmit om gegevens naar ons contactadres te sturen. Verstuur alleen informatie die nodig is voor de aanvraag. Je kunt ook rechtstreeks mailen naar trizentro.team@gmail.com.": "The form uses the external service FormSubmit to deliver information to our contact address. Please submit only information needed for the request. You can also email trizentro.team@gmail.com.",
  "Datum niet bevestigd": "Date not confirmed",
  "Bron controleren": "Check source",
  "Mijn opgeslagen": "My saved",
  "Officiële organisatorsite": "Official organizer website",
  "Organisatielink ontbreekt": "Organizer link missing",
  "Geen wedstrijden voor deze combinatie van filters.": "No races match these filters.",
  "Je hebt nog geen evenementen bewaard. Bekijk de evenementen en klik op + Bewaar.": "You haven't saved any races yet. Browse events and select + Save.",
  "Wis filters en bekijk alle evenementen": "Clear filters and show all events",
  "Bekijk evenementen": "Browse events",
  "Bekijk mijn seizoen": "View my season",
  "Bron laatst vastgelegd": "Source last recorded",
  "Broncontrole niet geregistreerd": "No source check recorded",
  "De gewone evenementenkalender blijft werken. Bekijk de organisatorsite voor inschrijfgegevens.": "The event calendar still works. Check the organizer for registration information.",
  "Inschrijfradar tijdelijk niet beschikbaar.": "Registration radar temporarily unavailable.",
  "Momenteel geen inschrijfdatums in beeld. Controleer altijd de organisator voor de actuele stand.": "No upcoming registration dates are currently shown. Always check the organizer for the latest availability.",
  "Geen bekende aankomende inschrijfdatums bij jouw opgeslagen races. Bewaar een wedstrijd om deze hier te volgen.": "No upcoming registration dates are known for your saved races. Save a race to track it here.",
  "Dezelfde sport als jouw seizoen": "Same sport as your season",
  "Vergelijkbare afstand": "Similar distance"
});
Object.assign(strings,{
  "Sluiten": "Close",
  "Locatie": "Location",
  "Afstanden": "Distances",
  "Laatst gecontroleerd": "Last checked",
  "Einde inschrijfperiode": "Registration deadline",
  "Programma/datumtoelichting": "Schedule / date note",
  "Prijsstatus": "Price status",
  "Extra informatie": "Additional information",
  "Verdere openingsinformatie": "More opening details",
  "Pre-registratie vanaf": "Pre-registration opens",
  "Opening inschrijving": "Registration opens",
  "Nog niet gepubliceerd": "Not yet published",
  "Openingsdatum nog niet gepubliceerd": "Opening date not yet published",
  "Inschrijving nog niet geopend (volgens organisator)": "Registration not yet open (according to organizer)",
  "Bij laatst gecontroleerde bron: reguliere startbewijzen uitverkocht": "Standard entries sold out at last source check",
  "Reguliere inschrijfperiode gesloten (alternatieven mogelijk)": "Standard registration closed (alternatives may exist)",
  "Verschilt per onderdeel; zie aanvullende informatie": "Varies by event category; see details",
  "Inschrijving opent later volgens bron": "Registration opens later according to source",
  "Alleen op locatie inschrijven": "On-site registration only",
  "Late-bird-inschrijving vermeld": "Late registration listed",
  "Inschrijfpagina beschikbaar; controleer actuele status": "Registration page available; verify current status",
  "Verwachte openingsperiode bekend": "Expected registration period known",
  "Openingsdatum of actuele status niet bevestigd": "Opening date or current status unconfirmed",
  "Actuele beschikbaarheid controleren bij organisator": "Check live availability with the organizer",
  "Tegenstrijdige informatie op officiële bron — niet bevestigd": "Conflicting information on the official source — unconfirmed",
  "Tegenstrijdige prijzen op organisatorwebsite — controleer bij organisator": "Conflicting fees on organizer website — verify with organizer",
  "Prijs en inschrijfdatum zijn alleen ingevuld wanneer er broninformatie beschikbaar is. Controleer wijzigingen, verschillende tarieven en beschikbaarheid altijd bij de organisator. Een maand zonder specifieke dag is geen bevestigde openingsdatum.": "Fees and registration dates are shown only when source information is available. Always confirm changes, different fees and availability with the organizer. A month without an exact day is not a confirmed opening date.",
  "Voor dit evenement ontbreekt nog een specifieke bronlink. De vermelde wedstrijddatum en gegevens moeten nog gecontroleerd worden bij de organisator. Je kunt via Gegevens corrigeren een officiële bron doorgeven.": "This event is missing a dedicated source link. The listed race date and details still need organizer verification. You can submit an official source through Correct details.",
  "Bron inschrijfgegevens: ": "Registration source: ",
  "Bron prijs: ": "Fee source: ",
  "Bekijk inschrijfbron ↗": "Check registration source ↗",
  "Deel evenement": "Share event",
  "🔔 Meldingen instellen": "🔔 Configure alerts",
  "Bron: RaceAtlas · AI-gegenereerd sfeerbeeld, geen officiële evenementfoto": "Source: RaceAtlas · AI-generated illustration, not an official event photo",
  "Bron: RaceAtlas · AI-gegenereerd reservebeeld, geen officiële evenementfoto": "Source: RaceAtlas · AI-generated fallback artwork, not an official event photo",
  "Evenementfoto": "Event photo",
  " · Fotobron": " · Photo source",
  " · Licentie": " · License",
  "Kopiëren niet gelukt": "Copy failed",
  "Bewaar je voorkeuren en voeg bekende wedstrijd- en inschrijfdatums toe aan je eigen agenda.": "Save your preferences and add known race and registration dates to your own calendar.",
  "Officiële wedstrijddatum bekend": "Official race date known",
  "Herinnering: 1 week, 1 dag en op de dag zelf": "Remind me: 1 week, 1 day and race day",
  "De wedstrijddatum is nog niet officieel bevestigd. Daarom maken we hiervoor geen kalenderherinnering. Een bevestigde openingsdatum voor inschrijving kan wel apart worden toegevoegd.": "The race date is not yet officially confirmed, so no calendar reminder can be created. A confirmed registration opening date can still be added separately.",
  "Automatische e-mails zijn nog niet actief: daarvoor moeten een beveiligde verzenddienst, bevestiging van e-mailadressen en afmeldfunctie worden aangesloten. We verzamelen nu geen e-mailadressen. Voorkeuren blijven op dit apparaat.": "Automatic emails are not active yet. They require a secure sending service, verified email addresses and unsubscribe support. We do not collect email addresses yet. Preferences stay on your device.",
  "Bewaar voorkeuren": "Save preferences",
  "Broncontrole geregistreerd": "Source review recorded",
  "Officiële bron opnieuw bekijken": "Recheck official source",
  "Event details": "Event details",
  "Prijs en inschrijfdatum": "Fee and registration date"
});
Object.assign(strings,{
  "Australië": "Australia",
  "Denemarken": "Denmark",
  "Estland": "Estonia",
  "Frankrijk": "France",
  "Griekenland": "Greece",
  "Ierland": "Ireland",
  "Italië": "Italy",
  "Japan": "Japan",
  "Luxemburg": "Luxembourg",
  "Oostenrijk": "Austria",
  "Polen": "Poland",
  "Portugal": "Portugal",
  "Roemenië": "Romania",
  "Slowakije": "Slovakia",
  "Spanje": "Spain",
  "Verenigd Koninkrijk": "United Kingdom",
  "Verenigde Staten": "United States",
  "Zuid-Afrika": "South Africa",
  "Zweden": "Sweden",
  "Zwitserland": "Switzerland",
  "Cross / trail": "Cross-country / trail",
  "Crossduatlon": "Cross duathlon",
  "Crosstriatlon": "Cross triathlon",
  "Duatlon": "Duathlon",
  "Kidsrun": "Kids race",
  "Lange afstand": "Long distance",
  "Middenafstand": "Middle distance",
  "Multisport": "Multisport",
  "Olympisch": "Olympic distance",
  "Racefiets": "Road cycling",
  "Recreatief": "Recreational",
  "Toertocht": "Sportive",
  "Wintertriatlon": "Winter triathlon",
  "Zwemloop": "Swim-run",
  "Weg": "Road",
  "Over RaceAtlas": "About RaceAtlas",
  "Ontdek wedstrijden": "Explore races"
});
Object.assign(strings,{
  "Nog te regelen": "To do",
  "Ingeschreven ✓": "Registered ✓",
  "Wachtlijst": "Waitlist",
  "Mijn inschrijving": "My registration",
  "Bekijk details": "View details",
  "Geen datum bekend": "No known date",
  "Geen aankomende wedstrijden": "No upcoming races",
  "Datum nog niet bevestigd": "Date not confirmed",
  "Datum vermeld, niet bevestigd": "Listed date, not confirmed",
  "Maand verwacht; exacte datum onbekend": "Expected month; exact date unknown",
  " · bevestigd": " · confirmed",
  "Bevestigd": "Confirmed",
  "Jouw eerstvolgende bevestigde wedstrijd": "Your next confirmed race",
  "Vandaag": "Today",
  "Morgen": "Tomorrow",
  "Nog geen aankomende wedstrijd met officieel bevestigde datum in je seizoen.": "No upcoming race with an officially confirmed date in your season.",
  "Je maandplanning verschijnt zodra je wedstrijden bewaart.": "Your month-by-month plan will appear when you save races.",
  "Controleer de officiële organisator voordat je reis of inschrijving vastlegt.": "Check the official organizer before booking travel or registering.",
  "Twee wedstrijden op dezelfde dag": "Two races on the same day",
  "Controleer of dit past bij je herstel en trainingsbelasting.": "Check whether this fits your recovery and training load.",
  "Bewaar één of meer wedstrijden om een seizoenscheck te krijgen.": "Save one or more races to get a season health check.",
  "✓ Geen datumconflicten gevonden tussen jouw bevestigde toekomstige wedstrijden.": "✓ No date conflicts found between your confirmed upcoming races.",
  "Je hebt nog geen wedstrijden bewaard. Klik op + Bewaar bij een evenement om jouw seizoen samen te stellen.": "You haven't saved any races yet. Select + Save to build your season.",
  "Geselecteerd op jouw sporten, afstanden, regio en spreiding van wedstrijden. Alleen officieel bevestigde datums.": "Selected based on your sports, distances, region and race spacing. Only officially confirmed dates.",
  "Ter inspiratie: grote evenementen met officieel bevestigde datums. Sla races op om betere suggesties te krijgen.": "For inspiration: major events with officially confirmed dates. Save races to improve your recommendations.",
  "Momenteel geen aanvullende wedstrijden met bevestigde datum gevonden in deze sporten.": "No additional races with confirmed dates were found for these sports.",
  "✓ Datum officieel bevestigd": "✓ Date officially confirmed",
  "Controleer herstel tussen wedstrijden": "Check your recovery between races",
  "Groot evenement met bevestigde datum": "Major event with a confirmed date",
  "Geen toekomstige inschrijfopeningen of deadlines met een specifieke datum gevonden. Controleer de organisator voor nieuwe informatie.": "No upcoming registration openings or deadlines with exact dates were found. Check with the organizer for updates.",
  "Geen opgeslagen wedstrijden met officieel bevestigde datum. Controleer de organisatorsite en probeer later opnieuw.": "No saved races with officially confirmed dates. Check the organizer website and try again later.",
  "Kon het JSON-bestand niet lezen. Je seizoen is ongewijzigd.": "Could not read the JSON file. Your season was not changed.",
  "Importeren is niet gelukt. Je seizoen is ongewijzigd.": "Import failed. Your season was not changed.",
  "Beschikbaarheid kan per afstand verschillen": "Availability may vary by distance",
  "Controleer eventuele heropening bij organisator": "Check the organizer for any reopening",
  "Beschikbaarheid verschilt per afstand": "Availability varies by distance",
  "Controleer de gekozen afstand bij de organisator.": "Check your chosen race distance with the organizer.",
  "Inschrijving nog niet geopend volgens bron": "Registration not yet open according to source",
  "Dit bevestigt niet dat er nog plaatsen zijn": "This does not confirm that places remain available",
  "Exacte datum onbekend": "Exact date unknown",
  "Bekijk de officiële evenementpagina voor actuele inschrijving": "Check the official event page for current registration",
  "Je seizoen is ongewijzigd.": "Your season is unchanged.",
  "Nog geen officiële wedstrijddata": "No official race dates yet",
  "Geen wedstrijddata beschikbaar": "No race dates available",
  "Link gekopieerd ✓": "Link copied ✓",
  "Kopieer deze link:": "Copy this link:",
  "Verwijder uit mijn seizoen": "Remove from my season",
  "Bewaar in mijn seizoen": "Save to my season",
  "Bewaren in mijn seizoen": "Save to my season",
  "Mijn inschrijfstatus": "My registration status",
  "Mijn inschrijfstatus voor ": "My registration status for ",
  "Inschrijfinfo": "Registration information",
  "Inschrijfinformatie": "Registration information",
  "Details bekijken": "View details",
  "Controleer bij de organisator": "Verify with organizer",
  "nog te controleren": "to verify",
  "Officiële wedstrijddatum op moment van export. Controleer actuele informatie: ": "Official race date at export. Check current information: ",
  "Gepubliceerde datum, niet live bijgewerkt. Controleer bij de organisator: ": "Published date, not live-updated. Check with organizer: ",
  "RaceAtlas — AI-gegenereerd sfeerbeeld, geen officiële wedstrijdfoto": "RaceAtlas — AI-generated illustration, not an official race photo",
  "RaceAtlas · AI-gegenereerd evenement-sfeerbeeld; geen echte opname": "RaceAtlas · AI-generated event illustration; not a real photograph",
  "Wedstrijddatum bevestigd": "Race date confirmed",
  "Datum nog onbekend": "Date still unknown",
  "Mijn opgeslagen wedstrijden": "My saved races",
  "Mijn racekalender": "My race calendar",
  " · nog niet automatisch gecontroleerd": " · not automatically verified",
  "Vanuit mijn seizoen": "From my season",
  "Algemene vraag": "General inquiry",
  "Evenementgegevens aanpassen": "Update event details",
  "Naam organisatie": "Organization name",
  "Selecteer en kopieer bovenstaande gegevens.": "Select and copy the details above.",
  "Gegevens gekopieerd.": "Details copied.",
  "Evenement aanmelden ↗": "Submit event ↗",
  "Bericht versturen ↗": "Send message ↗",
  "Contactformulier openen": "Open contact form",
  "Gegevens kunnen momenteel niet geladen worden. Meld correcties rechtstreeks via het organisatorenformulier.": "Data is temporarily unavailable. Please send corrections through the organizer form.",
  "Laatste broncontrole niet geregistreerd": "No source review date recorded",
  "Laatste broncontrole": "Last source review",
  "Brongegevens laden…": "Loading source data…",
  "INSCHRIJFRADAR": "REGISTRATION RADAR",
  "Wedstrijdkalender": "Race calendar",
  "Opening was op ": "Registration opened on ",
  "Mijn seizoen": "My season",
  "Meer wedstrijden tonen": "Show more races",
  "Je vraagt te snel aan": "Too many requests. Please try again later."
});
const translatedPatterns=[
  [
    "^(\\d+) van (\\d+) geplande wedstrijden · (.+)\\. (\\d+) met officieel bevestigde datum\\.$",
    "$1 of $2 planned races · $3. $4 with officially confirmed dates."
  ],
  [
    "^Doel bereikt!$",
    "Goal achieved!"
  ],
  [
    "^(\\d+) te plannen$",
    "$1 to plan"
  ],
  [
    "^(\\d+) bevestigd · (\\d+) te controleren$",
    "$1 confirmed · $2 to verify"
  ],
  [
    "^(\\d+) met officieel bevestigde datum · (\\d+) met nog te controleren datum\\. Controleer details altijd bij de organisator\\.$",
    "$1 with officially confirmed dates · $2 dates to verify. Always check details with the organizer."
  ],
  [
    "^(\\d+) wedstrijden opgeslagen · (\\d+) met officieel bevestigde datum · (\\d+) nog te controleren$",
    "$1 races saved · $2 dates confirmed · $3 to verify"
  ],
  [
    "^(\\d+) opgeslagen · (\\d+) aankomende wedstrijden met bevestigde datum\\. Deze check is een hulpmiddel, geen trainingsadvies\\.$",
    "$1 saved · $2 upcoming races with confirmed dates. This check is a planning aid, not training advice."
  ],
  [
    "^(\\d+) datum(s)? nog niet bevestigd$",
    "$1 dates not yet confirmed"
  ],
  [
    "^(\\d+) datum nog niet bevestigd$",
    "$1 date not yet confirmed"
  ],
  [
    "^Wedstrijden slechts (\\d+) dag(en)? uit elkaar$",
    "Races only $1 days apart"
  ],
  [
    "^Over (\\d+) dagen$",
    "In $1 days"
  ],
  [
    "^Jouw eerstvolgende bevestigde wedstrijd · (.+)$",
    "Your next confirmed race · $1"
  ],
  [
    "^En (\\d+) andere opgeslagen evenementen\\.$",
    "And $1 other saved events."
  ],
  [
    "^(\\d+) ingeschreven · (\\d+) op wachtlijst · (\\d+) nog te regelen\\. Deze statussen houd je zelf bij; RaceAtlas controleert geen inschrijvingen\\.$",
    "$1 registered · $2 on the waitlist · $3 to arrange. You manage these statuses; RaceAtlas does not check registrations."
  ],
  [
    "^(\\d+) wedstrijden opgeslagen · (\\d+) met relevante inschrijfinformatie$",
    "$1 saved races · $2 with relevant registration information"
  ],
  [
    "^(\\d+) wedstrijden in database · (\\d+) officieel gedateerd · (\\d+) relevante inschrijfdatums$",
    "$1 races in database · $2 officially dated · $3 relevant registration dates"
  ],
  [
    "^(\\d+) wedstrijden in de catalogus · (\\d+) met officieel gemarkeerde datum · (\\d+) met voorlopige datum · (\\d+) relevante inschrijfdatums$",
    "$1 races in the catalog · $2 with officially marked dates · $3 provisional dates · $4 relevant registration dates"
  ],
  [
    "^(.+) · (\\d+) met officiële evenementwebsite · (\\d+) met prijs · (.+)$",
    "$1 · $2 with an official event website · $3 with prices · $4"
  ],
  [
    "^(.+) bewaren in mijn seizoen$",
    "Save $1 to my season"
  ],
  [
    "^(\\d+) bekende inschrijfdatums geëxporteerd\\. Dit is een momentopname en wordt niet automatisch bijgewerkt\\.$",
    "$1 registration dates exported. This is a snapshot and will not update automatically."
  ],
  [
    "^(\\d+) wedstrijden opgeslagen$",
    "$1 races saved"
  ],
  [
    "^Bron laatst vastgelegd: (.+)$",
    "Source last recorded: $1"
  ],
  [
    "^Bron vastgelegd op (.+)$",
    "Source recorded on $1"
  ],
  [
    "^([🏃🚴🏊]\\s*)Hardlopen: (\\d+)$",
    "$1Running: $2"
  ],
  [
    "^([🏃🚴🏊]\\s*)Fietsen: (\\d+)$",
    "$1Cycling: $2"
  ],
  [
    "^([🏃🚴🏊]\\s*)Triatlon: (\\d+)$",
    "$1Triathlon: $2"
  ],
  [
    "^(\\d+) evenementen gevonden · (\\d+) zichtbaar$",
    "$1 events found · $2 shown"
  ],
  [
    "^Toon (\\d+) meer evenementen ↓$",
    "Show $1 more events ↓"
  ]
].map(([pattern,to])=>[new RegExp(pattern,"i"),to]);
const sentenceReplacements=[["(\\d+) te plannen","$1 left to plan"],["Over (\\d+) dagen","In $1 days"],["Over 1 dag","In 1 day"],["Vandaag","Today"],["Morgen","Tomorrow"],["(\\d+) met officieel bevestigde datum","$1 with officially confirmed dates"],["(\\d+) nog te controleren","$1 to verify"],["(\\d+) wedstrijden opgeslagen","$1 races saved"],["(\\d+) evenementen opgeslagen","$1 saved events"],["(\\d+) bevestigde wedstrijd(en)?","$1 confirmed races"],["(\\d+) te controleren","$1 to verify"],["(\\d+) op wachtlijst","$1 on waitlist"],["(\\d+) ingeschreven","$1 registered"],["(\\d+) gepland(e)? wedstrijden","$1 planned races"],["Datum vermeld, niet bevestigd","Date listed, unconfirmed"],["Nog niet automatisch gecontroleerd","Not automatically verified"],["nog niet bevestigd","not yet confirmed"],["nog te controleren datum","date to verify"],["volgens bron","according to source"],["bij organisator","with organizer"],[" · (\\\\d+) met prijs"," · $1 with prices"],[" · (\\\\d+) met officiële evenementwebsite"," · $1 with an official event website"],[" en (\\\\d+) andere"," and $1 others"]].map(([p,v])=>[new RegExp(p,"gi"),v]);
Object.assign(strings,{
  "Organisator bevestigde reguliere opening op 27 juli 2026 om 09:00. Inschrijving volgens bericht uiterlijk 28 december 2026 of eerder bij uitverkoop; controleer beschikbaarheid per afstand.": "The organizer confirmed that standard registration opened on 27 July 2026 at 09:00. According to the announcement, registration closes by 28 December 2026 or earlier if sold out; check availability by distance.",
  "Op 9 november was de 25 km nog inschrijfbaar; marathon, 10EM, 8 km en kidsrun staan als uitverkocht vermeld. Controleer beschikbaarheid per afstand.": "On 9 November, the 25 km distance was still available; the marathon, 10 miles, 8 km and kids' run were listed as sold out. Check availability by distance.",
  "Volgens organisator (13 oktober 2026) zijn individuele 10 km, 21,1 km en 30 km uitverkocht; Business Run en Kids Run hadden nog plaatsen. Controleer actuele beschikbaarheid bij organisator.": "According to the organizer (13 October 2026), individual entries for 10 km, 21.1 km and 30 km had sold out; Business Run and Kids Run still had places. Check current availability with the organizer.",
  "Inschrijving voor 2027 geopend; halve marathon uitverkocht, andere onderdelen op organisatorsite controleren.": "Registration for 2027 is open; the half marathon is sold out. Check other distances on the organizer website.",
  "Halve marathon is uitverkocht. Andere afstanden hebben verschillende tarieven en beschikbaarheid.": "The half marathon is sold out. Different fees and availability apply to the other distances.",
  "Online inschrijving beschikbaar; de exacte openingsdag is niet bevestigd.": "Online registration is available; the exact opening date has not been confirmed.",
  "De bekeken organisatorsite beschrijft nog de editie 2026; wedstrijddatum en inschrijfopening 2027 apart controleren.": "The organizer website reviewed still describes the 2026 edition; check the 2027 race date and registration opening separately.",
  "Reguliere inschrijfperiode voor 2027 was van 1 t/m 31 oktober 2026; loting/toewijzing en eventuele alternatieven via de organisator.": "The standard 2027 registration period ran from 1 to 31 October 2026; check the organizer for ballot results, allocation and possible alternatives.",
  "Reguliere inschrijving start 1 januari 2027 om 00.00 uur. Online inschrijven kan volgens organisator tot 14 mei. Mogelijk eerdere voorrangstarieven.": "Standard registration begins on 1 January 2027 at midnight. According to the organizer, online registration runs until 14 May. Earlier priority pricing may apply.",
  "Organisator vermeldt dat alle reguliere inschrijvingen uitverkocht zijn. Er is nog een apart Nirvana Enhanced Pack mogelijk; getoonde prijs is een pakketprijs en geen standaard deelnameprijs.": "The organizer says all standard entries are sold out. A separate Nirvana Enhanced Pack may still be available; the displayed fee is a package price, not the standard entry fee.",
  "Kwalificatieronde gesloten op 18 september 2026; geen heropening voor kwalificanten aangekondigd. Eventuele alternatieve toegang afzonderlijk bij B.A.A. nagaan.": "The qualification window closed on 18 September 2026; no reopening for qualifiers has been announced. Check alternative entry options with the B.A.A.",
  "Algemene loting voor 2027 liep van 24 april t/m 1 mei 2026. Andere toegangsroutes via organisator.": "The general 2027 ballot ran from 24 April to 1 May 2026. Other entry routes are listed by the organizer.",
  "Organisator meldt dat de loting voor 2027 is gesloten. Andere deelnameroutes via de organisator.": "The organizer reports that the 2027 ballot has closed. Check other participation routes with the organizer.",
  "Loting 2027 was 29 september t/m 19 oktober 2026; charity- en reisprogramma's kunnen nog alternatieven bieden.": "The 2027 ballot ran from 29 September to 19 October 2026; charity and travel programs may offer alternatives.",
  "De loting voor 2027 wordt op de officiële site als geopend vermeld. Controleer actuele einddatum.": "The official website lists the 2027 ballot as open. Verify the current closing date.",
  "Reguliere aanvraagperiode voor 2027 sloot 29 oktober 2026; charityplaatsen en later reispakketten zijn alternatieven.": "The regular 2027 application period closed on 29 October 2026; charity entries and later travel packages may offer alternatives.",
  "Voor loting 2027 zijn op de officiële NYRR-pagina nog geen aanvraagdatums gepubliceerd.": "No application dates for the 2027 ballot have been published on the official NYRR page yet.",
  "Marathonafstand is uitverkocht; andere afstanden bij organisator controleren.": "The marathon distance is sold out; check other distances with the organizer.",
  "Alleen inschrijven op de startlocatie.": "Registration is only available at the starting location.",
  "Clubkalender toont de ATB-toertocht op 31 januari 2027; specifieke inschrijfvoorwaarden nog niet gevonden.": "The club calendar lists the MTB sportive for 31 January 2027; detailed registration conditions have not yet been found.",
  "Organisatorsite toont nog informatie van 2026; exacte datum 2027 niet officieel bevestigd.": "The organizer website still shows 2026 information; the exact 2027 date has not been officially confirmed.",
  "Organisator toont nog editie 2026. De wedstrijddag en inschrijfopening voor 2027 zijn niet officieel bevestigd.": "The organizer still displays the 2026 edition. The 2027 race date and registration opening have not been officially confirmed.",
  "De officiële inschrijfpagina bevat naast 2027 ook regels uit 2026, met tegenstrijdige statusmeldingen. Controleer de beschikbaarheid op de inschrijfpagina.": "The official registration page includes rules from both 2027 and 2026 and contains conflicting status messages. Verify availability directly on the registration page.",
  "Inschrijflink op organisatorsite beschikbaar; exacte openingsdag niet gepubliceerd.": "The organizer website provides a registration link; the exact opening date has not been published.",
  "De organisator vermeldt dat de inschrijving voor de editie van 2027 op 19 december 2026 opent.": "The organizer states that registration for the 2027 edition opens on 19 December 2026.",
  "De loting voor startbewijzen opent op 12 november 2026 om 09:00 en sluit op 17 november 2026 om middernacht, volgens de organisator. Loting kost €4 plus transactiekosten; startbewijs €130 plus transactiekosten.": "According to the organizer, the entry ballot opens on 12 November 2026 at 09:00 and closes on 17 November 2026 at midnight. The ballot costs €4 plus transaction fees; an entry costs €130 plus transaction fees.",
  "Tarief verschilt per afstand en inschrijfmoment: o.a. 5 km volwassenen € 19–24, 10 km € 28,50–32,50, halve marathon € 35–41.": "Fees vary by distance and time of registration: for example, adult 5 km €19–24, 10 km €28.50–32.50 and half marathon €35–41.",
  "2027: kidsrun gratis, 5 km € 16, 10 km € 30, halve marathon € 45, marathon € 75.": "2027: kids' race free, 5 km €16, 10 km €30, half marathon €45, marathon €75.",
  "$ 270 voor toegelaten kwalificanten; geen algemene prijs voor alle soorten deelname.": "$270 for accepted qualifiers; not a general entry fee for every category.",
  "AUD 285 voor AU/NZ-inwoners, AUD 340 voor internationale deelnemers; verplichte CO₂-heffing en eventuele extra's komen erbij.": "AUD 285 for residents of Australia/New Zealand and AUD 340 for international participants; a mandatory CO₂ levy and other extras may apply.",
  "Per afstand: 4 km € 22; 12 km € 30; 10 EM € 33; Kids € 7.": "By distance: 4 km €22, 12 km €30, 10 miles €33, kids €7.",
  "Voorinschrijving: 10,1 km € 8,50; 21,1 km € 14; 31,5 km € 16,50; marathon € 20. Daginschrijving duurder.": "Early registration: 10.1 km €8.50, 21.1 km €14, 31.5 km €16.50, marathon €20. Race-day registration costs more.",
  "Normaal € 8, PLUS € 6. Startdatum inschrijving niet bevestigd.": "Standard €8, PLUS €6. Registration opening date not confirmed.",
  "Normaal € 10, PLUS € 8; kinderen t/m 15 jaar onder begeleiding gratis.": "Standard €10, PLUS €8; children up to age 15 accompanied by an adult enter free.",
  "Voorinschrijving normaal € 42 (PLUS € 39); daginschrijving normaal € 60 (PLUS € 57).": "Early registration: standard €42 (PLUS €39); race-day registration: standard €60 (PLUS €57).",
  "Normaal tarief € 6; Fietssport PLUS € 5. Inschrijven vanaf 17 november 2026.": "Standard fee €6; Fietssport PLUS €5. Registration opens on 17 November 2026.",
  "Normaal € 8, PLUS € 6.": "Standard €8, PLUS €6.",
  "Prijs nog te bevestigen: op dezelfde officiële Kidsrun-pagina staat € 7,50 bovenaan en € 6,00 in de FAQ. Vraag organisator om actuele prijs.": "Fee to be confirmed: the same official Kidsrun page shows €7.50 near the top but €6.00 in the FAQ. Ask the organizer for the current fee.",
  "De 5 km nightrun is op zaterdag 8 mei; marathon, halve marathon, 10 km en kidsrun zijn op zondag 9 mei.": "The 5 km night run is on Saturday 8 May; the marathon, half marathon, 10 km and kids' run are on Sunday 9 May.",
  "Unieke tweedaagse editie op 24 én 25 april 2027; deelnemers starten op één van beide dagen.": "Special two-day edition on 24 and 25 April 2027; participants race on one of the two days.",
  "Marathon op zondag 31 oktober; evenementweekend 30–31 oktober 2027.": "Marathon on Sunday 31 October; event weekend 30–31 October 2027.",
  "De organisator heeft nog geen exacte wedstrijddatum voor de editie van 2027 bevestigd. Traditioneel in november.": "The organizer has not yet confirmed an exact race date for the 2027 edition. Traditionally held in November.",
  "Voor 2027 is geen eenduidig bevestigde inschrijfopening vastgesteld. De melding 'vanaf 5 januari' heeft onvoldoende jaaraanduiding.": "No unambiguous confirmed opening date for 2027 has been established. The message 'from 5 January' does not specify a year."
});
Object.assign(strings,{
  "Exacte datum ontbreekt": "Exact date missing",
  "Datum nog niet officieel bevestigd": "Date not officially confirmed",
  "Datum gemarkeerd als officieel · geen controledatum": "Date marked official · no review date recorded",
  "Exacte datum achterhalen": "Find the exact date",
  "Mogelijke organisatielink — nog controleren": "Possible organizer link — verification needed",
  "Bron vastgelegd op ": "Source recorded on ",
  " nog zonder organisatielink": " without an organizer link",
  "Optioneel: extra toelichting voor het RaceAtlas-team": "Optional: further explanation for the RaceAtlas team",
  "RaceAtlas evenement-ID: ": "RaceAtlas event ID: ",
  "Nieuwe datum (indien relevant): ": "New date (if relevant): ",
  "Officiële bronlink: ": "Official source URL: ",
  "Contactbericht gekopieerd. Deel dit via je eigen e-mail of andere privé contactroute.": "Contact message copied. Share it through your email or another private contact channel.",
  "De formulierdienst heeft je bericht geaccepteerd. Bedankt! We nemen contact op als er meer informatie nodig is.": "The form service accepted your message. Thank you! We will get in touch if we need more information.",
  "De formulierdienst heeft je correctieverzoek geaccepteerd. RaceAtlas controleert de bron vóór eventuele aanpassing; de kalender is nog niet gewijzigd.": "The form service accepted your correction request. RaceAtlas will verify the source before making changes; the calendar has not yet been updated.",
  "De formulierdienst wacht nog op een eenmalige activatie door RaceAtlas. Je bericht is nog niet bevestigd als afgeleverd. Gebruik voorlopig de knop Kopieer bericht of mail rechtstreeks.": "The form service still requires one-time activation by RaceAtlas. Delivery has not been confirmed. Use Copy message or email us directly for now.",
  "Versturen is niet gelukt. Probeer opnieuw of mail rechtstreeks naar trizentro.team@gmail.com.": "Could not send your message. Try again or email trizentro.team@gmail.com directly.",
  "Er is geen bevestiging van verzending ontvangen. Probeer opnieuw of mail rechtstreeks naar trizentro.team@gmail.com.": "No delivery confirmation was received. Try again or email trizentro.team@gmail.com directly.",
  "Nog niet bekend": "Not yet known",
  "Bron voor datum, inschrijving en prijs: ": "Source for date, registration and price: ",
  "Officiële website: ": "Official website: ",
  "Controleer officiële bron en eventuele doublures vóór publicatie.": "Verify the official source and check for duplicates before publishing.",
  "Bevestig eerst dat je de foto op RaceAtlas mag laten publiceren.": "First confirm you have permission to publish the photograph on RaceAtlas.",
  "We versturen de evenementgegevens via de formulierdienst.": "We are sending the event details through the form service.",
  "RaceAtlas — evenement aanmelden: ": "RaceAtlas — event submission: ",
  "Je evenement is ter beoordeling ingediend. Het verschijnt pas na controle op de kalender.": "Your event has been submitted for review. It will appear in the calendar only after verification.",
  "De ontvangst moet eerst eenmalig worden geactiveerd door RaceAtlas. De aanmelding is nog niet bevestigd. Probeer later opnieuw of mail ons rechtstreeks.": "One-time activation is needed before the form can be received. Your submission has not been confirmed. Try again later or email us directly.",
  "Aanmelden is niet gelukt. Probeer opnieuw of mail de gegevens naar trizentro.team@gmail.com.": "Submission failed. Try again or email the details to trizentro.team@gmail.com.",
  "Geen bevestiging van ontvangst. Probeer opnieuw of mail de gegevens naar trizentro.team@gmail.com.": "No confirmation of receipt. Try again or email the details to trizentro.team@gmail.com.",
  "Inschrijving opent morgen": "Registration opens tomorrow",
  "Inschrijving opent vandaag": "Registration opens today",
  "Er is nog geen officieel bevestigde wedstrijddatum of exacte inschrijfdatum voor dit evenement. Je voorkeuren kunnen wel worden bewaard.": "This event has no officially confirmed race date or exact registration date yet. You can still save your preferences.",
  "Inschrijfdatum bekend": "Registration date known",
  "Meldingen voor ": "Alerts for ",
  "Alleen historische maand bekend": "Historical month only",
  "Bekijk prijs bij organisator ↗": "Check fee with organizer ↗",
  "Openingsdatum volgens bron · ": "Registration opening according to source · ",
  "Deadline volgens bron · ": "Deadline according to source · ",
  "Binnenkort": "Coming soon",
  "Voorlopig": "Provisional",
  "Kopieer bericht": "Copy message",
  "Wedstrijdgegevens": "Event details",
  "Organisator": "Organizer",
  "Meer informatie": "More information",
  "Foto bron": "Photo source",
  "Neem contact op": "Get in touch",
  "Geen controledatum": "No review date",
  "Broninformatie": "Source information"
});
Object.assign(strings,{
  "Openingsdatum": "Opening date",
  "Openingsdatum volgens bron": "Registration opening according to source",
  "Deadline volgens bron": "Deadline according to source",
  "Brongegevens konden niet worden geladen.": "Could not load source data.",
  "INSCHRIJFRADAR": "REGISTRATION RADAR",
  "Verwachte opening": "Expected opening",
  "Gemarkeerde datum": "Listed date",
  "Groot evenement": "Major event",
  "Kalendergegevens": "Calendar data",
  "Inschrijving geopend volgens bron": "Registration open according to source",
  "Inschrijvingsdeadline": "Registration deadline",
  "Gecontroleerde gegevens": "Reviewed information",
  "Organisatorsite": "Organizer website",
  "Registratie": "Registration",
  "Prijs onbekend": "Price unknown",
  "Kosten onbekend": "Cost unknown",
  "Tot en met": "Through",
  "Inschrijving": "Registration",
  "Startdatum": "Opening date",
  "Vol": "Full",
  "Deelnemers": "Participants",
  "Officieel": "Official",
  "Aankomende wedstrijden": "Upcoming races",
  "bekend": "known",
  "Geen startbewijzen meer beschikbaar": "No entries available",
  "Niet gevonden": "Not found",
  "Inschrijven": "Register",
  "Bevestigd op organisatorsite": "Confirmed on organizer website",
  "Toon minder": "Show less",
  "Toon meer": "Show more"
});
const extendedPatterns=[["^Openingsdatum volgens bron · (.+)$","Registration opening according to source · $1"],["^Deadline volgens bron · (.+)$","Deadline according to source · $1"],["^Datum vermeld — check bij organisator$","Date listed — check with the organizer"],["^(.+) · nog niet automatisch gecontroleerd$","$1 · not automatically reviewed"],["^([A-Za-zÀ-ÿ]+) · bron laatst gecontroleerd op (.+)$","$1 · source last checked on $2"],["^(\\\\d+) (ingeschreven|op wachtlijst|nog te regelen)$","$1 $2"]].map(([p,to])=>[new RegExp(p,"iu"),to]);
const shortMonths=[["jan","Jan"],["feb","Feb"],["mrt","Mar"],["apr","Apr"],["mei","May"],["jun","Jun"],["jul","Jul"],["aug","Aug"],["sep","Sep"],["okt","Oct"],["nov","Nov"],["dec","Dec"]];
const shortMonthRegex=/\b(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\b/gi;
const dateMonthTranslation=match=>shortMonths.find(([nl])=>nl===match.toLowerCase())?.[1]||match;
const monthDateContext=/\b\d{1,2}\s+(?:jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\b/i;
const datedMonthLabels=/^(?:jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)(?:\.?)$/i;
Object.assign(strings,{
  "Organisator meldt dat de reguliere inschrijving gesloten is. Controleer de officiële website voor overdracht van startbewijzen.": "The organizer reports that standard registration is closed. Check the official website for entry transfers.",
  "Datum bevestigd door WTC Zijtaart. Controleer inschrijfmogelijkheden bij de club.": "WTC Zijtaart confirmed the date. Check registration options with the club.",
  "Wedstrijddatum en parcours gecontroleerd bij de organisator. Actuele beschikbare startbewijzen onbekend.": "Race date and course checked with the organizer. Current entry availability is unknown.",
  "Inschrijving sluit volgens AC Waterland op de laatste vrijdag voor de wedstrijd om 20:00 of eerder wanneer 650 startbewijzen verkocht zijn.": "According to AC Waterland, registration closes at 20:00 on the final Friday before race day, or sooner if 650 entries sell out.",
  "Voorinschrijving volgens het officiële formulier tot en met 5 december 2026; controleer actuele capaciteit bij de organisator.": "According to the official form, advance registration runs through 5 December 2026. Check current capacity with the organizer.",
  "De officiële site vermeldt inschrijfopties voor 100 en 200 km. Controleer beschikbaarheid op de inschrijfpagina.": "The official website lists registration options for 100 km and 200 km. Check current availability on the registration page.",
  "De organisatorsite noemt €20 per individuele deelnemer en €30 per duo. De actuele inschrijfstatus is niet afzonderlijk bevestigd.": "The organizer website lists €20 per individual and €30 per pair. Current registration availability has not been independently confirmed.",
  "Organisator meldt volzet; inschrijfplatform biedt een wachtlijst. Controleer actuele mogelijkheden bij de organisator.": "The organizer reports a sell-out; the registration platform offers a waitlist. Check current options with the organizer.",
  "Status volgens laatst vastgelegde organisatorbron; controleer actuele beschikbaarheid op de officiële website.": "Status according to the last recorded organizer source; check live availability on the official website.",
  "Bekijk organisator ↗": "View organizer ↗",
  "Bron niet bereikbaar": "Source unavailable",
  "Niet bevestigd": "Not confirmed",
  "vermoedelijke datum": "provisional date"
});
const placeholders={
'Bijv. Egmond, gravel, marathon…':'E.g. Egmond, gravel, marathon…',
'Zoek op wedstrijd of plaats':'Search by event or location',
'Bijv. Stadsloop, https://...':'E.g. City Run, https://...',
'Naam organisatie':'Organization name',
'naam@organisatie.nl':'name@organization.com',
'Waar kunnen we je mee helpen?':'How can we help?',
'Bijvoorbeeld: de inschrijving voor 21,1 km is gesloten; 10 km is nog beschikbaar.':'For example: registration for 21.1 km is closed; 10 km is still available.'
};
const translations=new Map(Object.entries(strings));
const attrTranslations=new Map(Object.entries(placeholders));
const monthNames=[['januari','January'],['februari','February'],['maart','March'],['april','April'],['mei','May'],['juni','June'],['juli','July'],['augustus','August'],['september','September'],['oktober','October'],['november','November'],['december','December']];
const partials=[
[/^(\d+) evenementen gevonden · (\d+) zichtbaar$/,'$1 events found · $2 shown'],
[/^(\d+) evenementen gevonden · (\d+) zichtbaar$/,'$1 events found · $2 shown'],
[/^(\d+) evenementen gevonden · (\d+) zichtbaar$/,'$1 events found · $2 shown'],
[/^(\d+) wedstrijden opgeslagen/,'$1 races saved'],
[/^(\d+) evenementen opgeslagen/,'$1 events saved'],
[/^(\d+) wedstrijden in de catalogus/,'$1 events in the catalog'],
[/^(\d+) wedstrijden in database/,'$1 events in the database'],
[/^(\d+) wedstrijden met officieel bevestigde datum/,'$1 races with officially confirmed dates'],
[/^(\d+) gecontroleerd · (\d+) kandidaten · (\d+) nog zonder organisatielink$/,'$1 verified · $2 candidates · $3 without an organizer link'],
[/^Toon (\d+) meer evenementen ↓$/,'Show $1 more events ↓'],
[/^Wedstrijd (.+)$/,'Race $1'],
[/^Opening was op (.+)$/,'Opened on $1'],
[/^Verwachte opening · (.+)$/,'Expected opening · $1'],
[/^Bron vastgelegd op (.+)$/,'Source recorded on $1'],
[/^Bron laatst vastgelegd: (.+)$/,'Source last recorded: $1'],
[/^Datum vermeld — check bij organisator$/,'Date listed — verify with organizer'],
[/^Datum controleren bij organisator$/,'Verify date with organizer'],
[/^✓ Bevestigd op organisatorsite$/,'✓ Confirmed by organizer'],
[/^Inschrijving gesloten volgens bron$/,'Registration closed according to source'],
[/^Uitverkocht volgens bron$/,'Sold out according to source']
];
let lang='nl';
const originals=new WeakMap();
const attrs=new WeakMap();
let observer=null,queued=false;
function translation(text){
 if(translations.has(text))return translations.get(text);
 // Most templates contain whitespace around labels, particularly navigation.
 const prefix=(text.match(/^\s*/)||[''])[0];
 const suffix=(text.match(/\s*$/)||[''])[0];
 const core=text.slice(prefix.length,text.length-suffix.length);
 if(translations.has(core))return prefix+translations.get(core)+suffix;
 let result=text;
 for(const [pattern,replacement] of translatedPatterns)result=result.replace(pattern,replacement);
 for(const [pattern,replacement] of extendedPatterns)result=result.replace(pattern,replacement);
 for(const [pattern,replacement] of partials)result=result.replace(pattern,replacement);
 for(const [pattern,replacement] of sentenceReplacements)result=result.replace(pattern,replacement);
 for(const [nl,en] of monthNames)result=result.replace(new RegExp('\\b'+nl+'\\b','gi'),en);
 if(monthDateContext.test(text)||datedMonthLabels.test(text))result=result.replace(shortMonthRegex,dateMonthTranslation);
 return result;
}
function skip(node){
 const parent=node.parentElement;
 return !parent||parent.closest('script,style,noscript,code,pre,svg,[data-no-translate],input,textarea');
}
function visitText(node){
 if(!node||node.nodeType!==3||skip(node))return;
 const current=node.nodeValue||'';
 const option=node.parentElement?.closest('option');
 if(option&&!option.hasAttribute('value')){
   // Preserve semantic form values when translating visible labels.
   const original=originals.get(node)?.nl||current;
   option.setAttribute('value',original.trim());
 }
 let saved=originals.get(node);
 if(!saved||current!==saved.nl&&current!==saved.en){saved={nl:current,en:null};originals.set(node,saved)}
 if(saved.en===null)saved.en=translation(saved.nl);
 const next=lang==='en'?saved.en:saved.nl;
 if(current!==next)node.nodeValue=next;
}
function visitAttributes(elem){
 if(!elem||elem.nodeType!==1)return;
 for(const attribute of ['placeholder','title','aria-label']){
  if(!elem.hasAttribute(attribute))continue;
  const current=elem.getAttribute(attribute);
  let all=attrs.get(elem);
  if(!all){all={};attrs.set(elem,all)}
  let saved=all[attribute];
  if(!saved||current!==saved.nl&&current!==saved.en){
    saved={nl:current,en:attrTranslations.get(current)||translation(current)};
    all[attribute]=saved;
  }
  const next=lang==='en'?saved.en:saved.nl;
  if(current!==next)elem.setAttribute(attribute,next);
 }
}
function walk(root){
 if(root.nodeType===3){visitText(root);return}
 if(root.nodeType!==1&&root.nodeType!==9)return;
 if(root.nodeType===1)visitAttributes(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
   const node=walker.currentNode;
   if(node.nodeType===3)visitText(node);
   else if(node.nodeType===1)visitAttributes(node);
 }
}
function preserveLinks(){
 for(const a of document.querySelectorAll('a[href]')){
  const raw=a.getAttribute('href');
  if(!raw||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:'))continue;
  try{
   const u=new URL(raw,location.href);
   if(u.origin!==location.origin||!u.pathname.includes('/raceatlas/'))continue;
   if(lang==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');
   a.href=u.toString();
  }catch{}
 }
}
function buttons(){
 let nav=document.querySelector('.navright')||document.querySelector('header');
 if(!nav||document.getElementById('raLanguageSwitch'))return;
 const group=document.createElement('div');
 group.id='raLanguageSwitch';group.className='raLanguageSwitch';
 group.setAttribute('role','group');group.setAttribute('aria-label','Language / Taal');
 for(const code of ['nl','en']){
  const btn=document.createElement('button');
  btn.type='button';btn.textContent=code.toUpperCase();
  btn.dataset.language=code;
  btn.setAttribute('aria-label',code==='nl'?'Nederlands':'English');
  btn.addEventListener('click',()=>setLanguage(code));
  group.append(btn);
 }
 nav.append(group);
}
function updateButtons(){
 for(const btn of document.querySelectorAll('#raLanguageSwitch button')){
  const active=btn.dataset.language===lang;
  btn.setAttribute('aria-pressed',String(active));
  btn.classList.toggle('active',active);
 }
}
function setLanguage(next,updateUrl=true){
 if(next!=='en'&&next!=='nl')next='nl';
 lang=next;
 try{localStorage.setItem(KEY,next)}catch{}
 document.documentElement.lang=next;
 const path=location.pathname||'';
 const page=path.includes('organisatoren.html')?'organizer':path.includes('gegevenskwaliteit.html')?'quality':'home';
 const titles={home:{nl:'RaceAtlas — Vind jouw volgende wedstrijd',en:'RaceAtlas — Discover. Plan. Race.'},organizer:{nl:'Voor organisatoren — RaceAtlas',en:'For Organizers — RaceAtlas'},quality:{nl:'Gegevenskwaliteit & correcties — RaceAtlas',en:'Data Quality & Corrections — RaceAtlas'}};
 document.title=titles[page][next];
 if(updateUrl){
  const u=new URL(location.href);
  if(next==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');
  history.replaceState(history.state,'',u.pathname+u.search+u.hash);
 }
 if(observer)observer.disconnect();
 walk(document.body);
 preserveLinks();
 updateButtons();
 if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 window.dispatchEvent(new CustomEvent('raceatlas:languagechange',{detail:{language:next}}));
}
function schedule(){
 if(queued)return;
 queued=true;
 queueMicrotask(()=>{
  queued=false;
  if(observer)observer.disconnect();
  walk(document.body);
  preserveLinks();
  if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 });
}
function start(){
 buttons();
 observer=new MutationObserver(schedule);
 const param=new URL(location.href).searchParams.get('lang');
 let stored;
 try{stored=localStorage.getItem(KEY)}catch{}
 setLanguage(param==='en'||param==='nl'?param:stored==='en'?'en':'nl',false);
}
window.RaceAtlasI18n={getLanguage:()=>lang,setLanguage,translate:translation};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();