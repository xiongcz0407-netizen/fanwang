const APP_V=94;   // 打包时写入的版本号
/* ================= 云端存档 =================
   用户名 + 6 位口令登录，每个用户 3 个存档位，存档放在 GitHub 私有仓库里（读写接口见 ghsave.js，它会替换下面的 cloudApi / cloudBeacon）。
   本机仍然保留一份当前存档（xw_save），断网时照常玩，联网后下次保存会自动补传。
   必须登录才能玩（本地文件打开、或云端没配置好时，才退回原来的本机存档）。 */
const CLOUD_SLOTS=3;
let ACCT=LS.get('xw_acct');          // {name,pin} 云端账号；null 还没登录
if(ACCT&&!ACCT.name){ACCT=null;LS.del('xw_acct')}   // 以前选过「只在本机玩」的，改成要登录
LS.del('xw_save_old');
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
const cloudErrTxt=e=>({pin:'口令不对。',locked:'口令错太多次，请过一会儿再试。',input:'用户名不能为空，口令要 6 位数字。',nouser:'这个名字还没有存档。',token:'云端存档的钥匙失效了，请联系作者。',net:'连不上云端，检查一下网络。',size:'存档太大，存不进去。'}[e]||'云端出错了，请稍后再试。');
const cloudBrief=o=>`${saveBrief(o)}　${rankName(o.rank)}`;
const fmtTime=t=>{if(!t)return '';const d=new Date(t);return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};

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
    if(j.ok){LS.set('xw_acct',ACCT);LS.set('xw_lastname',ACCT.name);cloudSlots=j.slots;cloudConfirm=null;cloudMsg=j.created?'新账号已建好。请记住用户名和口令，忘了口令就找不回存档。':''}
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
function cloudNew(i){cloudMsg='';SLOT=i;LS.set('xw_slot',i);S=null;queue=[];title=false;titleSub='';cloudPushed='';LS.del('xw_save');LS.set('xw_savemeta',{name:ACCT.name,slot:i,savedAt:0});render()}
/* 标题页：没登录时显示登录；登录后显示三个存档位 */
let cloudPin2=false;                 // 新建账号时要再输一次口令
/* 版本号与检查更新：打包时写入 APP_V，网站上的 version.json 是最新版本号（每次都不走缓存地去读）
   还没开始玩（登录页、选存档、起名）时发现新版本：自动刷新；正在玩：顶部出一行提示，玩家自己点。 */
const appV=()=>typeof APP_V!=='undefined'?APP_V:0;
let newV=0,updWarn=false;
const verTxt=v=>(v/100).toFixed(2);          // 显示用：内部版本号 92 显示成 0.92，每次更新 +0.01
const safeToUpd=()=>title||!S;                     // 没有进行中的一局
function updTried(v){try{const t=JSON.parse(sessionStorage.getItem('xw_upd')||'null');return t&&t.v===v&&Date.now()-t.at<120000}catch(e){return false}}
let verMsg='',verLast=0;
async function checkUpdate(manual){
  if(!appV()||location.protocol==='file:')return;
  if(manual){if(Date.now()-verLast<3000)return;verLast=Date.now();verMsg='正在检查更新……';render()}
  try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
    const v=+(j&&j.v)||0;
    if(v<=appV()){if(manual){verMsg='已经是最新版本。';render()}return}
    if(v!==newV){newV=v}
    if(safeToUpd()||(manual&&!queue.length)){
      if(!updTried(v)){verMsg='发现新版本 '+verTxt(v)+'，正在更新……';render();doUpdate(v);return}
      if(manual)verMsg='网站还在更新，过一两分钟再点一次。'}   // 刚试过还是旧的：免得一直刷新
    else if(manual)verMsg='发现新版本 '+verTxt(v)+'：先处理完眼前的事，再点上面的提示更新。';
    render()}catch(e){if(manual){verMsg='没连上网，过一会儿再试。';render()}}
}
async function doUpdate(v){
  try{sessionStorage.setItem('xw_upd',JSON.stringify({v:v||newV,at:Date.now()}))}catch(e){}
  if(cloudOn()&&S){clearTimeout(cloudTimer);try{save();await cloudPush(true)}catch(e){}}   // 先把进度存到云端
  location.replace(location.pathname+'?u='+Date.now());                                       // 换一个网址，绕过旧的缓存
}
/* 自动检查：打开游戏时查一次；之后玩家每次操作（点任何地方）、从后台切回来时顺便查，但 5 分钟最多查一次 */
const UPD_GAP=5*60*1000;let updAutoAt=Date.now();
function autoCheck(){if(Date.now()-updAutoAt<UPD_GAP)return;updAutoAt=Date.now();checkUpdate()}
checkUpdate();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)autoCheck()});
document.addEventListener('click',autoCheck,true);
/* 游戏中：顶部状态栏下面加一行更新提示 */
const _renderBase=render;
render=function(){_renderBase();
  if(newV&&!safeToUpd()){const st=$('#status');if(st&&!st.querySelector('.updbar')){if(!queue.length)updWarn=false;
    st.insertAdjacentHTML('beforeend',`<button class="updbar${updWarn?' warn':''}" data-a="appUpd">${updWarn?'先处理完眼前的事，再点这里更新':`有新版本 ${verTxt(newV)}，点这里更新`}</button>`)}}};
const cloudFoot=()=>`<p class="lfoot">作者：小熊cz<span class="lver">版本 ${verTxt(appV())}</span></p>`;
const cloudUpd=()=>newV?`<button class="opt lupd" data-a="appUpd"><b>发现新版本 ${verTxt(newV)}</b><small>点这里更新（当前 ${verTxt(appV())}），进度会先存到云端</small></button>`:'';
const cloudHead=sub=>`<div class="lhead"><div class="lseal">藩</div><h2 class="ttl">藩王修仙录</h2><p class="lsub">${sub}</p></div>${cloudUpd()}`;
function cloudTitleHTML(){
  if(!cloudCan())return null;        // 本地文件打开、或云端没配置好：用原来的标题页
  const msg=cloudMsg?`<div class="lmsg${/已建好|已读取/.test(cloudMsg)?' ok':''}">${esc(cloudMsg)}</div>`:'';
  const busy=cloudBusy?'<div class="lbusy"><i></i>正在连接云端……</div>':'';
  if(!ACCT||!ACCT.name||!cloudSlots){
    const n=ACCT&&ACCT.name||cloudLastName||LS.get('xw_lastname')||'';const meta0=LS.get('xw_savemeta'),locS=S;
    const offl=!!(cloudMsg&&ACCT&&ACCT.name&&locS&&meta0&&meta0.name===ACCT.name&&SLOT!=null&&meta0.slot===SLOT);
    if(ACCT&&ACCT.name&&!cloudSlots&&!cloudBusy&&!cloudMsg&&!cloudConfirm){setTimeout(()=>cloudLogin(false),0)}
    if(cloudConfirm==='create')return `<div class="page title login">${cloudHead('新建账号')}
      <div class="lcard"><p class="lq">还没有叫「<b>${esc(ACCT.name)}</b>」的账号，要用这个名字新建一个吗？</p>
      <label class="lf"><span>再输一次口令</span><input type="password" id="lpin2" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="new-password" placeholder="······"></label>
      ${msg}${busy}
      <button class="opt primary lgo" data-a="cCreate" ${cloudBusy?'disabled':''}>确认新建</button>
      <button class="opt lback" data-a="cBack">换个名字</button>
      <p class="lnote">名字和口令请记好：换手机、换浏览器都靠它们登录，忘了口令存档就找不回来。</p></div>${cloudFoot()}</div>`;
    return `<div class="page title login">${cloudHead('罪藩七皇子，问鼎九五，羽化登仙。')}
    <div class="lcard">
      <label class="lf"><span>用户名</span><input type="text" id="lname" maxlength="12" value="${esc(n)}" placeholder="最多 12 个字" autocomplete="username" autocapitalize="off" spellcheck="false"></label>
      <label class="lf"><span>口令</span><input type="password" id="lpin" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="current-password" placeholder="6 位数字"></label>
      ${msg}${busy}
      <button class="opt primary lgo" data-a="cLogin" ${cloudBusy?'disabled':''}>登录</button>
      ${offl?`<button class="opt lback" data-a="cOffline">先离线继续上次的存档<small>${esc(saveBrief(locS))}　联网后会自动存到云端</small></button>`:''}
      <p class="lnote">没有账号的，输入新名字和口令就会新建。存档保存在云端，换手机、换浏览器都能接着玩。</p></div>${cloudFoot()}</div>`;
  }
  if(cloudConfirm&&cloudConfirm.del!=null){const i=cloudConfirm.del,s=cloudSlots[i];
    return `<div class="page title login">${cloudHead('删除存档')}<div class="lcard">${msg}<p class="lq">存档位 ${i+1}：<b>${esc(s?s.brief:'')}</b></p><p class="lnote">删除后找不回来。</p>
    <button class="opt primary lgo" data-a="cDel" data-i="${i}">确定删除</button><button class="opt lback" data-a="cBack">返回</button></div>${cloudFoot()}</div>`}
  const rows=cloudSlots.map((s,i)=>s?`<div class="lslot${i===SLOT?' cur':''}"><button class="opt${i===SLOT?' primary':''}" data-a="cPick" data-i="${i}" ${cloudBusy?'disabled':''}><span class="lno">${i+1}</span>继续游戏<small>${esc(s.brief)}<br>保存于 ${fmtTime(s.savedAt)}</small></button>
      <button class="ldel" data-a="cDelAsk" data-i="${i}" aria-label="删除存档位 ${i+1}">删除</button></div>`
    :`<div class="lslot"><button class="opt lempty" data-a="cNew" data-i="${i}" ${cloudBusy?'disabled':''}><span class="lno">${i+1}</span>空存档位<small>开新的一局</small></button></div>`).join('');
  return `<div class="page title login">${cloudHead('选择存档')}
  <div class="luser"><span>当前用户</span><b>${esc(ACCT.name)}</b><button class="small" data-a="cLogout">切换用户</button></div>
  ${msg}${busy}${rows}${cloudFoot()}</div>`;
}
/* 存档页顶部：云端存档状态 */
function cloudSaveHTML(){
  if(!(ACCT&&ACCT.name))return '';
  const st=cloudLast.ok===false?`✗ 上次没能存到云端（${esc(cloudErrTxt(cloudLast.err).replace(/。$/,''))}），联网后下次保存会自动补上。`:cloudLast.ok?`✓ 已存到云端：${fmtTime(cloudLast.at)}`:'进入游戏后，每次自动保存都会存到云端。';
  return `<div class="qcard${cloudLast.ok===false?' warn':''}"><p>用户：${esc(ACCT.name)}　存档位 ${SLOT!=null?SLOT+1:'-'}</p><p class="note">${st}</p>
  <div class="btns"><button class="small" data-a="cSaveNow">立刻存到云端</button><button class="small" data-a="toTitle">换存档 / 换用户</button></div></div>
  <div class="qcard vrow"><p>当前版本 ${verTxt(appV())}</p>${verMsg?`<p class="note">${esc(verMsg)}</p>`:''}<div class="btns"><button class="small" data-a="verChk">检查更新</button></div></div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;const i=b.dataset.i!=null?+b.dataset.i:null;
  if(a==='cLogin'){const n=($('#lname')||{}).value||'',p=($('#lpin')||{}).value||'';
    if(!n.trim()||!/^\d{6}$/.test(p)){cloudMsg=cloudErrTxt('input');render();return}
    const nn=n.trim().slice(0,12);if(!ACCT||ACCT.name!==nn){SLOT=null;LS.del('xw_slot')}ACCT={name:nn,pin:p};cloudSlots=null;cloudLogin(false);return}
  if(a==='verChk'){checkUpdate(true);return}
  if(a==='appUpd'){if(!safeToUpd()&&queue.length){updWarn=true;render();return}b.disabled=true;doUpdate();return}
  if(a==='cCreate'){const p2=($('#lpin2')||{}).value||'';if(p2!==ACCT.pin){cloudMsg='两次输入的口令不一样，请再输一次。';render();return}cloudLogin(true);return}
  if(a==='cBack'){cloudConfirm=null;cloudMsg='';if(!cloudSlots){cloudLastName=ACCT&&ACCT.name||'';ACCT=null;LS.del('xw_acct')}render();return}
  if(a==='cToCloud'){ACCT=null;cloudSlots=null;cloudMsg='';title=true;titleSub='';render();return}
  if(a==='cOffline'){title=false;titleSub='';tab='play';render();return}
  if(a==='cLogout'){cloudLastName='';ACCT=null;cloudSlots=null;SLOT=null;LS.del('xw_acct');LS.del('xw_slot');cloudMsg='';cloudConfirm=null;title=true;titleSub='';render();return}
  if(a==='cPick'){cloudPick(i);return}
  if(a==='cNew'){cloudNew(i);return}
  if(a==='cDelAsk'){cloudConfirm={del:i};render();return}
  if(a==='cDel'){cloudDel(i);return}
  if(a==='cSaveNow'){if(queue.length){fileMsg='眼前还有事没处理完，处理好了会自动保存。';render();return}save();cloudPush(true);return}
});
/* 回标题页时把云端存档位列表刷新一下 */
const _cloudToTitle=()=>{if(ACCT&&ACCT.name){cloudSlots=null}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="toTitle"]');if(b&&!queue.length&&ACCT&&ACCT.name){cloudMsg='';cloudConfirm=null;clearTimeout(cloudTimer);cloudPush().then(_cloudToTitle).then(()=>render())}},true);
/* 输入框里按回车 = 点登录 / 确认新建 */
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const id=e.target&&e.target.id;
  if(id==='lname'){e.preventDefault();const p=$('#lpin');if(p)p.focus()}
  else if(id==='lpin'||id==='lpin2'){e.preventDefault();const b=document.querySelector(id==='lpin'?'[data-a="cLogin"]':'[data-a="cCreate"]');if(b&&!b.disabled)b.click()}});
