/* TriZentro PWA: network-first public navigation, offline fallback only.
 * Never cache account responses, registration data, analytics or external requests. */
'use strict';
const CACHE='trizentro-offline-v1';
const OFFLINE='/app-offline.html';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([OFFLINE,'/app-icons/icon-192.png'])));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('trizentro-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==self.location.origin||r.mode!=='navigate')return;
 if(!(/^\/(events|seizoen)\/?$/.test(u.pathname)||/^\/events\/wedstrijden\/[a-z0-9-]+\.html$/.test(u.pathname)))return;
 if([...u.searchParams.keys()].some(k=>/token|code|auth|password|reset|error/i.test(k)))return;
 event.respondWith(fetch(r).catch(async()=>await caches.match(OFFLINE)||new Response('TriZentro is offline.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
