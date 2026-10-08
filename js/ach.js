/* ================= 我的成就 / 我的数据 =================
   数据挂在账号上（三个存档位一起算，删档不清零），本机存一份，登录后和云端合并。
   为了以后加成就、改门槛不丢东西：
   · 只存「原始数据」：st 累计次数、best 单局最高纪录、end 各结局次数、fast 最快通关；成就只是一套判断规则（ACH），随时可以重算。
   · 已解锁的成就（ach）永远保留，门槛以后提高也不收回；新加的成就会用已有数据自动补判。
   · 合并时每项取较大值，认不出的字段原样保留（旧版本不会把新版本的数据冲掉）。
   · 成就 id 一旦用了就不要改（改门槛只改说明和判断，id 不动），否则已达成的记录对不上。 */
const META_V=1;
let META=null,achNewQ=[];
const metaKey=()=>'xw_meta_'+((typeof ACCT!=='undefined'&&ACCT&&ACCT.name)||'local');
const metaBlank=()=>({v:META_V,rv:2,st:{},best:{},end:{},ach:{},fast:null});
function metaFix(m){m=m&&typeof m==='object'?m:{};const b=metaBlank();for(const k of ['st','best','end','ach'])if(!m[k]||typeof m[k]!=='object')m[k]=b[k];if(m.fast===undefined)m.fast=null;if(!m.v)m.v=META_V;
  /* 境界从 5 个大境界改成 8 个：旧数据里的最高境界按时间比例换算（rv=2 表示已换算） */
  if(!m.rv){if(m.best.realm&&typeof realmFromOld==='function')m.best.realm=Math.round(realmFromOld(m.best.realm));m.rv=2}return m}
/* 合并两份数据：数字取大，成就取并集（保留最早的达成时间），最快通关取年数少的，其余字段都保留 */
function metaMerge(a,b){a=metaFix(JSON.parse(JSON.stringify(a||{})));b=metaFix(b?JSON.parse(JSON.stringify(b)):{});
  const o=Object.assign({},b,a);
  for(const k of ['st','best','end']){o[k]=Object.assign({},b[k],a[k]);for(const x in b[k])if(typeof b[k][x]==='number'&&typeof a[k][x]==='number')o[k][x]=Math.max(a[k][x],b[k][x])}
  o.ach=Object.assign({},b.ach,a.ach);for(const x in b.ach)if(a.ach[x]&&b.ach[x]&&(b.ach[x].at||0)<(a.ach[x].at||0))o.ach[x]=b.ach[x];
  o.fast=!a.fast?b.fast:!b.fast?a.fast:(b.fast.year<a.fast.year?b.fast:a.fast);
  o.v=Math.max(a.v||1,b.v||1);o.rv=2;return o}
function achLoad(){try{META=metaFix(LS.get(metaKey()))}catch(e){META=metaBlank()}achEval(true)}
const achSave=()=>{try{LS.set(metaKey(),META)}catch(e){}};
/* 登录后把云端的数据合进来（cloud.js 调用） */
function achMergeRemote(r){achLoad();if(r)META=metaMerge(META,r);achEval(true);achSave()}
const achExport=()=>{if(!META)achLoad();return META};

/* ---------- 记录 ---------- */
const stAdd=(k,n)=>{META.st[k]=(META.st[k]||0)+(n==null?1:n)};
const bestMax=(k,v)=>{if(typeof v==='number'&&!(META.best[k]>=v))META.best[k]=v};
const trk=()=>{if(!S.trk)S.trk={};return S.trk};
const runAdd=(k,n)=>{const t=trk();t[k]=(t[k]||0)+(n==null?1:n);return t[k]};
/* 银两、功德的进出：给当前存档的 silver / merit 套一层记账（存档内容不变） */
function achWrap(){if(!S||S.__achW)return;
  Object.defineProperty(S,'__achW',{value:1,enumerable:false});
  for(const k of ['silver','merit']){let v=S[k]||0;
    Object.defineProperty(S,k,{enumerable:true,configurable:true,get(){return v},set(n){const d=n-v;v=n;if(!META||!d)return;
      if(k==='silver'){if(d>0)stAdd('silverEarn',d);else stAdd('silverSpend',-d)}else if(d>0){stAdd('meritEarn',d);runAdd('merit',d)}}})}}
const LOG_RULES=[[/^结识/,'met'],[/^与.+结为道侣$/,'wed'],[/^与.+和离$/,'split'],[/^休离/,'divorce'],[/^遣散/,'dismiss'],[/离去$/,'left'],
  [/^(擒获刺客|再次擒获|夜袭的刺客被拿下)/,'captured'],[/^收服刺客/,'recruit'],[/^处决刺客/,'executed'],[/^严刑逼供/,'tortured'],[/出逃$/,'escaped'],
  [/^打点朝廷$/,'bribe'],[/^晋升「/,'promo'],[/^突破至/,'breakthrough'],[/^问责/,'acc'],[/^(遇刺重伤|夜袭受伤)$/,'hurt']];
/* 游戏里各处调用 ev(类型, 参数)，汇到这里 */
function achEv(k,a){if(!S)return;if(!META)achLoad();achWrap();const t=trk();
  if(k==='log'){for(const [re,key] of LOG_RULES)if(re.test(a)){stAdd(key);
      if(key==='captured')runAdd('guardWin');if(key==='wed')t.wed=1;break}}
  else if(k==='new'){stAdd('games')}
  else if(k==='month'){stAdd('months')}
  else if(k==='income'){bestMax('incomeMax',a)}
  else if(k==='act'){stAdd('act_'+a.id);if(a.id==='pill'){stAdd('pills',a.n);bestMax('pillRun',runAdd('pill',a.n))}}
  else if(k==='mstudy'||k==='dual'||k==='deed'||k==='release'||k==='assn'||k==='raid'||k==='calm')stAdd(k);
  else if(k==='trib'){stAdd(a.ok?'tribOk':'tribFail');if(a.ok&&a.perfect)bestMax('tribPerfect',1)}
  else if(k==='ye'){stAdd(a?'yeOk':'yeFail');t.ye=a?(t.ye||0)+1:0;bestMax('yeStreak',t.ye)}
  else if(k==='win'||k==='end'){const title=k==='win'?'羽化登仙':a;META.end[title]=(META.end[title]||0)+1;
    if(k==='win'){stAdd('wins');if(S.route)stAdd('win_'+S.route);if(!t.wed&&!married().length)bestMax('winNoWife',1);
      if(!META.fast||S.year<META.fast.year)META.fast={year:S.year,name:S.name,route:S.route||'',wives:married().length}}
    else stAdd('fails')}
  achEval()}

/* 每次存档时看一眼当前状态（境界、帝业、民心……），更新单局纪录 */
function achScan(){if(!S)return;const t=trk();
  bestMax('realm',S.realm);bestMax('rank',S.rank);bestMax('industry',S.industry||0);bestMax('minxin',S.minxin);bestMax('silverMax',S.silver);
  bestMax('meritRun',t.merit||0);bestMax('guardWinRun',t.guardWin||0);
  t.susp=Math.max(t.susp||0,S.suspicion);bestMax('suspMax',t.susp);if(S.xinmo>0)t.xm=1;else if(t.xm)bestMax('xinmoZero',1);
  const ms=married();bestMax('married',ms.length);if(ms.some(p=>p.aff>=100))bestMax('aff100',1);
  if(ms.some(p=>p.tid==='assassin'&&p.bondN>=3))bestMax('assnBond',1);
  if(S.rank>=10&&!t.emp){t.emp=1;if(S.route)stAdd('emp_'+S.route);if(t.susp>=90)bestMax('empSusp90',1)}}

/* ---------- 成就规则（只看数据，所以随时可以重算） ---------- */
const realmAt=m=>{for(let r=1;r<=R_TOP;r++)if(majorOf(r)>=m)return r;return 99};
const B=k=>META.best[k]||0,C=k=>META.st[k]||0;
const ACH=[
  ['仙途',[
    ['zhuji','初窥门径','突破到筑基',()=>B('realm')>=realmAt(1)],
    ['jindan','金丹大道','结成金丹',()=>B('realm')>=realmAt(2)],
    ['yuanying','元婴老怪','修到元婴',()=>B('realm')>=realmAt(3)],
    ['huashen','化神真君','修到化神',()=>B('realm')>=realmAt(4)],
    ['lianxu','炼虚还真','修到炼虚',()=>B('realm')>=realmAt(5)],
    ['heti','天人合一','修到合体',()=>B('realm')>=realmAt(6)],
    ['dacheng','大乘圣尊','修到大乘',()=>B('realm')>=realmAt(7)],
    ['leiwei','一雷未伤','渡劫时三道天雷全部挡下',()=>B('tribPerfect')>=1],
    ['xinmo0','心如止水','心魔降到 0',()=>B('xinmoZero')>=1],
    ['danlu','丹炉不熄','一局里炼出 80 颗破障丹',()=>B('pillRun')>=80],
    ['tianjie','天劫磨砺','累计渡劫成功 20 次',()=>C('tribOk')>=20,1]]],
  ['帝业',[
    ['rank3','安民一方','帝业到第 3 阶',()=>B('rank')>=3],
    ['rank6','天下侧目','帝业到第 6 阶',()=>B('rank')>=6],
    ['empA','靖难之役','走兵变线登基',()=>C('emp_a')>=1],
    ['empB','众望所归','走民心线登基',()=>C('emp_b')>=1],
    ['rich','富甲一方','每月产业收入达到 1500 两',()=>B('industry')>=1500],
    ['minxin','民心所向','民心达到 100',()=>B('minxin')>=100],
    ['bingo','如履薄冰','猜忌到过 90 以上，最后还登基了',()=>B('empSusp90')>=1],
    ['empAN','兵变专家','累计走兵变线登基 5 次',()=>C('emp_a')>=5,1],
    ['empBN','万民拥戴','累计走民心线登基 5 次',()=>C('emp_b')>=5,1]]],
  ['后宅',[
    ['meet','初见','第一次遇到有缘人',()=>C('met')>=1],
    ['wed','三书六礼','第一次结为道侣',()=>C('wed')>=1],
    ['three','三宫齐备','同时有 3 位道侣',()=>B('married')>=3],
    ['aff100','生死相许','一位道侣好感到 100',()=>B('aff100')>=1],
    ['assn3','心结尽解','刺客出身的道侣走完三段羁绊',()=>B('assnBond')>=1],
    ['metN','阅人无数','累计遇到 100 位有缘人',()=>C('met')>=100,1],
    ['wedN','红烛常燃','累计结为道侣 20 次',()=>C('wed')>=20,1],
    ['splitN','好聚好散','累计和离 5 次',()=>C('split')>=5,1],
    ['divN','薄情郎','累计休离 5 次',()=>C('divorce')>=5,1]]],
  ['刺客',[
    ['recruit','以德报怨','把擒获的刺客收为己用',()=>C('recruit')>=1],
    ['release','刀下留人','擒获刺客后释放',()=>C('release')>=1],
    ['guardN','府中无虞','一局里拿下 40 名刺客',()=>B('guardWinRun')>=40],
    ['capN','刺客克星','累计擒获 100 名刺客',()=>C('captured')>=100,1]]],
  ['行善与应对',[
    ['merit','积善之家','一局里功德累计 60000',()=>B('meritRun')>=60000],
    ['yeN','年年有余','连续 20 年年末大事都应对成功',()=>B('yeStreak')>=20],
    ['deedN','乐善好施','累计行善 1000 次',()=>C('deed')>=1000,1],
    ['yeOkN','百战不殆','累计年末大事应对成功 100 次',()=>C('yeOk')>=100,1]]],
  ['通关',[
    ['win','羽化登仙','第一次通关',()=>C('wins')>=1],
    ['fast','速通','40 年内通关',()=>!!META.fast&&META.fast.year<=40],
    ['alone','孑然一身','没有结为道侣就通关',()=>B('winNoWife')>=1],
    ['both','双全','兵变线和民心线都通关过',()=>C('win_a')>=1&&C('win_b')>=1,1],
    ['winN','道心不改','累计通关 10 次',()=>C('wins')>=10,1],
    ['years','百年王侯','所有存档加起来，游戏内度过 500 年',()=>C('months')>=6000,1]]]];
const ACH_ALL=[].concat(...ACH.map(([c,l])=>l.map(x=>({cat:c,id:x[0],name:x[1],desc:x[2],test:x[3],sum:!!x[4]}))));
/* 重新判断一遍；quiet=只补记不弹窗（读数据、登录合并时） */
function achEval(quiet){if(!META)return;if(S&&!quiet)achScan();let n=0;
  for(const a of ACH_ALL){if(META.ach[a.id])continue;let ok=false;try{ok=a.test()}catch(e){}
    if(ok){META.ach[a.id]={at:Date.now(),who:S&&S.name||''};n++;if(!quiet)achNewQ.push(a)}}
  achSave();if(achNewQ.length&&typeof SIM==='undefined')setTimeout(achPop,0);return n}
function achPop(){if(!achNewQ.length||document.getElementById('achlay'))return;const L=achNewQ.splice(0);
  const d=document.createElement('div');d.id='achlay';
  d.innerHTML=`<div class="abox" role="dialog" aria-label="达成成就"><div class="aseal">成</div><h3>${L.length>1?`达成 ${L.length} 个成就`:'达成成就'}</h3>${L.map(a=>`<div class="aitem"><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></div>`).join('')}<button class="opt primary" data-a="achClose">知道了</button></div>`;
  document.body.appendChild(d)}
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a="achClose"]');if(b){const d=document.getElementById('achlay');if(d)d.remove();setTimeout(achPop,0)}});

/* ---------- 页面 ---------- */
const fmtDay=t=>{if(!t)return '';const d=new Date(t);return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`};
/* back：返回按钮的属性（默认回存档页；选存档页用 cloud.js 传进来的） */
const ACH_BACK='data-a="achBack"';
function achHTML(back){back=back||ACH_BACK;if(!META)achLoad();const got=ACH_ALL.filter(a=>META.ach[a.id]).length;
  return `<div class="page"><div class="hubhead"><h4 class="sub" style="margin-top:0">我的成就</h4><button class="small" ${back}>返回</button></div>
  <div class="achtop"><b>${got}</b> / ${ACH_ALL.length}<span>三个存档位一起算，删档也不会清零。</span></div>
  ${ACH.map(([c])=>`<h4 class="sub">${c}</h4><div class="achlist">${ACH_ALL.filter(a=>a.cat===c).map(a=>{const g=META.ach[a.id];
    return `<div class="achcard${g?' got':''}"><b>${esc(a.name)}</b><span>${esc(a.desc)}${a.sum?'（累计）':''}</span>${g?`<small>${fmtDay(g.at)}达成</small>`:''}</div>`}).join('')}</div>`).join('')}</div>`}
const END_LIST=['羽化登仙','废为庶人','民变','赐死','走火入魔','渡劫陨落','起兵兵败'];
function statsHTML(back){back=back||ACH_BACK;if(!META)achLoad();const st=META.st,be=META.best,c=k=>fmt(st[k]||0);
  const g=st.games||0,w=st.wins||0,f=st.fails||0,rate=w+f?Math.round(w/(w+f)*100)+'%':'—';
  const mx=Math.max(1,...END_LIST.map(k=>META.end[k]||0));
  const row=(l,v)=>`<div class="srow"><span>${l}</span><b>${v}</b></div>`;
  const card=(t,rows)=>`<details class="scard" open><summary>${t}</summary>${rows.join('')}</details>`;
  const yrs=st.months||0;const fs=META.fast;
  return `<div class="page"><div class="hubhead"><h4 class="sub" style="margin-top:0">我的数据</h4><button class="small" ${back}>返回</button></div>
  <div class="sbig">${[['开过几局',g],['通关',w],['失败',f],['通关率',rate]].map(([l,v])=>`<div><b>${typeof v==='number'?fmt(v):v}</b><span>${l}</span></div>`).join('')}</div>
  <p class="note ctr">累计游戏内 ${Math.floor(yrs/12)} 年${yrs%12?` ${yrs%12} 个月`:''}　·　累计赚到银两 ${c('silverEarn')}<br>最快通关 ${fs?`第 ${fs.year} 年`:'—'}　·　最高境界 ${be.realm?realmName(Math.min(be.realm,R_TOP)):'—'}　·　最高帝业 第 ${be.rank||1} 阶</p>
  <h4 class="sub">结局</h4><div class="ends">${END_LIST.map(k=>{const n=META.end[k]||0;return `<div class="erow"><span>${n?k:'？？？'}</span><i style="width:${n?`max(4px,${Math.round(n/mx*100)}%)`:0}"></i><b>${n}</b></div>`}).join('')}</div>
  ${card('仙途',[row('突破',c('breakthrough')),row('渡劫成功 / 失败',`${c('tribOk')} / ${c('tribFail')}`),row('炼出破障丹',c('pills')),row('闭关',c('act_retreat')),row('以功德悟道',c('mstudy'))])}
  ${card('帝业',[row('累计赚到的银两',c('silverEarn')),row('累计花掉的银两',c('silverSpend')),row('一局里最多同时有过的银两',fmt(be.silverMax||0)),row('最高月收入',fmt(be.incomeMax||0)),row('晋升',c('promo')),row('兵变线 / 民心线登基',`${c('emp_a')} / ${c('emp_b')}`),row('被问责',c('acc')),row('打点朝廷',c('bribe'))])}
  ${card('后宅',[row('遇到有缘人',c('met')),row('结为道侣',c('wed')),row('双修',c('dual')),row('和离',c('split')),row('休离',c('divorce')),row('遣散',c('dismiss')),row('没去看而离开',c('left'))])}
  ${card('刺客',[row('遇刺',c('assn')),row('夜袭',c('raid')),row('擒获',c('captured')),row('处决',c('executed')),row('严刑逼供',c('tortured')),row('收为己用',c('recruit')),row('释放',c('release')),row('刺客道侣出逃',c('escaped'))])}
  ${card('行善与应对',[row('行善',c('deed')),row('累计功德',c('meritEarn')),row('年末大事成功 / 失败',`${c('yeOk')} / ${c('yeFail')}`)])}
  ${fs?`<h4 class="sub">最好的一局</h4><div class="qcard"><p>${esc(fs.name)}　第 ${fs.year} 年羽化登仙</p><p class="note">${fs.route==='a'?'兵变线':fs.route==='b'?'民心线':''}${fs.wives?`　道侣 ${fs.wives} 位`:'　孑然一身'}</p></div>`:''}
  <p class="note">数据从这个版本开始记录，以前玩过的局不计入。</p></div>`}
