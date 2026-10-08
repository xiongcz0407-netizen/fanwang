const APP_V=105;   // 打包时写入的版本号
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
  try{const j=await cloudApi('save',{slot:SLOT,data,brief:cloudBrief(S),meta:typeof achExport==='function'?achExport():undefined});
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
    if(j.ok){LS.set('xw_acct',ACCT);LS.set('xw_lastname',ACCT.name);if(typeof achMergeRemote==='function')achMergeRemote(j.meta);cloudSlots=j.slots;cloudConfirm=null;cloudMsg=j.created?'新账号已建好。请记住用户名和口令，忘了口令就找不回存档。':''}
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
let cloudPin2=false,cloudView='';         // cloudView：选存档页上打开的「我的成就」「我的数据」
const achCount=()=>{try{const m=achExport();return `已达成 ${ACH_ALL.filter(a=>m.ach[a.id]).length} / ${ACH_ALL.length}`}catch(e){return ''}};                 // 新建账号时要再输一次口令
/* 版本号与检查更新：打包时写入 APP_V，网站上的 version.json 是最新版本号（每次都不走缓存地去读）
   还没开始玩（登录页、选存档、起名）时发现新版本：自动刷新；正在玩：顶部出一行提示，玩家自己点。 */
const appV=()=>typeof APP_V!=='undefined'?APP_V:0;
let newV=0,updWarn=false;
const verTxt=v=>(v/100).toFixed(2);          // 显示用：内部版本号 92 显示成 0.92，每次更新 +0.01
const safeToUpd=()=>title||!S;                     // 没有进行中的一局
/* 2 分钟内为同一个新版本试过几次更新：第 1 次覆盖首页缓存后原地址重开；第 2 次换带时间戳的地址；再不行就不自动刷新了 */
function updTries(v){try{const t=JSON.parse(sessionStorage.getItem('xw_upd')||'null');return t&&t.v===v&&Date.now()-t.at<120000?(t.n||1):0}catch(e){return 0}}
const updTried=v=>updTries(v)>=2;
const appBase=()=>location.pathname.replace(/index\.html$/,'');
/* 主屏幕图标总从首页原地址启动：强制重新下载首页，把手机里旧的缓存换成新的 */
const refreshHome=()=>Promise.all([appBase(),appBase()+'index.html'].map(u=>fetch(u,{cache:'reload'}).catch(()=>{})));
if(/[?&]u=/.test(location.search)){try{history.replaceState(null,'',appBase())}catch(e){}refreshHome()}   // 用时间戳地址打开的：顺手把首页缓存也换新
let verMsg='',verLast=0;
async function checkUpdate(manual){
  if(!appV()||location.protocol==='file:')return;
  if(manual){if(Date.now()-verLast<3000)return;verLast=Date.now();verMsg='正在检查更新……';render()}
  try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
    const v=+(j&&j.v)||0;
    if(v<=appV()){if(manual){verMsg='已经是最新版本。';render()}return}
    if(v!==newV){newV=v}
    if(safeToUpd()||(manual&&!queue.length)){
      if(!updTried(v)){verMsg='发现新版本 '+verTxt(v)+'，正在更新……';render();doUpdate(v,manual);return}
      if(manual)verMsg='网站还在更新，过一两分钟再点一次。'}   // 刚试过还是旧的：免得一直刷新
    else if(manual)verMsg='发现新版本 '+verTxt(v)+'：先处理完眼前的事，再点上面的提示更新。';
    render()}catch(e){if(manual){verMsg='没连上网，过一会儿再试。';render()}}
}
async function doUpdate(v,manual){
  v=v||newV;const n=updTries(v)+1;
  try{if(manual)sessionStorage.setItem('xw_updman','1');else sessionStorage.removeItem('xw_updman')}catch(e){}   // 玩家自己点的更新：更新后弹详细说明
  try{sessionStorage.setItem('xw_upd',JSON.stringify({v,at:Date.now(),n}))}catch(e){}
  if(cloudOn()&&S){clearTimeout(cloudTimer);try{save();await cloudPush(true)}catch(e){}}   // 先把进度存到云端
  if(n===1){await refreshHome();location.replace(appBase())}                                  // 首页缓存换新后，用原地址重新打开
  else location.replace(appBase()+'?u='+Date.now());                                          // 还是旧的：换一个网址绕过缓存
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
    st.insertAdjacentHTML('beforeend',`<button class="updbar${updWarn?' warn':''}" data-a="appUpd">${updWarn?'先处理完眼前的事，再点这里更新（进度不会丢失）':`有新版本 ${verTxt(newV)}，建议更新：点这里更新（进度不会丢失）`}</button>`)}}};
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
  /* 账号层面的页面：我的成就 / 我的数据（三个存档位一起算，所以放在选存档这一页） */
  if(cloudView==='ach'||cloudView==='stats')return `<div class="page title acctpage">${(cloudView==='ach'?achHTML:statsHTML)('data-a="cView" data-v=""')}</div>`;
  if(cloudConfirm&&cloudConfirm.del!=null){const i=cloudConfirm.del,s=cloudSlots[i];
    return `<div class="page title login">${cloudHead('删除存档')}<div class="lcard">${msg}<p class="lq">存档位 ${i+1}：<b>${esc(s?s.brief:'')}</b></p><p class="lnote">删除后找不回来。</p>
    <button class="opt primary lgo" data-a="cDel" data-i="${i}">确定删除</button><button class="opt lback" data-a="cBack">返回</button></div>${cloudFoot()}</div>`}
  const rows=cloudSlots.map((s,i)=>s?`<div class="lslot${i===SLOT?' cur':''}"><button class="opt${i===SLOT?' primary':''}" data-a="cPick" data-i="${i}" ${cloudBusy?'disabled':''}><span class="lno">${i+1}</span>继续游戏<small>${esc(s.brief)}<br>保存于 ${fmtTime(s.savedAt)}</small></button>
      <button class="ldel" data-a="cDelAsk" data-i="${i}" aria-label="删除存档位 ${i+1}">删除</button></div>`
    :`<div class="lslot"><button class="opt lempty" data-a="cNew" data-i="${i}" ${cloudBusy?'disabled':''}><span class="lno">${i+1}</span>空存档位<small>开新的一局</small></button></div>`).join('');
  return `<div class="page title login">${cloudHead('选择存档')}
  <div class="luser"><span>当前用户</span><b>${esc(ACCT.name)}</b><button class="small" data-a="cLogout">切换用户</button></div>
  ${msg}${busy}${rows}
  ${typeof achHTML==='function'?`<div class="lacc"><button class="opt" data-a="cView" data-v="ach">我的成就<small>${achCount()}</small></button><button class="opt" data-a="cView" data-v="stats">我的数据<small>所有存档的累计统计</small></button></div>`:''}${cloudFoot()}</div>`;
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
  if(a==='cView'){cloudView=b.dataset.v||'';render();const m=$('#main');if(m)m.scrollTop=0;return}
  if(a==='appUpd'){if(!safeToUpd()&&queue.length){updWarn=true;render();return}b.disabled=true;doUpdate(0,true);return}
  if(a==='cCreate'){const p2=($('#lpin2')||{}).value||'';if(p2!==ACCT.pin){cloudMsg='两次输入的口令不一样，请再输一次。';render();return}cloudLogin(true);return}
  if(a==='cBack'){cloudConfirm=null;cloudMsg='';if(!cloudSlots){cloudLastName=ACCT&&ACCT.name||'';ACCT=null;LS.del('xw_acct')}render();return}
  if(a==='cToCloud'){ACCT=null;cloudSlots=null;cloudMsg='';title=true;titleSub='';render();return}
  if(a==='cOffline'){title=false;titleSub='';tab='play';render();return}
  if(a==='cLogout'){cloudView='';cloudLastName='';ACCT=null;cloudSlots=null;SLOT=null;LS.del('xw_acct');LS.del('xw_slot');cloudMsg='';cloudConfirm=null;title=true;titleSub='';render();return}
  if(a==='cPick'){cloudView='';cloudPick(i);return}
  if(a==='cNew'){cloudView='';cloudNew(i);return}
  if(a==='cDelAsk'){cloudConfirm={del:i};render();return}
  if(a==='cDel'){cloudDel(i);return}
  if(a==='cSaveNow'){if(queue.length){fileMsg='眼前还有事没处理完，处理好了会自动保存。';render();return}save();cloudPush(true);return}
});
/* 回标题页时把云端存档位列表刷新一下 */
const _cloudToTitle=()=>{if(ACCT&&ACCT.name){cloudSlots=null}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="toTitle"]');if(b&&!queue.length&&ACCT&&ACCT.name){cloudMsg='';cloudConfirm=null;cloudView='';clearTimeout(cloudTimer);cloudPush().then(_cloudToTitle).then(()=>render())}},true);
/* 输入框里按回车 = 点登录 / 确认新建 */
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const id=e.target&&e.target.id;
  if(id==='lname'){e.preventDefault();const p=$('#lpin');if(p)p.focus()}
  else if(id==='lpin'||id==='lpin2'){e.preventDefault();const b=document.querySelector(id==='lpin'?'[data-a="cLogin"]':'[data-a="cCreate"]');if(b&&!b.disabled)b.click()}});
/* 更新后弹一次：玩家自己点的更新，列出上次打开以来开发者说明里新增的内容；自动更新的，只提示「已更新，去开发者说明看」（第一次玩的人不弹） */
(function(){
  if(typeof CHANGELOG==='undefined'||!appV())return;
  const all=[];CHANGELOG.forEach(d=>d.items.forEach(t=>all.push(t)));
  const seenV=LS.get('xw_seenv'),seen=LS.get('xw_seenlog');
  /* 只看上次打开时最新那一天及以后的条目：旧日期里改了字的条目不会被当成新内容 */
  const newest=CHANGELOG[0]?CHANGELOG[0].date:'',seenD=LS.get('xw_seendate');
  const dIdx=seenD?CHANGELOG.findIndex(d=>d.date===seenD):0;const recent=[];CHANGELOG.slice(0,dIdx<0?1:dIdx+1).forEach(d=>d.items.forEach(t=>recent.push(t)));
  const mark=()=>{LS.set('xw_seenv',appV());LS.set('xw_seenlog',all);LS.set('xw_seendate',newest)};
  let fresh;
  if(seenV==null||!Array.isArray(seen)){
    if(!(LS.get('xw_acct')||LS.get('xw_save'))){mark();return}     // 第一次玩：记下当前内容，不弹
    fresh=CHANGELOG[0]?CHANGELOG[0].items.slice():[];              // 以前玩过、这是第一个带弹窗的版本：给看最近一天的
  }else{if(appV()<=seenV)return;const has=new Set(seen);fresh=recent.filter(t=>!has.has(t))}
  mark();
  let man=false;try{man=sessionStorage.getItem('xw_updman')==='1';sessionStorage.removeItem('xw_updman')}catch(e){}
  if(man&&!fresh.length)return;
  /* 玩家自己点了更新：列出这次更新的内容；自动更新的：只告诉一声，内容去开发者说明看 */
  const body=man?`<ul>${fresh.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:`<p class="nmsg">游戏已经自动更新到最新版本。\n这次更新了什么，可以到「存档」页的「开发者说明」查看。</p>`;
  const show=()=>{const d=document.createElement('div');d.id='newlay';
    d.innerHTML=`<div class="nbox" role="dialog" aria-label="${man?'本次更新':'游戏已更新'}"><h3>${man?'本次更新':'游戏已更新'}<small>版本 ${verTxt(appV())}</small></h3>${body}<button class="opt primary" data-a="newClose">知道了</button></div>`;
    document.body.appendChild(d)};
  if(document.body)show();else document.addEventListener('DOMContentLoaded',show);
})();
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="newClose"]');if(b){const d=document.getElementById('newlay');if(d)d.remove()}});
