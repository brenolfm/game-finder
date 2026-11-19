const CACHE='game-finder-shell-v9';
const DATA_CACHE='game-finder-data-v1';
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg','./catalogo-psplus.json','./destaques.json'];
function isCatalogData(url){
 return url.hostname==='raw.githubusercontent.com'&&
  url.pathname.startsWith('/Ephellon/game-store-catalog/main/ps5/')&&
  url.pathname.endsWith('.json');
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(name=>
  (name.startsWith('game-finder-shell-')&&name!==CACHE)||
  (name.startsWith('game-finder-data-')&&name!==DATA_CACHE)
 ).map(name=>caches.delete(name)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET')return;
 if(isCatalogData(url)){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(DATA_CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
   return response;
  }).catch(()=>caches.open(DATA_CACHE).then(cache=>cache.match(request)).then(cached=>
   cached||new Response('Este trecho do catálogo ainda não foi salvo neste aparelho. Conecte-se à internet para carregá-lo.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})
  )));
  return;
 }
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok)caches.open(CACHE).then(cache=>cache.put('./index.html',response.clone()));
   return response;
  }).catch(()=>caches.match('./index.html')));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
  return response;
 })));
});
