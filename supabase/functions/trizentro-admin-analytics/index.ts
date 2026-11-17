import { createClient } from "npm:@supabase/supabase-js@2.95.0";
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const PUBLIC_KEY=Deno.env.get("SUPABASE_ANON_KEY")||"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const origins=new Set(["https://trizentro.com","https://www.trizentro.com","https://samknook.github.io"]);
function respond(body:unknown,status=200,origin=""){
 const h=new Headers({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin, Authorization","X-Content-Type-Options":"nosniff"});
 if(origins.has(origin))h.set("Access-Control-Allow-Origin",origin);
 return new Response(JSON.stringify(body),{status,headers:h});
}
Deno.serve(async req=>{
 const origin=req.headers.get("Origin")||"";
 if(origin&&!origins.has(origin))return respond({error:"origin_not_allowed"},403,origin);
 if(req.method==="OPTIONS"){
  if(!origins.has(origin))return respond({error:"origin_not_allowed"},403,origin);
  return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"GET, OPTIONS","Access-Control-Max-Age":"3600","Vary":"Origin"}});
 }
 if(req.method!=="GET")return respond({error:"method_not_allowed"},405,origin);
 if(!SUPABASE_URL||!PUBLIC_KEY||!SERVICE_KEY)return respond({error:"service_unavailable"},503,origin);
 const header=req.headers.get("Authorization")||"";
 if(!/^Bearer\s+\S{20,}$/.test(header))return respond({error:"sign_in_required"},401,origin);
 try{
  const jwt=header.replace(/^Bearer\s+/,"");
  const auth=createClient(SUPABASE_URL,PUBLIC_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await auth.auth.getUser(jwt);
  if(error||!data.user)return respond({error:"sign_in_required"},401,origin);
  // Privilege is only stored in trusted app_metadata; user_metadata is user-editable.
  if(data.user.app_metadata?.trizentro_admin!==true)return respond({error:"admin_access_required"},403,origin);
  const requested=Number(new URL(req.url).searchParams.get("days")||30);
  if(![7,30,90].includes(requested))return respond({error:"invalid_period"},400,origin);
  const end=new Date(),start=new Date(end);
  start.setUTCDate(end.getUTCDate()-(requested-1));
  const toDay=d=>d.toISOString().slice(0,10);
  const periodStart=toDay(start),periodEnd=toDay(end);
  const db=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:records,error:dailyError}=await db.from("raceatlas_outbound_click_daily").select("day,event_id,kind,clicks").gte("day",periodStart).lte("day",periodEnd).order("day",{ascending:true}).limit(10001);
  if(dailyError)throw dailyError;
  if((records||[]).length>10000)return respond({error:"too_many_records_reduce_period"},503,origin);
  const allowed=new Set(["card_view","detail_view","organizer","registration","promotion","source","site_view"]);
  const daily=(records||[]).filter(r=>/^ra-\d{1,8}$/.test(r.event_id)&&allowed.has(r.kind))
   .map(r=>({day:r.day,event_id:r.event_id,kind:r.kind,clicks:Math.max(0,Number(r.clicks)||0)}));
  const eventIds=[...new Set(daily.map(r=>r.event_id))];
  const names=new Map<string,string>();
  for(let i=0;i<eventIds.length;i+=150){
   const {data:info,error:nameError}=await db.from("raceatlas_event_intelligence").select("event_id,event_name").in("event_id",eventIds.slice(i,i+150));
   if(nameError)throw nameError;
   for(const row of info||[])names.set(row.event_id,String(row.event_name||row.event_id));
  }
  const byEvent=new Map<string,Record<string,number>>();
  for(const r of daily){
   if(!byEvent.has(r.event_id))byEvent.set(r.event_id,{card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0,sponsored_clicks:0});
   const key=({card_view:"card_views",detail_view:"detail_views",organizer:"organizer_clicks",registration:"registration_clicks",promotion:"sponsored_clicks"} as Record<string,string>)[r.kind];
   if(key)byEvent.get(r.event_id)![key]+=r.clicks;
  }
  const events=[...byEvent].map(([id,m])=>({event_id:id,event_name:names.get(id)||id,...m}))
   .sort((a,b)=>(b.organizer_clicks+b.registration_clicks)-(a.organizer_clicks+a.registration_clicks)||b.card_views-a.card_views);
  const total=events.reduce((acc,row)=>{for(const key of ["card_views","detail_views","organizer_clicks","registration_clicks","sponsored_clicks"])acc[key]+=Number(row[key as keyof typeof row]||0);return acc;},{card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0,sponsored_clicks:0});
  return respond({periodStart,periodEnd,events,daily,totals:total,asOf:new Date().toISOString(),measurement:"aggregate_actions_not_unique_visitors"},200,origin);
 }catch(err){
  console.error("analytics_internal_error",err instanceof Error?err.message:"unknown");
  return respond({error:"analytics_unavailable"},503,origin);
 }
});