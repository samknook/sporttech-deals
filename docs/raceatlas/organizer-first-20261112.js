/* RaceAtlas organizer-first follow-up, researched 12 Nov 2026.
 * Unknown dates remain unverified; never infer ticket availability.
 */
(() => {
'use strict';
const rows={
'ra-174':{officialEventUrl:'https://www.adelaar.org/wielrennen/toerfietsen/rittenkalender/',source:'https://www.adelaar.org/wielrennen/toerfietsen/rittenkalender/',distance:'74 km',confirmed:true},
'ra-175':{officialEventUrl:'https://www.adelaar.org/wielrennen/toerfietsen/rittenkalender/',source:'https://www.adelaar.org/wielrennen/toerfietsen/rittenkalender/',distance:'26 / 40 / 56 km',confirmed:true},
'ra-176':{officialEventUrl:'https://toer.cc75.nl/tochten/vwv-holterbergtocht/',confirmed:false},
'ra-177':{officialEventUrl:'https://toer.cc75.nl/tochten/vwv-holterbergtocht/',confirmed:false},
'ra-179':{officialEventUrl:'https://peddelaarsaalten.nl/',source:'https://peddelaarsaalten.nl/',distance:'80 km gravel',confirmed:true},
'ra-181':{officialEventUrl:'https://www.wstexel.nl/',source:'https://www.wstexel.nl/',distance:'37 / 59 / 71 km',confirmed:true},
'ra-342':{officialEventUrl:'https://www.westeinderloop.nl/',source:'https://zorgenzekerheidcircuit.nl/Race.php?ID=19&RID=122',distance:'5 / 10 / 16,1 km',confirmed:true},
'ra-343':{officialEventUrl:'https://suomi.web-content.eu/sinterklaasloop',source:'https://www.ijmuiden.nl/evenement/av-suomi-sinterklaasloop-2026/',distance:'1 / 5 / 10 km',confirmed:true},
'ra-390':{officialEventUrl:'https://www.savatletiek.nl/event/sav-cross-2/',source:'https://www.savatletiek.nl/event/sav-cross-2/',confirmed:true},
'ra-182':{officialEventUrl:'https://www.tempo-soest.nl/evenementen',source:'https://www.tempo-soest.nl/evenementen',distance:'60 / 90 km',confirmed:true},
'ra-183':{officialEventUrl:'https://rtcprinsenbeek.nl/veldtoertocht/',source:'https://rtcprinsenbeek.nl/veldtoertocht/',distance:'80 km gravel',confirmed:true},
'ra-184':{officialEventUrl:'https://www.wtcg.nl/',confirmed:false},
'ra-185':{officialEventUrl:'https://www.vrtcvorden.nl/',confirmed:false},
'ra-186':{officialEventUrl:'https://www.wtcboekel.nl/',confirmed:false},
'ra-187':{officialEventUrl:'https://veluwerenners.nl/toertocht2',source:'https://veluwerenners.nl/toertocht2',distance:'70 / 90 km gravel',confirmed:true}
};
const events=window.RACEATLAS_EVENTS;
if(!Array.isArray(events))return;
for(const e of events){
const x=rows[e.id];if(!x)continue;
const {confirmed,...rest}=x;
Object.assign(e,rest);
if(confirmed){e.dateEvidence='official';e.sourceCheckedOn='2026-11-12';}
}
if(typeof window.RaceAtlasRefresh==='function')window.RaceAtlasRefresh();
})();