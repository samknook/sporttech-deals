#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const page=fs.readFileSync('docs/admin/analytics/index.html','utf8');
const script=page.match(/<script>\n([\s\S]*?)<\/script>\s*<\/body>/);
assert.ok(script,'Admin analytics page must have runtime script');
new Function(script[1]);
assert.ok(page.includes('noindex,nofollow'),'Admin route must not be indexed');
assert.ok(page.includes("response.status===403"),'Admin route must handle missing privileges');
assert.ok(page.includes('getSession()'),'Admin route must require signed-in account');
assert.ok(page.includes("Authorization:'Bearer '+token"),'Admin API must receive signed-in JWT');
assert.ok(page.includes("trizentro-admin-analytics"),'Admin route must fetch privileged server endpoint');
assert.ok(!/SERVICE_ROLE_KEY|sk_secret_|service_role/.test(page),'Privileged database credential must never appear in public HTML');
assert.ok(page.includes('data=result;'),'Analytics state only populated after authenticated API returns');
assert.ok(page.includes('download(name,contents,type)'),'Admin route should export files');
assert.ok(page.includes('void init()'),'Admin page initialization missing');
console.log('PASS: admin analytics authorization UI, no secrets, secure API fetch, export and script syntax');
