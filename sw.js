// Network-first service worker; caches the loader and encrypted blobs for offline play.
const CACHE="bq-enc-mvgoc6hq",SHELL=["./","img/season/fall-1.webp","img/season/fall-2.webp","img/season/fall-3.webp","img/season/fall-4.webp","img/season/spring-1.webp","img/season/spring-2.webp","img/season/spring-3.webp","img/season/spring-4.webp","img/season/summer-1.webp","img/season/summer-2.webp","img/season/summer-3.webp","img/season/winter-1.webp","img/season/winter-2.webp","img/season/winter-3.webp","index.html","loader.js","audio/words.js","img/bg/list.js","manifest.webmanifest","enc/meta.json","enc/b0.bin","enc/b1.bin","enc/b2.bin","enc/b3.bin","enc/b4.bin","enc/b5.bin","enc/b6.bin","enc/b7.bin","enc/b8.bin","enc/b9.bin","enc/b10.bin","enc/b11.bin","enc/b12.bin","enc/b13.bin","enc/b14.bin","enc/b15.bin","enc/b16.bin","enc/n_chains_json.bin","enc/n_threads_json.bin","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png"];
// 🔊 word-pronunciation clips: precached in the background (not blocking install) and refreshed with every new cache version.
try{importScripts("audio/words.js","img/bg/list.js")}catch(_){}
const AUD=[...new Set(Object.values(self.BQ_AU||{}))].map(f=>"audio/"+f).concat(self.BQ_IMG||[]);let auBusy=null;
function auFill(){if(auBusy)return auBusy;auBusy=caches.open(CACHE).then(async c=>{const have=new Set((await c.keys()).map(r=>new URL(r.url).pathname.split("/").slice(-3).join("/")));const miss=AUD.filter(u=>!have.has(u.split("/").slice(-3).join("/")));
 for(let i=0;i<miss.length;i+=16)await Promise.all(miss.slice(i,i+16).map(u=>fetch(u,{cache:"reload"}).then(r=>r.ok&&c.put(u,r)).catch(()=>0)))}).finally(()=>{auBusy=null});return auBusy}
self.addEventListener("message",e=>{if(e.data==="bq-audio")e.waitUntil?e.waitUntil(auFill()):auFill()});
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("bq-enc-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()).then(()=>{auFill()}))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r,{cache:"no-cache"}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
 .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==="navigate"?caches.match("index.html"):Response.error()))))});
