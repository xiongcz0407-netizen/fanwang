/* ================= GitHub 版云端存档 =================
   存档放在一个私有仓库里（见 js/ghcfg.js），用 GitHub 的接口读写：
     users/u_xxx.json   一个用户一个文件：名字、口令的哈希、三个存档位的摘要
     saves/<id>_<位>.json 一个存档位一个文件：存档本身
   这里实现 cloud.js 需要的 cloudApi（login / load / save / del），其余逻辑（登录页、存档位、自动上传）都在 cloud.js。
   注意：钥匙（令牌）写在网页里，懂行的人能拿到，所以令牌只授权存档仓库、只给读写文件的权限。 */
const GH=typeof GH_SAVE!=='undefined'?GH_SAVE:null;
function cloudReady(){return !!(GH&&GH.owner&&GH.repo&&GH.k)}
cloudMinGap=60000;                       // 两次上传至少隔 1 分钟，关页面时会补传最后一次
const ghTok=()=>atob(GH.k.split('').reverse().join(''));
const ghB64e=s=>{const b=new TextEncoder().encode(s);let x='';for(let i=0;i<b.length;i+=0x8000)x+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(x)};
const ghB64d=s=>new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/\s/g,'')),c=>c.charCodeAt(0)));
async function ghSha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const ghShas={};                         // 记住每个文件最新的版本号（sha），改文件时要用
class GhErr extends Error{constructor(code){super(code);this.code=code}}
async function ghReq(method,path,body,keep){
  const r=await fetch(`${GH.api||'https://api.github.com'}/repos/${GH.owner}/${GH.repo}/contents/${path}`+(method==='GET'?`?t=${Date.now()}`:''),{method,cache:'no-store',keepalive:!!keep,
    headers:{Authorization:'Bearer '+ghTok(),Accept:'application/vnd.github+json'},body:body?JSON.stringify(body):undefined});
  if(r.status===401||r.status===403)throw new GhErr('token');
  return r}
async function ghGet(path){const r=await ghReq('GET',path);if(r.status===404){delete ghShas[path];return null}
  if(!r.ok)throw new GhErr('net');const j=await r.json();ghShas[path]=j.sha;return ghB64d(j.content)}
async function ghPut(path,text,msg,keep){
  for(let i=0;i<2;i++){const body={message:msg||('save '+path),content:ghB64e(text)};if(ghShas[path])body.sha=ghShas[path];
    const r=await ghReq('PUT',path,body,keep);
    if(r.ok){const j=await r.json().catch(()=>null);if(j&&j.content)ghShas[path]=j.content.sha;return true}
    if((r.status===409||r.status===422)&&i===0){await ghGet(path);continue}   // 版本号过期：重新取一次再写
    throw new GhErr('net')}
  throw new GhErr('net')}
async function ghDel(path){if(!ghShas[path])await ghGet(path);if(!ghShas[path])return;
  const r=await ghReq('DELETE',path,{message:'del '+path,sha:ghShas[path]});if(r.ok||r.status===404){delete ghShas[path];return}throw new GhErr('net')}

let ghUser=null;                         // 登录后缓存：{uk,path,u}
async function ghAuth(name,pin,create,fresh){
  name=String(name||'').trim().slice(0,12);if(!name||!/^\d{6}$/.test(String(pin||'')))throw new GhErr('input');
  const uk='u_'+(await ghSha256('xw|'+name)).slice(0,40),path=`users/${uk}.json`;
  const ph=await ghSha256('pin|'+uk+'|'+pin);
  if(!fresh&&ghUser&&ghUser.uk===uk&&ghUser.u.ph===ph)return ghUser;
  const t=await ghGet(path);let u=t?JSON.parse(t):null,created=false;
  if(!u){if(!create)throw new GhErr('nouser');u={id:uk.slice(2,20),name,ph,slots:[null,null,null],created:Date.now()};await ghPut(path,JSON.stringify(u),'new user');created=true}
  else if(u.ph!==ph)throw new GhErr('pin');
  ghUser={uk,path,u,created};return ghUser}
const ghSavePath=(u,slot)=>`saves/${u.id}_${slot}.json`;
/* 删存档或在同一个存档位开新局时，旧的那一局不删，存成一个不带用户 ID 的匿名文件，留作平衡参考 */
async function ghArchive(path){const t=await ghGet(path);if(!t)return;const d=new Date(),p2=n=>String(n).padStart(2,'0');
  const ts=`${d.getFullYear()}${p2(d.getMonth()+1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}`;
  await ghPut(`saves/arch_${ts}_${Math.random().toString(36).slice(2,8)}.json`,t,'archive')}
const gidOf=data=>{const m=/"gid":"([^"]+)"/.exec(data);return m?m[1]:''};

/* cloud.js 调用的接口：login / load / save / del */
async function cloudApi(op,extra){
  extra=extra||{};
  try{
    const a=await ghAuth(ACCT&&ACCT.name,ACCT&&ACCT.pin,op==='login'&&extra.create,op==='login');
    const slot=extra.slot|0;
    if(op==='login')return {ok:true,slots:a.u.slots,created:a.created,meta:a.u.meta||null};
    if(slot<0||slot>=CLOUD_SLOTS)return {ok:false,err:'input'};
    if(op==='load'){const d=await ghGet(ghSavePath(a.u,slot));return {ok:true,data:d,meta:a.u.slots[slot]}}
    if(op==='save'){const data=String(extra.data||'');if(data.length>900000)return {ok:false,err:'size'};
      const at=Date.now(),gid=gidOf(data),old=a.u.slots[slot];
      if(old&&old.gid&&gid&&old.gid!==gid)await ghArchive(ghSavePath(a.u,slot));   // 这个存档位换了一局：先把旧的存成匿名文件
      await ghPut(ghSavePath(a.u,slot),data,'save');
      a.u.slots[slot]={brief:String(extra.brief||'').slice(0,80),savedAt:at,gid};
      /* 成就与数据：和云端已有的合并，每项取较大值 */
      if(extra.meta)a.u.meta=typeof metaMerge==='function'?metaMerge(extra.meta,a.u.meta):extra.meta;
     await ghPut(a.path,JSON.stringify(a.u),'slots');
      return {ok:true,savedAt:at}}
    if(op==='del'){await ghArchive(ghSavePath(a.u,slot));await ghDel(ghSavePath(a.u,slot));a.u.slots[slot]=null;await ghPut(a.path,JSON.stringify(a.u),'del slot');return {ok:true,slots:a.u.slots}}
    return {ok:false,err:'input'};
  }catch(e){return {ok:false,err:e&&e.code||'net'}}
}
/* 关页面前补传：只写存档文件本身（用 keepalive，页面关了请求也会发出去） */
function cloudBeacon(){
  if(!cloudOn()||!S||!cloudCan()||!ghUser)return;const data=JSON.stringify(S);if(data===cloudPushed)return;
  const p=ghSavePath(ghUser.u,SLOT);if(!ghShas[p])return;const os=ghUser.u.slots[SLOT];if(os&&os.gid&&S.gid&&os.gid!==S.gid)return;   // 换了一局的第一次上传要走正常流程（先存档旧局）
  try{ghReq('PUT',p,{message:'save',content:ghB64e(data),sha:ghShas[p]},true).catch(()=>{});cloudPushed=data}catch(e){}
}
