/* RaceAtlas anonymous outbound-click collector.
 * Counts aggregate event/day/action only; does not read or store user identifiers.
 * Public caller cannot read aggregate counters or update the database directly.
 * Source control: supabase/functions/raceatlas-track-outbound/index.ts
 */
const ALLOWED_ORIGIN = "https://samknook.github.io";
const PROJECT_URL = Deno.env.get("SUPABASE_URL") || "https://lpzndnxloykcthbsqcet.supabase.co";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const allowedKinds = new Set(["organizer","registration","source","promotion","site_view","card_view","detail_view"]);
const CORS = {
  "Access-Control-Allow-Origin":ALLOWED_ORIGIN,
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
function respond(status:number,payload:Record<string,unknown>):Response {
 return new Response(JSON.stringify(payload),{status,headers:{...CORS,"Content-Type":"application/json"}});
}
Deno.serve(async (request:Request):Promise<Response>=>{
 const origin=request.headers.get("origin");
 if(origin!==ALLOWED_ORIGIN)return respond(403,{ok:false});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(request.method!=="POST")return respond(405,{ok:false});
 if(Number(request.headers.get("content-length")||0)>512)return respond(413,{ok:false});
 const type=request.headers.get("content-type")||"";
 if(!type.toLowerCase().startsWith("text/plain"))return respond(415,{ok:false});
 let data:Record<string,unknown>;
 try{
  const body=await request.text();
  if(body.length>512)return respond(413,{ok:false});
  data=JSON.parse(body);
 }catch{return respond(400,{ok:false})}
 const eventId=String(data.eventId||"");
 const kind=String(data.kind||"");
 if(!allowedKinds.has(kind)||!((eventId==="ra-site"&&kind==="site_view")||(/^ra-[0-9]{1,8}$/.test(eventId)&&kind!=="site_view")))return respond(400,{ok:false});
 if(!SERVICE_KEY)return respond(503,{ok:false});
 try{
  const result=await fetch(PROJECT_URL+"/rest/v1/rpc/raceatlas_record_outbound_click",{
   method:"POST",
   headers:{"Content-Type":"application/json",apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY},
   body:JSON.stringify({p_event_id:eventId,p_kind:kind}),
   signal:AbortSignal.timeout(4000)
  });
  if(!result.ok)return respond(503,{ok:false});
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
     if(unique.ok)return respond(202,{ok:true,uniqueRecorded:true});
    }
   }catch{}
   // Recording an ordinary view must not fail when unique estimation cannot run.
   return respond(202,{ok:true,uniqueRecorded:false});
  }
  return respond(202,{ok:true});
 }catch{return respond(503,{ok:false})}
});