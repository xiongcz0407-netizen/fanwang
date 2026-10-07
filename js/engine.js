/* 游戏引擎：状态、属性要求、月度流程、渲染。数值参数在 data/config.js。 */
/* ================= 存储与配置 ================= */
const SAVE_V=2;
const LS={get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
let CFG=Object.assign({},DEFAULT_CFG,LS.get('xw_cfg')||{});
let S=LS.get('xw_save'); let oldSave=false; if(S&&S.v!==SAVE_V){S=null;oldSave=true} if(S)S.exp=S.exp||{};
/* 随机数存在存档里（S.rs）：读档后做同样的事，结果也一样，刷新网页没法重抽运气 */
const _rnd=Math.random;
Math.random=function(){if(typeof S!=='undefined'&&S&&typeof S.rs==='number'){let x=S.rs|0;x^=x<<13;x^=x>>>17;x^=x<<5;S.rs=x|0||1;return (x>>>0)/4294967296}return _rnd()};
if(S&&typeof S.rs!=='number')S.rs=Math.floor(_rnd()*2147483646)+1;
function migrate(o){if(!o||o.v!==SAVE_V)return null;o.exp=o.exp||{};if(typeof o.rs!=='number')o.rs=(Math.floor(_rnd()*2147483646)+1);(o.partners||[]).forEach(p=>{if(!p.img)p.img=pickImg(p.g,o)});return o}
let backTo='', queue=[], view='game', tab='play', title=true, titleSub='', titleMsg='', gmResetArm=false, restartArm=false, fileMsg='';
function download(name,obj){const b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function loadFile(input){const f=input.files[0];if(!f)return;const kind=input.dataset.file;const r=new FileReader();
  r.onload=()=>{try{const o=JSON.parse(r.result);
    if(kind==='save'){if(o&&o.v===SAVE_V){S=migrate(o);queue=[];save();fileMsg=`已读取存档：${o.name}，第${o.year}年`;}else fileMsg='这不是当前版本的存档文件。'}
    else{CFG=Object.assign({},DEFAULT_CFG,o);LS.set('xw_cfg',CFG);fileMsg='已读取参数文件。'}}catch(e){fileMsg='文件读取失败，格式不对。'}render()};
  r.readAsText(f);input.value=''}

/* ================= 基础工具 ================= */
const $=s=>document.querySelector(s);
const rand=n=>Math.floor(Math.random()*n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sg=v=>(v>0?'+':'')+v;
const pick1=a=>a[rand(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.abs(n)>=10000?(Math.round(n/1000)/10)+'万':String(n);
const CN=['零','一','二','三','四','五','六','七','八','九','十'];
const MONTHS=['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','腊月'];
const ATTR={wencai:'文才',wulue:'武略',xinji:'心机',meili:'魅力',gengu:'根骨',wuxing:'悟性'};
const RES={xiuwei:'修为',wengong:'文功',wugong:'武功',merit:'功德',xinmo:'心魔',minxin:'民心',silver:'银两',troops:'私兵',train:'训练度',suspicion:'猜忌',harmony:'后宅安宁',pill:'破障丹',industry:'每月产业收入',guard:'防刺客加成'};
const C100=['xinmo','minxin','train','suspicion','harmony'];
const RN={crit:'大成功',ok:'成功',fail:'失败',fumble:'大失败'};
const RANKS=['','罪藩','立足封地','安民一方','雄踞一州','威震三州','天下侧目'];
const RANKS_A=['','','','','','','','起兵靖难','攻城略地','兵临京师','夺位登基'];
const RANKS_B=['','','','','','','','天下归心','朝臣倒戈','万民请愿','众望登基'];
const rankName=r=>r<=6?RANKS[r]:(S&&S.route==='a'?RANKS_A[r]:S&&S.route==='b'?RANKS_B[r]:['','','','','','','','第七阶','第八阶','第九阶','登基'][r]);
const ACTS=['抚琴','品茶','赏月','切磋','听戏','游湖','对弈','吟诗','骑射','赏花'];
const NAMES={f:{s:['沈','苏','顾','林','叶','慕容','温','秦','萧','陆','柳','白','江','姜','楚','宋','唐','阮','谢','上官','洛','许','孟','傅'],
    g:['清霜','映雪','若兰','婉宁','紫鸢','芷萱','云裳','素心','念瑶','初晴','惊鸿','落英','疏影','霁月','采薇','晚晴','听雪','青黛','锦书','明姝','南枝','寒烟','如歌','知意']},
  m:{s:['沈','谢','顾','裴','叶','慕容','温','秦','萧','陆','卫','白','江','楚','宋','傅','燕','霍','容','季','晏','沐','司马','梁'],
    g:['承霄','怀瑾','景行','长风','逸尘','砚之','云澈','子衿','望舒','凌川','清晏','墨渊','无咎','知行','修远','惊澜','听松','少卿','观澜','明夷','寒川','不疑','子期','鹤年']}};
/* 取名：尽量不和后宅里的人、来报复的刺客、最近遇到过的人同姓或同名，方便记住谁是谁 */
const nameParts=(n,g)=>{const s=NAMES[g]||NAMES.f;const sur=s.s.filter(x=>n.startsWith(x)).sort((a,b)=>b.length-a.length)[0]||n[0];return [sur,n.slice(sur.length)]};
const randName=g=>{const st=typeof S!=='undefined'&&S?S:null;const pool=NAMES[g]||NAMES.f;
  const names=[...((st&&st.partners)||[]).map(p=>p.name),...(st&&st.revenge&&st.revenge.name?[st.revenge.name]:[]),...((st&&st.nameLog)||[])];
  const usedS=new Set(),usedG=new Set();names.forEach(n=>{const [a,b]=nameParts(n,g);usedS.add(a);usedG.add(b)});
  const all=new Set(names);let n=null;
  for(const strict of [2,1,0])for(let i=0;i<40&&!n;i++){const a=pick1(pool.s),b=pick1(pool.g);if(all.has(a+b))continue;if(strict>=1&&usedG.has(b))continue;if(strict>=2&&usedS.has(a))continue;n=a+b}
  if(!n)n=pick1(pool.s)+pick1(pool.g);
  if(st){st.nameLog=(st.nameLog||[]).concat(n).slice(-10)}return n};

const mi=()=>(S.year-1)*12+S.month;
const gongji=()=>S.wengong+S.wugong;
const married=()=>S.partners.filter(p=>p.married);
const cap=()=>CFG.partnerMax;
/* ===== 道侣才貌：固定不变；双修、防刺客、后宅消耗看才貌与当前标准之差 ===== */
const cmStd=()=>CM_STD[Math.min(S.rank,10)];
const cmTier=p=>{if(p.cm==null)p.cm=rollCm();const d=p.cm-cmStd();return CM_TIER.find(t=>d>=t[0])};
const cmMul=p=>cmTier(p)[1];
const cmTxt=p=>`才貌 ${p.cm==null?(p.cm=rollCm()):p.cm}（当前门第标准 ${cmStd()}，${cmTier(p)[2]}）`;
/* 新遇到的人：10% 高很多、40% 略高、50% 一样或更低；你的魅力比事件基准每高 1 点，好的两档各 +0.5%（各最多 +10%） */
function rollCm(h0,m0){h0=h0==null?10:h0;m0=m0==null?40:m0;const b=clamp(((S.attr&&S.attr.meili)||0)-reqBase(),-20,20)*0.5;const pH=clamp(h0+b,h0/2,h0*2),pM=clamp(m0+b,m0-10,m0+10);const r=Math.random()*100,st=cmStd();
  const v=r<pH?st+20+rand(11):r<pH+pM?st+5+rand(11):st-20+rand(25);return clamp(v,1,100)}
/* ---- 境界：1~10 练气，11~14 筑基，15~18 金丹，19~22 元婴，23~26 化神，27 飞升 ---- */
const MAJOR=['练气','筑基','金丹','元婴','化神'];
const majorOf=i=>i<=10?0:Math.min(4,Math.floor((i-11)/4)+1);
const STAGE=['初期','中期','后期','圆满'];
const realmName=i=>i>=27?'飞升':i<=10?`练气${CN[i]}层`:MAJOR[majorOf(i)]+STAGE[(i-11)%4];
const xiuNeed=i=>XIU_NEED[Math.min(i,26)];
/* 大境界之间要渡劫（10→筑基，14→金丹，18→元婴，22→化神，26→飞升） */
const TRIB_AT={10:'zhuji',14:'jindan',18:'yuanying',22:'huashen',26:'feisheng'};
const TRIB_RANK={zhuji:3,jindan:6,yuanying:9,huashen:10,feisheng:10};
const TRIB_MERIT={zhuji:'meritZhu',jindan:'meritJin',yuanying:'meritYuan',huashen:'meritHua',feisheng:'meritFei'};
const TRIB_MAJOR={zhuji:0,jindan:1,yuanying:2,huashen:3,feisheng:4};
const isBottle=i=>[3,6,9,12,16,20,24].includes(i);
/* 突破需要的破障丹：练气三层起每次都要，按大境界 1/2/3/4/5 颗，瓶颈双倍；跨大境界走渡劫，不用丹 */
const PILL_PER_MAJOR=[1,2,3,4,5];
const pillNeed=i=>i<3||TRIB_AT[i]?0:PILL_PER_MAJOR[majorOf(i)]*(isBottle(i)?2:1);
const carryXiu=oldNeed=>Math.min(Math.max(0,S.xiuwei-oldNeed),Math.round(xiuNeed(Math.min(S.realm,26))*0.5));
const pillYield=()=>Math.min(2,1+Math.floor(S.attr.wuxing/CFG.pillWuxingStep));
const realmMul=()=>REALM_MUL[majorOf(Math.min(S.realm,26))];
const rankMul=(r)=>1+CFG.rankScale*((r||S.rank)-1);
const diffMul=()=>1+CFG.diffPerRank*(S.rank-1);
/* 帝业 → 修仙：封地灵脉、国库天材地宝，帝业越高，修行越快 */
const lingMul=()=>1+CFG.lingPerRank*(S.rank-1);
const attrCap=()=>[CFG.capQi,CFG.capZhu,CFG.capJin,CFG.capYuan,CFG.capHua][majorOf(Math.min(S.realm,26))];
const meritNeed=k=>Math.round(CFG[TRIB_MERIT[k]]);
/* 修仙 → 帝业：帝业带来权欲心魔，境界提供定力抵消 */
const xinmoRankGain=()=>S.rank>=10?CFG.xinmoRank10:S.rank>=7?CFG.xinmoRank7:S.rank>=4?CFG.xinmoRank4:0;
const xinmoResist=()=>majorOf(Math.min(S.realm,26))*CFG.xinmoResistPerMajor;
/* ---- 兵力 ---- */
const power=()=>Math.round(S.troops*(1+S.train/100));
const ratio=()=>Math.round(power()/Math.max(1,S.court)*1000)/10;
const RATIO_TIERS=[[0,'府兵'],[5,'一方武装'],[15,'雄兵'],[30,'朝廷忌惮'],[60,'可争天下']];
const ratioTier=r=>{let t=RATIO_TIERS[0];for(const x of RATIO_TIERS)if(r>=x[0])t=x;return t};
const nextTier=r=>RATIO_TIERS.find(x=>x[0]>r);
const income=()=>Math.round((CFG.incomeBase+S.minxin*CFG.incomePerMinxin)*(1+CFG.incomeRankScale*(S.rank-1))*(S.rank>=10?CFG.emperorIncome:1)+S.industry);
/* 产业没有上限；已有产业越多，再扩张越贵：每多 industryPerRank×帝业阶×industryDouble 的产业，价格翻一倍 */
const indPriceMul=()=>1+S.industry/(CFG.industryPerRank*S.rank*CFG.industryDouble);
const indPayback=()=>Math.round(150*indPriceMul()/15);
const freeTroops=()=>CFG.freeTroopsPerRank*S.rank;
/* 收编开关旁的后果提示：兵多了要发军饷、猜忌涨得快、民心掉得快 */
function acceptTip(){const t=[];const over=S.troops-freeTroops();
  if(over>0)t.push(`私兵已超出免饷 ${fmt(over)} 人，每月军饷 ${upkeep()} 两`);else t.push(`免饷还能再收 ${fmt(-over)} 人，超出后要发军饷`);
  if(!(S.route==='a'&&S.rank>=7)){const su=Math.floor(ratio()/CFG.suspPerRatio);if(su>0)t.push(`兵力比 ${ratio()}%，每月猜忌 +${su}`)}
  const md=Math.floor(ratio()/CFG.minxinDecayRatio);if(md>0)t.push(`养兵扰民，每月民心多掉 ${md}`);
  return t.join('；')+'。兵太多时记得切换成婉拒。'}
const upkeep=()=>Math.round(Math.max(0,S.troops-freeTroops())/100*CFG.upkeepPer100*(S.route==='a'&&S.rank>=7?0.5:1));

const save=()=>{if(S){S.savedAt=Date.now();LS.set('xw_save',S);if(typeof cloudAfterSave==='function')cloudAfterSave()}};
function storageOK(){try{localStorage.setItem('xw_t','1');const ok=localStorage.getItem('xw_t')==='1';localStorage.removeItem('xw_t');return ok}catch(e){return false}}
const saveCode=o=>{const t=JSON.stringify(o||S);return typeof LZString!=='undefined'?'XW'+SAVE_V+'-'+LZString.compressToEncodedURIComponent(t):btoa(unescape(encodeURIComponent(t)))};
function parseCode(code){code=String(code||'').replace(/\s+/g,'');if(!code)return null;
  try{const m=/^XW\d+-(.+)$/.exec(code);const o=JSON.parse(m?LZString.decompressFromEncodedURIComponent(m[1]):decodeURIComponent(escape(atob(code))));return o&&o.v===SAVE_V?o:null}catch(e){return null}}
function loadCode(code){const o=parseCode(code);if(!o)return false;S=migrate(o);queue=[];save();return true}
const saveBrief=o=>`${o.name}　第${o.year}年${MONTHS[o.month]}　${realmName(Math.min(o.realm,26))}`;
/* 每年正月提醒备份存档码（上次复制满 12 个月才提醒） */
function backupScene(){if(typeof cloudOn==='function'&&cloudOn()){S.copyMi=mi();save();return {who:me(),tag:'存档',title:'新的一年',text:cloudLast.ok===false?`新的一年开始了。游戏已保存在这台设备上，但上次没能存到云端（${cloudErrTxt(cloudLast.err).replace(/。$/,'')}）。联网后会自动补上。`:'新的一年开始了，游戏已自动保存到云端。',options:[{label:'继续',run(){}}]}}
  return {who:me(),tag:'存档提醒',title:'备份存档码',text:`新的一年开始了。这局游戏很长，存档只保存在这台设备的这个浏览器里。\n复制一份存档码，发到微信「文件传输助手」或存进备忘录。换手机、换浏览器、或者浏览器清了数据，打开游戏点「用存档码找回」粘贴进去就能接着玩。`,
  options:[{label:'复制存档码',hint:'复制后自动继续',run(){copyText(saveCode(),ok=>{S.copyMi=mi();save();if(ok)result('存档码已复制','现在去微信「文件传输助手」或备忘录里粘贴保存。以后打开游戏点「用存档码找回」，粘贴进去就能接着玩。');else{fileMsg='自动复制失败：请点「复制存档码」，或在下面文字框里长按手动复制。';tab='save'}render()})}},
  {label:'这次先不了',hint:'明年正月再提醒',run(){S.copyMi=mi()}}]}}
function copyText(t,cb){const fb=()=>{try{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();a.setSelectionRange(0,t.length);const ok=document.execCommand('copy');a.remove();cb(ok)}catch(e){cb(false)}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>cb(true),fb);else fb()}
const logAdd=t=>{S.log.unshift(`${S.logLbl||`第${S.year}年${MONTHS[S.month]}`}：${t}`);if(S.log.length>200)S.log.length=200};
const me=()=>({isMe:true,name:S.name,g:S.gender,origin:S.rank>=10?'皇帝':S.gender==='m'?'王爷':'公主'});
const opp=()=>S.gender==='m'?'f':'m';
function fill(t,ctx){if(!t)return'';const p=ctx&&ctx.p,a=ctx&&ctx.a,b=ctx&&ctx.b;
  return t.replace(/\{name\}/g,p?p.name:'她').replace(/\{ta\}/g,p?(p.g==='f'?'她':'他'):'她').replace(/\{t\}/g,p?p.origin:'')
    .replace(/\{a\}/g,a?a.name:'她').replace(/\{b\}/g,b?b.name:'她')}

/* ================= 数值缩放 =================
   事件数据按前期量级写，结算时按阶段放大：功绩/银两/功德/私兵/产业 × 帝业倍率，修为 × 大境界倍率。
   属性、民心、心魔、猜忌、安宁、好感、训练度等百分制数值不放大。 */
const SCALE_RANK=['wengong','wugong','silver','merit','industry'];
function scaleEff(e){if(!e)return e;const o={};for(const[k,v]of Object.entries(e)){
  if(SCALE_RANK.includes(k))o[k]=Math.round(v*rankMul());else if(k==='xiuwei')o[k]=Math.round(v*realmMul());else o[k]=v}return o}
const scaleDiff=d=>Math.round(d*diffMul());

/* ================= 属性要求（达标拿奖励，不达标吃惩罚） =================
   奖励选项都有属性要求：属性（含加成）达到就能选，选了必定拿到奖励；达不到就灰掉，只能选惩罚选项。
   要求 = 基准（按帝业阶位与大境界取高者）+ 难度档（易 −5 / 中 0 / 难 +8）。 */
const reqBase=()=>Math.max(REQ_RANK[Math.min(S.rank,10)]||18,REQ_MAJOR[majorOf(Math.min(S.realm,26))]||0);
function reqOf(c,ctx){if(!c)return 0;const off=c.lv?REQ_LV[c.lv]:Math.round(((c.difficulty||28)-28)*0.6);const v=clamp(reqBase()+off+(c.plus||0)+((typeof ATTR_REQ_ADJ!=='undefined'&&ATTR_REQ_ADJ[c.attr])||0),5,100);return Math.min(v,attrCap())}/* 要求不超过当前境界的属性上限：不然练满也过不了 */
function bonusOf(o){const b=o.check&&o.check.bonus;return b==='troops'?Math.min(15,Math.floor(ratio()/2)):(b||0)}
const meets=(o,ctx)=>!o.check||S.attr[o.check.attr]+bonusOf(o)+((ctx&&ctx.bonus)||0)>=reqOf(o.check,ctx);
function needTxt(attr,need,bonus){const v=S.attr[attr];const cap=attrCap();
  return `需要${ATTR[attr]} ${need}（你 ${v}${bonus?` + 加成 ${bonus}`:''}）`+(v+(bonus||0)<need&&need-(bonus||0)>cap?`，超过当前上限 ${cap}，需突破大境界`:'')}
function gainAttr(k,n){const before=S.attr[k];S.attr[k]=clamp(S.attr[k]+n,1,Math.max(attrCap(),before));return S.attr[k]-before}
/* 历练：行动给对应属性加历练，攒够 +1；到当前上限就不再积累 */
const trainNeed=v=>CFG.trainBase+Math.floor(v/CFG.trainStep);
/* 属性历练：每次掷一次骰子，几率 = trainChance ÷ 需要次数（属性越高越难）；连续落空达到「需要次数」后下一次必中（保底）。几率和保底都不告诉玩家。S.exp[k] = 连续落空次数 */
const trainP=(k,m)=>Math.min(0.9,CFG.trainChance*(m||1)/trainNeed(S.attr[k]));
function train(k,m){S.exp=S.exp||{};if(S.attr[k]>=attrCap())return `${ATTR[k]}已到当前上限 ${attrCap()}，突破大境界后才能继续提升`;
  const miss=S.exp[k]||0;if(miss>=trainNeed(S.attr[k])||Math.random()<trainP(k,m)){S.exp[k]=0;S.attr[k]++;return `${ATTR[k]} +1（现在 ${S.attr[k]}）`}
  S.exp[k]=miss+1;return ''}
/* 还要做几次这件事，属性才 +1（n = 这件事一次给几点历练） */
const trainTxt=(k,n)=>S.attr[k]>=attrCap()?`${ATTR[k]}已到当前上限 ${attrCap()}，突破大境界后才能继续提升`:`有概率提升${ATTR[k]}`;
const afford=cost=>Object.entries(scaleEff(cost)).every(([k,v])=>(S[k]||0)>=v);
const pay=cost=>Object.entries(scaleEff(cost)).forEach(([k,v])=>{S[k]-=v});
/* 结算效果（先缩放）。返回给玩家看的文字。属性键在事件效果里一律忽略（属性只靠历练、突破、渡劫、道侣礼物）。 */
function apply(effRaw,ctx,noScale){
  const parts=[];if(!effRaw)return'';const eff=noScale?effRaw:scaleEff(effRaw);const stop=S.xinmo>=CFG.xinmoStop;
  for(let [k,v] of Object.entries(eff)){
    if(['_t','next','flag','meet','_note'].includes(k)||ATTR[k])continue;
    if(k==='aff'||k==='affA'||k==='affB'){const p=ctx&&(k==='aff'?ctx.p:k==='affA'?ctx.a:ctx.b);if(p){const a0=p.aff;p.aff=clamp(p.aff+v,0,100);if(p.aff!==a0)parts.push(`${p.name}好感 ${sg(p.aff-a0)}`)}continue}
    if(k==='injured'){if(v>S.injured){S.injured=v;parts.push(`下月起负伤 ${v} 个月`)}continue}
    if(['xiuwei','wengong','wugong'].includes(k)&&v>0&&stop)continue;
    if((k==='wengong'||k==='wugong')&&v>0&&S.rank>=10){const m=Math.max(1,Math.round(v/CFG.overflowRate));S.merit+=m;parts.push(`功德 +${m}`);continue}
    if(k==='xiuwei'&&v>0&&S.xinmo>CFG.xinmoSlowFrom){const cut=Math.min(99,S.xinmo-CFG.xinmoSlowFrom);v=Math.round(v*(100-cut)/100)}
    if(k==='xiuwei'){const need=xiuNeed(S.realm);const before=S.xiuwei;S.xiuwei=clamp(S.xiuwei+v,0,Math.round(need*CFG.xiuBank));if(S.xiuwei!==before)parts.push(`修为 ${sg(S.xiuwei-before)}`);continue}
    if(k==='suspicion'&&S.route==='a'&&S.rank>=7){const pct=v*CFG.courtPerSusp;S.court=Math.max(10000,Math.round(S.court*(1+pct/100)));parts.push(`朝廷兵力 ${sg(Math.round(pct*10)/10)}%`);continue}
    if(C100.includes(k)){const before=S[k]||0;const after=clamp(before+v,0,100);S[k]=after;const d=after-before;
      if(d!==0)parts.push(`${RES[k]} ${sg(d)}`);continue}
    const b0=S[k]||0;S[k]=b0+v; if(k==='guard')S[k]=Math.min(S[k],CFG.guardMax);if(S[k]<0)S[k]=0;
    if(S[k]!==b0)parts.push(`${RES[k]} ${sg(S[k]-b0)}`);
  }
  if(eff.next)S.chains.push({id:eff.next,due:mi()+1});
  return parts.join('，');
}
const effName=k=>k==='aff'||k==='affA'||k==='affB'?'好感':k==='injured'?'负伤月数':ATTR[k]||RES[k]||k;
function effTxt(eff,ctx,noScale){const e0=noScale?eff:scaleEff(eff);const e={...(e0||{})};const stop=S.xinmo>=CFG.xinmoStop;
  for(const k of ['xiuwei','wengong','wugong'])if(e[k]>0){if(stop)delete e[k];else if(k==='xiuwei'&&S.xinmo>CFG.xinmoSlowFrom)e[k]=Math.round(e[k]*(100-Math.min(99,S.xinmo-CFG.xinmoSlowFrom))/100)}
  if(e.xiuwei>0){const room=Math.round(xiuNeed(S.realm)*CFG.xiuBank)-S.xiuwei;if(room<=0)delete e.xiuwei;else e.xiuwei=Math.min(e.xiuwei,room)}
  for(const k of C100)if(typeof e[k]==='number'&&!(k==='suspicion'&&S.route==='a'&&S.rank>=7)){const cur=S[k]||0;e[k]=e[k]>0?Math.min(e[k],100-cur):Math.max(e[k],-cur);if(!e[k])delete e[k]}
  if(e.injured>0&&e.injured<=S.injured)delete e.injured;
  for(const [k,pk] of [['aff','p'],['affA','a'],['affB','b']]){const q=ctx&&ctx[pk];if(q&&typeof e[k]==='number'){e[k]=e[k]>0?Math.min(e[k],100-q.aff):Math.max(e[k],-q.aff);if(!e[k])delete e[k]}}
  for(const k of Object.keys(e))if(typeof e[k]==='number'&&e[k]<0&&!C100.includes(k)&&!['aff','affA','affB','injured'].includes(k)&&RES[k]){e[k]=Math.max(e[k],-(S[k]||0));if(!e[k])delete e[k]}
  if(e.guard>0){e.guard=Math.min(e.guard,CFG.guardMax-(S.guard||0));if(e.guard<=0)delete e.guard}
  return Object.entries(e).filter(([k,v])=>v!==0&&!['_t','next','flag','meet','_note'].includes(k)&&!ATTR[k]&&!(C100.includes(k)&&!(k==='suspicion'&&S.route==='a'&&S.rank>=7)&&((v>0&&(S[k]||0)>=100)||(v<0&&(S[k]||0)<=0))))
  .map(([k,v])=>k==='suspicion'&&S.route==='a'&&S.rank>=7?`朝廷兵力 ${sg(Math.round(v*CFG.courtPerSusp*10)/10)}%`:(k==='wengong'||k==='wugong')&&v>0&&S.rank>=10?`功德 +${Math.max(1,Math.round(v/CFG.overflowRate))}`:k==='injured'?`下月起负伤 ${v} 个月`:(k==='aff'&&ctx&&ctx.p?ctx.p.name:k==='affA'&&ctx&&ctx.a?ctx.a.name:k==='affB'&&ctx&&ctx.b?ctx.b.name:'')+effName(k)+' '+sg(v)).join('，')}
const costTxt=c=>'花费 '+Object.entries(scaleEff(c)).map(([k,v])=>effName(k)+' '+v).join('，');
const effOf0=o=>o.eff||o.success||{};
/* 奖励随形势调整：某项已经满了（或为 0）、领了没用，就按价值换成眼下用得上的东西；惩罚碰到「已经没法更糟」也换成别的损失 */
function adaptEff(e,ctx,pen){const o={},note=[];const add=(k,v)=>{o[k]=(o[k]||0)+v};const mar=()=>married().length>0;
  for(const[k,v]of Object.entries(e||{})){if(typeof v!=='number'){o[k]=v;continue}
    if(!pen){
      if(k==='xinmo'&&v<0&&S.xinmo<=0){add('merit',Math.round(-v*1.5));note.push('心魔已为 0，改为功德');continue}
      if(k==='minxin'&&v>0&&S.minxin>=95){add('wengong',v*5);note.push('民心已满，改为文功');continue}
      if(k==='suspicion'&&v<0&&S.suspicion<=0&&!(S.route==='a'&&S.rank>=7)){add('wengong',-v*4);note.push('猜忌已为 0，改为文功');continue}
      if(k==='harmony'&&v>0&&(S.harmony>=95||!mar())){add('merit',v);note.push(mar()?'后宅已安宁，改为功德':'尚无道侣，改为功德');continue}
      if(k==='train'&&v>0&&S.train>=95){add('wugong',v*3);note.push('训练度已满，改为武功');continue}
      if(k==='guard'&&v>0&&S.guard>=CFG.guardMax){add('wugong',v*3);note.push('守卫已满，改为武功');continue}
      if(k==='troops'&&v>0&&S.route!=='a'&&ratio()>=25){add('wugong',Math.round(v/20));note.push('私兵已够多，再招只会招朝廷猜忌，改为武功');continue}
      if(k==='xiuwei'&&v>0&&S.xiuwei>=xiuNeed(S.realm)*CFG.xiuBank){add('merit',Math.max(1,Math.round(v/20)));note.push('修为已积满，改为功德');continue}
      const p=k==='aff'?ctx&&ctx.p:k==='affA'?ctx&&ctx.a:k==='affB'?ctx&&ctx.b:null;
      if(p&&v>0&&p.aff>=100){if(S.harmony<95)add('harmony',Math.ceil(v/2));else add('merit',v);note.push(`${p.name}好感已满，改为${S.harmony<95?'后宅安宁':'功德'}`);continue}
    }else{
      if(k==='minxin'&&v<0&&S.minxin<=0){add('silver',v*15);note.push('民心已为 0，改扣银两');continue}
      if(k==='harmony'&&v<0&&!mar()){add('xinmo',Math.ceil(-v/2));note.push('尚无道侣，改为心魔');continue}
      if(k==='train'&&v<0&&S.train<=0){add('wugong',v*3);note.push('训练度已为 0，改扣武功');continue}
    }
    add(k,v)}
  if(note.length)o._note=note.join('；');return o}
const effOf=(o,ctx)=>o._auto?effOf0(o):adaptEff(effOf0(o),ctx,!o.check);
function optHint(o,ctx){const h=[];
  if(o.check)h.push(needTxt(o.check.attr,reqOf(o.check,ctx),bonusOf(o)+((ctx&&ctx.bonus)||0)));
  if(o.cost)h.push(costTxt(o.cost));
  const ef=effOf(o,ctx);const e=effTxt(ef,ctx);if(e)h.push((o.check?'奖励：':'后果：')+e);else if(ef.meet)h.push('结识此人');
  return h.join('；')}
function runOpt(o,ctx){
  ctx=ctx||{};if(o.cost)pay(o.cost);const eff=effOf(o,ctx);const good=!!o.check;
  const head=o.check?`【${ATTR[o.check.attr]} ${reqOf(o.check,ctx)}，达标】`:'';
  let body=eff&&eff._t?fill(eff._t,ctx):'';
  if(eff&&eff.meet&&ctx.p&&!ctx.p.met){ctx.p.met=true;S.partners.push(ctx.p);S.metT[ctx.p.tid]=1;
    body+=(body?'\n':'')+`你结识了${ctx.p.origin}「${ctx.p.name}」。`;logAdd(`结识${ctx.p.origin}${ctx.p.name}`)}
  const sum=apply(eff,ctx);
  return {text:[head,body,sum?`（${sum}）`:''].filter(Boolean).join('\n'),good};
}
/* 把事件选项变成界面选项：奖励选项不达标就灰掉；没有惩罚选项的（旧数据、晋升关卡）自动补一个 */
function buildOpts(opts,ctx,onRun,fallback){
  const out=opts.map(o=>({attr:o.check&&o.check.attr,label:fill(o.label,ctx),get hint(){return optHint(o,ctx)},get disabled(){return !meets(o,ctx)||!!(o.cost&&!afford(o.cost))},reward:!!o.check,run(){onRun(o)}}));/* 提示和可选状态在显示时现算：同一个月排队的几件事，前一件改了状态，后一件的提示也跟着变 */
  if(opts.every(o=>o.check)){const pen=fallback||{xinmo:2};out.push({label:'力有不逮，勉强应付',get hint(){return '后果：'+(effTxt(pen,ctx)||'这一关失利')},run(){onRun({label:'力有不逮',eff:pen,_auto:1})}})}
  return out}
function result(title,text,who,good){queue.unshift({who,title,text:text||'事情就这样过去了。',good:!!good,options:[{label:'继续',run(){}}]})}
const optDisabled=o=>!!(o.cost&&!afford(o.cost));
function markDone(t){if(t.id){if(t.once)S.done[t.id]=1;else S.cd[t.id]=mi()+(t.major?24:8)}}
/* 普通事件：不能跳过 */
function taskScene(t,ctx){
  if(t.major)return majorScene(t,ctx);
  ctx=ctx||{};const title=fill(t.title,ctx);
  const options=buildOpts(t.opts,ctx,o=>{markDone(t);const r=runOpt(o,ctx);result(title,r.text,ctx.p||ctx.who,r.good)},t.skipEff||SKIP_PENALTY[ctx.skipCat||t.cat]||SKIP_PENALTY.默认);
  return {who:ctx.p||ctx.who,title,text:fill(t.text,ctx),options};
}
/* 大事件：多步，连续发生，不能跳过 */
function majorScene(t,ctx){
  ctx=ctx||{};const title=fill(t.title,ctx);const n=t.steps.length;
  const stepScene=i=>{const st=t.steps[i];return {who:ctx.p||ctx.a||ctx.who,tag:`大事件 ${i+1}/${n}`,title,text:fill(st.text,ctx),
    options:buildOpts(st.opts,ctx,o=>{
      const r=runOpt(o,ctx);const next=i+1<n?stepScene(i+1):(t.outro?{who:ctx.who,tag:'大事件',title,text:fill(t.outro,ctx),options:[{label:'继续',run(){}}]}:null);
      if(next)queue.unshift(next);result(title,r.text,ctx.p||ctx.a||ctx.who,r.good)},SKIP_PENALTY[t.cat]||SKIP_PENALTY.默认)}};
  return {who:ctx.p||ctx.a||ctx.who,tag:'大事件',bg:bgOfOpts(t.steps[0]&&t.steps[0].opts),title,text:fill(t.intro,ctx),options:[{label:'应对',run(){markDone(t);logAdd(`大事件：${title}`);queue.unshift(stepScene(0))}}]};
}
function gameOver(title,text){S.over={title,text,win:false};logAdd(title);queue=[];save()}
function victory(text){S.over={title:'羽化登仙',text,win:true};logAdd('羽化飞升');queue=[];save()}

/* ================= 道侣 ================= */
function pickImg(g,st){st=st||S;const pool=(g==='f'?DAOLV_IMGS_F:DAOLV_IMGS_M)||[];if(!pool.length)return '';
  const used=new Set([...(st&&st.partners||[]),...(st&&st.prisoners||[])].map(p=>p.img));const free=pool.filter(x=>!used.has(x));const c=free.length?free:pool;return c[Math.floor(Math.random()*c.length)]}
function makePartner(t,a){
  const g=a?a.g:opp();const pr=shuffle(ACTS);const n=t?2+rand(2):1;
  return {id:'p'+Date.now().toString(36)+rand(1000),tid:t?t.id:'assassin',type:t?t.type:(a&&a.type)||'武',origin:t?t.origin[g]:'刺客',
    name:a?a.name:randName(g),g,realm:t?t.realm:S.realm,img:(a&&a.img)||pickImg(g),aff:0,met:false,bonded:false,bondN:0,married:false,
    prefs:pr.slice(0,n),taboo:pr[n],known:[],lastVisit:mi(),dual:0,spec:pick1(Object.keys(SPEC).filter(k=>SPEC[k].t===(t?t.type:'武')))};
}

/* ================= 双修：每位道侣每月一次（道侣越多，每月能双修的次数越多），每次奖励按 dualRewardMul 折算 =================
   武类道侣偏武事那 5 种、文类偏钱粮政事那 5 种（约六四开），不再细分专长。好感越高奖励越大：好感 60 ×1.1，好感 100 ×1.5，且 10% 机会翻倍。
   当下用不上的奖励不进池子（没受伤不抽疗伤、守卫已满不抽护院……）。 */
const SPEC={
  xiu:{n:'同修',t:'武',d:'修为'},bing:{n:'兵法',t:'武',d:'武功'},jian:{n:'剑术',t:'武',d:'防刺客加成'},zhen:{n:'阵法',t:'武',d:'下次渡劫根骨要求 −5'},yi:{n:'医术',t:'武',d:'伤势痊愈'},
  shang:{n:'商贾',t:'文',d:'银两'},zheng:{n:'理政',t:'文',d:'文功'},mou:{n:'谋略',t:'文',d:'猜忌下降'},shan:{n:'善举',t:'文',d:'功德'}};
/* 类型说明：武类、文类各有什么用 */
const typeTxt=p=>`${p.type}类`;
const typeUse=p=>p.type==='武'?'双修更容易得到修为、武功、防刺客、疗伤、渡劫阵法；防刺客加成较多；护法时让没挡住的天雷伤得轻一些。':'双修更容易得到银两、文功、降猜忌、功德；防刺客加成较少；护法时帮你过悟道这一关。';
const specOf=p=>{if(!p.spec||!SPEC[p.spec])p.spec=pick1(Object.keys(SPEC).filter(k=>SPEC[k].t===p.type));return SPEC[p.spec]};
const dualMulOf=p=>(0.5+p.aff/100)*cmMul(p);
function dualPool(p){const stop=S.xinmo>=CFG.xinmoStop;const ok={xiu:!stop&&S.xiuwei<xiuNeed(S.realm)*CFG.xiuBank,bing:!stop,zheng:!stop,yi:S.injured>0||!!S.hurt,jian:S.guard<CFG.guardMax,mou:S.suspicion>0||(S.route==='a'&&S.rank>=7),zhen:!S.zhen&&S.realm<27};
  const r=Object.keys(SPEC).filter(k=>ok[k]!==false).map(k=>[k,SPEC[k].t===p.type?3:2]);
  if(isAssassin(p)&&(S.suspicion>0&&!(S.route==='a'&&S.rank>=7)))r.push(['ansha',3]);return r}
const isAssassin=p=>p.tid==='assassin';
/* 聘礼：按才貌和帝业算 */
const brideCost=p=>Math.round((p.cm==null?(p.cm=rollCm()):p.cm)*CFG.brideCm*rankMul()/10)*10;
const dismissCost=p=>Math.max(10,Math.round((p.cm==null?(p.cm=rollCm()):p.cm)*CFG.dismissPerCm/10)*10);
const assassinFree=p=>p.bondN>=ASSASSIN_BONDS.length;/* 三段羁绊走完，心结解开 */
const assassinPenChance=p=>assassinFree(p)?CFG.assassinPenLate:CFG.assassinPen;
function dualDraw(p){
  if(false&&isAssassin(p)&&Math.random()*100<assassinPenChance(p)){/* 双修不再有惩罚 */const k=rand(3);
    const t=[`${p.name}出手没留分寸，一掌拍在你心口。`,`${p.name}身上的杀气顺着经脉涌过来，你压了好几天才压住。`,`${p.name}的旧主循着她的踪迹，查到了王府附近。`][k];
    const sum=k===0?apply({injured:1}):k===1?apply({xinmo:6}):apply({suspicion:8});return {k:'pen',t,sum}}
  const pool=dualPool(p);let tot=pool.reduce((a,x)=>a+x[1],0),r=Math.random()*tot,k=pool[0][0];for(const[x,w]of pool){r-=w;if(r<=0){k=x;break}}
  let m=dualMulOf(p)*CFG.dualRewardMul*(isAssassin(p)?CFG.assassinDualMul:1);const dbl=p.aff>=100&&Math.random()<0.1;if(dbl)m*=2;
  const R=CFG.retreatBase*lingMul(),n=v=>Math.round(v*m);let e,t,extra='';
  switch(k){
    case 'xiu':e={xiuwei:n(R*2)};t=`红烛高照，你与${p.name}结发同修，灵力在两人经脉间往复流转。`;break;
    case 'bing':e={wugong:n(40)};t=`${p.name}替你把私兵从头到尾操练了一遍。`;break;
    case 'jian':e={guard:Math.min(CFG.guardMax-S.guard,n(8))};t=`${p.name}亲自给府中护院指点剑法，又重排了夜里的岗哨。`;break;
    case 'zhen':S.zhen=1;e={};t=`${p.name}在静室四周布下护身阵法。`;extra='下次渡劫，三道天雷的根骨要求各 −5';break;
    case 'yi':e={};S.injured=0;S.hurt=false;t=`${p.name}替你行针换药，旧伤一夜之间好了大半。`;extra='伤势痊愈';break;
    case 'shang':e={silver:n(200)};t=`${p.name}替你盘了一遍产业的账，又谈下几笔好买卖。`;break;
    case 'zheng':e={wengong:n(45)};t=`${p.name}替你理清了几桩积压的公文，见解比属官还老道。`;break;
    case 'mou':e={suspicion:-n(8)};t=`${p.name}给京中故旧写了几封信，替你说了几句好话。`;break;
    case 'shan':e={merit:n(25)};t=`${p.name}以你的名义在城外施粥济贫。`;break;
    case 'ansha':e={suspicion:-15};t=`${p.name}消失了两夜。回来时一言不发，京中却传来一位政敌暴毙的消息。`;break;
  }
  const s=apply(e);const a0=p.aff;p.aff=clamp(p.aff+3,0,100);if(p.type==='武'&&(p.realm||0)<S.realm)p.realm++;
  return {k,t:t+(dbl?'\n心意相通，这一次的收获格外丰厚。':''),sum:[s,extra,p.aff>a0?`${p.name}好感 +${p.aff-a0}`:''].filter(Boolean).join('，')}}

/* ================= 寻访机缘：纯抽奖，点了直接出结果 ================= */
const SEEK_P=[['大吉',5],['有缘人',20],['吉',28],['平',22],['凶',25]];
const canMeet=()=>S.partners.length<CFG.knownMax;
function luckP(){const un=PT.filter(t=>!S.metT[t.id]);const t=pick1(un.length?un:PT);const p=makePartner(t);p.met=true;
  const ro=t.meet.opts.find(o=>o.check)||t.meet.opts[0];p.aff=(ro.eff&&ro.eff.aff)||10;p.cm=rollCm();return {p,t,ro}}
function meetDone(L){const {p,t,ro}=L;S.partners.push(p);S.metT[t.id]=1;logAdd(`结识${p.origin}${p.name}`);
  const rest={...(ro.eff||{})};['aff','meet','_t'].forEach(k=>delete rest[k]);const ex=apply(rest);
  return `${fill(t.meet.text,{p})}\n${fill(ro.eff&&ro.eff._t,{p})}\n（有缘人：你结识了${p.origin}「${p.name}」，${typeTxt(p)}，${cmTxt(p)}，好感 ${p.aff}${ex?'；'+ex:''}）`}
function meetByLuck(){return meetDone(luckP())}
/* 后宅满了又来了新人：选一位没结亲的遣散（付遣散费、后宅安宁下降），换新人进门；或者放弃新人 */
function replaceScene(np,intro,onAdd,onMiss){const ta=np.g==='f'?'她':'他';
  const opts=S.partners.filter(q=>!q.married).map(q=>{const c=dismissCost(q);return {label:`遣散${q.name}，留下${np.name}`,
    hint:S.silver<c?`银两不够（遣散费 ${c}）`:`${q.name}：${cmTxt(q)}，好感 ${q.aff}；遣散费 银两 ${c}，后宅安宁 −${CFG.dismissHarmony}`,disabled:S.silver<c,run(){
      queue.unshift({who:q,title:`遣散${q.name}？`,text:`你确定要遣散${q.name}（${cmTxt(q)}，好感 ${q.aff}），把${np.name}留下吗？\n${q.name}会离开，从此不再回来。\n（银两 −${c}，后宅安宁 −${CFG.dismissHarmony}）`,options:[
        {label:'确定遣散',run(){if(S.silver<c)return;S.silver-=c;S.partners=S.partners.filter(x=>x!==q);S.harmony=clamp(S.harmony-CFG.dismissHarmony,0,100);logAdd(`遣散${q.name}`);
          const t=onAdd();result(`${np.name}入府`,`你备了一份盘缠，送${q.name}出府。\n${t}\n（银两 −${c}，后宅安宁 −${CFG.dismissHarmony}）`,np)}},
        {label:'算了',hint:'不遣散，回到上一步',run(){queue.unshift(replaceScene(np,intro,onAdd,onMiss))}}]})}}});
  opts.push(onMiss);
  return {who:np,title:`后宅已满：${np.name}`,text:`${intro}\n后宅已有 ${CFG.knownMax} 人。要留下${ta}，得先遣散一位没结亲的人。\n${np.name}：${cmTxt(np)}，${typeTxt(np)}`,options:opts}}
function seekDraw(dm){
  let r=Math.random()*100,tier='凶';for(const[t,w]of SEEK_P){if(r<w){tier=t;break}r-=w}
  if(tier==='有缘人'&&!canMeet()){const L=luckP();const p=L.p;
    return {tier,text:`山路上你遇到了一位${p.origin}「${p.name}」。（有缘人）`,after:replaceScene(p,`${p.origin}「${p.name}」对你颇有好感。`,()=>meetDone(L),{label:'错过',hint:`不遣散任何人，${p.name}会离开`,run(){logAdd('后宅已满，错过有缘人');result('错过',`你看着${p.name}走远，没有挽留。`,p)}})}}
  const R=CFG.retreatBase*lingMul();const g=e=>apply(dimEff(e,dm));let t,sum='';
  if(tier==='大吉'){const c=['fu'];if((S.dongtian||0)<3)c.push('dt');if(!S.treasure&&S.realm<27)c.push('bao');const k=pick1(c);
    if(k==='dt'){S.dongtian=(S.dongtian||0)+1;t='你在深山里寻到一处洞天福地，灵气浓得化不开。';sum=`闭关修为永久 +10%，现在共 +${S.dongtian*10}%`}
    else if(k==='bao'){S.treasure=1;t='古修洞府的石台上，静静放着一件护体法宝。';sum='得到护体法宝：下次渡劫时直接用它护体，不用再花钱'}
    else{t='你误入一座上古遗府，石壁上刻满了前人的心得。';sum=g({xiuwei:Math.round(R*6.5),merit:40})}
    logAdd('寻访大吉')}
  else if(tier==='有缘人')return {tier,text:meetByLuck()};
  else if(tier==='吉'){const k=rand(3);t=['山中老道与你论道一夜，你豁然开朗。','你在古墓旁捡到一匣前朝金叶子。','你顺手救下一村被山洪围困的百姓。'][k];sum=g([{xiuwei:Math.round(R*3.2)},{silver:320},{merit:40}][k])}
  else if(tier==='平'){const k=rand(4);t=['路边的茶棚里，一位樵夫随口说了几句吐纳的诀窍。','山民卖给你一株老参，转手还赚了些。','你帮一户人家寻回了走失的孩子。','你在山里转了几天，什么也没遇到。'][k];sum=k<3?g([{xiuwei:Math.round(R*0.8)},{silver:60},{merit:8}][k]):'白跑一趟'}
  else{const k=rand(3);t=['山道上遇到劫匪，你中了一刀。','盘缠在客栈里被人偷了。','你误入一座古阵，幻象缠身，好几天才走出来。'][k];
    sum=k===0?apply({injured:1}):k===1?(()=>{const v=Math.min(S.silver,Math.round(80*rankMul()));S.silver-=v;return `银两 −${v}`})():apply({xinmo:6})}
  return {tier,text:`${t}\n（${tier}${sum?'：'+sum:''}）`}}

/* ================= 事件池 ================= */
const ALL_EV=[...EV_GOV,...EV_MIL,...EV_TRV,...EV_CUL,...EV_HAR,...EV_CRT,...EV_RND];
const TASKMAP=Object.fromEntries([...ALL_EV,...EV_YEAREND].map(t=>[t.id,t]));
function condOK(c){if(!c)return true;
  if(c.partners&&S.partners.length<c.partners)return false;if(c.married&&married().length<c.married)return false;
  if(c.rankMin&&S.rank<c.rankMin)return false;if(c.rankMax&&S.rank>c.rankMax&&!(S.rank>=10&&c.rankMax>=7))return false;
  if(c.realmMin&&S.realm<c.realmMin)return false;if(c.realmMax&&S.realm>c.realmMax)return false;
  if(c.months&&!c.months.includes(S.month))return false;return true}
function evOK(t){if(t.needP&&!S.partners.length)return false;if(t.needP2&&married().length<2)return false;return true}
function pickFrom(pool){const now=mi();pool=pool.filter(t=>!S.done[t.id]&&!(S.cd[t.id]>now)&&condOK(t.cond)&&evOK(t));
  if(!pool.length)return null;let r=Math.random()*pool.reduce((a,t)=>a+(t.w||10),0);for(const t of pool){r-=(t.w||10);if(r<=0)return t}return pool[0]}
const pickTask=cat=>pickFrom(ALL_EV.filter(t=>t.cat===cat));
function ctxFor(t){if(t.needP2){const [a,b]=shuffle(married());return {a,b}}if(t.needP)return {p:pick1(S.partners)};return {}}
function sceneFor(t,tg){const sc=taskScene(t,ctxFor(t));if(BG[t.cat])sc.bg=t.cat;if(tg&&!t.major)sc.tag=tg;return sc}

/* ================= 晋升 =================
   条件见 config.js 的 RANK_REQ：文功、武功、银两（晋升时扣除），民心门槛、境界，第7~10阶另需路线条件（兵变线：兵力比；民心线：民心）。 */
const rankLbl=r=>`第 ${r} 阶「${rankName(r)}」`;
const rankGap=r=>S.rank>=r?`帝业${rankLbl(r)}（已达到）`:`帝业${rankLbl(r)}（你现在${rankLbl(S.rank)}）`;
const promoKey=r=>r<=6?String(r):r+(S.route||'a');
function promoNeed(r){const q=RANK_REQ[r];if(!q)return null;
  const rt=S.route||'a';const o={wen:r>=7?(rt==='a'?q.wenA:q.wenB):q.wen,wu:r>=7?(rt==='a'?q.wuA:q.wuB):q.wu,silver:(r>=7&&rt==='b'&&q.silverB)?q.silverB:q.silver,minxin:q.minxin,realm:q.realm};
  o.acts=CFG.promoActBase+CFG.promoActPerRank*r;
  if(r>=7){if(S.route==='a')o.ratio=q.a;else o.minxin=Math.max(o.minxin,q.b)}return o}
/* 上次晋升以来做了多少次治理、军务 */
const actsSince=d=>(S.stat[d]||0)-((S.statP&&S.statP[d])||0);
function promoReady(r){const q=promoNeed(r);if(!q)return false;
  return S.wengong>=q.wen&&S.wugong>=q.wu&&S.silver>=q.silver&&S.minxin>=q.minxin&&S.realm>=q.realm&&(q.ratio==null||ratio()>=q.ratio)&&actsSince('治理')>=q.acts&&actsSince('军务')>=q.acts}
function startPromo(r){
  const P=PROMO2[promoKey(r)];let wins=0;const n=P.steps.length;
  const steps=P.steps.map((st,i)=>({tag:`晋升 ${i+1}/${n}`,title:P.name,text:st.text,options:buildOpts(st.opts.filter(o=>o.check),{promo:1},o=>{
    const res=runOpt(o,{promo:1});if(!o._auto)wins++;
    if(i===n-1)queue.unshift(promoEnd(r,wins));
    result(P.name,o._auto?st.lose+(res.text?'\n'+res.text:''):(res.text?res.text+'\n':'')+st.win);
  },st.loseEff||{})}));
  queue.push({tag:'晋升大事件',bg:bgOfOpts(P.steps[0]&&P.steps[0].opts),title:`晋升契机：${P.name}`,text:P.intro+`\n\n（共 ${n} 关，过 ${n-1} 关即可晋升「${rankName(r)}」。每关属性达标就能过，不达标只能勉强应付，这一关算失利。晋升成功将花费文功 ${fmt(promoNeed(r).wen)}、武功 ${fmt(promoNeed(r).wu)}、银两 ${fmt(promoNeed(r).silver)}。）\n\n晋升之后，事件的要求会更高，更难应付。`+(CH_PROMO[S.chap]===r&&!CH_DEF[S.chap].done()&&!S.acc?(chLeft()>2?`\n阶段期限：第 ${chDue()} 年腊月底，${chLeftTxt()}。条件已经提前达成，可以现在晋升；也可以先继续准备（练属性、攒银两、补守卫），准备好了再到「帝业」页上表，只要在期限前晋升就行。`:`\n阶段期限：第 ${chDue()} 年腊月底，${chLeftTxt()}。期限快到了，建议尽快晋升。`):''),options:[
    {label:'现在晋升',get hint(){const q=promoNeed(r);return promoReady(r)?`先把晋升花费押上：文功 −${fmt(q.wen)}，武功 −${fmt(q.wu)}，银两 −${fmt(q.silver)}；失利会退回`:'晋升条件已经不够了（刚才有花销），这次只能放过'},get disabled(){return !promoReady(r)},run(){const q=promoNeed(r);S.promoHold={wen:q.wen,wu:q.wu,silver:q.silver};S.wengong-=q.wen;S.wugong-=q.wu;S.silver-=q.silver;queue.unshift(...steps)}},
    {label:'先做准备，稍后再上表',get hint(){return '不再自动提醒；准备好了到「帝业」页点「上表求晋升」'+(CH_PROMO[S.chap]===r&&chLeft()<=2?'；期限快到了，别拖过期限':'')},run(){S.promoPause=true;logAdd('暂缓晋升')}}]});
}
function promoEnd(r,wins){
  const P=PROMO2[promoKey(r)];const n=P.steps.length;
  if(wins>=n-1){const q=S.promoHold||promoNeed(r);S.promoHold=null;S.rank=r;if(S.route==='b'&&r>=7){S.suspicion=clamp(S.suspicion-CFG.routeBPromoSusp,0,100)}S.statP={治理:S.stat.治理||0,军务:S.stat.军务||0};const s=`文功 −${fmt(q.wen)}，武功 −${fmt(q.wu)}，银两 −${fmt(q.silver)}（晋升花费），`+(S.route==='b'&&r>=7?`朝廷安抚：猜忌 −${CFG.routeBPromoSusp}，`:'')+apply(P.reward);logAdd(`晋升「${rankName(r)}」`);
    return {who:me(),tag:'晋升',title:`晋升：${rankName(r)}`,text:`${P.win}\n（${s}）`,options:[{label:'继续',run(){if(r===6)queue.unshift(routeScene())}}]};}
  if(S.promoHold){S.wengong+=S.promoHold.wen;S.wugong+=S.promoHold.wu;S.silver+=S.promoHold.silver;S.promoHold=null}
  const lw=Math.round(S.wengong*CFG.promoFailLoss/100),lu=Math.round(S.wugong*CFG.promoFailLoss/100);S.wengong-=lw;S.wugong-=lu;S.suspicion=clamp(S.suspicion+10,0,100);S.promoCD=mi()+2;logAdd(`${P.name}失利`);
  return {who:me(),title:`${P.name}：失利`,text:`${P.lose}\n（押上的晋升花费已退回；文功 −${lw}，武功 −${lu}，猜忌 +10，两个月后才有下一次契机）`,options:[{label:'继续',run(){}}]};
}
/* 第6阶后选路线 */
function routeScene(){const q=RANK_REQ;return {who:me(),tag:'路线抉择',title:'削藩之后',text:`削藩诏的风波过去，天下都在看你下一步怎么走。\n兵变线晋升看兵力比（${q[7].a}%→${q[10].a}%），起兵后不再有猜忌，但年年征讨。民心线晋升看民心（${q[7].b}→${q[10].b}），不动刀兵，猜忌一直都在。选定后不能更改。`,options:[
  {label:'兵变线：起兵靖难',hint:'晋升武功要求高、看兵力比；武功、私兵来得快，心魔、民心代价大',run(){S.route='a';logAdd('选择兵变线');result('起兵','你把削藩诏扔进了火盆。帐外，私兵们磨刀的声音彻夜不停。')}},
  {label:'民心线：万民归心',hint:`晋升文功要求高、看民心；文功、功德来得多，猜忌压力大。民心 ${CFG.routeBSuspLo} 以上猜忌每月自然下降，每次晋升猜忌 −${CFG.routeBPromoSusp}`,run(){S.route='b';logAdd('选择民心线');result('归心','你把削藩诏供在案上，第二天开仓放粮、减租三成。消息一路传到了玉京。')}}]}}

/* ================= 渡劫 ================= */
/* 渡劫：三道天雷的根骨要求 = 基准（上限的 70% / 85% / 100%）上下浮动，渡劫时才揭晓；道侣阵法 −5。
   挡下护体 −10，没挡住护体 −tribHit；护体归零失败。第四关悟道看悟性，要求是确定的。 */
function tribReq(){const cap=attrCap();const z=S.zhen?5:0;const base=[0.7,0.85,1].map(f=>Math.round(cap*f));
  return {base,lo:base.map(d=>Math.max(1,d-CFG.tribRollLo-z)),hi:base.map(d=>Math.min(cap,d+CFG.tribRollHi)-z),xd:Math.min(cap,Math.round(cap*0.55+S.xinmo/2+(S.harmony<40?10:0)))}}
const tribLoss=(f,hit)=>f*(hit||CFG.tribHit)+(3-f)*10;
function tribScene(key){
  const T=TRIB[key];const mc=meritNeed(key);
  const {lo,hi,xd}=tribReq();const fc=Math.round(200*rankMul());const mg=Math.round(mc*CFG.meritGuardRatio);const g=S.attr.gengu;
  const fBest=lo.filter(d=>g<d).length,fWorst=hi.filter(d=>g<d).length;const die=S.xinmo>60;
  /* 结论不显示给玩家（_v 只给测试用） */
  const pv=(hp,hit,xdx)=>{const wuOk=S.attr.wuxing>=xd+(xdx||0),best=hp-tribLoss(fBest,hit)>0,worst=hp-tribLoss(fWorst,hit)>0;
    if(!wuOk)return die&&!worst?'必败：悟道过不去'+(best?'，天雷偏强还会当场陨落':'，天雷也挡不住，会当场陨落'):'必败：悟道过不去';
    if(!best)return die?'必败：天雷挡不住，会当场陨落':'必败：天雷挡不住';
    return worst?'必定成功':(die?'有风险：天雷偏强就会当场陨落':'有风险：天雷偏强就会失败')};
  const run=(hp,guard,mod)=>{S.merit-=mc;tribRun(key,hp,guard,xd,mod||{})};
  /* 护体 100 的准备：自动用最省的方式 */
  const prep=S.treasure?{how:'用寻访得到的护体法宝，不花钱',ok:true,pay(){S.treasure=0}}:S.silver>=fc?{how:`花费 银两 ${fc} 炼制护体法宝`,ok:true,pay(){S.silver-=fc}}:S.merit>=mc+mg?{how:`银两不够，改用 功德 ${mg} 护体`,ok:true,pay(){S.merit-=mg}}:{how:`需要 银两 ${fc}，或者 功德 ${mg}`,ok:false,pay(){}};
  const helperOpt=p=>{const wu=p.type==='武';const risky=isAssassin(p)&&!assassinFree(p);const hit=wu?CFG.tribHit-10:0,xdx=wu?0:-5;
    return {label:`请${p.name}护法`,_v:pv(100,hit,xdx),hint:`${p.type}类：护体 100，${wu?`没挡住的天雷只扣护体 ${CFG.tribHit-10}`:'悟道的悟性要求 −5'}；${p.name}好感 +10${risky?`；${p.name}心结未解，有 10% 几率临阵退缩（只剩护体 70、没有加成）`:''}`,
      run(){if(risky&&Math.random()<0.1){S.merit-=mc;tribRun(key,70,null,xd,{flinch:p});return}run(100,p,{hit:hit||0,xdx})}}};
  const ms=married();const best=[pv(70),prep.ok?pv(100):null].concat(ms.map(p=>pv(100,p.type==='武'?CFG.tribHit-10:0,p.type==='武'?0:-5)));
  const tip=pv(70)==='必定成功'?'以你现在的根骨和悟性，闭关稳固就必定成功。':best.includes('必定成功')?'闭关稳固不够稳，做好准备或请道侣护法就能必定成功。':best.some(x=>x&&x.startsWith('有风险'))?'怎么准备都有风险，也可以再等等，先练根骨和悟性。':'现在怎么准备都过不去，建议再等等，先练根骨和悟性。';
  const opts=[
    {label:'闭关稳固，直接渡劫',_v:pv(70),hint:'不花费，护体 70',run(){run(70)}},
    {label:'备好护体再渡劫',_v:prep.ok?pv(100):'必败',hint:`护体 100，${prep.how}`,disabled:!prep.ok,run(){prep.pay();run(100)}}];
  if(ms.length===1)opts.push(helperOpt(ms[0]));
  else if(ms.length>1)opts.push({label:'请道侣护法',hint:'护体 100，外加道侣的加成；点进去选请哪一位',run(){queue.unshift({who:me(),tag:'渡劫',title:`${T.name}：请谁护法`,text:'请哪一位道侣为你护法？',options:[...ms.map(helperOpt),{label:'返回',hint:'回到渡劫准备',run(){queue.unshift(tribScene(key))}}]})}});
  opts.push({label:'再等等',hint:'先不渡劫，继续修炼根骨和悟性',run(){}});
  return {who:me(),tag:'渡劫',bg:'修行',title:`${T.name}：准备`,text:`${T.intro}\n\n消耗功德 ${mc}。三道天雷考根骨，强弱要到渡劫时才知道，要求大约 ${lo.map((d,i)=>d===hi[i]?d:`${d}~${hi[i]}`).join(' / ')}（你 ${g}${S.zhen?'；已算上道侣阵法 −5':''}）。挡下的护体 −10，没挡住的护体 −${CFG.tribHit}，护体归零即失败。\n第四关悟道：要求悟性 ${xd}（你 ${S.attr.wuxing}；心魔越高、后宅越不宁，要求越高）。\n成功：境界提升，全属性 +2，三道都挡下算完美渡劫 +3。失败：跌回上一层，重伤三月，所耗功德不退。`+(die?`\n心魔太重：要是被天雷打碎护体，会当场陨落。`:''),options:opts};
}
function tribRun(key,hp,guard,xd,mod){
  mod=mod||{};const T=TRIB[key];const {lo,hi}=tribReq();const ds=lo.map((l,i)=>l+rand(hi[i]-l+1));const hit=mod.hit||CFG.tribHit;xd+=mod.xdx||0;
  const L=[(mod.flinch?`${mod.flinch.name}临到阵前，手却松开了。你只能独自扛这场劫。\n`:'')+(guard?`${guard.name}为你护法。`:'')+`初始护体 ${hp}。`+(S.zhen?'道侣布下的阵法替你分去了一部分雷威（根骨要求各 −5）。':'')];let failed=0;S.zhen=0;
  ds.forEach((d,i)=>{if(S.attr.gengu>=d){hp-=10;L.push(`${T.rounds[i]}\n→ 这道天雷要根骨 ${d}，你 ${S.attr.gengu}，挡下了，护体 −10。`)}
    else{hp-=hit;failed++;L.push(`${T.rounds[i]}\n→ 这道天雷要根骨 ${d}，你 ${S.attr.gengu}，没挡住，护体 −${hit}。`)}});
  const fall=()=>{S.injured=3;S.realm=Math.max(1,S.realm-1);S.xiuwei=0};
  if(hp<=0){if(S.xinmo>60){gameOver('渡劫陨落','护体尽碎，心魔趁虚而入。你没能走出这场劫。');return}
    fall();L.push(`护体破碎。${T.fail}（跌回${realmName(S.realm)}，重伤三月）`);logAdd(`${T.name}失败`);result('渡劫失败',L.join('\n\n'));return}
  const xok=S.attr.wuxing>=xd;L.push(`${T.xinmo}\n→ 第四关悟道：悟性 ${S.attr.wuxing}${xok?' ≥ ':' < '}${xd}，${xok?'守住了本心':'没能守住'}。`);
  if(!xok){fall();S.xinmo=clamp(S.xinmo+10,0,100);L.push(`${T.fail}（跌回${realmName(S.realm)}，重伤三月，心魔 +10）`);logAdd(`${T.name}失败`);result('渡劫失败',L.join('\n\n'));return}
  if(key==='feisheng'){S.realm=27;victory(T.win);return}
  S.realm++;S.xiuwei=carryXiu(xiuNeed(S.realm-1));Object.keys(ATTR).forEach(k=>gainAttr(k,failed?2:3));
  L.push(`${T.win}\n${failed?'':'完美渡劫！'}脱胎换骨：全部属性 +${failed?2:3}，属性上限提高到 ${attrCap()}。`);
  if(guard){guard.aff=clamp(guard.aff+10,0,100);L.push(`${guard.name}为你护法，好感 +10。`)}
  logAdd(`渡过${T.name}，晋入${realmName(S.realm)}`);result(T.name,L.join('\n\n'),me());
}
/* 小境界突破 */
function breakInfo(){
  const key=TRIB_AT[S.realm];
  if(key){const miss=[];const rr=TRIB_RANK[key];
    if(key==='feisheng'&&S.rank<10)miss.push(`先登基（你现在${rankLbl(S.rank)}）`);else if(S.rank<rr)miss.push(rr>=10?`先登基（你现在${rankLbl(S.rank)}）`:rankGap(rr));
    if(S.merit<meritNeed(key))miss.push(`功德 ${meritNeed(key)}`);if(S.xinmo>=CFG.xinmoNoBreak)miss.push(`心魔低于 ${CFG.xinmoNoBreak}`);
    return {label:`渡${TRIB[key].name}`,hint:miss.length?'尚缺：'+miss.join('、'):`大境界渡劫，消耗功德 ${meritNeed(key)}`,ok:!miss.length,run(){queue.unshift(tribScene(key))}};}
  const bottle=isBottle(S.realm),need=pillNeed(S.realm),from=realmName(S.realm);
  return {label:bottle?'冲击瓶颈':'突破',hint:need?`消耗破障丹 ${need} 颗（你有 ${S.pill} 颗）`+(bottle?'；瓶颈要双倍':'')+(S.pill<need?'，不够，先去炼丹':''):'不需要破障丹',ok:S.pill>=need,run(){
    S.pill-=need;S.realm++;S.xiuwei=carryXiu(xiuNeed(S.realm-1));logAdd(`突破至${realmName(S.realm)}`);result('突破',`${from}关隘豁然贯通。你晋入${realmName(S.realm)}。`+(need?`\n（破障丹 −${need}）`:''))}};
}

/* ================= 年末大事件 ================= */
const YE_HINT={刺杀:'有消息称，有人花重金买通刺客要你人头。',战乱:'边境不太平，探子说有兵马在集结。',天灾:'钦天监说今冬天象有异。',朝廷:'听说朝中有人在翻你的旧账，钦差可能要来。',宗门:'修仙界最近风声不对。'};
function rollYearEnd(){
  const r=ratio();const w={刺杀:20+S.suspicion/2,战乱:15+Math.max(0,20-r)+(S.route==='a'&&S.rank>=7?40:0),天灾:15,朝廷:8+S.suspicion/2+(S.route==='b'&&S.rank>=7?20:0),宗门:S.realm>=11?15:0};
  let x=Math.random()*Object.values(w).reduce((a,b)=>a+b,0);for(const k in w){x-=w[k];if(x<=0)return k}return '刺杀';
}
function yearEndEvent(){
  const k=S.yeKind||rollYearEnd();S.yeKind=null;
  if(k==='刺杀'){assassination();return}
  const pool=EV_YEAREND.filter(t=>t.kind===k&&condOK(t.cond));const t=pool.length?pick1(pool):null;
  if(!t){assassination();return}
  const wb=k==='战乱'?warBonus():0;const sc=majorScene(t,wb?{bonus:wb}:{});sc.tag=`年末大事：${k}`;if(wb)sc.text+=`\n\n（私兵训练有素：这场战事里每一关的属性都 +${wb}）`;queue.push(sc);
}
/* 训练度让打仗更容易：年末战乱每关属性加成 */
const warBonus=()=>Math.floor(S.train/CFG.warTrainStep);
/* 刺杀 */
const guardParts=()=>({drill:Math.min(6,Math.floor(S.train/15)),wife:Math.min(CFG.guardWifeMax,Math.round(married().reduce((a,p)=>a+(p.type==='武'?5:2)*clamp(cmMul(p),0.6,1.2),0))),troops:Math.min(5,Math.floor(S.troops/2000)),guard:S.guard,keep:Math.min(10,S.partners.filter(p=>p.tid==='assassin').length*5)});
const guardBonus=()=>{const g=guardParts();return g.wife+g.troops+g.guard+g.keep+g.drill};
const guardTxt=()=>{const g=guardParts();return `武类道侣 +${g.wife}，私兵 +${g.troops}，训练度 +${g.drill}，府中守卫 +${g.guard}`+(g.keep?`，收服的护卫 +${g.keep}`:'')};
/* 投奔：民心越高、治下人口越多（帝业越高），每月来投奔的人越多 */
const popMul=()=>1+0.5*(S.rank-1);
const volunteers=()=>S.minxin>=CFG.recruitMin?Math.round((S.minxin-CFG.recruitOffset)*CFG.recruitMul*popMul()):0;
/* 刺客夜袭：每月都可能发生，猜忌越高越频繁。防刺客总加成达标才能拿下 */
const raidReq=()=>10+(S.rank-1)*5;
function raidScene(){const q=raidReq();const lostOf=()=>Math.round(S.silver*0.05);const injN=()=>S.injured>0?S.injured+1:1;
  return {who:me(),tag:'刺客夜袭',bg:'军务',title:'夜半刀光',get text(){return `深夜，王府后院传来瓦片碎裂声，有人摸进来了。\n（防刺客总加成 ${guardBonus()}，拿下需要 ${q}：${guardTxt()}）`},options:[
    {label:'暗哨收网，当场拿下',get hint(){return `需要防刺客加成 ${q}（你 ${guardBonus()}）；奖励：功德 +${Math.round(3*rankMul())}；守卫折损 −${CFG.raidGuardWear}`},reward:true,get disabled(){return guardBonus()<q},run(){logAdd('夜袭的刺客被拿下');S.guard=Math.max(0,S.guard-CFG.raidGuardWear);result('夜袭',`暗哨早有准备，刺客还没摸到书房就被按在了地上。\n（${apply({merit:3})}，守卫 −${CFG.raidGuardWear}）`)}},
    {label:'惊醒迎敌',get hint(){return `后果：下月起负伤 ${injN()} 个月，库房被劫 银两 −${lostOf()}，守卫折损 −${CFG.raidGuardWear}`},run(){const lost=lostOf();S.injured=injN();S.silver-=lost;S.guard=Math.max(0,S.guard-CFG.raidGuardWear);logAdd('夜袭受伤');result('夜袭',`你从睡梦中惊起，挨了一刀，刺客卷了库房的银子跑了。\n（下月起负伤 ${S.injured} 个月，银两 −${lost}，守卫 −${CFG.raidGuardWear}）`)}}]}}
const assassinReq=()=>reqBase()+(S.feud||0)-(S.intel?10:0);
function assassinPreview(){const gb=guardBonus(),d=assassinReq();return ['wulue','xinji'].map(k=>({k,d,ok:S.attr[k]+gb>=d}))}
/* 刺客：年末大事里有，平时每月也可能来（第 3 年起）。武类刺客夜里行刺，文类刺客扮成高门子弟登门讨教诗文。才貌出现时就定下 */
const newAssassin=()=>{const g=opp();const type=Math.random()<0.5?'武':'文';return {name:randName(g),g,type,origin:'刺客',img:pickImg(g),cm:rollCm(CFG.assassinCmHigh,CFG.assassinCmMid)}};
const assnLook=a=>`${a.name}：${cmTxt(a)}，${a.type}类`;
function assassination(monthly){
  const a=newAssassin();const g=a.g;const guard=guardBonus();const d=assassinReq();
  S.guard=Math.max(0,S.guard-CFG.assassinGuardWear);S.intel=0;
  const win=k=>{logAdd(`擒获刺客${a.name}`);queue.unshift(prisonerScene(a));result('刺杀',`【${ATTR[k]} ${S.attr[k]} + 加成 ${guard} ≥ ${d}】\n刺客被你制住，押了下去。`,a)};
  const open=a.type==='武'?(monthly?`深夜，王府后院传来一声轻响。一道身影自梁上掠下，是一名${g==='f'?'女':'男'}刺客，招招直取要害。`:`年末守岁，府中灯火通明。一道身影自梁上掠下，是一名${g==='f'?'女':'男'}刺客，招招直取要害。`)
    :`一位自称高门${g==='f'?'小姐':'公子'}的人递帖求见，说仰慕殿下文名，想讨教诗文。席间谈笑风生，${g==='f'?'她':'他'}袖中却寒光一闪。`;
  queue.push({who:a,tag:monthly?'刺客':'年末大事：刺杀',title:'刺杀',text:`${open}\n（防刺客加成 +${guard}：${guardTxt()}）`,options:[
    {label:'正面迎战',attr:'wulue',hint:needTxt('wulue',d,guard)+'；奖励：擒获刺客',disabled:S.attr.wulue+guard<d,run(){win('wulue')}},
    {label:a.type==='武'?'设局诱擒':'识破伪装，当场拿下',hint:needTxt('xinji',d,guard)+'；奖励：擒获刺客',disabled:S.attr.xinji+guard<d,run(){win('xinji')}},
    {label:'闭门死守',hint:S.injured>0||S.hurt?'后果：旧伤未愈又添新伤，下月起负伤 6 个月，心魔 +10':'后果：下月起负伤 3 个月，刺客逃走',run(){
      const old=S.injured>0||!!S.hurt;S.injured=old?6:3;if(old)S.xinmo=clamp(S.xinmo+10,0,100);logAdd('遇刺重伤');result('刺杀',`刀锋入肉，你重伤倒地，刺客趁乱逃走。\n（下月起负伤 ${S.injured} 个月${old?'，心魔 +10':''}）`,a)}}]});
}
function prisonerScene(a,again){
  const ta=a.g==='f'?'她':'他';const full=S.partners.length>=CFG.knownMax;
  return {who:a,title:`处置刺客：${a.name}`,text:(again?`${a.name}再次被押在堂下，眼里全是恨意。`:`刺客${a.name}被押在堂下，一言不发。`)+`\n${assnLook(a)}`,options:[
    {label:'审问后处决',hint:'拿到幕后主使的把柄：猜忌 −10；心魔 +12，对方结仇，以后的刺客更难对付（难度 +3）',run(){
      const m=pick1(['严崇府上','邻藩平阳王','京中某位宗室']);S.feud=(S.feud||0)+3;logAdd(`处决刺客，查出主使是${m}`);
      result('审问',`几番拷问，刺客吐露主使出自${m}。你把供词收好，人押了下去，再没出来。\n（${apply({suspicion:-10,xinmo:12},null,true)}，以后的刺客难度 +3）`)}},
    ...(again?[shameOpt(a)]:[
    {label:'严刑逼供',hint:`把一切都榨出来：猜忌 −20，另外随机得到 赃银 / 修为心得 / 刺客组织的情报（下次刺杀要求 −10）之一；心魔 +${CFG.tortureXinmo}，对方结仇（难度 +3）；刺客会趁乱逃走，下个月起连续三个月来报复`,run(){
      S.feud=(S.feud||0)+3;const k=pick1(['silver','xiu',...(S.intel?[]:['intel'])]);let e={suspicion:-20,xinmo:CFG.tortureXinmo},x='';
      if(k==='silver')e.silver=300;else if(k==='xiu')e.xiuwei=Math.round(CFG.retreatBase*3*lingMul());else{S.intel=1;x='，得到刺客组织的情报：下次刺杀要求 −10'}
      const sum=apply(e);logAdd(`严刑逼供刺客${a.name}`);S.revenge={name:a.name,g:a.g,img:a.img,type:a.type,cm:a.cm,next:mi()+1,left:CFG.revengeMonths};
      result('严刑逼供',`刑房里的灯亮了三天三夜。${a.name}最后什么都说了。\n第四天清晨，牢门大开，人不见了，墙上用血写着一个字：等。\n（${sum}${x}，以后的刺客难度 +3；${a.name}逃走了，下个月起会来报复）`)}}]),
    {label:'收为己用',get hint(){return `${cmTxt(a)}，${a.type||'武'}类；`+'得到一名护卫：防刺客加成永久 +5，开启好感线；好感太低时可能反水行刺。结为道侣后双修收益更大，但羁绊没走完前会设法出逃'+(full?`；后宅已满 ${CFG.knownMax} 人，要先遣散一位没结亲的人`:'')},run(){
      const p=makePartner(null,a);p.met=true;p.aff=10;p.cm=a.cm!=null?a.cm:rollCm(CFG.assassinCmHigh,CFG.assassinCmMid);a.cm=p.cm;
      const add=()=>{S.partners.push(p);S.bodyguard=Math.min(10,(S.bodyguard||0)+5);logAdd(`收服刺客${a.name}`);return `${a.name}沉默良久，终于跪下：「这条命，以后是殿下的。」\n（防刺客加成永久 +5，${a.name}好感 10）`};
      if(full){queue.unshift(replaceScene(p,`${a.name}愿意归顺。`,add,{label:'算了',hint:'不收服，回去重新处置',run(){queue.unshift(prisonerScene(a,again))}}));return}
      result('收服',add(),p)}},
    {label:'释放',hint:`功德 +${Math.round(20*rankMul())}，心魔 −8；对方回去报信，猜忌 +8`,run(){result('释放',`你命人解开绳索，放${a.name}离去。${ta}回头看了你一眼。\n（${apply({merit:20,xinmo:-8,suspicion:8})}）`)}}]};
}

/* ================= 逼供后的报复 =================
   刺客逃走后，下个月起连续 revengeMonths 个月每月来一次。比武略或心机 + 防刺客加成；
   她的身手只知道大概范围，来了才揭晓。打赢一次就再次擒获（不能再逼供，可以羞辱换钱）；
   打不过当月负伤、库房被劫；全都打不过，威名受损。 */
const revengeRange=()=>{const b=assassinReq()+CFG.revengeOffset;return [Math.max(5,b-CFG.revengeSpread),b+CFG.revengeSpread]};
function revengeScene(){const r=S.revenge;const [lo,hi]=revengeRange();const gb=guardBonus();const a={name:r.name,g:r.g,img:r.img,origin:'刺客',type:r.type||'武',cm:r.cm!=null?r.cm:rollCm(CFG.assassinCmHigh,CFG.assassinCmMid)};r.cm=a.cm;const ta=r.g==='f'?'她':'他';
  const fight=k=>{const need=lo+rand(hi-lo+1);const v=S.attr[k]+gb;S.revenge.left--;S.revenge.next=mi()+1;
    if(v>=need){S.revenge=null;logAdd(`再次擒获${r.name}`);queue.unshift(prisonerScene(a,true));result('报复',`【${ATTR[k]} ${S.attr[k]} + 加成 ${gb} = ${v}，${ta}这次的身手 ${need}】\n${ta}又来了，这一次没能走掉。`,a);return}
    const lost=Math.round(S.silver*0.05);S.silver-=lost;S.injured=Math.max(S.injured,1);let t=`【${ATTR[k]} ${S.attr[k]} + 加成 ${gb} = ${v}，${ta}这次的身手 ${need}】\n${ta}来去如风，你中了一刀，库房也被洗劫。\n（下月起负伤 1 个月，银两 −${lost}）`;
    if(S.revenge.left<=0){S.revenge=null;S.minxin=clamp(S.minxin-CFG.shameMinxin,0,100);S.suspicion=clamp(S.suspicion+CFG.shameSusp,0,100);S.xinmo=clamp(S.xinmo+CFG.shameXinmo,0,100);logAdd(`${r.name}报复得手，威名受损`);
      t+=`\n\n${r.name}临走前在王府门口留下一行字，满城都在传你连一个刺客都拿不住。\n（威名受损：民心 −${CFG.shameMinxin}，猜忌 +${CFG.shameSusp}，心魔 +${CFG.shameXinmo}）`}
    else{logAdd(`${r.name}来报复`);t+=`\n（${ta}还会再来，还剩 ${S.revenge.left} 次）`}
    result('报复',t,a)};
  return {who:a,tag:'刺客报复',title:`${r.name}回来报仇`,text:`刺客${r.name}再次回来了。`,options:[
    {label:'正面迎战',attr:'wulue',hint:`武略 ${S.attr.wulue} + 加成 ${gb} = ${S.attr.wulue+gb}，要对上 ${lo}~${hi}`,run(){fight('wulue')}},
    {label:'设局诱擒',hint:`心机 ${S.attr.xinji} + 加成 ${gb} = ${S.attr.xinji+gb}，要对上 ${lo}~${hi}`,run(){fight('xinji')}}]}}
const SHAMES=[
  ['游街示众','剃去长发，枷号游街三日，随身的兵刃暗器拍卖给黑市',1.0,10],
  ['卖作矿奴','卖给北山的矿场，锁上铁链去挖矿',1.2,12],
  ['刺字发配','脸上刺字，发配边关军屯为奴',0.9,10],
  ['关笼展览','关进兽笼，在庙会上供人围观收钱',1.1,14],
  ['卖给盐场','卖给人牙子，送去海边盐场做苦工',1.3,12],
  ['当众请罪','押到城门口当众磕头认罪，再把随身的师门信物高价卖出',0.8,8]];
function shameOpt(a){const ta=a.g==='f'?'她':'他';
  return {label:'羞辱换钱',hint:`随机一种羞辱的办法，换一笔银两；心魔会加重`,run(){const [n,t,m,x]=pick1(SHAMES);const sv=Math.round(CFG.shameSilver*m);
    const sum=apply({silver:sv,xinmo:x});logAdd(`${n}：${a.name}`);result(n,`你命人把${a.name}${t}。\n${ta}一路上一句话也没说。\n（${sum}）`)}}}

/* ================= 行善 ================= */
const deedDone=()=>S.deedMi===mi();
/* 行善：每月可以选一件，三种做法各有取舍（只能选一种） */
function deedScene(){
  const [n,c0]=DEEDS[S.month];const c=Math.round(c0*rankMul());const x=S.month===7?CFG.deedXinmo*2:CFG.deedXinmo;const m=Math.round(10*rankMul());const done=deedDone();
  const go=(t,cost,eff,ap)=>{if(cost)S.silver-=cost;if(ap){spend('游历','deed');}S.deedMi=mi();logAdd(n);result(n,`${t}\n（${apply(eff,null,true)}）`)};
  queue.unshift({who:me(),bg:'行善',title:'行善',text:`本月善事：${n}。\n每月只能选一种做法。功德是渡劫要消耗的，越往后需要越多。`+(done?'\n\n这个月的善事已经做过了。':''),options:[
    {label:`重金${n}`,hint:done?'这个月已经做过了':`花费 银两 ${c*2}；功德 +${m*2}，民心 +2，心魔 −${x}；不占行动力`,disabled:done||S.silver<c*2,run(){go('你出了大笔银子，事情办得风风光光。',c*2,{merit:m*2,minxin:2,xinmo:-x})}},
    {label:`略尽心意`,hint:done?'这个月已经做过了':`花费 银两 ${Math.round(c/2)}；民心 +3；不占行动力`,disabled:done||S.silver<Math.round(c/2),run(){go('你拨了些银子，交给地方去办。',Math.round(c/2),{minxin:3})}},
    {label:`亲力亲为`,hint:done?'这个月已经做过了':S.ap<=0?'行动力不够':`消耗 行动力 1，不花钱；功德 +${Math.round(m*1.5)}，民心 +3，心魔 −${x*2}`,disabled:done||S.ap<=0,run(){go('你挽起袖子亲自去办，百姓看在眼里。',0,{merit:Math.round(m*1.5),minxin:3,xinmo:-x*2},true)}},
    {label:'返回',run(){}}]});
}

/* ================= 章节（每章一个大目标） ================= */
const CH_DEF=[null,
 {done:()=>S.minxin>=40&&S.realm>=3,prog:()=>`民心 ${S.minxin}/40，${realmName(S.realm)}/练气三层`,due:2},
 {done:()=>S.rank>=2,prog:()=>promoProg(2),due:3},
 {done:()=>S.rank>=3,prog:()=>promoProg(3),due:6},
 {done:()=>S.realm>=11,prog:()=>`${realmName(S.realm)}；筑基需要${rankGap(3)}、功德 ${meritNeed('zhuji')}`,due:8},
 {done:()=>S.rank>=4,prog:()=>promoProg(4),due:10},
 {done:()=>S.rank>=5,prog:()=>promoProg(5),due:12},
 {done:()=>S.rank>=6&&!!S.route,prog:()=>promoProg(6),due:16},
 {done:()=>S.realm>=15,prog:()=>`${realmName(S.realm)}；金丹需要${rankGap(6)}、功德 ${meritNeed('jindan')}`,due:17},
 {done:()=>S.rank>=7,prog:()=>promoProg(7),due:22},
 {done:()=>S.rank>=8,prog:()=>promoProg(8),due:26},
 {done:()=>S.rank>=9,prog:()=>promoProg(9),due:33},
 {done:()=>S.realm>=19,prog:()=>`${realmName(S.realm)}；元婴需要${rankGap(9)}、功德 ${meritNeed('yuanying')}`,due:34},
 {done:()=>S.rank>=10,prog:()=>promoProg(10),due:41},
 {done:()=>S.realm>=23,prog:()=>`${realmName(S.realm)}；化神需要登基、功德 ${meritNeed('huashen')}`,due:42},
 {done:()=>S.realm>=27||(S.realm>=26&&S.xiuwei>=xiuNeed(26)),prog:()=>`${realmName(Math.min(S.realm,26))}，修为 ${fmt(S.xiuwei)}/${fmt(xiuNeed(Math.min(S.realm,26)))}`,due:50},
 {done:()=>S.realm>=27,prog:()=>`飞升需要功德 ${meritNeed('feisheng')}，心魔低于 ${CFG.xinmoNoBreak}`,due:52}];
/* 阶段进度拆成一项一项：完成的绿色打勾 */
function chapItems(n){const it=[];const add=(t,done,pct)=>it.push({t,done:!!done,pct:done?1:Math.max(0,Math.min(0.99,pct||0))});
  const promoCh={2:2,3:3,5:4,6:5,7:6,9:7,10:8,11:9,13:10};const realmCh={4:[10,3,'zhuji'],8:[14,6,'jindan'],12:[18,9,'yuanying'],14:[22,10,'huashen']};
  if(n===1){add(`民心 ${S.minxin}/40`,S.minxin>=40,S.minxin/40);add(`${realmName(S.realm)}/练气三层`,S.realm>=3,S.realm/3)}
  else if(promoCh[n]){const r=promoCh[n];empItems(r).forEach(x=>{const l=x.l.replace(/（.*）/,'').replace('上次晋升后的','');add(/次数/.test(l)?`${l.replace('次数','')} ${x.v}/${x.n} 次`:`${l} ${x.f(x.v)}/${x.f(x.n)}`,x.pct>=1,x.pct)});if(r===6)add('晋升第 6 阶后选择路线',!!S.route,0)}
  else if(realmCh[n]){const [pre,rk,key]=realmCh[n];const need=xiuNeed(pre);
    add(`${realmName(Math.min(S.realm,26))}/${realmName(pre)}`,S.realm>=pre,S.realm/pre);
    if(S.realm>=pre)add(`修为 ${fmt(S.realm>pre?need:S.xiuwei)}/${fmt(need)}`,S.realm>pre||S.xiuwei>=need,S.xiuwei/need);
    add(rk>=10?'登基':`帝业第 ${rk} 阶`,S.rank>=rk,S.rank/rk);add(`功德 ${fmt(S.merit)}/${fmt(meritNeed(key))}`,S.merit>=meritNeed(key),S.merit/meritNeed(key));
    it.push({t:'条件齐了到「修行」渡劫',done:false,pct:2,tip:1})}
  else if(n===15){const r=Math.min(S.realm,26);add(`${realmName(r)}/化神圆满`,S.realm>=26,S.realm/26);if(S.realm>=26)add(`修为 ${fmt(S.realm>=27?xiuNeed(26):S.xiuwei)}/${fmt(xiuNeed(26))}`,S.realm>=27||S.xiuwei>=xiuNeed(26),S.xiuwei/xiuNeed(26))}
  else if(n===16){add(`功德 ${fmt(S.merit)}/${fmt(meritNeed('feisheng'))}`,S.merit>=meritNeed('feisheng'),S.merit/meritNeed('feisheng'));add(`心魔 ${S.xinmo}（要低于 ${CFG.xinmoNoBreak}）`,S.xinmo<CFG.xinmoNoBreak,0.5);add('化神圆满后到「修行」渡飞升劫',false,2)}
  return it}
function chipsHTML(it){const und=it.filter(x=>!x.done&&x.pct<=1);const low=und.length?und.reduce((a,b)=>b.pct<a.pct?b:a):null;
  return `<span class="pchips">${it.map(x=>`<span class="pchip${x.done?' ok':''}">${x.done?'✓ ':''}${esc(x.t)}</span>`).join('')}</span>`}
/* 章节顺序与 CHAPTERS 文本对应：1安身 2立足 3安民 4筑基 5雄踞 6威震 7侧目(第6阶并选路线) 8结丹 9起势 10鏖战 11逼宫 12元婴 13登基 14化神 15圆满 16飞升 */
const CH_ORDER=[0,1,2,3,4,5,6,8,7,9,10,11,12,13,14,15,16];
const CH_REWARD=[null,{silver:200},{silver:400},{silver:400,merit:20},{silver:200,merit:30},{silver:500},{silver:700},{silver:800},{silver:200,merit:50},
 {silver:800,merit:60},{silver:1000},{silver:1000,merit:80},{silver:200,merit:100},{silver:1500},{merit:150},{merit:200},{}];
function promoProg(r){const q=promoNeed(r);if(!q)return '';const L=[`文功 ${fmt(S.wengong)}/${fmt(q.wen)}`,`武功 ${fmt(S.wugong)}/${fmt(q.wu)}`,`银两 ${fmt(S.silver)}/${fmt(q.silver)}`,`民心 ${S.minxin}/${q.minxin}`,`${realmName(S.realm)}/${realmName(q.realm)}`,`上次晋升后治理 ${actsSince('治理')}/${q.acts} 次、军务 ${actsSince('军务')}/${q.acts} 次`];
  if(r===7&&!S.route)L.push('第6阶后选择路线');if(q.ratio!=null)L.push(`兵力比 ${ratio()}%/${q.ratio}%`);return L.join('，')}
const chap=()=>CHAPTERS[CH_ORDER[S.chap]-1];
function chapterCheck(){
  while(S.chap<=16&&CH_DEF[S.chap].done()){const c=chap();const rw=CH_REWARD[S.chap];const s=Object.keys(rw).length?apply(rw):'';
    logAdd(`阶段目标「${c.name}」完成`);S.chap++;S.chapMi=mi();S.accGrace=0;
    if(S.acc){logAdd('补齐目标，问责解除');queue.push({who:me(),tag:'问责解除',title:'问责解除',text:`你在期限内完成了阶段目标「${c.name}」，朝廷的问责到此为止。已经受的惩罚不会退回。`,options:[{label:'继续',run(){}}]});S.acc=null}
    if(S.chap>16)return;const nx=chap();
    queue.push({who:me(),tag:'阶段完成',title:`阶段完成：${c.name}`,text:`${c.done}${s?`\n（${s}）`:''}\n\n下一阶段：「${nx.name}」（${S.chap}/16）\n${nx.intro}\n\n期限：第 ${chDue()} 年腊月底（${chLeftTxt()}）。到期没完成会被问责，问责后只有 2 个月补救，补不上惩罚升级，连续三级补不上游戏结束。`,options:[{label:'继续',run(){}}]});}
}
/* 期限问责：章节到期（腊月底）没完成 → 第 1 级惩罚 + 2 个月补救期；补不上 → 立即升一级惩罚，再给 2 个月；第 4 级游戏结束 */
/* 离阶段期限还剩几个月（含本月） */
const chLeft=()=>(chDue()-1)*12+12-mi()+1;
const chLeftTxt=()=>{const n=chLeft();return n<=1?'本月底到期':`还剩 ${n} 个月`};
const chDue=()=>S.chap>16?99:Math.max(CH_DEF[S.chap].due,Math.floor(((S.chapMi||1)+10)/12)+1);
const ACC=[null,
 {name:'朝廷申饬',txt:'猜忌 +15，心魔 +5，银两 −10%',run(){S.suspicion=clamp(S.suspicion+15,0,100);S.xinmo=clamp(S.xinmo+5,0,100);S.silver=Math.round(S.silver*0.9)}},
 {name:'削减封地',txt:'产业收入减半，民心 −10，猜忌 +20，心魔 +10',run(){S.industry=Math.floor(S.industry/2);S.minxin=clamp(S.minxin-10,0,100);S.suspicion=clamp(S.suspicion+20,0,100);S.xinmo=clamp(S.xinmo+10,0,100)}},
 {name:'夺去兵权',txt:'私兵 −50%，文功、武功 −30%，猜忌至少 80，心魔 +15',run(){S.troops=Math.floor(S.troops/2);S.wengong=Math.round(S.wengong*0.7);S.wugong=Math.round(S.wugong*0.7);S.suspicion=Math.max(S.suspicion,80);S.xinmo=clamp(S.xinmo+15,0,100)}}];
function accScene(lv){const a=ACC[lv];const c=chap();
  return {who:me(),tag:`问责 第 ${lv} 级`,title:a.name,text:`期限已过，阶段目标「${c.name}」还没完成（${CH_DEF[S.chap].prog()}）。\n惩罚：${a.txt}。\n\n限你 2 个月内补齐（到第 ${Math.floor((S.acc.until-1)/12)+1} 年${MONTHS[(S.acc.until-1)%12+1]}底）。`+(lv<3?`补不上，立刻升为第 ${lv+1} 级「${ACC[lv+1].name}」：${ACC[lv+1].txt}。`:'再补不上，你将被废为庶人，游戏结束。'),options:[{label:'领罚',run(){}}]}}
/* 晋升要到下个月初才触发：期限到时如果晋升条件已经齐了，宽限一个月，等晋升结果 */
const CH_PROMO={2:2,3:3,5:4,6:5,7:6,9:7,10:8,11:9,13:10};
const promoSoon=()=>{const r=CH_PROMO[S.chap];return !!r&&!S.promoPause&&S.rank===r-1&&(S.rank<6||!!S.route)&&mi()+1>=S.promoCD&&promoReady(r)};
function accCheck(L){if(S.chap>16)return;
  if(S.acc){if(mi()<S.acc.until)return;if(!S.acc.ext&&promoSoon()){S.acc.ext=1;S.acc.until=mi()+1;return}S.acc.lv++;S.acc.ext=0;
    if(S.acc.lv>=4){gameOver('废为庶人',`一再延误，朝廷终于下旨：削去你的爵位，废为庶人，圈禁至死。你苦心经营的一切，就此烟消云散。`);return}
    ACC[S.acc.lv].run();S.acc.until=mi()+2;logAdd(`问责升级：${ACC[S.acc.lv].name}`);L.push(`问责升级：${ACC[S.acc.lv].name}（${ACC[S.acc.lv].txt}）`);queue.push(accScene(S.acc.lv));return}
  if(S.accGrace&&mi()<S.accGrace)return;
  const due=(S.month===12&&S.year>=chDue())||(S.accGrace&&mi()>=S.accGrace);
  if(due&&!CH_DEF[S.chap].done()&&!S.accGrace&&promoSoon()){S.accGrace=mi()+1;return}
  if(due)S.accGrace=0;
  if(due&&!CH_DEF[S.chap].done()){S.acc={chap:S.chap,lv:1,until:mi()+2};ACC[1].run();logAdd(`问责：${ACC[1].name}`);L.push(`阶段目标「${chap().name}」逾期：${ACC[1].name}（${ACC[1].txt}）`);queue.push(accScene(1))}}
const accTxt=()=>S.acc&&ACC[S.acc.lv]?`问责第 ${S.acc.lv} 级「${ACC[S.acc.lv].name}」：还剩 ${Math.max(0,S.acc.until-mi()+1)} 个月补齐，补不上${S.acc.lv<3?'升为「'+ACC[S.acc.lv+1].name+'」':'游戏结束'}`:'';

/* ================= 月度流程 ================= */
function monthStart(){S.logLbl=null;if(S.month===1)logAdd('新年');
  S.hurt=S.injured>0;S.ap=S.hurt?CFG.apInjured:CFG.apMonth;if(S.hurt){S.injured--;if(!S.injured)logAdd('伤势本月后痊愈')}
  const due=S.chains.filter(c=>c.due<=mi());S.chains=S.chains.filter(c=>c.due>mi());
  due.forEach(c=>{const t=TASKMAP[c.id];if(t){const sc=taskScene(t);if(!t.major)sc.tag='事件后续';queue.push(sc)}});
  if(S.month===CFG.yearEndWarnMonth)S.yeKind=rollYearEnd();
  if(S.month===1&&S.year>1&&mi()-(S.copyMi||0)>=12&&typeof document!=='undefined'&&!(typeof SIM!=='undefined'))S.wantBackup=1;
  suspicionEvent();
  if(S.rank<10&&!S.promoPause&&mi()>=S.promoCD&&(S.rank<6||S.route)&&promoReady(S.rank+1))startPromo(S.rank+1);
}
const pleaCount=()=>(S.pleas||[]).filter(m=>mi()-m<CFG.pleaWindow).length;
function suspicionEvent(){
  const s=S.suspicion,r=Math.random();if(S.route==='a'&&S.rank>=7)return;
  if(s>=100){const pw=power(),need=Math.round(S.court*0.6);const n=pleaCount();
    const plea=n===0?{label:'遣散半数私兵，上表请罪',hint:'私兵减半，猜忌降到 60，民心 −10。七年内第一次请罪',run(){S.troops=Math.floor(S.troops/2);S.suspicion=60;S.minxin=clamp(S.minxin-10,0,100);S.pleas=(S.pleas||[]).concat(mi());logAdd('上表请罪');result('请罪','朝廷收兵，但你元气大伤。')}}
      :n===1?{label:'交出兵符，再次请罪',hint:'私兵只留三成，猜忌降到 70，民心 −15，文功、武功 −20%。七年内第二次：再有一次，朝廷不会再收你的请罪折子',run(){S.troops=Math.floor(S.troops*0.3);S.suspicion=70;S.minxin=clamp(S.minxin-15,0,100);S.wengong=Math.round(S.wengong*0.8);S.wugong=Math.round(S.wugong*0.8);S.pleas=(S.pleas||[]).concat(mi());logAdd('再次请罪');result('请罪','你跪在钦差面前交出了兵符。朝廷收兵了，但这是最后一次。')}}
      :{label:'束手入京请罪',hint:'七年内已请罪两次，朝廷不会再信你：入京必死',run(){gameOver('赐死','你孤身入京请罪。三日后，一杯毒酒送进了天牢。')}};
    queue.push({tag:'朝廷讨伐',title:'朝廷讨伐',text:`朝廷以私蓄兵马、图谋不轨为由发兵讨伐。\n你的战力 ${fmt(pw)}，挡住需要 ${fmt(need)}（朝廷兵力的 60%）。`+(n?`\n七年内你已请罪 ${n} 次。`:''),options:[plea,
    {label:'起兵抗命',hint:pw>=need?'挡得住：猜忌降到 70，武功大增':'打不过会兵败身死',run(){
      if(pw>=need){S.suspicion=70;result('抗命',`你的私兵硬是挡住了朝廷大军。\n（${apply({wugong:80})}）`)}
      else gameOver('起兵兵败',`你的私兵（战力 ${fmt(pw)}）面对朝廷大军不堪一击。`)}}]});return}
  if(s>=80&&r<0.35){queue.push(taskScene({noSkip:1,title:'大军压境',text:'朝廷一支兵马驻扎在封地边界，迟迟不走。',opts:[
    {label:'虚与委蛇，拖到对方撤兵',check:{attr:'xinji',lv:3},eff:{suspicion:-20}},
    {label:'设宴犒军，献银求和',check:{attr:'meili',lv:2},cost:{silver:300},eff:{suspicion:-20}},
    {label:'遣散三成私兵',eff:{troops:-Math.floor(S.troops*0.3/rankMul()),suspicion:-10}}]}));return}
  if(s>=60&&r<0.3){queue.push(taskScene({noSkip:1,title:'钦差查访',text:'京城来了一位钦差，说是巡视地方，却专往军营附近转。',opts:[
    {label:'藏兵于民',check:{attr:'xinji',lv:2},eff:{suspicion:-10}},
    {label:'陪钦差游山玩水，重金打点',check:{attr:'meili',lv:1},cost:{silver:300},eff:{suspicion:-15}},
    {label:'任他查看',eff:{suspicion:8}}]}))}
}
function randomPhase(){
  if(S.revenge&&mi()>=S.revenge.next){queue.push(revengeScene());return}
  if(S.year>CFG.assassinFreeYears&&Math.random()*100<CFG.assassinMonthly+S.suspicion/CFG.assassinPerSusp+(S.feud||0)*0.3){assassination(true);return}
  if(Math.random()*100<CFG.raidChance+S.suspicion/CFG.raidPerSusp){queue.push(raidScene());return}
  if(married().length>=2&&Math.random()*100<CFG.gongdouChance){const t=pickFrom(ALL_EV.filter(t=>t.cat==='后宅'&&t.needP2));if(t){queue.push(sceneFor(t,'宫斗'));return}}
  if(Math.random()*100<CFG.courtEventChance){const t=pickTask('朝廷');if(t){queue.push(sceneFor(t,'朝廷来事'));return}}
  if(Math.random()*100<CFG.randomEventChance){const t=pickTask('突发');if(t)queue.push(sceneFor(t,'突发事件'))}
}
function courtTick(L){
  S.courtBase=Math.round(S.courtBase*(1+CFG.courtGrowth/12));
  if(S.court<S.courtBase)S.court=Math.min(S.courtBase,Math.round(S.court+S.courtBase*CFG.warRecover/100));else S.court=S.courtBase;
  if(S.month===S.warMonth){const loss=CFG.warLossMin+rand(CFG.warLossMax-CFG.warLossMin+1);S.court=Math.round(S.court*(1-loss/100));
    const w=pick1(['北狄大举犯边，京营北调','南方苗乱，朝廷发兵征讨','西陲吐谷浑叩关','东南倭寇登岸，水师吃紧']);L.push(`京城来报：${w}，朝廷兵力 −${loss}%（现为 ${fmt(S.court)}）`);logAdd(`朝廷用兵：${w}`)}
  if(S.month===12)S.warMonth=Math.random()<CFG.warChance?1+rand(12):0;
}
function monthEnd(){
  const L=[];
  const inc=income();S.silver+=inc;L.push(`封地收入：银两 +${inc}`);
  const up=upkeep();if(up>0){if(S.silver>=up){S.silver-=up;L.push(`军饷：银两 −${up}`)}else{const n=Math.ceil(S.troops*0.1);S.troops-=n;S.train=clamp(S.train-5,0,100);const had=S.silver;S.silver=0;L.push(`发不出军饷：库里 ${had} 两全部发掉还不够，私兵逃散 ${n} 人，训练度 −5`)}}
  const ns=apply({xiuwei:Math.round(S.attr.gengu*CFG.naturalPerGengu*lingMul())});if(ns)L.push('日常吐纳：'+ns);
  if(S.minxin>=CFG.recruitMin){const n=volunteers();
    if(S.accept){S.troops+=n;L.push(`民心所向，${n} 人前来投奔，已收编为私兵`)}else L.push(`有 ${n} 人前来投奔，你婉拒了`)}
  else if(S.minxin<CFG.desertBelow){const n=Math.ceil(S.troops*CFG.desertRate);S.troops-=n;L.push(`民心涣散，私兵逃散 ${n} 人`)}
  const mr=CFG.minxinDecayPer3Rank*Math.floor((S.rank-1)/5)+Math.floor(S.minxin/CFG.minxinDecayStep),mt=Math.floor(ratio()/CFG.minxinDecayRatio),md=CFG.minxinDecay+mr+mt;if(md>0){S.minxin=clamp(S.minxin-md,0,100);L.push(`民心自然消退 −${md}`+(mr?'（民心越高越难维持，治下越大越难顾全）':'')+(mt?'（养兵扰民）':''))}
  if(!(S.route==='a'&&S.rank>=7)){const su=Math.floor(ratio()/CFG.suspPerRatio);if(su>0){S.suspicion=clamp(S.suspicion+su,0,100);L.push(`兵力比 ${ratio()}%，朝廷警惕：猜忌 +${su}`)}}
  if(S.route==='b'&&S.minxin>=CFG.routeBSuspLo&&S.suspicion>0){const d=S.minxin>=CFG.routeBSuspHi?CFG.routeBSusp90:CFG.routeBSusp80;S.suspicion=clamp(S.suspicion-d,0,100);L.push(`民心 ${S.minxin}，百姓替你请命：猜忌 −${d}`)}
  if(S.train>0)S.train=Math.max(0,S.train-CFG.trainDecay);
  const xg=xinmoRankGain(),xr=xinmoResist(),xn=xg-xr;
  if(xg>0){if(xn>0){S.xinmo=clamp(S.xinmo+xn,0,100);L.push(`权欲渐重：心魔 +${xn}（帝业 +${xg}，${MAJOR[majorOf(S.realm)]}定力 −${xr}）`)}else L.push(`${MAJOR[majorOf(S.realm)]}定力压住了权欲，心魔不涨`)}
  S.partners.filter(p=>!p.married&&mi()-p.lastVisit>=CFG.leaveMonths&&p.leaveAsk!==mi()).slice(0,1).forEach(p=>{p.leaveAsk=mi();queue.push(leaveScene(p))});
  married().filter(p=>p.aff<CFG.splitAff&&p.splitAsk!==mi()).slice(0,1).forEach(p=>{p.splitAsk=mi();queue.push(splitScene(p))});
  married().forEach(p=>{if(mi()-p.lastVisit>=CFG.neglectMonths){p.aff=clamp(p.aff-2,0,100);S.harmony=clamp(S.harmony-3,0,100);L.push(`${p.name}许久不见你：好感 −2，后宅安宁 −3`)}});
  married().filter(p=>isAssassin(p)&&!assassinFree(p)).forEach(p=>{const c=p.aff>=90?1:p.aff>=60?3:6;if(Math.random()*100>=c)return;
    if(guardBonus()>=raidReq()){p.aff=clamp(p.aff-5,0,100);L.push(`${p.name}夜里想翻墙出府，被暗哨拦了下来：${p.name}好感 −5`);logAdd(`${p.name}出逃未遂`)}
    else{S.partners=S.partners.filter(x=>x!==p);S.bodyguard=Math.max(0,(S.bodyguard||0)-5);S.harmony=clamp(S.harmony-10,0,100);S.xinmo=clamp(S.xinmo+10,0,100);
      L.push(`${p.name}趁夜逃出王府，再没回来（防刺客加成 −5，后宅安宁 −10，心魔 +10）`);logAdd(`${p.name}出逃`)}});
  {const ms=married();const n=ms.length-1;if(n>0&&S.harmony>0){const d=n*CFG.harmonyPerWife+ms.filter(p=>cmMul(p)<1).length;S.harmony=clamp(S.harmony-d,0,100);L.push(`后宅人多事杂：后宅安宁 −${d}`)}}
  if(S.harmony<40&&married().length){S.xinmo=clamp(S.xinmo+CFG.harmonyLowXinmo,0,100);L.push(`后宅不宁：心魔 +${CFG.harmonyLowXinmo}`)}
  S.partners.filter(p=>p.tid==='assassin'&&p.aff<30&&!p.married).forEach(p=>{if(Math.random()<0.04){S.partners=S.partners.filter(x=>x!==p);S.bodyguard=Math.max(0,(S.bodyguard||0)-5);S.injured=Math.max(S.injured,1);L.push(`护卫${p.name}心怀旧主，夜里行刺后逃走：负伤 1 个月`);logAdd(`${p.name}反水`)}});
  courtTick(L);
  if(S.minxin<10){S.lowMinxin++;if(S.lowMinxin>=6){gameOver('民变','封地民心尽失，百姓揭竿而起，王府被付之一炬。');return}}else S.lowMinxin=0;
  if(S.xinmo>=100){S.hiXinmo=(S.hiXinmo||0)+1;if(S.hiXinmo>=CFG.xinmoDeathMonths){gameOver('走火入魔',`心魔满溢${CFG.xinmoDeathMonths}个月，你在一个深夜里经脉逆行，再也没有醒来。`);return}L.push(`心魔已满！再持续 ${CFG.xinmoDeathMonths-S.hiXinmo} 个月就会走火入魔`)}else S.hiXinmo=0;
  if(S.xinmo>=CFG.xinmoStop)L.push(`心魔过重（${S.xinmo}），修为、文功、武功停止增长，需要做善事化解`);
  chapterCheck();accCheck(L);if(S.over)return;
  if(S.month===12)yearEndEvent();
  queue.unshift({title:`${MONTHS[S.month]}结算`,text:L.join('\n'),options:[{label:'继续',run(){}}]});
  S.logLbl=`第${S.year}年${MONTHS[S.month]}`;S.month++;if(S.month>12){S.month=1;S.year++}
}

/* ================= 后宅 ================= */
const BOND_AFF=[40,55,80];
/* 刺客道侣：第三段羁绊要好感 95，且结为道侣满 assassinBondMonths 个月；喜好只有 1 样，普通相处好感只 +1 */
const ASSN_BOND_AFF=[40,55,95];
const bondAff=(p,i)=>(isAssassin(p)?ASSN_BOND_AFF:BOND_AFF)[i];
const marriedMonths=p=>{if(!p.married)return 0;if(p.marriedMi==null)p.marriedMi=mi();return mi()-p.marriedMi};
const bondReady=p=>p.aff>=bondAff(p,p.bondN)&&!(isAssassin(p)&&p.bondN===2&&marriedMonths(p)<CFG.assassinBondMonths);
const bondsOf=p=>p.tid==='assassin'?ASSASSIN_BONDS:PT.find(t=>t.id===p.tid).bonds;
const stageOf=a=>a>=80?'生死相许':a>=60?'倾心':a>=30?'知己':'相识';
const talkMax=p=>p.married?CFG.talkMarried:CFG.talkPerMonth;
const talkLeft=p=>talkMax(p)-(p.talkMi===mi()?p.talkN:0);
const useTalk=p=>{if(p.talkMi!==mi()){p.talkMi=mi();p.talkN=0}p.talkN++;p.lastVisit=mi()};
function houseEvent(){if(S.houseEvMi===mi())return;S.houseEvMi=mi();if(Math.random()>=CFG.houseEventChance)return;
  const t=pickFrom(ALL_EV.filter(t=>t.cat==='后宅'&&!t.needP2));if(t)queue.push(sceneFor(t,'随机事件'))}
/* 好感满了以后，告诉玩家下一步是什么 */
function affFullTxt(p){const chain=bondsOf(p);
  if(p.bondN>=chain.length)return p.married?'已经是最亲近的人了':'羁绊都走完了，可以提亲';
  const nx=`第 ${p.bondN+1}/${chain.length} 段羁绊`;
  if(isAssassin(p)&&p.bondN===2&&marriedMonths(p)<CFG.assassinBondMonths)return `${nx}要结亲满 ${CFG.assassinBondMonths} 个月，还差 ${CFG.assassinBondMonths-marriedMonths(p)} 个月`;
  if(mi()<(p.bondNext||0))return `${nx}约 ${p.bondNext-mi()} 个月后再出现`;
  return `${nx}会在下次看望时出现`}
function visit(p,pos){
  const put=sc=>queue.splice(pos||0,0,sc);const chain=bondsOf(p);
  if(talkLeft(p)>0&&p.bondN<chain.length&&bondReady(p)&&mi()>=(p.bondNext||0)){const sc=taskScene(chain[p.bondN],{p,skipCat:'羁绊'});sc.title=`${sc.title}（羁绊 ${p.bondN+1}/${chain.length}）`;
    sc.options.forEach(o=>{const r=o.run;if(!o.reward){o.hint+='；羁绊没有推进，半年后才会再遇到';o.run=()=>{useTalk(p);p.bondNext=mi()+6;r()};return}o.run=()=>{p.bondN++;p.bonded=true;useTalk(p);r()}});put(sc);return}
  const n=talkLeft(p),opts=[];const again=()=>{if(talkLeft(p)>0)visit(p,1)};
  if(n>0){
    if(p.married){const done=p.dual===mi(),m=dualMulOf(p)*CFG.dualRewardMul;
      opts.push({label:'双修',cls:'dual',hint:done?`这个月已经和${p.name}双修过了`:`随机得到一份奖励：修为、武功、文功、银两、功德、防刺客、降猜忌、疗伤、渡劫阵法之一；${p.type}类道侣更容易得到${p.type==='武'?'修为、武功、防刺客、疗伤、渡劫阵法':'银两、文功、降猜忌、功德'}。好感越深、才貌越出众，收获越好。${isAssassin(p)?`刺客出身：奖励更大，还可能替你暗中除掉政敌（猜忌 −15）；但也可能变成惩罚（负伤、心魔加重或猜忌上升）。`:''}每位道侣每月可以双修一次（和相处二选一），道侣越多，每月能双修的次数越多`,disabled:done,
        run(){useTalk(p);p.dual=mi();const d=dualDraw(p);result('双修',d.sum?`${d.t}\n（${d.sum}）`:d.t,p,true);again()}})}
    if(p.aff<100)shuffle(ACTS).slice(0,5).forEach(a=>{const k=p.known.includes(a);const val=p.prefs.includes(a)?CFG.affLike:a===p.taboo?-CFG.affTaboo:isAssassin(p)?1:CFG.affNormal;
      opts.push({label:a,hint:k?`好感 ${sg(val)}`:'',run(){useTalk(p);let t;
        if(val===CFG.affLike){t=`${p.name}眉眼都亮了，看得出很喜欢。`;S.harmony=clamp(S.harmony+1,0,100)}else if(val<0)t=`${p.name}脸色淡了下来，显然不喜欢。`;else t=`你与${p.name}${a}，相处融洽。`;
        if(!k)p.known.push(a);p.aff=clamp(p.aff+val,0,100);result(`与${p.name}${a}`,`${t}\n（好感 ${sg(val)}）`,p);again()}})});
    if(p.aff>=100)opts.push({label:'好感已满',hint:affFullTxt(p),disabled:true,run(){}});
  }
  if(!p.married&&p.bondN>=2&&p.aff>=CFG.marryAff){const full=married().length>=cap();const price=brideCost(p),poor=S.silver<price;
    const wed=()=>{if(S.silver<price)return;S.silver-=price;p.married=true;p.marriedMi=mi();p.aff=clamp(p.aff+10,0,100);const others=married().length-1;if(others>0)S.harmony=clamp(S.harmony-5,0,100);
      logAdd(`与${p.name}结为道侣`);result('结为道侣',`三书六礼，红绸满府。从此以后，${p.name}便是你的道侣。\n（聘礼 银两 −${price}`+(others>0?'，新人入府，后宅安宁 −5':'')+'）',p)};
    if(!full)opts.unshift({label:'提亲',hint:poor?`银两不够（聘礼 ${price}）`:`花费 聘礼 银两 ${price}；结为道侣`+(married().length?'；新人入府，后宅安宁 −5':''),disabled:poor,run:wed});
    else opts.unshift({label:'提亲（需先休离一位）',hint:poor?`银两不够（聘礼 ${price}）`:`道侣已满 ${cap()} 位；选一位休离，再迎娶${p.name}（${cmTxt(p)}）；聘礼 银两 ${price}`,disabled:poor,run(){useTalk(p);
      queue.unshift({who:p,title:`迎娶${p.name}`,text:`道侣已满 ${cap()} 位。要迎娶${p.name}（${cmTxt(p)}），得先休离一位：`,options:[...married().map(q=>{const x=divorceXinmo(q);return {label:`休离${q.name}`,hint:`${cmTxt(q)}，好感 ${q.aff}；心魔 +${x}，后宅安宁 −10`,run(){
          queue.unshift({who:q,title:`确认休离${q.name}？`,text:`你确定要休离${q.name}（好感 ${q.aff}，${cmTxt(q)}），迎娶${p.name}吗？\n${q.name}会离开，从此不再回来。\n（心魔 +${x}，后宅安宁 −10；新人入府，后宅安宁 −5）`,options:[
            {label:`确定休离${q.name}`,hint:`心魔 +${x}，后宅安宁 −10，然后迎娶${p.name}`,run(){S.partners=S.partners.filter(z=>z!==q);S.xinmo=clamp(S.xinmo+x,0,100);S.harmony=clamp(S.harmony-10,0,100);logAdd(`休离${q.name}`);wed();queue.unshift({who:q,title:'休离',text:`${q.name}收拾好行装走了。\n（心魔 +${x}，后宅安宁 −10）`,options:[{label:'继续',run(){}}]})}},
            {label:'算了',hint:'不休离，也暂不提亲',run(){}}]})}}}),{label:'算了',hint:'暂不提亲',run(){}}]})}})}
  if(!p.married){const c=dismissCost(p);opts.push({label:'遣散',hint:S.silver<c?`银两不够（遣散费 ${c}）`:`付遣散费 银两 ${c}（按才貌算），后宅安宁 −${CFG.dismissHarmony}；${p.name}会离开，不再回来`,disabled:S.silver<c,run(){
    queue.unshift({who:p,title:`遣散${p.name}？`,text:`你确定要遣散${p.name}吗？（好感 ${p.aff}，${cmTxt(p)}）\n${p.name}会离开，从此不再回来。\n（银两 −${c}，后宅安宁 −${CFG.dismissHarmony}）`,options:[
      {label:'确定遣散',run(){if(S.silver<c)return;S.silver-=c;S.partners=S.partners.filter(q=>q!==p);S.harmony=clamp(S.harmony-CFG.dismissHarmony,0,100);logAdd(`遣散${p.name}`);
        result('遣散',`你备了一份盘缠，送${p.name}出府。\n${p.name}行了一礼，没有多说什么。\n（银两 −${c}，后宅安宁 −${CFG.dismissHarmony}）`,p)}},
      {label:'算了',run(){}}]})}})}
  if(p.married){const x=divorceXinmo(p);opts.push({label:'休离',hint:`心魔 +${x}，后宅安宁 −10；${p.name}会离开，不再回来`,run(){queue.unshift(divorceScene(p))}})}
  opts.push({label:'返回',run(){}});
  const nb=chain.length>p.bondN?bondAff(p,p.bondN):null;
  const hint=`\n${cmTxt(p)}`+(cmMul(p)<1?'——她已渐渐配不上王府的门第。':'')+(isAssassin(p)&&p.married&&!assassinFree(p)?`\n${p.name}心结未解，每月可能设法出逃，府中守备越严越拦得住。走完三段羁绊后不再出逃。`:'')+`\n${typeTxt(p)}：${typeUse(p)}`+(p.married?'好感越高，双修奖励越大。':'结为道侣后可以双修，随机得到奖励。')+`\n本月还可以互动 ${n} 次。`+(!p.married?(p.bondN>=2&&p.aff>=60?'\n可以提亲了。':`\n提亲条件：好感 60，且完成前两段羁绊事件（已完成 ${Math.min(p.bondN,2)}/2）。`):'')+(nb!=null?`\n感情再深一些，会有新的故事${isAssassin(p)&&p.bondN===2?`；第三段要结为道侣满 ${CFG.assassinBondMonths/12} 年（${p.married?`已 ${Math.floor(marriedMonths(p)/12)} 年 ${marriedMonths(p)%12} 个月`:'尚未成亲'}）`:''}。`:'')+(isAssassin(p)?'\n刺客出身，心防很重：喜欢的相处方式只有一样，其余相处好感只 +1。':'');
  put({who:p,title:p.name,text:`${p.origin}，${stageOf(p.aff)}（好感 ${p.aff}）。${n>0?'一起做什么？':'这个月已经陪过很久了。'}${hint}`,options:opts});
}
const divorceXinmo=p=>cmMul(p)<=0.3?5:CFG.divorceXinmo+(p.aff>=80?10:p.aff>=60?5:0);
const keepCost=()=>Math.round(CFG.keepCost*rankMul());
const splitCost=()=>Math.round(CFG.splitCost*rankMul());
/* 挽留 / 放手都要再确认一次，免得误点（「再想想」回到原来的选择） */
const confirmScene=(p,title,text,yes,back)=>({who:p,title,text,options:[{label:yes.label,hint:yes.hint,run:yes.run},{label:'再想想',hint:'回到刚才的选择',run(){queue.unshift(back())}}]});
function splitScene(p){const c=splitCost();
  const keep=()=>{S.silver-=c;p.aff=Math.max(p.aff,CFG.splitKeepAff);p.lastVisit=mi();logAdd(`挽回${p.name}`);result('挽回',`你备下厚礼，又陪了她好几日。${p.name}终究把和离书收了回去。\n（银两 −${c}，好感回到 ${p.aff}）`,p)};
  const go=()=>{S.partners=S.partners.filter(q=>q!==p);S.xinmo=clamp(S.xinmo+CFG.splitXinmo,0,100);S.harmony=clamp(S.harmony-CFG.splitHarmony,0,100);logAdd(`与${p.name}和离`);
      result('和离',`${p.name}收拾好行装，向你行了最后一礼。\n（心魔 +${CFG.splitXinmo}，后宅安宁 −${CFG.splitHarmony}）`,p)};
  return {who:p,title:`${p.name}提出和离`,text:`${p.name}把一纸和离书放在你面前：「殿下心里早已没有我，不如好聚好散。」\n（好感 ${p.aff}，${cmTxt(p)}）`,options:[
    {label:'花钱挽留',hint:S.silver<c?`银两不够（需要 ${c}）`:`花费 银两 ${c}；${p.name}留下，好感回到 ${CFG.splitKeepAff}`,disabled:S.silver<c,run(){
      queue.unshift(confirmScene(p,`挽留${p.name}？`,`你确定要花 银两 ${c} 挽留${p.name}吗？\n她会留下，好感回到 ${Math.max(p.aff,CFG.splitKeepAff)}。\n（现有银两 ${S.silver}）`,{label:'确定挽留',hint:`银两 −${c}`,run:keep},()=>splitScene(p)))}},
    {label:'同意和离',hint:`${p.name}离开；心魔 +${CFG.splitXinmo}，后宅安宁 −${CFG.splitHarmony}（她主动提的，比休离轻）`,run(){
      queue.unshift(confirmScene(p,`与${p.name}和离？`,`你确定要和${p.name}和离吗？\n她会离开，从此不再回来。\n（心魔 +${CFG.splitXinmo}，后宅安宁 −${CFG.splitHarmony}）`,{label:'确定和离',hint:`${p.name}离开`,run:go},()=>splitScene(p)))}}]}}
function leaveScene(p){const c=keepCost();
  const keep=()=>{S.silver-=c;p.lastVisit=mi();p.aff=clamp(p.aff+5,0,100);logAdd(`挽留${p.name}`);result('挽留',`你备了厚礼，亲自登门赔罪。${p.name}终究还是留了下来。\n（银两 −${c}，好感 +5）`,p)};
  const go=()=>{S.partners=S.partners.filter(q=>q!==p);logAdd(`${p.name}离去`);result('离去',`${p.name}走了，没有回头。`,p)};
  return {who:p,title:`${p.name}要走`,text:`你已经半年没去看${p.name}了。\n${p.name}收拾了行装，托人带话：「既然殿下无意，我也不便久留。」\n（${cmTxt(p)}，好感 ${p.aff}）`,options:[
    {label:'厚礼挽留',hint:S.silver<c?`银两不够（需要 ${c}）`:`花费 银两 ${c}；${p.name}留下，好感 +5`,disabled:S.silver<c,run(){
      queue.unshift(confirmScene(p,`挽留${p.name}？`,`你确定要花 银两 ${c} 挽留${p.name}吗？\n她会留下，好感 +5。之后半年内再不去看她，她还会想走。\n（现有银两 ${S.silver}）`,{label:'确定挽留',hint:`银两 −${c}`,run:keep},()=>leaveScene(p)))}},
    {label:'让她走',hint:'没有惩罚，后宅空出一个位置',run(){
      queue.unshift(confirmScene(p,`让${p.name}走？`,`你确定让${p.name}走吗？\n她会离开，从此不再回来。`,{label:'确定让她走',hint:'没有惩罚，后宅空出一个位置',run:go},()=>leaveScene(p)))}}]}}
function divorceScene(p){const x=divorceXinmo(p);
  return {who:p,title:`休离${p.name}`,text:`你真的要休离${p.name}吗？\n她会离开，从此不再回来。\n（心魔 +${x}，后宅安宁 −10。好感越深，心魔越重；已配不上门第的，心魔只 +5。）`,options:[
    {label:'确定休离',hint:`心魔 +${x}，后宅安宁 −10`,run(){S.partners=S.partners.filter(q=>q!==p);S.xinmo=clamp(S.xinmo+x,0,100);S.harmony=clamp(S.harmony-10,0,100);logAdd(`休离${p.name}`);
      result('休离',`${p.name}收拾好行装，临走前没有回头。\n府里安静了很多，你却好几夜没睡着。\n（心魔 +${x}，后宅安宁 −10）`,p)}},
    {label:'算了',hint:'什么也不发生',run(){}}]}}

/* ================= 行动 ================= */
const dateTxt=()=>`第${S.year}年${MONTHS[S.month]}`;
const markPhase=()=>{S.actLabel=dateTxt()};
function spend(d,id){markPhase();S.ap--;S.stat[d]=(S.stat[d]||0)+1}
function afterAct(d,bonus){
  if(Math.random()>=CFG.actEventChance+bonus)return;
  const t=pickTask(d);if(!t)return;queue.push(sceneFor(t,'随机事件'));
}
const actTip=a=>typeof a.tip==='function'?a.tip():a.tip;
function actHint(a){const h=[];const c=a.cost&&a.cost();if(c)h.push(costTxt(c));const e=effTxt(a.eff());if(e)h.push(e);const t=actTip(a);if(t)h.push(t);return h.join('；')}
function menuInfo(d){
  const need=xiuNeed(S.realm);
  return {修行:`${realmName(S.realm)}，修为 ${fmt(S.xiuwei)}/${fmt(need)}。属性上限 ${attrCap()}（突破大境界提高）。闭关练根骨，参悟练悟性。\n帝业带来的灵脉加成：修行 ×${lingMul().toFixed(2)}。`+(pillNeed(S.realm)?`\n下次突破需要破障丹 ${pillNeed(S.realm)} 颗${isBottle(S.realm)?'（瓶颈，双倍）':''}，你有 ${S.pill} 颗。`:''),
    治理:`民心 ${S.minxin}，每月收入 ${income()} 两，军饷 ${upkeep()} 两。文功 ${fmt(S.wengong)}。`,
    军务:`私兵 ${fmt(S.troops)}，训练度 ${S.train}，战力 ${fmt(power())}。\n府中守卫 +${S.guard}/${CFG.guardMax}，防刺客总加成 +${guardBonus()}（防夜袭需要 +${raidReq()}）。\n朝廷兵力 ${fmt(S.court)}，兵力比 ${ratio()}%（${ratioTier(ratio())[1]}${nextTier(ratio())?`，下一档 ${nextTier(ratio())[0]}% ${nextTier(ratio())[1]}`:''}）。`,
    游历:`功德 ${fmt(S.merit)}，心魔 ${S.xinmo}。道侣只能在「寻访机缘」中遇到。`,
    后宅:`后宅安宁 ${S.harmony}。后宅 ${S.partners.length}/${CFG.knownMax} 人，道侣 ${married().length}/${cap()} 位，当前门第标准：才貌 ${cmStd()}。`+(S.partners.length?'':'\n还没有结识任何人。「游历 → 寻访机缘」有机会遇到有缘人。')}[d];
}
/* 同一件事一个月内重复做，收益递减：第 2 次 70%，第 3 次 40% */
const DIM=[1,0.7,0.4];
const actN=id=>(S.actM===mi()&&S.actC&&S.actC[id])||0;
const dimMul=id=>DIM[Math.min(actN(id),2)];
function useAct(id){if(S.actM!==mi()){S.actM=mi();S.actC={}}S.actC[id]=(S.actC[id]||0)+1}
function dimEff(e,m){if(m>=1)return e;const o={};for(const[k,v]of Object.entries(e))o[k]=typeof v==='number'&&k!=='suspicion'?(v>0?Math.max(1,Math.round(v*m)):Math.round(v*m)):v;return o}
const meritCalm=()=>Math.round(CFG.meritCalmCost*rankMul());
function doAction(d){
  if(S.phase!=='act')return;
  if(d==='行善'){deedScene();return}
  const house=d==='后宅';const opts=[],noAp=!house&&S.ap<=0;
  if(d==='修行'){const mc=meritCalm(),used=S.calmMi===mi();opts.push({label:'以功德化解心魔',hint:used?'这个月已经化解过了':S.xinmo<=0?'心魔已为 0':`花费 功德 ${mc}；心魔 −${CFG.meritCalmXinmo}；每月一次，不占行动力`,disabled:used||S.xinmo<=0||S.merit<mc,
    run(){S.merit-=mc;S.calmMi=mi();S.xinmo=clamp(S.xinmo-CFG.meritCalmXinmo,0,100);logAdd('以功德化解心魔');result('化解心魔',`你把这些年行善积下的因果一一回想，胸中的郁结散了不少。\n（功德 −${mc}，心魔 −${CFG.meritCalmXinmo}）`)}})}
  if(d==='修行'){const mc=Math.round(CFG.meritStudyCost*rankMul()),used=S.mstudyMi===mi(),full=S.xiuwei>=xiuNeed(S.realm)*CFG.xiuBank,g=Math.round(CFG.retreatBase*0.6*lingMul()*realmMul());
    const blk=S.xinmo>=CFG.xinmoStop;opts.push({label:'以功德悟道',hint:used?'这个月已经悟过了':full?'修为已积满，先突破':blk?'心魔过重，修为不涨':`花费 功德 ${mc}；修为 +${fmt(g)}；每月一次，不占行动力`,disabled:used||full||blk||S.merit<mc,
      run(){S.merit-=mc;S.mstudyMi=mi();const r=apply({xiuwei:Math.round(CFG.retreatBase*0.6*lingMul())});result('以功德悟道',`你把这些年的善缘一一回想，心境澄明，修为随之精进。\n（功德 −${mc}，${r}）`)}})}
  if(d==='修行'&&S.xiuwei>=xiuNeed(S.realm)&&S.realm<27){const b=breakInfo();opts.push({label:b.label,hint:b.hint+'；不占行动力',disabled:!b.ok,run:b.run})}
  if(house)S.partners.forEach(p=>{const n=talkLeft(p);opts.push({label:`看望${p.name}`,img:p.img,hint:`${p.origin}·${p.type}类，${stageOf(p.aff)}（好感 ${p.aff}），才貌 ${p.cm==null?(p.cm=rollCm()):p.cm}·${cmTier(p)[2]}${p.married?'，已结为道侣':''}；本月还可互动 ${n} 次`,disabled:n<=0,run(){visit(p);houseEvent()}})});
  ACTIONS[d].filter(a=>!a.cond||a.cond()).forEach(a=>{const c=a.cost?a.cost():null;const full=a.id==='retreat'&&S.xiuwei>=xiuNeed(S.realm)*CFG.xiuBank;
    const used=house&&S.monthUsed&&S.monthUsed[a.id]===mi();
    const capped=a.id==='study'&&S.attr.wuxing>=attrCap();
    const maxed=!!(a.maxed&&a.maxed());
    const dn=house||a.noDim?1:dimMul(a.id);
    opts.push({label:a.label,hint:(a.noDim&&actN(a.id)>0?'本月再炼，花费更高；':'')+(dn<1&&!full?`本月再做收益只有 ${Math.round(dn*100)}%；`:'')+(maxed?`府中守卫已满 +${CFG.guardMax}`:full?`修为已积满，这次闭关不涨修为；`+trainTxt('gengu',1):capped?`悟性已到当前上限 ${attrCap()}，突破大境界后才能继续参悟`:used?'这个月已经做过了':actHint(a)+(a.train?'；'+trainTxt(a.train):'')+(house?'；每月一次，不占行动力':'')),disabled:noAp||capped||maxed||used||!!(c&&!afford(c)),
      run(){if(c)pay(c);if(house){S.monthUsed=S.monthUsed||{};S.monthUsed[a.id]=mi()}else spend(d,a.id);const dm=house||a.noDim?1:dimMul(a.id);if(!house)useAct(a.id);if(a.lottery){const sd=seekDraw(dm);result(a.label,`${a.text}\n${sd.text}`);if(sd.after)queue.splice(1,0,sd.after);return}
      const r=apply(dimEff(a.eff(),dm));const tr=a.train?train(a.train,a.trainMul):'';result(a.label,`${a.text}\n（${[r,tr].filter(Boolean).join('，')}）`);if(!house)afterAct(d,a.evBonus||0)}})});
  if(house)opts.forEach(o=>{const r=o.run;o.run=function(){backTo='后宅';return r.apply(this,arguments)}});
  opts.push({label:'返回',hint:'不消耗行动力',run(){backTo=''}});
  queue.push({who:me(),bg:d,title:d,text:menuInfo(d)+(house?`\n\n后宅里的事都不占行动力。没结亲的人每月可以互动 ${CFG.talkPerMonth} 次，道侣每月 ${CFG.talkMarried} 次。`:`\n\n每件事用 1 点行动力（本月还剩 ${S.ap} 点）。做完后可能顺带遇到随机事件，随机事件不占行动力。`),options:opts});
}
/* 只提示危险，不提示建议 */
function warnings(){
  const w=[];if(S.suspicion>=70&&!(S.route==='a'&&S.rank>=7))w.push(`朝廷猜忌 ${S.suspicion}，再高下去朝廷会发兵讨伐。`+(pleaCount()>=2?'七年内已请罪两次，再被讨伐只能起兵抗命或入京赴死。':pleaCount()===1?'七年内已请罪一次，第二次代价更重。':''));
  if(S.xinmo>=50)w.push(`心魔 ${S.xinmo}。心魔太重会停止增长、不能渡劫，长期满了会走火入魔。`);
  if(S.minxin<20)w.push(`民心 ${S.minxin}。民心太低私兵会逃散，长期这样会民变。`);
  if(S.silver+income()<upkeep())w.push(`银两不够下月军饷（${upkeep()} 两），发不出会逃兵。`);
  if(S.harmony<40&&married().length)w.push(`后宅安宁 ${S.harmony}，心魔会跟着加重。`);
  return w;
}
function step(){
  const p=S.phase;markPhase();
  if(p==='start'){S.phase='act';monthStart()}
  else if(p==='random'){S.phase='end';randomPhase()}
  else if(p==='end'){S.phase='start';monthEnd()}
}
function endMonth(){if(S.ap>0)return;markPhase();S.phase='random'}
/* 打点朝廷：次数不限。价格 = 基础 + 兵力比(%) × 每1%加价，封顶；同一个月第二次起翻倍。 */
const bribeBaseCost=()=>Math.round(Math.min(CFG.bribeCap*rankMul(),CFG.bribeBase*rankMul()+ratio()*CFG.bribePerRatio));
const bribeCost=()=>bribeBaseCost()*(S.bribeMi===mi()?2:1);

function newGame(name,g){
  S={v:SAVE_V,rs:Math.floor(_rnd()*2147483646)+1,exp:{},chapMi:1,name,gender:g,year:1,month:1,phase:'start',ap:0,attr:{},realm:1,rank:1,route:null,chap:1,xiuwei:0,wengong:0,wugong:0,merit:0,xinmo:0,
    minxin:CFG.startMinxin,silver:CFG.startSilver,troops:CFG.startTroops,train:20,suspicion:CFG.startSuspicion,harmony:CFG.startHarmony,
    court:CFG.courtStart,courtBase:CFG.courtStart,warMonth:0,
    pill:0,injured:0,accept:true,partners:[],prisoners:[],metT:{},cd:{},done:{},chains:[],promoCD:0,lowMinxin:0,log:[],over:null,
    industry:0,guard:0,stat:{修行:0,治理:0,军务:0,游历:0}};
  for(const k in ATTR)S.attr[k]=CFG.startAttr;
  const pages=INTRO(INTRO_T[g]);
  queue=pages.map(([t,x],k)=>({who:me(),title:t,text:x,options:[{label:k===pages.length-1?'入府':'继续',run(){}}]}));
  const c=CHAPTERS[0];queue.push({who:me(),tag:'阶段目标',title:`阶段目标：${c.name}（1/16）`,text:`${c.intro}\n\n目标：民心到 40，修到练气三层。期限：第 ${chDue()} 年腊月底（${chLeftTxt()}）。\n到期没完成会被朝廷问责，问责后只有 2 个月补救，补不上惩罚升级，连续三级补不上游戏结束。`,options:[{label:'开始',run(){}}]});
  logAdd('贬谪至封地');
}

/* ================= 渲染（竖屏手游布局） ================= */
const imgUrl=src=>(src||PORTRAIT)+(typeof IMG_V!=='undefined'?'?v='+IMG_V:'');
/* zoom：角色页、道侣页的立绘可以点开放大 */
function portrait(w,cap,zoom){
  if(!w)return'';const chars=[...(w.name||'？')].slice(0,4);
  return `<div class="portrait${zoom?' zoomable':''}"${zoom?` data-a="zoom" data-src="${esc(imgUrl(w.img))}" data-name="${esc(w.name||'')}"`:''}><img src="${esc(imgUrl(w.img))}" alt="${esc(w.name)}的立绘"><span class="seal">${chars.map(esc).join('')}</span>${cap?`<div class="pcap">${esc(w.origin||'')}</div>`:''}</div>`;
}
function renderStatus(){
  const rl=Math.min(S.realm,26),need=xiuNeed(rl),pct=Math.min(100,Math.round(S.xiuwei/need*100));
  const ch=(l,v,w)=>`<span class="tchip${w?' warn':''}">${l}<b>${v}</b></span>`;
  $('#status').innerHTML=`<div class="t1"><span class="tname">${esc(S.name)}</span><span class="tdate">${S.phase==='start'&&queue.length&&S.actLabel?S.actLabel:dateTxt()}</span>${S.phase==='act'||S.phase==='random'?`<span class="ap" title="本月剩余行动力">行动力 <b>${S.phase==='act'?S.ap:0}</b>/${S.hurt?CFG.apInjured:CFG.apMonth}</span>`:''}</div>
  <div class="t2"><span>${realmName(rl)}</span><div class="tbar" title="修为 ${S.xiuwei}/${need}"><i style="width:${pct}%"></i></div><span>${rankName(S.rank)}</span></div>
  <div class="t3">${ch('银',fmt(S.silver))}${ch('民心',S.minxin,S.minxin<20)}${ch('兵力比',ratio()+'%')}${ch('猜忌',S.suspicion,S.suspicion>=70)}${ch('心魔',S.xinmo,S.xinmo>=50)}${ch('功德',fmt(S.merit))}${S.hurt?ch('负伤',(S.injured+1)+'月',true):S.injured>0?ch('下月负伤',S.injured+'月',true):''}</div>`;
}
/* 主角自己的场景不放立绘（地方留给文字和选项）；有道侣、刺客等别人出场时才显示立绘 */
/* 奖励文字标绿：选项提示里的「奖励：……」一段；达标后结果里最后一行（……） */
const rewHint=h=>esc(h).replace(/奖励：[^；]*/g,m=>`<span class="rew">${m}</span>`);
const rewText=(t,good)=>{const e=esc(t||'');if(!good)return e;return e.replace(/（[^（\n]*）$/,m=>`<span class="rew">${m}</span>`)};
const stageBox=(w,title,text,tg,good)=>`${w&&!w.isMe?`<div class="stagepic">${portrait(w)}<span class="whotag">${esc(w.origin||'')}</span></div>`:''}<div class="dialog">${tg?`<span class="stag">${esc(tg)}</span>`:''}<h2>${esc(title)}</h2><p>${rewText(text,good)}</p></div>`;
function sceneHTML(sc){
  const w=sc.who||me();return `<div class="play${w.isMe?' nopic':''}">${stageBox(w,sc.title,sc.text,sc.tag,sc.good)}
  <div class="choices">${sc.options.map((o,i)=>`<button class="opt${o.cls?' '+o.cls:''}${o.img?' withpic':''}" data-a="opt" data-i="${i}" ${o.disabled?'disabled':''}>${o.img?`<img class="othumb" src="${esc(imgUrl(o.img))}" alt="">`:''}<span class="otxt">${esc(o.label)}${o.hint?`<small>${rewHint(o.hint)}</small>`:''}</span></button>`).join('')}</div></div>`;
}
function guideHTML(){
  const L=[];if(S.chap<=16){const c=chap(),d=CH_DEF[S.chap];L.push(`<div class="gl${S.acc||(S.year>=chDue()&&S.month>=CFG.yearEndWarnMonth)?' warn':''}"><b>阶段目标</b><span>${esc(c.name)}（${S.chap}/16，${S.promoPause&&CH_PROMO[S.chap]?'已暂缓晋升，':''}${S.acc?esc(accTxt()):`期限第 ${chDue()} 年腊月底，${chLeftTxt()}`}）<br>${chipsHTML(chapItems(S.chap))}</span></div>`)}
  warnings().forEach(w=>L.push(`<div class="gl warn"><b>警告</b><span>${esc(w)}</span></div>`));
  if(S.month>=CFG.yearEndWarnMonth&&S.yeKind)L.push(`<div class="gl warn"><b>年末</b><span>${esc(YE_HINT[S.yeKind])}</span></div>`);
  return `<div class="guide" data-a="tab" data-t="quest" role="button" aria-label="查看目标">${L.join('')}<div class="gmore">查看目标 ›</div></div>`;
}
function hubHTML(){
  const dirs=[['修行','闭关、炼丹、突破'],['治理','民生，产出文功'],['军务','练兵，产出武功'],['游历','行侠，或有奇遇'],['后宅','道侣，不占行动力'],['行善',deedDone()?'本月已做':`本月：${DEEDS[S.month][0]}`]];
  const tot=S.hurt?CFG.apInjured:CFG.apMonth;const bc=bribeCost();const war=S.route==='a'&&S.rank>=7;
  return `<div class="play hub nopic">
  <div class="dialog"><div class="hubhead"><h2>${dateTxt()}　<span class="aptag">行动力 ${S.ap}/${tot}</span></h2>${S.ap<=0?'<button class="endbtn hot" data-a="endmonth">结束本月</button>':''}</div><p>${S.ap>0?'选一个方向，每件事用 1 点行动力。行动力用完后才能结束本月。':'本月行动力用完了，还可以打点朝廷；准备好了就点右上角「结束本月」。'}${S.hurt?`\n你负伤在身，本月只有 ${CFG.apInjured} 点行动力`+(S.injured>0?`，之后还要再养 ${S.injured} 个月。`:'，下个月痊愈。'):''}${S.injured>0&&!S.hurt?`\n你受了伤，下月起负伤 ${S.injured} 个月，每月只有 ${CFG.apInjured} 点行动力。`:''}</p>${guideHTML()}</div>
  <div class="choices"><div class="hubgrid">${dirs.map(([d,h])=>`<button class="opt tile" data-a="act" data-d="${d}">${d}<small>${h}</small></button>`).join('')}</div>
  <div class="decree"><button class="opt" data-a="bribe" ${S.silver<bc||war||S.suspicion<=0?'disabled':''}>打点朝廷<small>${war?'已起兵，无从打点':S.suspicion<=0?'猜忌已经是 0，不用打点':`银 ${bc}${S.bribeMi===mi()?'（本月第二次起翻倍）':''}，猜忌 −${CFG.bribeDrop}`}</small></button>
  <button class="opt" data-a="accept">投奔者：${S.accept?'收编':'婉拒'}<small>${volunteers()?`每月约 ${volunteers()} 人，`:`民心 ${CFG.recruitMin} 起才有人投奔，`}点击切换。${acceptTip()}</small></button></div></div></div>`;
}
function helpHTML(){if(typeof HELP!=='function')return'';return `<h4 class="sub" id="help">游戏说明</h4>${HELP().map(([t,x])=>`<details class="help"><summary>${esc(t)}</summary><p>${esc(x)}</p></details>`).join('')}`}
function questHTML(){
  const pv=assassinPreview();const c=S.chap<=16?chap():null,d=S.chap<=16?CH_DEF[S.chap]:null;
  const rq=S.rank<10?promoNeed(S.rank+1):null;const rl=Math.min(S.realm,26);
  return `<div class="page quest">
  <h4 class="sub" style="margin-top:0">终极目标</h4><p class="note">登上皇位，并羽化飞升。两件都做到才算通关。</p>
  ${c?`<h4 class="sub">阶段目标（${S.chap}/16）：${esc(c.name)}</h4><div class="qcard"><p>${esc(c.intro)}</p><p class="qprog">${chipsHTML(chapItems(S.chap))}</p><p class="qrew">${S.acc?esc(accTxt()):`期限：第 ${chDue()} 年腊月底（${chLeftTxt()}）。到期没完成会被问责：朝廷申饬 → 削减封地 → 夺去兵权 → 废为庶人（游戏结束），每级只有 2 个月补救。`}</p></div>`:''}
  <h4 class="sub">帝业</h4><div class="qcard"><p>第 ${S.rank} 阶「${esc(rankName(S.rank))}」${S.route?`（${S.route==='a'?'兵变线':'民心线'}）`:''}</p>
  <p class="note">${rq?`晋升下一阶：${esc(promoProg(S.rank+1))}`:'已登基。'}
帝业越高：奖励越大，修行越快，遇到的事也越难应付，权欲心魔也越重。</p></div>
  <h4 class="sub">仙途</h4><div class="qcard"><p>${realmName(rl)}，修为 ${fmt(S.xiuwei)}/${fmt(xiuNeed(rl))}</p>
  <p class="note">${TRIB_AT[rl]?'下一步是渡劫，不用破障丹。':`下次突破需要破障丹 ${pillNeed(rl)} 颗（你有 ${S.pill} 颗）${isBottle(rl)?'，瓶颈双倍':''}。`}
境界越高：属性上限越高（现在 ${attrCap()}），定力也越强。
大境界渡劫：筑基需帝业${rankLbl(3)}、金丹需${rankLbl(6)}、元婴需第 9 阶、化神需登基，飞升需化神圆满并登基（你现在${rankLbl(S.rank)}）。每次渡劫消耗功德。</p></div>
  <h4 class="sub">兵力</h4><div class="qcard"><p>战力 ${fmt(power())} ÷ 朝廷兵力 ${fmt(S.court)} = 兵力比 ${ratio()}%（${ratioTier(ratio())[1]}）</p>
  <p class="note">档位：5% 一方武装／15% 雄兵／30% 朝廷忌惮／60% 可争天下
兵越多，朝廷越猜忌，民心也掉得越快；兵多了要发军饷。私兵只靠百姓投奔。朝廷每年可能对外用兵，兵力会暂时下降。</p></div>
  <h4 class="sub">年末大事</h4><div class="qcard${S.month>=CFG.yearEndWarnMonth?' warn':''}"><p>${S.month>=CFG.yearEndWarnMonth&&S.yeKind?esc(YE_HINT[S.yeKind]):'每年腊月必有一件大事：刺杀、战乱、天灾、朝廷或宗门。九月起会有预兆。'}</p>
  ${S.month>=CFG.yearEndWarnMonth&&S.yeKind==='刺杀'?`<p class="note">防刺客加成 +${guardBonus()}（${esc(guardTxt())}）。</p>`:''}</div>
  ${warnings().length?`<h4 class="sub">警告</h4>${warnings().map(t=>`<p class="note">· ${esc(t)}</p>`).join('')}`:''}
  ${helpHTML()}
  </div>`;
}
/* ================= 帝业页：晋升下一阶每项要多少、有多少、差多少 ================= */
function empItems(r){const q=promoNeed(r);if(!q)return [];
  const it=[['文功（处理公务、巡视民情、事件）',S.wengong,q.wen,fmt],['武功（剿匪巡境、事件）',S.wugong,q.wu,fmt],['银两（晋升时扣除）',S.silver,q.silver,fmt],['民心（门槛，不扣）',S.minxin,q.minxin,x=>x],
    ['境界（门槛）',S.realm,q.realm,x=>realmName(Math.min(x,26))],['上次晋升后的治理次数',actsSince('治理'),q.acts,x=>x+' 次'],['上次晋升后的军务次数',actsSince('军务'),q.acts,x=>x+' 次']];
  if(q.ratio!=null)it.push(['兵力比（兵变线门槛）',ratio(),q.ratio,x=>x+'%']);
  return it.map(([l,v,n,f])=>({l,v,n,f,pct:Math.min(1,n>0?v/n:1)}))}
function empHTML(){
  const r=S.rank;const rows=[];
  for(let i=1;i<=10;i++)rows.push(`<span style="${i===r?'color:var(--cinnabar);font-weight:600':i<r?'opacity:.55':''}">第${i}阶「${esc(rankName(i))}」${i===r?' ← 现在':''}</span>`);
  let next='';
  if(r<10){const it=empItems(r+1);const low=it.reduce((a,b)=>b.pct<a.pct?b:a,it[0]);const all=it.every(x=>x.pct>=1);
    const wait=S.promoCD>mi()?`上次没有成功，${S.promoCD-mi()} 个月后才会再有晋升契机。`:'';
    const needRoute=r===6&&!S.route;
    const ask=S.promoPause?(()=>{const ok=all&&!wait&&!needRoute&&!queue.length;return `<button class="opt primary promoask${ok?' hot':''}" style="margin:4px 0 10px" data-a="promoAsk" ${ok?'':'disabled'}>上表求晋升<small>${ok?'条件已齐，上表后月初触发晋升大事件':queue.length?'眼前还有事没处理完，处理好再来上表':all?'暂时还不能上表':'条件齐了才能上表'}</small></button>`})():'';
    next=`<h4 class="sub">晋升第 ${r+1} 阶「${esc(rankName(r+1))}」</h4>${ask}<div class="qcard">
    ${it.map(x=>`<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;gap:8px"><span style="${x.pct>=1?'color:var(--ok)':''}">${x.pct>=1?'✓ ':''}${esc(x.l)}</span><b style="${x.pct>=1?'color:var(--ok)':''}">${esc(String(x.f(x.v)))} / ${esc(String(x.f(x.n)))}</b></div><div class="tbar" style="margin-top:3px"><i style="width:${Math.round(x.pct*100)}%;${x.pct>=1?'background:var(--ok)':x===low&&!all?'background:var(--cinnabar)':''}"></i></div></div>`).join('')}
    <p class="note" style="margin-top:8px">${needRoute?'第 6 阶之后要先选路线（晋升到第 6 阶时会让你选）。':S.promoPause?'你选择了暂缓晋升。':all?(wait||'条件已经齐了，月初会触发晋升大事件。'):(wait||'')}</p></div>`}
  else next=`<div class="qcard"><p>你已经登基为帝。接下来专心修行，冲击化神与飞升。</p><p class="note">登基后得到的文功、武功会折成功德。</p></div>`;
  return `<div class="page quest">
  <h4 class="sub" style="margin-top:0">帝业</h4><div class="qcard"><p>第 ${r} 阶「${esc(rankName(r))}」${S.route?`（${S.route==='a'?'兵变线':'民心线'}）`:''}</p>
  <p class="note">帝业越高：收入越多、事件奖励越大、修炼越快；但事件要求越高，权欲带来的心魔也越重。</p></div>
  ${next}
  <h4 class="sub">晋升怎么进行</h4><div class="qcard"><p class="note">所有条件都达到后，月初触发晋升大事件，三关过两关就晋升。契机出现时也可以选择暂缓，想升的时候再到这里上表。
晋升成功：扣掉这一阶要求的文功、武功和银两（民心、境界、次数只看门槛）。
晋升失利：损失一部分文功和武功，猜忌上升，几个月后才能再试。
每一关都看一项属性，达标就过；三关考的属性各不相同。</p></div>
  <h4 class="sub">路线</h4><div class="qcard"><p class="note">${S.route==='a'?'你走的是兵变线：武功要求高，还要兵力比。起兵后朝廷不再猜忌你，但战乱更多，养兵扰民。':S.route==='b'?'你走的是民心线：文功、民心要求高，也更费银两。猜忌一直都在；民心够高时百姓会替你请命，每次晋升朝廷也会安抚。':'第 6 阶之后要在兵变线和民心线之间选一条，选了不能改。\n兵变线：武功要求高，还要兵力比；起兵后不再有猜忌，但战乱更多。\n民心线：文功、民心要求高，更费银两；猜忌一直都在，靠民心和晋升压下去。'}</p></div>
  <h4 class="sub">帝业十阶</h4><div class="qcard"><p class="note">${rows.join('\n')}</p></div>
  </div>`;
}
function overHTML(){
  if(S.over.win)return `<div class="page over win"><h2>${esc(S.over.title)}</h2><p>${esc(S.over.text)}</p><p class="note">历时 ${S.year} 年，登基为帝，羽化飞升。</p><button class="opt primary" data-a="restart">再来一局</button></div>`;
  return `<div class="page over"><h2>${esc(S.over.title)}</h2><p>${esc(S.over.text)}</p><p class="note">历时 ${S.year} 年，止步于${realmName(Math.min(S.realm,26))}、${rankName(S.rank)}。</p><button class="opt primary" data-a="restart">重新开始</button></div>`;
}
function roleHTML(){
  const rl=Math.min(S.realm,26),need=xiuNeed(rl);
  const ch=(l,v,w)=>`<div class="chip${w?' warn':''}"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="page"><div class="prow">${portrait(me(),false,true)}<div><h3 class="ph">${esc(S.name)}</h3><p class="note">${realmName(rl)}，${rankName(S.rank)}
修为 ${fmt(S.xiuwei)}/${fmt(need)}
文功 ${fmt(S.wengong)}，武功 ${fmt(S.wugong)}（晋升时消耗）</p><div class="btns" style="margin-top:8px"><button class="small" data-a="tab" data-t="log">查看日志（${S.log.length} 条）</button></div></div></div>
  <h4 class="sub">属性（当前上限 ${attrCap()}）</h4><div class="chips">${Object.keys(ATTR).map(k=>ch(ATTR[k],S.attr[k]>=attrCap()?S.attr[k]+' 满':S.attr[k])).join('')}</div>
  <p class="note">属性靠做事培养，每项只由一件事负责：根骨←闭关修炼；悟性←参悟功法；文才←处理公务；心机←巡视民情；武略←剿匪巡境；魅力←结交名士。每次有概率 +1，属性越高越难涨；到当前上限后要突破大境界才能继续。事件的奖励选项要求属性达标。</p>
  <h4 class="sub">资源</h4><div class="chips">${ch('功德',fmt(S.merit))}${ch('防刺客','+'+guardBonus())}${ch('心魔',S.xinmo,S.xinmo>=50)}${ch('民心',S.minxin,S.minxin<20)}${ch('银两',fmt(S.silver))}${ch('月收入',income())}${ch('月军饷',upkeep())}${ch('私兵',fmt(S.troops))}${ch('训练',S.train)}${ch('战力',fmt(power()))}${ch('朝廷兵力',fmt(S.court))}${ch('兵力比',ratio()+'%')}${ch('猜忌',S.suspicion,S.suspicion>=70)}${ch('后宅安宁',S.harmony,S.harmony<40)}${ch('破障丹',S.pill)}${ch('负伤',S.injured?S.injured+'月':'无',S.injured)}</div>
  <p class="note">道侣上限 ${cap()} 位，已结 ${married().length} 位。
每月行动力 ${CFG.apMonth} 点（负伤时 ${CFG.apInjured} 点）。
事件选项：属性达标才能选奖励，达不到只能选惩罚。</p>
</div>`;
}
function ptnHTML(){
  if(!S.partners.length)return '<div class="page"><p class="note">还没有结识任何人。「游历 → 寻访机缘」有机会遇到有缘人，年末擒获的刺客也可以收为己用。</p></div>';
  return `<div class="page"><p class="note">后宅 ${S.partners.length}/${CFG.knownMax} 人，道侣 ${married().length}/${cap()} 位。当前门第标准：才貌 ${cmStd()}（随帝业上涨）。</p>${S.partners.map(p=>{const kp=p.known.filter(a=>p.prefs.includes(a));const kt=p.known.includes(p.taboo);
    return `<div class="pcard">${portrait(p,false,true)}<div><h4>${esc(p.name)}</h4><div class="note" style="margin:0">${esc(p.origin)}，${p.type}类，${stageOf(p.aff)}（好感 ${p.aff}）${p.married?'，已结为道侣':''}
${cmTxt(p)}
羁绊事件：${p.bondN}/${bondsOf(p).length}${p.bondN<bondsOf(p).length?`（感情再深一些会有新的故事${isAssassin(p)&&p.bondN===2?`；要结为道侣满 ${CFG.assassinBondMonths/12} 年`:''}）`:''}
喜好：${kp.length?kp.join('、'):'未知'}（共 ${p.prefs.length} 项）
禁忌：${kt?p.taboo:'未知'}</div></div></div>`}).join('')}</div>`;
}
/* 开发者说明（更新日志），内容在 data/changelog.js */
function devlogHTML(){const L=typeof CHANGELOG!=='undefined'?CHANGELOG:[];
  return `<div class="page devlog"><div class="btns" style="margin-bottom:10px"><button class="small" data-a="tab" data-t="save">返回存档</button></div><h4 class="sub" style="margin-top:0">开发者说明</h4><p class="note">每天改了什么，都写在这里。最新的在最上面。</p>
  ${L.map(v=>`<div class="qcard dl-card"><div class="dl-head"><b>${esc(v.date||'')}</b></div><ul class="dl">${(v.items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>`}
function logHTML(){return `<div class="page"><div class="btns" style="margin-bottom:10px"><button class="small" data-a="tab" data-t="role">返回角色</button></div><h4 class="sub" style="margin-top:0">日志</h4>${S.log.length?`<ol class="log" reversed>${S.log.map(l=>`<li>${esc(l)}</li>`).join('')}</ol>`:'<p class="note">暂无记录。</p>'}</div>`}
function saveHTML(){
  const ok=storageOK();const t=S&&S.savedAt?new Date(S.savedAt):null;
  const cm=typeof cloudCan==='function'&&cloudCan()&&typeof ACCT!=='undefined'&&!!(ACCT&&ACCT.name);   // 云端版：存档在云端，不用存档码、存档文件
  return `<div class="page"><div class="hubhead"><h4 class="sub" style="margin-top:0">存档</h4><button class="small" data-a="tab" data-t="devlog">开发者说明</button></div>${fileMsg?`<div class="gmmsg">${esc(fileMsg)}</div>`:''}${typeof cloudSaveHTML==='function'?cloudSaveHTML():''}
  ${cm?'':`<div class="qcard${ok?'':' warn'}"><p>${ok?'✓ 本浏览器可以自动保存。':'✗ 本浏览器现在无法保存进度（可能是无痕浏览模式），关掉页面进度就会丢。'}</p>
  <p class="note">最近一次自动保存：${t?`${t.getMonth()+1}月${t.getDate()}日 ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}（游戏内 ${dateTxt()}）`:'还没有'}
当前网址：${esc(location.host||'本地文件')}
存档跟着「网址 + 浏览器」走：换了网址、换了浏览器，或者从 Safari 换到主屏幕图标打开，都是另一份存档。</p></div>
  <h4 class="sub">存档码（推荐手机用）</h4><p class="note">把整个存档变成一串文字。复制下来发给自己（微信、备忘录都行），换网址、换手机时粘贴回来就能接着玩。</p>
  <p class="note">上次复制：${S.copyMi?`游戏内第${Math.floor((S.copyMi-1)/12)+1}年${MONTHS[(S.copyMi-1)%12+1]}`:'还没复制过'}</p>
  ${queue.length?'<p class="note">眼前还有事没处理完：现在复制或导出的，是处理这些事之前的进度。</p>':''}<div class="btns" style="margin-top:8px"><button class="small" data-a="copyCode">复制存档码</button></div>
  <textarea id="codeBox" placeholder="把存档码粘贴到这里" style="margin-top:8px;min-height:70px"></textarea>
  <div class="btns" style="margin-top:6px"><button class="small" data-a="pasteCode">读取上面的存档码</button><button class="small" data-a="toTitle">回到标题页</button></div>
  <h4 class="sub">存档文件（电脑用）</h4><p class="note">保存成文件，放进 saves 文件夹，或者换电脑时读取。</p>
  <div class="btns" style="margin-top:10px"><button class="small" data-a="exportSave">导出存档文件</button><label class="small">读取存档文件<input type="file" accept=".json" data-file="save" hidden></label></div>`}
  <h4 class="sub">重新开始</h4><p class="note">${cm?'删除这个存档位的进度，回到起名界面重新开一局。删除后找不回来。':'删除当前进度，回到起名界面重新开一局。删除前想留着这一局，先点上面的「导出存档文件」。'}</p>
  <div class="btns" style="margin-top:8px">${restartArm?'<button class="small danger" data-a="restart">确定删除并重新开始</button><button class="small" data-a="restartNo">取消</button>':'<button class="small" data-a="restartAsk">重新开始</button>'}</div></div>`;
}
function navHTML(){
  const t=[['play','行动'],['quest','目标'],['role','角色'],['ptn','道侣'],['emp','帝业'],['save','存档']];
  return t.map(([k,l])=>`<button class="${tab===k||(k==='role'&&tab==='log')||(k==='save'&&tab==='devlog')?'on':''}" data-a="tab" data-t="${k}">${l}${k==='play'&&tab!=='play'&&queue.length?'<i class="dot"></i>':''}</button>`).join('');
}
function titleHTML(){
  if(!titleSub&&typeof cloudTitleHTML==='function'){const c=cloudTitleHTML();if(c)return c}
  const has=!!S;const home=navigator.standalone||matchMedia('(display-mode: standalone)').matches;const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
  const msg=titleMsg?`<div class="gmmsg">${esc(titleMsg)}</div>`:'';
  if(titleSub==='code')return `<div class="page title"><h2 class="ttl">用存档码找回</h2>${msg}
  <p class="note">把之前复制保存的存档码粘贴到下面（长按文字框 →「粘贴」）。</p>
  <textarea id="tcode" placeholder="XW2-……" style="min-height:120px"></textarea>
  <button class="opt primary" data-a="tLoadCode">读取存档</button><button class="opt" data-a="tBack">返回</button></div>`;
  if(titleSub==='newConfirm')return `<div class="page title"><h2 class="ttl">开新的一局？</h2>
  <p>这台设备上已经有一局存档：<b>${esc(saveBrief(S))}</b>。开新的一局会把它覆盖掉。</p>
  <p class="note">想留着它，先点「复制存档码」存起来，以后可以找回。</p>${msg}
  <button class="opt" data-a="tCopy">复制存档码</button><button class="opt primary" data-a="tNew">覆盖，开新的一局</button><button class="opt" data-a="tBack">返回</button></div>`;
  return `<div class="page title"><h2 class="ttl">藩王修仙录</h2><p class="note ctr">罪藩七皇子，问鼎九五，羽化登仙。</p>${msg}
  ${has?`<button class="opt primary" data-a="tCont">继续游戏<small>${esc(saveBrief(S))}</small></button>`:''}
  <button class="opt${has?'':' primary'}" data-a="${has?'tNewAsk':'tNew'}">新的一局</button>
  <button class="opt" data-a="tCode">用存档码找回<small>换了手机、换了浏览器、存档不见了，都用这个</small></button>
  ${oldSave?'<p class="note">游戏已更新到新版本，旧存档不能继续使用。</p>':''}
  ${!storageOK()?'<p class="note warn">这个浏览器现在无法自动保存（可能开了无痕浏览），关掉页面进度就会丢。</p>':''}
  ${ios&&!home?'<p class="note">提示：iPhone 上请在 Safari 点「分享 → 添加到主屏幕」，以后从主屏幕图标进游戏，可以全屏，存档也更不容易被系统清掉。注意：主屏幕图标和 Safari 里的存档是分开的，可以用存档码互相转移。</p>':''}
  <p class="note">存档只保存在这台设备的这个浏览器里。每年正月游戏会提醒你复制存档码，存到微信或备忘录，丢了也能找回来。</p>
  ${typeof cloudCan==='function'&&cloudCan()?'<button class="opt" data-a="cToCloud">登录，用云端存档<small>换手机、换浏览器都能接着玩</small></button>':''}</div>`;
}
function createHTML(){
  return `<div class="page create"><div class="prow">${portrait({name:'待定'})}<div><h3 class="ph">新的一局</h3><p class="note">你曾是先帝最看重的孩子。一场巫蛊案，一道圣旨，你被削去爵位，贬到北境的朔州。
目标只有一个：登上皇位，并羽化飞升。</p></div></div>
  ${oldSave?'<p class="note">游戏已更新到新版本，旧存档不能继续使用，请重新开一局。</p>':''}
  <label>名字<input type="text" id="cname" maxlength="8" placeholder="为主角起名"></label>
  ${CFG.allowFemale?`<div class="gsel"><label><input type="radio" name="cg" value="m" checked> 男（王爷）</label><label><input type="radio" name="cg" value="f"> 女（公主）</label></div>`:''}
  <button class="opt primary" data-a="create">开始</button><p class="note" id="cerr"></p></div>`;
}
/* ================= 场景背景图 =================
   六个方向各一张；行动主页一张。不属于方向的事件（刺客、年末、晋升、朝廷、突发……）按考的属性找对应的方向：
   根骨/悟性→修行，文才/心机→治理，武略→军务，魅力→游历。结果页沿用上一幕的背景。
   其余没有方向、不考属性的：和道侣有关的用后宅，其他用行动主页的图。目标、角色等标签页、标题页、结局页也统一用行动主页的图。 */
const BG={行动:'xingdong',修行:'xiuxing',治理:'zhili',军务:'junwu',游历:'youli',后宅:'houzhai',行善:'xingshan'};
const ATTR_BG={gengu:'修行',wuxing:'修行',wencai:'治理',xinji:'治理',wulue:'军务',meili:'游历'};
const bgOfOpts=os=>{const o=(os||[]).find(o=>o&&(o.attr||(o.check&&o.check.attr)));return o?ATTR_BG[o.attr||o.check.attr]:''};
let curBg='',curWeak=false;
function applyBg(){const el=$('#main');if(!el||!el.classList||!el.style)return;let k='';
  if(!title&&S&&!S.over&&tab==='play'){
    if(queue.length){const sc=queue[0];let b=sc.bg||bgOfOpts(sc.options);
      /* 没有方向、也不考属性的（每月结算、开局剧情、阶段目标、问责、讨伐、存档提示……）：和道侣有关的用后宅，其余用行动主页的图 */
      if(b)curWeak=false;else if(!curBg||curWeak){b=sc.who&&!sc.who.isMe&&S.partners.includes(sc.who)?'后宅':'行动';curWeak=true}
      if(b)curBg=b;k=curBg}
    else{curBg='';k=S.phase==='act'?'行动':''}}
  else curBg='';
  if(!k&&tab!=='devlog')k='行动';/* 其余页面（目标、角色、道侣、帝业、存档、标题、结局……）统一用行动主页的图 */
  const u=k&&BG[k]?`../images/bg_${BG[k]}.jpg`+(typeof IMG_V!=='undefined'?'?v='+IMG_V:''):'';
  el.classList.toggle('hasbg',!!u);el.style.setProperty('--bgimg',u?`url("${u}")`:'none')}
function render(){_render();applyBg()}
function _render(){
  if(title||!S){$('#status').innerHTML='<div class="t1"><span class="tname">藩王修仙录</span></div>';$('#nav').innerHTML='';$('#main').innerHTML=title?titleHTML():createHTML();return}
  if(!queue.length&&!S.over)chapterCheck();
  let guard=0;while(!S.over&&!queue.length&&S.phase!=='act'&&guard++<10)step();
  if(!queue.length&&S.wantBackup&&S.phase==='act'&&!S.over){S.wantBackup=0;queue.push(backupScene())}
  /* 后宅里做完一件事，剧情都放完后回到后宅菜单，玩家自己点「返回」才回主页 */
  if(!queue.length&&backTo&&S.phase==='act'&&!S.over){const d=backTo;backTo='';save();doAction(d)}else if(S.phase!=='act'||S.over)backTo='';
  renderStatus();
  const pages={quest:questHTML,role:roleHTML,ptn:ptnHTML,log:logHTML,devlog:devlogHTML,emp:empHTML,save:saveHTML};
  $('#main').innerHTML=tab==='play'?(S.over?overHTML():queue.length?sceneHTML(queue[0]):hubHTML()):pages[tab]();
  $('#nav').innerHTML=navHTML();
  if(!queue.length||S.over)save();
}
