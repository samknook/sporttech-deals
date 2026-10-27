"""Interne tweedehandscalculator. Geen automatische aankoop of bewezen verkoopprijzen."""
from __future__ import annotations
import argparse,csv,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SETTINGS=json.loads((ROOT/'config/settings.json').read_text(encoding='utf-8'))
def evaluate(row):
    def num(key):return float(str(row.get(key,0) or 0).replace(',','.'))
    purchase=num('buy_eur')
    sale=num('expected_sale_eur')
    shipping=num('shipping_eur')
    fees=num('platform_fees_eur')
    risk=num('risk_reserve_eur')
    sold_count=int(num('verified_sold_comparables'))
    proof=str(row.get('evidence_urls','')).strip()
    gain=round(sale-purchase-shipping-fees-risk,2)
    roi=round(gain/purchase*100,1) if purchase>0 else 0
    passes=(
      0<purchase<=SETTINGS['resale_max_purchase_eur']
      and purchase<=SETTINGS['resale_budget_eur']
      and sold_count>=SETTINGS['resale_min_sold_comparables']
      and bool(proof) and gain>=SETTINGS['resale_min_profit_eur']
      and roi>=SETTINGS['resale_min_roi_percent'])
    return {'product':row.get('title',''),'estimated_contribution_eur':gain,'roi_percent':roi,
            'verified_sold_comparables_claimed':sold_count,
            'purchase_candidate':passes,
            'note':'Bewijslinks en productconditie vereisen altijd handmatige controle.'}
def main():
    p=argparse.ArgumentParser()
    p.add_argument('csv_file')
    a=p.parse_args()
    with open(a.csv_file,newline='',encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):print(json.dumps(evaluate(row),ensure_ascii=False))
if __name__=='__main__':main()
