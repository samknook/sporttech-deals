"""Genereert site/data.json op basis van uitsluitend geautoriseerde CSV-feeds."""
from __future__ import annotations
import argparse,datetime as dt,json,os
from pathlib import Path
from engine import ROOT,CATALOG,download_feed,parse_feed,dedupe,update_history,report_data

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--feed',action='append',default=[],help='Geautoriseerd CSV-bestand of HTTPS-URL')
    parser.add_argument('--verify',action='store_true',help='Controleer feed zonder bestanden te wijzigen')
    args=parser.parse_args()
    now=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
    sources=list(args.feed)+[x.strip() for x in os.getenv('STD_FEED_URLS','').splitlines() if x.strip()]
    offers=[]
    for index,source in enumerate(sources):
        if source.lower().startswith('https://'):
            raw=download_feed(source)
        else:
            if source.lower().startswith(('http://','file://')):raise ValueError('Onveilig URL-schema')
            raw=Path(source).read_bytes()
        imported=parse_feed(raw,f'authorized_feed_{index+1}',now)
        print(f'Feed {index+1}: {len(imported)} veilige nieuwe aanbiedingen')
        offers.extend(imported)
    offers=dedupe(offers)
    if args.verify:
        print(json.dumps({'offers':len(offers),'models':len({o['product_id'] for o in offers})}))
        return
    hp=ROOT/'data/history.json'
    history=json.loads(hp.read_text(encoding='utf-8')) if hp.exists() else {}
    if offers:
        update_history(history,offers,now[:10])
        hp.write_text(json.dumps(history,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    result=report_data(offers,history,now)
    (ROOT/'site/data.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps(result['stats'],ensure_ascii=False))
    if not offers:print('Geen geautoriseerde feed: website toont geen verzonnen prijzen.')
if __name__=='__main__':main()
