"""Optionele beheerdernotificatie: nog niet actief in de publicatieworkflow.
Bezoekers bewaren in de MVP alleen lokale prijsdoelen.
"""
from __future__ import annotations
import json,os,ssl,smtplib
from email.message import EmailMessage
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def notify():
    required=['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM','SMTP_TO']
    if not all(os.getenv(k) for k in required):
        print('SMTP niet ingesteld, geen mail verzonden.');return False
    d=json.loads((ROOT/'site/data.json').read_text(encoding='utf-8'))
    count=sum(len(p.get('deal_flags',[])) for p in d.get('products',[]))
    if count==0:
        print('Geen gevalideerde deals, geen mail.');return False
    msg=EmailMessage()
    msg['From']=os.environ['SMTP_FROM']
    msg['To']=os.environ['SMTP_TO']
    msg['Subject']=f'SportTech Deals: {count} prijssignalen'
    msg.set_content('Controleer resultaten op de website en verifieer de eindprijzen.\n\nUitsluitend beheerdersmail.')
    with smtplib.SMTP_SSL(os.environ['SMTP_HOST'],int(os.getenv('SMTP_PORT','465')),context=ssl.create_default_context(),timeout=20) as smtp:
        smtp.login(os.environ['SMTP_USER'],os.environ['SMTP_PASSWORD'])
        smtp.send_message(msg)
    return True
if __name__=='__main__':notify()
