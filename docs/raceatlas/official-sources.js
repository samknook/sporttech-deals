/* First-party RaceAtlas official-source overrides, reviewed 12 November 2026.
 * These entries replace old competitor-calendar links with the organizer's pages.
 * Never infer registration availability from an old opening date.
 */
(() => {
  'use strict';
  const official = {
    'ra-178': {
      date:'2026-11-15', name:'Dutch Masters of MTB Ultra-Marathon',
      officialEventUrl:'https://www.dutchmastersofmtb.nl/',
      source:'https://www.dutchmastersofmtb.nl/',
      distance:'101 / 200 km',
      registrationStatus:'closed',
      registrationStatusNote:'Organisator meldt dat de reguliere inschrijving gesloten is. Controleer de officiële website voor overdracht van startbewijzen.'
    },
    'ra-180': {
      date:'2026-11-15', officialEventUrl:'https://wtczijtaart.nl/',
      source:'https://wtczijtaart.nl/',
      registrationStatus:'check',
      registrationStatusNote:'Datum bevestigd door WTC Zijtaart. Controleer inschrijfmogelijkheden bij de club.'
    },
    'ra-200': {
      date:'2026-11-15', officialEventUrl:'https://runbikerunpijnacker.nl/',
      source:'https://runbikerunpijnacker.nl/',
      distance:'5 km lopen / 20 km fietsen / 2,5 km lopen',
      registrationStatus:'check',
      registrationStatusNote:'Wedstrijddatum en parcours gecontroleerd bij de organisator. Actuele beschikbare startbewijzen onbekend.'
    },
    'ra-344': {
      date:'2026-11-29', officialEventUrl:'https://www.avcastricum.nl/',
      source:'https://www.avcastricum.nl/nieuws?n=1069',
      registrationInfoUrl:'https://www.avcastricum.nl/wedstrijdinfo%20',
      distance:'1 / 2,2 / 4 / 10,1 / 15 km',
      registrationStatus:'check'
    },
    'ra-391': {
      date:'2026-11-29',officialEventUrl:'https://www.avedam.nl/agenda/meeuwen.php',
      source:'https://www.avedam.nl/agenda/meeuwen.php',
      distance:'9 km',registrationStatus:'check'
    },
    'ra-345': {
      date:'2026-12-06',officialEventUrl:'https://www.acwaterland.nl/twiskemolenloop/',
      registrationInfoUrl:'https://www.acwaterland.nl/twiskemolenloop/inschrijven/',
      source:'https://www.acwaterland.nl/twiskemolenloop/',
      distance:'1,5 / 3 / 5 / 10 / 16,1 / 21 km',
      registrationStatus:'check',
      registrationStatusNote:'Inschrijving sluit volgens AC Waterland op de laatste vrijdag voor de wedstrijd om 20:00 of eerder wanneer 650 startbewijzen verkocht zijn.'
    },
    'ra-201': {
      date:'2026-12-12',
      officialEventUrl:'https://devilstrail.nl/evenementen/devils-crossduathlon-netl-kraggenburg/',
      registrationInfoUrl:'https://inschrijven.nl/form/2026121251604-nl',
      source:'https://devilstrail.nl/evenementen/devils-crossduathlon-netl-kraggenburg/',
      distance:'Sprint 3,5-12,5-3,5 km / Lang 7-25-3,5 km',
      registrationEndDate:'2026-12-05',
      registrationStatus:'check',
      registrationStatusNote:'Voorinschrijving volgens het officiële formulier tot en met 5 december 2026; controleer actuele capaciteit bij de organisator.'
    }
  };
  const events = window.RACEATLAS_EVENTS;
  if (!Array.isArray(events)) return;
  let patched=0;
  for(const event of events) {
    const data=official[event.id];
    if(!data)continue;
    Object.assign(event,data,{dateEvidence:'official',sourceCheckedOn:'2026-11-12',sourceType:'organizer'});
    patched++;
  }
  if(patched && typeof window.RaceAtlasRefresh==='function')window.RaceAtlasRefresh();
  window.RaceAtlasOfficialOverridesApplied=patched;
})();