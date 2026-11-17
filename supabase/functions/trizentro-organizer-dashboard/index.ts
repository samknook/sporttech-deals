import { createClient } from "npm:@supabase/supabase-js@2.95.0";
const SUPABASE_BASE=Deno.env.get("SUPABASE_URL")||"";
const PUB=Deno.env.get("SUPABASE_ANON_KEY")||"";
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const origins=new Set(["https://trizentro.com","https://www.trizentro.com","https://samknook.github.io"]);
const respond=(body:unknown,status=200,origin="")=>{
 const h=new Headers({"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin, Authorization","X-Content-Type-Options":"nosniff"});
 if(origins.has(origin))h.set("Access-Control-Allow-Origin",origin);
 return new Response(JSON.stringify(body),{status,headers:h});
};
Deno.serve(async req=>{
 const origin=req.headers.get("Origin")||"";
 if(origin&&!origins.has(origin))return respond({error:"origin_not_allowed"},403,origin);
 if(req.method==="OPTIONS")return origins.has(origin)?new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"GET,OPTIONS","Access-Control-Allow-Headers":"authorization,apikey,content-type","Vary":"Origin"}}):respond({error:"origin_not_allowed"},403,origin);
 if(req.method!=="GET")return respond({error:"method_not_allowed"},405,origin);
 if(!SUPABASE_BASE||!PUB||!SERVICE)return respond({error:"service_unavailable"},503,origin);
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/,"");
 if(!token||token.length<20)return respond({error:"sign_in_required"},401,origin);
 try{
  const caller=createClient(SUPABASE_BASE,PUB,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authError}=await caller.auth.getUser(token);
  if(authError||!auth.user||!auth.user.email_confirmed_at)return respond({error:"verified_account_required"},401,origin);
  const admin=createClient(SUPABASE_BASE,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:access,error:accessError}=await admin.from("raceatlas_organizer_event_access").select("event_id").eq("user_id",auth.user.id).is("revoked_at",null).limit(100);
  if(accessError)throw accessError;
  const ids=[...new Set((access||[]).map(x=>x.event_id).filter(x=>/^ra-\d{1,8}$/.test(x)))];
  if(!ids.length)return respond({events:[],totals:{card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0},measurement:"aggregate_actions_not_unique_visitors",message:"no_verified_events"},200,origin);
  const days=Number(new URL(req.url).searchParams.get("days")||30);
  if(![7,30,90].includes(days))return respond({error:"invalid_period"},400,origin);
  const start=new Date();start.setUTCDate(start.getUTCDate()-(days-1));const since=start.toISOString().slice(0,10);
  const {data:events,error:eventError}=await admin.from("raceatlas_event_intelligence").select("event_id,event_name,official_event_url,start_date,date_confidence,publish_status").in("event_id",ids);
  if(eventError)throw eventError;
  const {data:daily,error:metricsError}=await admin.from("raceatlas_outbound_click_daily").select("day,event_id,kind,clicks").in("event_id",ids).gte("day",since).limit(10000);
  if(metricsError)throw metricsError;
  const mapped=new Map(ids.map(id=>[id,{event_id:id,event_name:id,official_event_url:null as string|null,start_date:null as string|null,date_confidence:"unknown",card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0}]));
  for(const e of events||[]){
   if(e.publish_status!=="published")continue;
   const x=mapped.get(e.event_id);if(x){x.event_name=e.event_name||e.event_id;x.official_event_url=e.official_event_url;x.start_date=e.date_confidence==="official"?e.start_date:null;x.date_confidence=e.date_confidence||"unknown"}
  }
  const keys:Record<string,"card_views"|"detail_views"|"organizer_clicks"|"registration_clicks">={card_view:"card_views",detail_view:"detail_views",organizer:"organizer_clicks",registration:"registration_clicks"};
  for(const d of daily||[]){const row=mapped.get(d.event_id);const metric=keys[d.kind];if(row&&metric)row[metric]+=Math.max(0,Number(d.clicks)||0)}
  const rows=[...mapped.values()].filter(x=>x.event_name!==x.event_id).sort((a,b)=>b.registration_clicks-a.registration_clicks);
  const publishedIds=new Set(rows.map(x=>x.event_id));
  // Daily aggregates power the dashboard trend view; each record is scoped to
  // a manually approved, published event and contains no user identifiers.
  const dailyByEvent=new Map<string,{day:string,event_id:string,card_views:number,detail_views:number,organizer_clicks:number,registration_clicks:number}>();
  for(const d of daily||[]){
   if(!publishedIds.has(d.event_id)||!keys[d.kind]||typeof d.day!=="string")continue;
   const groupKey=d.day+"|"+d.event_id;
   if(!dailyByEvent.has(groupKey))dailyByEvent.set(groupKey,{day:d.day,event_id:d.event_id,card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0});
   const entry=dailyByEvent.get(groupKey)!;
   entry[keys[d.kind]]+=Math.max(0,Number(d.clicks)||0);
  }
  const trend=[...dailyByEvent.values()].sort((a,b)=>a.day.localeCompare(b.day)||a.event_id.localeCompare(b.event_id));

  const totals=rows.reduce((a,r)=>{a.card_views+=r.card_views;a.detail_views+=r.detail_views;a.organizer_clicks+=r.organizer_clicks;a.registration_clicks+=r.registration_clicks;return a},{card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0});
  return respond({days,events:rows,totals,trend,asOf:new Date().toISOString(),measurement:"aggregate_actions_not_unique_visitors"},200,origin);
 }catch(e){console.error("organizer_dashboard_error",e instanceof Error?e.message:"unknown");return respond({error:"dashboard_unavailable"},503,origin)}
});