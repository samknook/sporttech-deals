import csv,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from engine import match_product,money,normalize_row,parse_feed,dedupe,build_deals,report_data
from resale import evaluate
NOW='2026-10-27T12:00:00Z'
class ScannerTests(unittest.TestCase):
    def example(self,shop,price,shipping='5',name='Garmin Edge 540'):
        return normalize_row({'title':name,'shop':shop,'price':str(price),'shipping':shipping,
            'url':'https://shop.example.org/garmin-edge-540','condition':'new','currency':'EUR',
            'stock':'in_stock'},'test',NOW)
    def test_exact_match(self):
        self.assertEqual(match_product('Garmin Edge 540')['id'],'garmin-edge-540')
        self.assertIsNone(match_product('Garmin Edge 540 Solar'))
        self.assertIsNone(match_product('Garmin Edge 540 bundle'))
        self.assertIsNone(match_product('Garmin Edge 840 hoes'))
        self.assertIsNone(match_product('Garmin Edge 5400'))
    def test_european_currency(self):
        self.assertEqual(money('1.299,99'),1299.99)
        self.assertEqual(money('299,95'),299.95)
    def test_used_rejected(self):
        row={'title':'Garmin Edge 540','shop':'Test','price':'200','shipping':'4','url':'https://example.org','condition':'used'}
        self.assertIsNone(normalize_row(row,'test',NOW))
    def test_http_rejected(self):
        row={'title':'Garmin Edge 540','shop':'Test','price':'200','shipping':'4','url':'http://example.org'}
        self.assertIsNone(normalize_row(row,'test',NOW))
    def test_no_shipping_no_deal(self):
        arr=[self.example('A',200,''),self.example('B',270,''),self.example('C',280,'')]
        self.assertFalse(build_deals(arr,NOW))
    def test_deal_requires_three_shops(self):
        a=[self.example('A',200),self.example('B',270)]
        self.assertFalse(build_deals(a,NOW))
        a.append(self.example('C',280))
        self.assertEqual(len(build_deals(a,NOW)['garmin-edge-540']),1)
    def test_duplicate_shop_only_one(self):
        a=[self.example('A',200),self.example('A',195)]
        self.assertEqual(len(dedupe(a)),1)
    def test_feed_parser(self):
        raw=b'title,shop,price,shipping,url,condition,currency,stock\nGarmin Edge 540,Shop,250,5,https://example.org,new,EUR,in_stock\n'
        self.assertEqual(len(parse_feed(raw,'test',NOW)),1)
    def test_report_prices_empty(self):
        r=report_data([],{},NOW)
        self.assertEqual(r['stats']['offers'],0)
        self.assertEqual(r['stats']['products'],8)
    def test_resale_guard(self):
        base={'title':'Garmin','buy_eur':70,'expected_sale_eur':135,'shipping_eur':7,
              'platform_fees_eur':8,'risk_reserve_eur':7,'verified_sold_comparables':2,'evidence_urls':'https://example.org'}
        self.assertFalse(evaluate(base)['purchase_candidate'])
        base['verified_sold_comparables']=3
        self.assertTrue(evaluate(base)['purchase_candidate'])
if __name__=='__main__':unittest.main()
