#!/usr/bin/env python3
"""RaceAtlas non-destructive URL availability monitor. Does NOT verify event dates."""
import json, re, urllib.request, urllib.error, pathlib, datetime, time, collections, os
ROOT=pathlib.Path(__file__).resolve().parents[1]
INDEX=ROOT/'docs/raceatlas/index.html'
OUT=ROOT/'docs/raceatlas/source-health.json'
def events():
    text=INDEX.read_text(encoding='utf-8')
    m=re.search(r'const EVENTS=(\[.*?\]);\s*window\.RACEATLAS_EVENTS',text,re.S)
    if not m: raise ValueError('RaceAtlas EVENTS data not found')
    return json.loads(m.group(1))
def domain(url):
    from urllib.parse import urlparse
    u=urlparse(url)
    if u.scheme not in ('https','http') or not u.hostname: return None
    return u.hostname.lower()
def probe(url):
    req=urllib.request.Request(url,method='HEAD',headers={'User-Agent':'RaceAtlas-SourceMonitor/1.0 (+https://github.com/samknook/sporttech-deals)','Accept':'text/html'})
    try:
        with urllib.request.urlopen(req,timeout=10) as response:
            code=response.status
            return 'reachable' if 200<=code<400 else 'unknown'
    except urllib.error.HTTPError as e:
        # Sites often reject automated requests, CAPTCHA, or HEAD. 403 is not proof of a dead link.
        return 'broken' if e.code in (404,410) else 'unknown'
    except Exception:
        return 'unknown'
def main():
    data=events()
    urls=sorted({e.get('officialEventUrl') or e.get('source') for e in data if domain(e.get('officialEventUrl') or e.get('source'))})
    # Keep the check gentle and predictable; one URL per domain on each scheduled run.
    grouped=collections.defaultdict(list)
    for url in urls: grouped[domain(url)].append(url)
    urls=[values[0] for values in grouped.values()]
    offset=int(os.environ.get('RACEATLAS_SOURCE_BATCH','0'))
    selected=urls[offset*30:(offset+1)*30] or urls[:30]
    report={'note':'HTTP link availability only; no event date or registration has been verified.','checked_on':datetime.date.today().isoformat(),'total_records':len(data),'total_unique_source_urls':len({e.get('source') for e in data if e.get('source')}),'checked_urls':[]}
    for url in selected:
        result=probe(url)
        report['checked_urls'].append({'url':url,'result':result})
        time.sleep(0.1)
    OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    counts=collections.Counter(v['result'] for v in report['checked_urls'])
    print('RaceAtlas source monitor:',dict(counts),'events:',len(data))
if __name__=='__main__':main()
