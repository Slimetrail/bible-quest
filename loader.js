// Password gate: derives an AES-GCM key with PBKDF2 (600k), decrypts the app blobs and boots the game.
(()=>{const KEY="bq_key",$=s=>document.getElementById(s);
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));const toB64=u=>btoa(String.fromCharCode(...new Uint8Array(u)));
addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.__bip=e});
const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone;if(standalone())$("lInstall").classList.add("hide");
$("lInstall").onclick=async()=>{if(window.__bip){window.__bip.prompt();await window.__bip.userChoice;window.__bip=null}else $("lHelp").classList.remove("hide")};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
let meta;const getMeta=async()=>meta||(meta=await (await fetch("enc/meta.json",{cache:"no-cache"})).json());
const dec=async(k,u8)=>new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:u8.slice(0,12)},k,u8.slice(12)));
const imp=raw=>crypto.subtle.importKey("raw",raw,"AES-GCM",false,["decrypt"]);
async function check(k){const m=await getMeta();try{return new TextDecoder().decode(await dec(k,b64(m.check)))==="bible-quest-ok"}catch(e){return false}}
async function boot(k){const m=await getMeta(),out={};
 for(const[n,id]of m.files){const u=new Uint8Array(await (await fetch("enc/"+id+"?v="+m.v)).arrayBuffer());out[n]=new TextDecoder().decode(await dec(k,u))}
 window.__bqLock=()=>{localStorage.removeItem(KEY);location.reload()};
 const st=document.createElement("style");st.textContent=out["style.css"];document.head.appendChild(st);
 $("lock").remove();document.body.insertAdjacentHTML("afterbegin",out["body.html"]);
 for(const f of m.files.map(x=>x[0]).filter(n=>n.endsWith(".js"))){const s=document.createElement("script");s.textContent=out[f];document.body.appendChild(s)}}
async function unlock(){const pw=$("pw").value;if(!pw)return;$("lErr").textContent="Unlocking…";$("lGo").disabled=true;
 try{const m=await getMeta();const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:b64(m.salt),iterations:m.iter,hash:"SHA-256"},base,256);const k=await imp(bits);
  if(!(await check(k))){$("lErr").textContent="❌ Wrong password, try again";$("lGo").disabled=false;return}
  localStorage.setItem(KEY,JSON.stringify({salt:m.salt,k:toB64(bits)}));await boot(k)}catch(e){$("lErr").textContent="Couldn't unlock: "+e.message;$("lGo").disabled=false}}
$("lGo").onclick=unlock;$("pw").onkeydown=e=>{if(e.key==="Enter")unlock()};
(async()=>{try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(!s)return;const m=await getMeta();if(s.salt!==m.salt){localStorage.removeItem(KEY);return}
 const k=await imp(b64(s.k));if(await check(k))await boot(k);else localStorage.removeItem(KEY)}catch(e){}})();
})();
