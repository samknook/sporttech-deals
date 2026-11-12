/* Verified organizer facts checked 2026-11-12. Manual evidence gate. */
(() => {
  'use strict';
  const facts={
    'ra-194':{
      date:'2026-12-29',dateEvidence:'official',
      officialEventUrl:'https://www.drenthe200.nl/',
      registrationInfoUrl:'https://www.drenthe200.nl/inschrijven',
      source:'https://www.drenthe200.nl/',
      distance:'100 / 200 km',sourceCheckedOn:'2026-11-12',
      sourceType:'organizer',
      registrationStatus:'check',
      registrationStatusNote:'De officiële site vermeldt inschrijfopties voor 100 en 200 km. Controleer beschikbaarheid op de inschrijfpagina.'
    },
    'ra-202':{
      date:'2026-12-19',dateEvidence:'official',
      officialEventUrl:'https://www.veluwserunbikerun.nl/oldebroek/',
      registrationInfoUrl:'https://www.veluwserunbikerun.nl/oldebroek/',
      source:'https://www.veluwserunbikerun.nl/reglement/',
      distance:'4 km lopen / 12,5 km fietsen / 3 km lopen',
      sourceCheckedOn:'2026-11-12',sourceType:'organizer',
      priceEur:20,priceStatus:'known',
      registrationStatus:'check',
      registrationStatusNote:'De organisatorsite noemt €20 per individuele deelnemer en €30 per duo. De actuele inschrijfstatus is niet afzonderlijk bevestigd.'
    },
    'ra-203':{
      date:'2026-12-20',dateEvidence:'official',
      officialEventUrl:'https://dehelvankasterlee.be/',
      registrationInfoUrl:'https://www.sqmtime.com/nl-helvankasterlee',
      source:'https://dehelvankasterlee.be/',
      distance:'15 km lopen / 125 km MTB / 30 km lopen',
      sourceCheckedOn:'2026-11-12',sourceType:'organizer',
      priceEur:230,priceStatus:'known',
      registrationStatus:'sold_out',
      registrationStatusNote:'Organisator meldt volzet; inschrijfplatform biedt een wachtlijst. Controleer actuele mogelijkheden bij de organisator.'
    }
  };
  const events=window.RACEATLAS_EVENTS;
  if(!Array.isArray(events))return;
  for(const event of events)if(facts[event.id])Object.assign(event,facts[event.id]);
  window.RaceAtlasRefresh?.();
})();