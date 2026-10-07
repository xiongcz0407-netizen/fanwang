/* ================= 云端存档 =================
   用户名 + 6 位口令登录，每个用户 3 个存档位，存档放在 EdgeOne 的 KV 里（接口 /api/save，见 edge-functions/api/save.js）。
   本机仍然保留一份当前存档（xw_save），断网时照常玩，联网后下次保存会自动补传。
   也可以「不登录，只在本机玩」，那就和原来一样，只存在这个浏览器里。 */
const CLOUD_SLOTS=3;
let ACCT=LS.get('xw_acct');          // {name,pin} 云端账号；{local:1} 只在本机玩；null 还没选
let SLOT=LS.get('xw_slot');          // 当前用的是第几个存档位（0~2）
let cloudSlots=null;                 // 登录后拿到的三个存档位摘要
let cloudBusy=false, cloudMsg='', cloudConfirm=null, cloudLast={ok:null,at:0,err:''};
let cloudPushed='', cloudTimer=null, cloudLastName='';
const cloudOn=()=>{if(!(ACCT&&ACCT.name&&SLOT!=null))return false;const m=LS.get('xw_savemeta');return !!(m&&m.name===ACCT.name&&m.slot===SLOT)};
/* cloudReady：GitHub 版用来判断云端配置是否填好（没填就自动退回「只在本机玩」） */
const cloudCan=()=>typeof fetch!=='undefined'&&location.protocol!=='file:'&&(typeof cloudReady!=='function'||cloudReady());
/* 两次上传之间至少隔多久（毫秒）；GitHub 版会调大，省请求次数 */
let cloudMinGap=0,cloudLastPush=0;
async function cloudApi(op,extra){
  const body=JSON.stringify(Object.assign({op,name:ACCT&&ACCT.name,pin:ACCT&&ACCT.pin},extra||{}));
  const r=await fetch('/api/save',{method:'POST',headers:{'content-type':'application/json'},body});
  let j=null;try{j=await r.json()}catch(e){}
  return j||{ok:false,err:'net'};
}
const cloudErrTxt=e=>({pin:'口令不对。',locked:'口令错太多次，请过一会儿再试。',input:'用户名不能为空，口令要 6 位数字。',nouser:'这个名字还没有存档。',token:'云端存档的钥匙失效了，请联系作者。',nokv:'云端存档还没有开通（需要在 EdgeOne 绑定 KV）。',net:'连不上云端，检查一下网络。',size:'存档太大，存不进去。'}[e]||'云端出错了，请稍后再试。');
const cloudBrief=o=>`${saveBrief(o)}　${rankName(o.rank)}`;
const fmtTime=t=>{if(!t)return '';const d=new Date(t);return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};

/* 这台设备上不属于当前账号的存档（本机玩的、存档码读进来的），可以放进空存档位 */
function cloudForeign(){const meta=LS.get('xw_savemeta'),loc=LS.get('xw_save');if(loc&&loc.v===SAVE_V&&(!meta||meta.name!==(ACCT&&ACCT.name)))return loc;const o=LS.get('xw_save_old');return o&&o.v===SAVE_V?o:null}
/* 保存后自动传到云端（等 1.5 秒合并连续的保存） */
function cloudAfterSave(){if(!cloudOn()||!S||!cloudCan())return;clearTimeout(cloudTimer);cloudTimer=setTimeout(cloudPush,Math.max(1500,cloudLastPush+cloudMinGap-Date.now()))}
async function cloudPush(force){
  if(!cloudOn()||!S||!cloudCan())return;
  const data=JSON.stringify(S);if(!force&&data===cloudPushed)return;cloudLastPush=Date.now();
  try{const j=await cloudApi('save',{slot:SLOT,data,brief:cloudBrief(S)});
    if(j.ok){cloudPushed=data;cloudLast={ok:true,at:j.savedAt,err:''};LS.set('xw_savemeta',{name:ACCT.name,slot:SLOT,savedAt:j.savedAt})}
    else cloudLast={ok:false,at:Date.now(),err:j.err};
  }catch(e){cloudLast={ok:false,at:Date.now(),err:'net'}}
  if(tab==='save')render();
}
/* 关页面前：用 sendBeacon 把最后一次存档发出去 */
function cloudBeacon(){if(!cloudOn()||!S||!cloudCan()||!navigator.sendBeacon)return;const data=JSON.stringify(S);if(data===cloudPushed)return;
  try{navigator.sendBeacon('/api/save',new Blob([JSON.stringify({op:'save',name:ACCT.name,pin:ACCT.pin,slot:SLOT,data,brief:cloudBrief(S)})],{type:'application/json'}));cloudPushed=data}catch(e){}}
window.addEventListener('pagehide',()=>cloudBeacon());
document.addEventListener('visibilitychange',()=>{if(document.hidden)cloudBeacon()});

async function cloudLogin(create){
  if(!cloudCan()){cloudMsg='现在是本地文件打开的，用不了云端存档。可以选「不登录，只在本机玩」。';render();return}
  cloudBusy=true;cloudMsg='';render();
  try{const j=await cloudApi('login',{create:!!create});cloudBusy=false;
    if(j.ok){LS.set('xw_acct',ACCT);cloudSlots=j.slots;cloudConfirm=null;cloudMsg=j.created?'新账号已建好。请记住用户名和口令，忘了口令就找不回存档。':''}
    else if(j.err==='nouser'){cloudConfirm='create'}
    else{cloudMsg=cloudErrTxt(j.err);if(j.err==='pin'||j.err==='locked'){cloudLastName=ACCT.name;ACCT=null;LS.del('xw_acct')}}
  }catch(e){cloudBusy=false;cloudMsg=cloudErrTxt('net')}
  render();
}
async function cloudPick(i){
  cloudBusy=true;cloudMsg='';render();
  try{const j=await cloudApi('load',{slot:i});cloudBusy=false;
    if(!j.ok){cloudMsg=cloudErrTxt(j.err);render();return}
    let o=null;try{o=j.data?JSON.parse(j.data):null}catch(e){}
    /* 本机缓存的是同一个存档位、而且比云端新（比如上次断网），就用本机的，再补传 */
    const meta=LS.get('xw_savemeta'),loc=LS.get('xw_save');
    if(loc&&meta&&meta.name===ACCT.name&&meta.slot===i&&(!o||(loc.savedAt||0)>(o.savedAt||0)))o=loc;
    o=migrate(o);
    if(!o){cloudMsg='这个存档读不出来（可能是旧版本的存档）。';render();return}
    S=o;queue=[];SLOT=i;LS.set('xw_slot',i);LS.set('xw_save',S);LS.set('xw_savemeta',{name:ACCT.name,slot:i,savedAt:S.savedAt||0});cloudPushed='';
    cloudMsg='';title=false;titleSub='';tab='play';render();cloudPush();
  }catch(e){cloudBusy=false;cloudMsg=cloudErrTxt('net');render()}
}
async function cloudDel(i){
  cloudBusy=true;render();
  try{const j=await cloudApi('del',{slot:i});cloudBusy=false;if(j.ok){cloudSlots=j.slots;if(SLOT===i){SLOT=null;LS.del('xw_slot');const m=LS.get('xw_savemeta');if(m&&m.name===ACCT.name&&m.slot===i){LS.del('xw_savemeta');LS.del('xw_save');S=null}}}else cloudMsg=cloudErrTxt(j.err)}
  catch(e){cloudBusy=false;cloudMsg=cloudErrTxt('net')}
  cloudConfirm=null;render();
}
function cloudNew(i){cloudMsg='';const lo=cloudForeign();if(lo)LS.set('xw_save_old',lo);SLOT=i;LS.set('xw_slot',i);S=null;queue=[];title=false;titleSub='';cloudPushed='';LS.del('xw_save');LS.set('xw_savemeta',{name:ACCT.name,slot:i,savedAt:0});render()}
async function cloudImport(i){
  const o=migrate(cloudForeign());if(!o){cloudMsg='本机没有可以导入的存档。';render();return}
  S=o;queue=[];SLOT=i;LS.set('xw_slot',i);LS.set('xw_savemeta',{name:ACCT.name,slot:i,savedAt:0});cloudPushed='';
  await cloudPush(true);
  if(cloudLast.ok){cloudMsg='';LS.del('xw_save_old');LS.set('xw_save',S);title=false;titleSub='';tab='play'}else{cloudMsg='导入时没能存到云端：'+cloudErrTxt(cloudLast.err)}
  render();
}

/* 标题页：还没选「云端账号 / 只在本机玩」时显示登录；登录后显示三个存档位 */
function cloudTitleHTML(){
  if((ACCT&&ACCT.local)||!cloudCan())return null;   // 只在本机玩、或者是本地文件打开的：用原来的标题页
  const msg=cloudMsg?`<div class="gmmsg">${esc(cloudMsg)}</div>`:'';
  const busy=cloudBusy?'<p class="note">正在连接云端……</p>':'';
  if(!ACCT||!ACCT.name||!cloudSlots){
    const n=ACCT&&ACCT.name||cloudLastName||'';const meta0=LS.get('xw_savemeta'),locS=S;
    const offl=!!(cloudMsg&&ACCT&&ACCT.name&&locS&&meta0&&meta0.name===ACCT.name&&SLOT!=null&&meta0.slot===SLOT);
    if(ACCT&&ACCT.name&&!cloudSlots&&!cloudBusy&&!cloudMsg&&!cloudConfirm){setTimeout(()=>cloudLogin(false),0)}
    return `<div class="page title"><h2 class="ttl">藩王修仙录</h2><p class="note ctr">罪藩七皇子，问鼎九五，羽化登仙。</p>${msg}${busy}
    ${cloudConfirm==='create'?`<div class="qcard"><p>「${esc(ACCT.name)}」还没有存档。要用这个名字和这个口令新建一个账号吗？</p><p class="note">请记好口令。忘了口令，存档就找不回来。</p>
      <div class="btns"><button class="opt primary" data-a="cCreate">新建账号</button><button class="opt" data-a="cBack">重新输入</button></div></div>`:`
    <label>用户名<input type="text" id="lname" maxlength="12" value="${esc(n)}" placeholder="给自己起个名字"></label>
    <label>口令（6 位数字）<input type="password" id="lpin" inputmode="numeric" maxlength="6" placeholder="••••••"></label>
    <button class="opt primary" data-a="cLogin" ${cloudBusy?'disabled':''}>进入游戏</button>
    <p class="note">第一次进入会用这个名字和口令建一个账号。存档保存在云端，换手机、换浏览器，输入同样的名字和口令就能接着玩。</p>
    ${offl?`<button class="opt" data-a="cOffline">先离线继续上次的存档<small>${esc(saveBrief(locS))}　联网后会自动存到云端</small></button>`:''}
    <button class="opt" data-a="cLocal">不登录，只在本机玩<small>存档只保存在这个浏览器里</small></button>
    <button class="opt" data-a="tCode">用存档码找回<small>以前复制过存档码的，用这个</small></button>`}</div>`;
  }
  const loc=cloudForeign(),hasLocalOld=!!loc;
  if(cloudConfirm&&cloudConfirm.del!=null){const i=cloudConfirm.del,s=cloudSlots[i];
    return `<div class="page title"><h2 class="ttl">删除存档？</h2>${msg}<p>存档位 ${i+1}：<b>${esc(s?s.brief:'')}</b></p><p class="note">删除后找不回来。</p>
    <button class="opt primary" data-a="cDel" data-i="${i}">确定删除</button><button class="opt" data-a="cBack">返回</button></div>`}
  const rows=cloudSlots.map((s,i)=>s?`<button class="opt${i===SLOT?' primary':''}" data-a="cPick" data-i="${i}" ${cloudBusy?'disabled':''}>存档位 ${i+1}：继续游戏<small>${esc(s.brief)}　保存于 ${fmtTime(s.savedAt)}</small></button>
      <div class="btns" style="margin:-4px 0 10px"><button class="small" data-a="cDelAsk" data-i="${i}">删除这个存档</button></div>`
    :`<button class="opt" data-a="cNew" data-i="${i}" ${cloudBusy?'disabled':''}>存档位 ${i+1}：空<small>开新的一局</small></button>${hasLocalOld?`<div class="btns" style="margin:-4px 0 10px"><button class="small" data-a="cImport" data-i="${i}">把这台设备上的存档放进来<small>${esc(saveBrief(loc))}</small></button></div>`:''}`).join('');
  return `<div class="page title"><h2 class="ttl">藩王修仙录</h2><p class="note ctr">用户：${esc(ACCT.name)}</p>${msg}${busy}
  ${rows}
  <div class="btns" style="margin-top:12px"><button class="small" data-a="cLogout">切换用户</button><button class="small" data-a="tCode">用存档码找回</button></div></div>`;
}
/* 存档页顶部：云端存档状态 */
function cloudSaveHTML(){
  if(!(ACCT&&ACCT.name))return '';
  const st=cloudLast.ok===false?`✗ 上次没能存到云端（${esc(cloudErrTxt(cloudLast.err).replace(/。$/,''))}），联网后下次保存会自动补上。`:cloudLast.ok?`✓ 已存到云端：${fmtTime(cloudLast.at)}`:'进入游戏后，每次自动保存都会存到云端。';
  return `<div class="qcard${cloudLast.ok===false?' warn':''}"><p>用户：${esc(ACCT.name)}　存档位 ${SLOT!=null?SLOT+1:'-'}</p><p class="note">${st}</p>
  <div class="btns"><button class="small" data-a="cSaveNow">立刻存到云端</button><button class="small" data-a="toTitle">换存档 / 换用户</button></div></div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;const i=b.dataset.i!=null?+b.dataset.i:null;
  if(a==='cLogin'){const n=($('#lname')||{}).value||'',p=($('#lpin')||{}).value||'';
    if(!n.trim()||!/^\d{6}$/.test(p)){cloudMsg=cloudErrTxt('input');render();return}
    const nn=n.trim().slice(0,12);if(!ACCT||ACCT.name!==nn){SLOT=null;LS.del('xw_slot')}ACCT={name:nn,pin:p};cloudSlots=null;cloudLogin(false);return}
  if(a==='cCreate'){cloudLogin(true);return}
  if(a==='cBack'){cloudConfirm=null;cloudMsg='';if(!cloudSlots){ACCT=null;LS.del('xw_acct')}render();return}
  if(a==='cToCloud'){ACCT=null;cloudSlots=null;cloudMsg='';title=true;titleSub='';render();return}
  if(a==='cOffline'){title=false;titleSub='';tab='play';render();return}
  if(a==='cLocal'){ACCT={local:1};LS.set('xw_acct',ACCT);cloudMsg='';render();return}
  if(a==='cLogout'){ACCT=null;cloudSlots=null;SLOT=null;LS.del('xw_acct');LS.del('xw_slot');cloudMsg='';cloudConfirm=null;title=true;titleSub='';render();return}
  if(a==='cPick'){cloudPick(i);return}
  if(a==='cNew'){cloudNew(i);return}
  if(a==='cImport'){cloudImport(i);return}
  if(a==='cDelAsk'){cloudConfirm={del:i};render();return}
  if(a==='cDel'){cloudDel(i);return}
  if(a==='cSaveNow'){if(queue.length){fileMsg='眼前还有事没处理完，处理好了会自动保存。';render();return}save();cloudPush(true);return}
});
/* 回标题页时把云端存档位列表刷新一下 */
const _cloudToTitle=()=>{if(ACCT&&ACCT.name){cloudSlots=null}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="toTitle"]');if(b&&!queue.length&&ACCT&&ACCT.name){cloudMsg='';cloudConfirm=null;clearTimeout(cloudTimer);cloudPush().then(_cloudToTitle).then(()=>render())}},true);
