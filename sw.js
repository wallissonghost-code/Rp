/* ARCANA PWA v26: network-first documents and code; offline fallback. */
const CACHE='arcana-lobby-v34';
const ASSETS=['./','./index.html','./navigation.js','./lobby-premium.css','./account.js','./arena.js','./arena-premium.css','./shop.js','./collection-premium.css','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('arcana-lobby-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 const isCode=request.mode==='navigate'||/\.(?:html|js|css)$/.test(url.pathname);
 event.respondWith((async()=>{
  try{
   const response=await fetch(isCode?new Request(request,{cache:'no-store'}):request);
   if(response.ok){const cache=await caches.open(CACHE);event.waitUntil(cache.put(request,response.clone()));}
   return response;
  }catch(error){
   const cached=await caches.match(request,{ignoreSearch:true});
   if(cached)return cached;
   throw error;
  }
 })());
});