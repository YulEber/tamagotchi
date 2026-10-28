// Pixel-Tamagotchi: lädt das Spiel auch ohne Internet
const CACHE="tamagotchi-v18";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith("tamagotchi-")).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.hostname.endsWith("open-meteo.com"))return; // Wetter immer frisch aus dem Netz
  const font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
  if(u.origin!==self.location.origin&&!font)return;
  // aus dem Speicher antworten und im Hintergrund auffrischen
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=r.mode==="navigate"?"./index.html":r,hit=await c.match(key,{ignoreSearch:r.mode==="navigate"});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(key,res.clone());return res;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    return(await net)||new Response("Offline",{status:503,statusText:"Offline"});
  }));
});
