#!/usr/bin/env python3
"""Audit every RaceAtlas organizer link. Review HTTP failures manually; never auto-publish."""
import concurrent.futures
import datetime as dt
import html
import ipaddress
import json
import pathlib
import re
import socket
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
PAGE=ROOT/"docs/raceatlas/index.html"
OUT=ROOT/"raceatlas-link-audit.json"
TODAY=dt.date.today()
def collect():
    source=PAGE.read_text(encoding="utf-8")
    match=re.search(r"const EVENTS=(\[.*?\]);\s*window\.RACEATLAS_EVENTS",source,re.S)
    if not match: raise ValueError("Cannot locate embedded event dataset")
    return json.loads(match.group(1))
def validate(url):
    try:
        p=urllib.parse.urlparse(url)
        if p.scheme!="https" or not p.hostname or p.username or p.password: return "invalid_https"
        if p.hostname in {"localhost","127.0.0.1"}: return "invalid_host"
        try:
            ip=ipaddress.ip_address(p.hostname)
            if not ip.is_global: return "private_host"
        except ValueError: pass
        return None
    except Exception: return "invalid_url"
def audit(e):
    url=e.get("officialEventUrl")
    result={"id":e.get("id"),"name":e.get("name"),"url":url,"date":e.get("date"),"dateEvidence":e.get("dateEvidence"),"checkedAt":dt.datetime.now(dt.timezone.utc).isoformat(),"httpStatus":None,"finalUrl":None,"issue":None}
    invalid=validate(url)
    if invalid: result["issue"]=invalid; return result
    for method in ("HEAD","GET"):
        try:
            req=urllib.request.Request(url,method=method,headers={"User-Agent":"Mozilla/5.0 (compatible; TriZentroLinkAudit/1.0; organizer link validation)","Accept":"text/html,*/*"})
            with urllib.request.urlopen(req,timeout=13,context=ssl.create_default_context()) as response:
                result["httpStatus"]=response.status
                result["finalUrl"]=response.url
                if method=="GET":
                    ctype=response.headers.get("Content-Type","")
                    if "text/html" not in ctype: result["issue"]="non_html"
                    else:
                        snippet=response.read(120000).decode("utf-8","replace")
                        title=re.search(r"<title[^>]*>(.*?)</title>",snippet,re.I|re.S)
                        result["pageTitle"]=html.unescape(re.sub(r"<[^>]*>","",title.group(1))).strip()[:180] if title else ""
                if not result["issue"] and (result["finalUrl"].rstrip("/")==url.rstrip("/") or validate(result["finalUrl"]) is None): result["issue"]=None
                return result
        except urllib.error.HTTPError as exc:
            result["httpStatus"]=exc.code
            if exc.code in (403,405,429,501) and method=="HEAD": continue
            result["issue"]="http_"+str(exc.code);return result
        except Exception as exc:
            if method=="HEAD": continue
            result["issue"]=type(exc).__name__[:80];return result
    result["issue"]="not_reachable";return result
def main():
    events=collect()
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        rows=list(pool.map(audit,events))
    problems=[r for r in rows if r["issue"]]
    report={"auditedOn":dt.datetime.now(dt.timezone.utc).isoformat(),"events":len(events),"reachable":len(events)-len(problems),"requiresReview":len(problems),"issues":problems,"results":rows}
    OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Events: {len(events)}, reachable: {len(events)-len(problems)}, review: {len(problems)}")
    for r in problems: print(f"REVIEW {r['id']} {r['issue']} {r['url']}")
    print("Note: HTTP reachability is not proof that event content, 2027 edition or registration is correct.")
    return 0
if __name__=="__main__":sys.exit(main())
