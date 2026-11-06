#!/usr/bin/env node
/* Synthetic evaluation: no real messages, no model call, no stored data. */
'use strict';
const batch=require('./batch-evaluation.cjs');
const facts=[{source:'Synthetic demo facts',fact:'INV-218 exists; customer-facing payment status not yet confirmed.'}];
const sample=id=>({id,message:'Please check payment for invoice INV-218.',approvedFacts:facts});
const claim=value=>({kind:'invoice',reference:'INV-218',field:'payment_status',value});
const source=value=>({...claim(value),source:'Synthetic ledger',checkedOn:'2026-11-06'});
const draft='CATEGORY: invoice\nDRAFT: Thank you for asking about INV-218. We will check the accounting system before providing confirmation.\nHUMAN CHECKS: Verify customer identity and payment status against authorized records.';
const shared={draft,asOf:'2026-11-06'};
const items=[
 {...shared,sample:sample('BATCH-001'),assertions:[claim('unpaid')],records:[source('unpaid')]},
 {...shared,sample:sample('BATCH-002'),assertions:[claim('paid')],records:[source('unpaid')]},
 {...shared,sample:sample('BATCH-003'),assertions:[claim('paid')],records:[]}
];
const result=batch.evaluateBatch(items,{minutesBefore:8,minutesAfter:5,hourlyCost:40});
console.log(batch.report(result));
