"""SportTech Deals: veilige import van geautoriseerde CSV-productfeeds, alleen stdlib."""
from __future__ import annotations
import csv, gzip, io, json, re, statistics, urllib.parse, urllib.request, ipaddress
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=json.loads((ROOT/'config/catalog.json').read_text(encoding='utf-8'))
SETTINGS=json.loads((ROOT/'config/settings.json').read_text(encoding='utf-8'))
ALIASES={
 'title':['title','product_name','name','product','productname','product_title','productnaam'],
 'shop':['shop','merchant','merchant_name','retailer','winkel','advertiser_name','store'],
 'price':['price','price_eur','search_price','sale_price','price_with_vat','product_price','prijs','price_including_vat'],
 'shipping':['shipping','shipping_eur','shipping_cost','delivery_cost','verzendkosten','shipping_price'],
 'url':['url','link','product_url','deeplink','aw_deep_link','merchant_deep_link','affiliate_url','product_link','destination_url'],
 'condition':['condition','state','staat','item_condition'],
 'currency':['currency','valuta'],
 'stock':['stock','availability','in_stock','voorraad']
}
BLOCK=re.compile(r'\b(hoes|case|cover|houder|mount|beugel|accessor\w*|sensor|bescherm\w*|protector|replacement|vervang\w*|bundle|bundel|refurb\w*|renewed|tweedehands|used|solar|pack)\b',re.I)

def canonical(value):
    return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9]+',' ',str(value).lower())).strip()

def match_product(title):
    if BLOCK.search(title):return None
    normalized=canonical(title)
    hits=[p for p in CATALOG if re.search(p['match_pattern'],normalized,flags=re.I)]
    return hits[0] if len(hits)==1 else None

def money(value):
    s=str(value if value is not None else '').replace('€','').replace(' ','').replace('\u00a0','').strip()
    if not s:return 0.0
    if ',' in s and '.' in s:
        s=s.replace('.','').replace(',','.') if s.rfind(',')>s.rfind('.') else s.replace(',','')
    elif ',' in s:
        s=s.replace(',','') if re.fullmatch(r'\d{1,3},\d{3}',s) else s.replace(',','.')
    elif re.fullmatch(r'\d{1,3}\.\d{3}',s):
        s=s.replace('.','')
    return round(float(s),2)

def val(row,field,default=''):
    for key in ALIASES[field]:
        if key in row and row[key] is not None and str(row[key]).strip():
            return str(row[key]).strip()
    return default

def normalize_row(row,source,now):
    row={str(k).strip().lower():v for k,v in row.items() if k is not None}
    title=val(row,'title')
    p=match_product(title)
    if not p:return None
    if val(row,'condition','new').lower() not in ('new','nieuw','brand new','new with tags'):return None
    if val(row,'currency','EUR').upper() not in ('EUR','€'):return None
    if val(row,'stock','in_stock').lower() in ('0','false','sold','out of stock','out_of_stock','unavailable','niet op voorraad'):return None
    price=money(val(row,'price'))
    if not 10<=price<=5000:return None
    raw=val(row,'shipping')
    known=raw!=''
    shipping=money(raw) if known else 0.0
    if not 0<=shipping<=250:return None
    shop=val(row,'shop')
    url=val(row,'url')
    parsed=urllib.parse.urlparse(url)
    if not shop or parsed.scheme!='https' or not parsed.netloc or parsed.username or parsed.password:return None
    if not parsed.hostname or parsed.hostname in ('localhost','127.0.0.1','::1'):return None
    return {'product_id':p['id'],'name':title[:160],'shop':shop[:90],
            'price_eur':price,'shipping_eur':shipping if known else None,
            'shipping_known':known,'total_eur':round(price+shipping,2),
            'url':url,'source':source,'condition':'nieuw',
            'checked_at':now,'data_origin':'authorized_feed'}

def parse_feed(data:bytes,source:str,now:str):
    if data[:2]==b'\x1f\x8b':data=gzip.decompress(data)
    if len(data)>20_000_000:raise ValueError('Feed te groot (max 20 MB)')
    text=data.decode('utf-8-sig',errors='replace')
    if not text.strip():return []
    try:dialect=csv.Sniffer().sniff(text[:4096],delimiters=',;\t|')
    except csv.Error:dialect=csv.excel
    rows=csv.DictReader(io.StringIO(text),dialect=dialect)
    if not rows.fieldnames:return []
    offers=[]
    for idx,row in enumerate(rows):
        if idx>=100_000:break
        try:item=normalize_row(row,source,now)
        except (ValueError,TypeError,OverflowError):item=None
        if item:offers.append(item)
    return offers

def download_feed(url):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!='https' or not parsed.hostname:raise ValueError('HTTPS-feed-URL vereist')
    if parsed.hostname.lower() in ('localhost','localhost.localdomain'):raise ValueError('Lokale bron verboden')
    try:
        addr=ipaddress.ip_address(parsed.hostname)
        if not addr.is_global:raise ValueError('Privé-netwerken verboden')
    except ValueError as exc:
        if str(exc)=='Privé-netwerken verboden':raise
    request=urllib.request.Request(url,headers={'User-Agent':'SportTechDealsPublisher/1.0','Accept':'text/csv,*/*'})
    with urllib.request.urlopen(request,timeout=25) as response:
        target=urllib.parse.urlparse(response.geturl())
        if target.scheme!='https':raise ValueError('Onveilige redirect')
        data=response.read(15_000_001)
    if len(data)>15_000_000:raise ValueError('Feed te groot voor MVP (15 MB)')
    return data

def dedupe(offers):
    result={}
    for offer in offers:
        key=(offer['product_id'],canonical(offer['shop']))
        if key not in result or offer['total_eur']<result[key]['total_eur']:
            result[key]=offer
    return sorted(result.values(),key=lambda x:(x['product_id'],x['total_eur']))

def build_deals(offers,now):
    latest=datetime.fromisoformat(now.replace('Z','+00:00'))
    grouped=defaultdict(list)
    for o in offers:
        if not o.get('shipping_known'):continue
        try:age=latest-datetime.fromisoformat(o['checked_at'].replace('Z','+00:00'))
        except (KeyError,ValueError):continue
        if timedelta(0)<=age<=timedelta(hours=SETTINGS['feed_max_age_hours']):
            grouped[o['product_id']].append(o)
    flagged={}
    for pid,arr in grouped.items():
        if len({canonical(o['shop']) for o in arr})<SETTINGS['minimum_distinct_shops_for_comparison']:continue
        for o in arr:
            peers=[x['total_eur'] for x in arr if canonical(x['shop'])!=canonical(o['shop'])]
            if len(peers)<2:continue
            median=statistics.median(peers)
            discount=round(100*(1-o['total_eur']/median),1) if median>0 else 0
            if discount>=SETTINGS['deal_percent_below_peer_median']:
                flagged.setdefault(pid,[]).append({
                    'shop':o['shop'],'total_eur':o['total_eur'],
                    'discount_vs_peer_median_percent':discount,
                    'peer_median_eur':round(median,2),'peer_shops':len(peers),
                    'url':o['url'],'checked_at':o['checked_at']})
    return flagged

def update_history(history,offers,date):
    for pid in {o['product_id'] for o in offers}:
        totals=[o['total_eur'] for o in offers if o['product_id']==pid and o.get('shipping_known')]
        if not totals:continue
        rows=history.setdefault(pid,[])
        rows[:]=[r for r in rows if r.get('date')!=date]
        rows.append({'date':date,'lowest_offer_eur':min(totals),'shops':len(totals)})
        rows.sort(key=lambda r:r['date']);del rows[:-90]
    return history

def report_data(offers,history,now):
    offers=dedupe(offers)
    flags=build_deals(offers,now)
    by_id=defaultdict(list)
    for o in offers:by_id[o['product_id']].append(o)
    products=[]
    for p in CATALOG:
        arr=sorted(by_id[p['id']],key=lambda x:x['total_eur'])[:SETTINGS['max_offers_per_product']]
        products.append({k:v for k,v in p.items() if k!='match_pattern'}|{
            'offers':arr,'min_price_eur':arr[0]['total_eur'] if arr else None,
            'offer_count':len(arr),'deal_flags':flags.get(p['id'],[]),
            'history':history.get(p['id'],[])})
    return {'site_name':'SportTech Deals','generated_at':now,'mode':'live-feed',
            'disclosure':'Prijzen komen uit goedgekeurde feeds; controleer de eindprijs bij de winkel.',
            'products':products,
            'stats':{'products':len(products),'priced_products':sum(bool(x['offers']) for x in products),
                     'offers':sum(len(x['offers']) for x in products),
                     'signals':sum(len(x['deal_flags']) for x in products)}}
