import { createClient } from "npm:@supabase/supabase-js@2.95.0";
const BASE=Deno.env.get("SUPABASE_URL")||"";
const ANON=Deno.env.get("SUPABASE_ANON_KEY")||"";
const SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const allowed=new Set(["https://trizentro.com","https://www.trizentro.com","https://samknook.github.io"]);
const response=(body:unknown,status=200,origin="")=>{
 const h=new Headers({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin, Authorization","X-Content-Type-Options":"nosniff"});
 if(allowed.has(origin))h.set("Access-Control-Allow-Origin",origin);
 return new Response(JSON.stringify(body),{status,headers:h});
};
Deno.serve(async req=>{
 const origin=req.headers.get("Origin")||"";
 if(origin&&!allowed.has(origin))return response({error:"origin_not_allowed"},403,origin);
 if(req.method==="OPTIONS")return allowed.has(origin)?new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Vary":"Origin"}}):response({error:"origin_not_allowed"},403,origin);
 if(!["GET","POST"].includes(req.method))return response({error:"method_not_allowed"},405,origin);
 if(!BASE||!ANON||!SECRET)return response({error:"service_unavailable"},503,origin);
 const authorization=req.headers.get("Authorization")||"";
 if(!/^Bearer\s+\S{20,}$/.test(authorization))return response({error:"login_required"},401,origin);
 try{
  const pub=createClient(BASE,ANON,{auth:{persistSession:false,autoRefreshToken:false}});
  const jwt=authorization.replace(/^Bearer\s+/,"");
  const {data:{user},error}=await pub.auth.getUser(jwt);
  if(error||!user||!user.email_confirmed_at)return response({error:"login_required"},401,origin);
  if(user.app_metadata?.trizentro_admin!==true)return response({error:"admin_required"},403,origin);
  const db=createClient(BASE,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
  if(req.method==="GET"&&new URL(req.url).searchParams.get("view")==="acquisition"){
   const since=new Date();since.setUTCDate(since.getUTCDate()-29);
   const start=since.toISOString().slice(0,10);
   const {data:counts,error:countError}=await db.from("trizentro_acquisition_daily")
     .select("day,channel,campaign,pageviews").gte("day",start).order("day",{ascending:false}).limit(1500);
   if(countError)throw countError;
   const {data:conversions,error:conversionError}=await db.from("trizentro_conversion_daily")
     .select("day,event_id,kind,channel,campaign,actions").gte("day",start).order("day",{ascending:false}).limit(2000);
   if(conversionError)throw conversionError;
   const actionByChannel=new Map<string,{saves:number,radarIntents:number}>();
   const actionByCampaign=new Map<string,{saves:number,radarIntents:number}>();
   for(const x of conversions||[]){
    const n=Math.max(0,Number(x.actions)||0);
    const field:"saves"|"radarIntents"=x.kind==="season_save"?"saves":"radarIntents";
    if(!actionByChannel.has(x.channel))actionByChannel.set(x.channel,{saves:0,radarIntents:0});
    actionByChannel.get(x.channel)![field]+=n;
    if(x.campaign!=="none"){
     if(!actionByCampaign.has(x.campaign))actionByCampaign.set(x.campaign,{saves:0,radarIntents:0});
     actionByCampaign.get(x.campaign)![field]+=n;
    }
   }
   const byChannel=new Map<string,number>();
   const byCampaign=new Map<string,number>();
   for(const x of counts||[]){
    const n=Math.max(0,Number(x.pageviews)||0);
    byChannel.set(x.channel,(byChannel.get(x.channel)||0)+n);
    if(x.campaign!=="none")byCampaign.set(x.campaign,(byCampaign.get(x.campaign)||0)+n);
   }
   return response({
    days:30,asOf:new Date().toISOString(),metric:"pageviews_not_unique_visitors",
    total:(counts||[]).reduce((n,x)=>n+Math.max(0,Number(x.pageviews)||0),0),
    channels:[...byChannel.entries()].map(([channel,pageviews])=>({channel,pageviews})).sort((a,b)=>b.pageviews-a.pageviews),
    campaigns:[...byCampaign.entries()].map(([campaign,pageviews])=>({campaign,pageviews})).sort((a,b)=>b.pageviews-a.pageviews).slice(0,30),
    conversionMetric:"save_actions_and_radar_entry_clicks_not_unique_users_or_confirmed_subscriptions",
    conversions:{
     saves:[...actionByChannel.values()].reduce((n,x)=>n+x.saves,0),
     radarIntents:[...actionByChannel.values()].reduce((n,x)=>n+x.radarIntents,0),
     channels:[...actionByChannel.entries()].map(([channel,actions])=>({channel,...actions})),
     campaigns:[...actionByCampaign.entries()].map(([campaign,actions])=>({campaign,...actions})).slice(0,30)
    }
   },200,origin);
  }
  if(req.method==="GET"){
   const status=new URL(req.url).searchParams.get("status")||"pending";
   if(!["pending","approved","rejected"].includes(status))return response({error:"invalid_status"},400,origin);
   const {data:requests,error:listError}=await db.from("raceatlas_organizer_change_requests")
    .select("id,event_id,field_name,proposed_value,evidence_url,explanation,created_at,review_status,reviewer_note,reviewed_at,user_id")
    .eq("review_status",status).order("created_at",{ascending:status!=="pending"}).limit(100);
   if(listError)throw listError;
   const ids=[...new Set((requests||[]).map(x=>x.event_id))];
   const names=new Map<string,string>();
   if(ids.length){
    const {data:events,error:eventsError}=await db.from("raceatlas_event_intelligence").select("event_id,event_name,official_event_url").in("event_id",ids);
    if(eventsError)throw eventsError;
    for(const e of events||[])names.set(e.event_id,e.event_name||e.event_id);
   }
   const rows=(requests||[]).map(x=>({...x,event_name:names.get(x.event_id)||x.event_id}));
   return response({requests:rows,asOf:new Date().toISOString()},200,origin);
  }
  const contentLength=Number(req.headers.get("content-length")||0);
  if(contentLength>2500)return response({error:"request_too_large"},413,origin);
  const body=await req.text();
  if(body.length>2500)return response({error:"request_too_large"},413,origin);
  let payload:any;
  try{payload=JSON.parse(body)}catch{return response({error:"invalid_json"},400,origin)}
  if(payload?.action==="grant_access"){
   const email=String(payload?.email||"").trim().toLowerCase();
   const eventId=String(payload?.event_id||"").trim();
   if(email.length>254||!/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/.test(email)||!/^ra-\d{1,8}$/.test(eventId))
    return response({error:"invalid_organizer_details"},400,origin);
   const {data:granted,error:grantError}=await db.rpc("trizentro_approve_organizer_access",{
    p_email:email,p_event_id:eventId,p_reviewer:user.id
   });
   if(grantError){console.error("organizer_access_grant_failed",grantError.code||"unknown");return response({error:"grant_not_applied"},409,origin)}
   return response(granted,200,origin);
  }
  const requestId=String(payload?.request_id||"");
  const decision=String(payload?.decision||"");
  const note=String(payload?.note||"").trim();
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)||!["approve","reject"].includes(decision)||note.length<10||note.length>1200)
   return response({error:"invalid_review"},400,origin);
  const {data,error:reviewError}=await db.rpc("trizentro_review_organizer_change",{
   p_request_id:requestId,p_action:decision,p_reviewer:user.id,p_note:note
  });
  if(reviewError){console.error("organizer_review_failed",reviewError.code||"unknown");return response({error:"review_not_applied"},409,origin)}
  return response(data,200,origin);
 }catch(err){console.error("organizer_admin_error",err instanceof Error?err.message:"unknown");return response({error:"admin_unavailable"},503,origin)}
});