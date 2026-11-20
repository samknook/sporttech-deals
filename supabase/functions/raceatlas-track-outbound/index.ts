/* RaceAtlas anonymous outbound-click collector.
 * Counts aggregate event/day/action only; does not read or store user identifiers.
 * Public caller cannot read aggregate counters or update the database directly.
 * Source control: supabase/functions/raceatlas-track-outbound/index.ts
 */
const ALLOWED_ORIGINS = new Set(["https://samknook.github.io","https://trizentro.com","https://www.trizentro.com"]);
const PROJECT_URL = Deno.env.get("SUPABASE_URL") || "https://lpzndnxloykcthbsqcet.supabase.co";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const allowedKinds = new Set(["organizer","registration","source","promotion","site_view","card_view","detail_view","season_save","radar_intent"]);
const CORS = {
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"content-type",
  "Vary":"Origin",
  "Cache-Control":"no-store"
};
// Deduplication is per UTC day only. Do not log or store the raw IP/User-Agent.
const encoder=new TextEncoder();
async function dailyDigest(req:Request):Promise<string|null>{
 const ip=req.headers.get("cf-connecting-ip");
 const ua=req.headers.get("user-agent");
 if(!ip||!ua||ip.length>90||ua.length>512)return null;
 const day=new Date().toISOString().slice(0,10);
 const hmacKey=await crypto.subtle.importKey(
  "raw",encoder.encode(SERVICE_KEY),{name:"HMAC",hash:"SHA-256"},false,["sign"]
 );
 const input=day+"|raceatlas|"+ip+"|"+ua;
 const signature=await crypto.subtle.sign("HMAC",hmacKey,encoder.encode(input));
 return [...new Uint8Array(signature)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function cors(origin:string|null){return {...CORS,...(origin&&ALLOWED_ORIGINS.has(origin)?{"Access-Control-Allow-Origin":origin}:{})}}
function respond(status:number,payload:Record<string,unknown>,origin:string|null):Response {
 return new Response(JSON.stringify(payload),{status,headers:{...cors(origin),"Content-Type":"application/json"}});
}
Deno.serve(async (request:Request):Promise<Response>=>{
 const origin=request.headers.get("origin");
 if(!origin||!ALLOWED_ORIGINS.has(origin))return respond(403,{ok:false},origin);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(request.method!=="POST")return respond(405,{ok:false},origin);
 if(Number(request.headers.get("content-length")||0)>512)return respond(413,{ok:false},origin);
 const type=request.headers.get("content-type")||"";
 if(!type.toLowerCase().startsWith("text/plain"))return respond(415,{ok:false},origin);
 let data:Record<string,unknown>;
 try{
  const body=await request.text();
  if(body.length>512)return respond(413,{ok:false},origin);
  data=JSON.parse(body);
 }catch{return respond(400,{ok:false},origin)}
 const eventId=String(data.eventId||"");
 const kind=String(data.kind||"");
 if(!allowedKinds.has(kind)||!((eventId==="ra-site"&&kind==="site_view")||(/^ra-[0-9]{1,8}$/.test(eventId)&&kind!=="site_view")))return respond(400,{ok:false},origin);
 if(!SERVICE_KEY)return respond(503,{ok:false},origin);
 try{
  if(kind==="season_save"||kind==="radar_intent"){
   // Counts an actual save action or opening the radar flow — NOT an email
   // confirmation, unique visitor, or verified registration.
   const allowedChannels=new Set(["instagram","facebook","whatsapp","google","bing","search_other","social_other","email","referral","direct","campaign_other"]);
   const channel=typeof data.channel==="string"&&allowedChannels.has(data.channel)?data.channel:"direct";
   const campaign=typeof data.campaign==="string"&&/^[a-z0-9_-]{1,48}$/.test(data.campaign)?data.campaign:"none";
   const conversion=await fetch(PROJECT_URL+"/rest/v1/rpc/trizentro_record_conversion",{
    method:"POST",
    headers:{"Content-Type":"application/json",apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY},
    body:JSON.stringify({p_event_id:eventId,p_kind:kind,p_channel:channel,p_campaign:campaign}),
    signal:AbortSignal.timeout(4000)
   });
   return conversion.ok?respond(202,{ok:true},origin):respond(503,{ok:false},origin);
  }
  const result=await fetch(PROJECT_URL+"/rest/v1/rpc/raceatlas_record_outbound_click",{
   method:"POST",
   headers:{"Content-Type":"application/json",apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY},
   body:JSON.stringify({p_event_id:eventId,p_kind:kind}),
   signal:AbortSignal.timeout(4000)
  });
  if(!result.ok)return respond(503,{ok:false},origin);
  if(kind==="site_view"){
   // Optional coarse source aggregation. A view still succeeds when acquisition
   // telemetry fails; no visitor data or raw referring URL is persisted.
   const allowedChannels=new Set(["instagram","facebook","whatsapp","google","bing","search_other","social_other","email","referral","direct","campaign_other"]);
   const rawChannel=typeof data.channel==="string"?data.channel:"direct";
   const rawCampaign=typeof data.campaign==="string"?data.campaign:"none";
   const channel=allowedChannels.has(rawChannel)?rawChannel:"direct";
   const campaign=/^[a-z0-9_-]{1,48}$/.test(rawCampaign)?rawCampaign:"none";
   try{
    await fetch(PROJECT_URL+"/rest/v1/rpc/trizentro_record_acquisition",{
     method:"POST",
     headers:{"Content-Type":"application/json",apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY},
     body:JSON.stringify({p_channel:channel,p_campaign:campaign}),
     signal:AbortSignal.timeout(3500)
    });
   }catch{}
  }
  if(kind==="detail_view"){
   // Funnel step: page/modal opened, not a unique visitor.
   // Keep legacy detail counter intact even if coarse attribution fails.
   const allowedChannels=new Set(["instagram","facebook","whatsapp","google","bing","search_other","social_other","email","referral","direct","campaign_other"]);
   const channel=typeof data.channel==="string"&&allowedChannels.has(data.channel)?data.channel:"direct";
   const campaign=typeof data.campaign==="string"&&/^[a-z0-9_-]{1,48}$/.test(data.campaign)?data.campaign:"none";
   try{
    await fetch(PROJECT_URL+"/rest/v1/rpc/trizentro_record_conversion",{
     method:"POST",
     headers:{"Content-Type":"application/json",apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY},
     body:JSON.stringify({p_event_id:eventId,p_kind:"event_open",p_channel:channel,p_campaign:campaign}),
     signal:AbortSignal.timeout(3500)
    });
   }catch{}
  }
  // Unique daily estimates apply to views only; outbound clicks remain simple counts.
  if(kind==="site_view"||kind==="card_view"||kind==="detail_view"){
   try{
    const digest=await dailyDigest(request);
    if(digest){
     const unique=await fetch(PROJECT_URL+"/rest/v1/rpc/raceatlas_record_daily_unique",{
      method:"POST",
      headers:{"Content-Type":"application/json",apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY},
      body:JSON.stringify({p_event_id:eventId,p_kind:kind,p_digest:digest}),
      signal:AbortSignal.timeout(4000)
     });
     if(unique.ok)return respond(202,{ok:true,uniqueRecorded:true},origin);
    }
   }catch{}
   // Recording an ordinary view must not fail when unique estimation cannot run.
   return respond(202,{ok:true,uniqueRecorded:false},origin);
  }
  return respond(202,{ok:true},origin);
 }catch{return respond(503,{ok:false},origin)}
});