#!/usr/bin/env python3
"""Check the published Supabase catalogue links without changing production data."""
import concurrent.futures
import datetime as dt
import json
import pathlib
import urllib.request
from importlib.machinery import SourceFileLoader

BASE=pathlib.Path(__file__).resolve().parents[1]
audit=SourceFileLoader("raceatlas_audit",str(BASE/"scripts/check-raceatlas-official-links.py")).load_module()
API="https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_event_intelligence"
KEY="sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw"
PARAMS="?select=event_id,event_name,start_date,official_event_url,official_registration_url,date_confidence,publish_status&publish_status=eq.published&limit=1000"
req=urllib.request.Request(API+PARAMS,headers={"apikey":KEY,"Accept":"application/json","User-Agent":"TriZentroReleaseAudit/1.0"})
with urllib.request.urlopen(req,timeout=25) as response:
    rows=json.loads(response.read())
if not isinstance(rows,list): raise ValueError("Unexpected Supabase response")
events=[]
for e in rows:
    url=e.get("official_event_url") or e.get("official_registration_url")
    events.append({"id":e["event_id"],"name":e["event_name"],"date":e.get("start_date"),"dateEvidence":e.get("date_confidence"),"officialEventUrl":url})
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
    checked=list(executor.map(audit.audit,events))
problems=[r for r in checked if r["issue"]]
result={"checkedAt":dt.datetime.now(dt.timezone.utc).isoformat(),"publishedCount":len(events),"reachable":len(events)-len(problems),"requiresManualReview":len(problems),"problems":problems,"results":checked}
(BASE/"raceatlas-live-link-audit.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
print(f"LIVE published: {len(events)}; reachable: {len(events)-len(problems)}; manual review: {len(problems)}")
for r in problems: print(f"REVIEW {r['id']} {r['name']} | {r['issue']} | {r['url']}")
if len(events)<100: raise SystemExit("Unexpectedly small live catalog; inspect before release")
