/* MKB AI Studio prospect preparation — browser only, no network or storage.
 * Never infer recipient details or accept sensitive customer message contents.
 */
(function(root){'use strict';
function clean(value,max){
 if(typeof value!=='string')throw Error('Vul de verplichte gegevens in');
 const v=value.trim().replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ');
 if(!v||v.length>max)throw Error('Controleer de lengte van je invoer');
 return v;
}
function build(input){
 if(!input||typeof input!=='object')throw Error('Ontbrekende invoer');
 const type=clean(input.type,60),size=clean(input.size,40),task=clean(input.task,120);
 const volume=Number(input.volume);
 if(!Number.isInteger(volume)||volume<0||volume>10000)throw Error('Ongeldig e-mailvolume');
 const goal=clean(input.goal,100);
 const urgent=input.urgent===true;
 const recommendation=type==='Ik heb een eigen API/ERP-koppeling nodig'?'Maatwerkonderzoek':'Kennismakingsgesprek over AI Inbox Starter';
 const lines=[
 'Onderwerp: Kennismaking MKB AI Studio — AI Inbox',
 '',
 'Goedemiddag,',
 '',
 'Ik wil onderzoeken of een afgebakende AI Inbox-pilot geschikt is voor ons bedrijf.',
 '',
 'Type organisatie: '+type,
 'Teamgrootte: '+size,
 'Proces: '+task,
 'Geschat administratief berichtvolume: '+volume+' per week',
 'Doel: '+goal,
 'Vereiste snelle start: '+(urgent?'Ja, bespreek haalbaarheid':'Niet noodzakelijk'),
 'Gewenste vervolgstap: '+recommendation,
 '',
 'Ik wil graag eerst de scope, informatiebeveiliging en de verwachte investering bespreken.',
 'Ik begrijp dat dit geen bestelling is en dat voor toegang tot echte gegevens aparte afspraken nodig zijn.',
 '',
 'Met vriendelijke groet,',
 '[Naam en zakelijke contactgegevens zelf toevoegen in je eigen e-mailprogramma]'
 ];
 return {subject:lines[0].slice(11),body:lines.slice(2).join('\n'),
 fullText:lines.join('\n'),readyToSend:false,sent:false,stored:false};
}
const api={build};
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.MkbAiLeadBrief=api;
})(typeof window!=='undefined'?window:null);
