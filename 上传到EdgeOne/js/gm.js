/* ================= GM 页面（gm.html 专用） ================= */
let gmMsg='';
const GMF=['year','month','ap','chap','court','courtBase','industry','guard','xiuwei','wengong','wugong','merit','xinmo','minxin','silver','troops','train','suspicion','harmony','pill','injured'];
const GML={year:'年',month:'月',ap:'剩余行动力',chap:'当前阶段(1~16)',court:'朝廷兵力',courtBase:'朝廷兵力基准',injured:'负伤月数',...RES};
function renderGM(){
  const cfg=`<div class="panel gm"><h3>数值配置</h3><div class="grid">${Object.keys(DEFAULT_CFG).map(k=>`<label>${CFGL[k]||k}<input type="number" step="any" data-gc="${k}" value="${CFG[k]}"></label>`).join('')}</div>
  <div class="btns" style="margin-top:10px"><button class="small" data-a="gm" data-x="cfgreset">恢复默认配置</button><button class="small" data-a="exportCfg">导出参数文件</button><label class="small">读取参数文件<input type="file" accept=".json" data-file="cfg" hidden></label></div><p class="note">改动即时生效并保存在本浏览器，优先于 data/config.js 里的默认值；点「恢复默认配置」回到 config.js 的数值。${fileMsg?esc(fileMsg):""}</p></div>`;
  const msg=gmMsg?`<div class="gmmsg">${esc(gmMsg)}</div>`:'';
  if(!S){$('#gm').innerHTML=msg+`<div class="panel gm"><h3>GM</h3><p class="note">还没有存档，先在游戏页面（index.html）创建角色。</p></div>`+cfg;return}
  const quick=[['fill','修为加满'],['break','立即突破'],['promo','触发晋升大事件'],['assassin','触发刺杀'],['yearend','触发年末大事'],['court','触发朝廷事件'],['trib','触发渡劫'],['gongdou','触发宫斗'],['random','触发突发事件'],['deed','触发本月善事'],['skip','跳过本月剩余行动'],['silver','银两 +1000'],['clearq','清空当前事件'],['mq','完成当前章节'],['ap','行动力 +3']];
  const st=`<div class="panel gm"><h3>快捷操作</h3><div class="btns">${quick.map(([x,l])=>`<button class="small" data-a="gm" data-x="${x}">${l}</button>`).join('')}</div>
  <div class="row" style="margin-top:10px"><select id="gmTask">${[...ALL_EV,...EV_YEAREND].map(t=>`<option value="${t.id}">${t.cat}${t.major?'·大事件':''}：${esc(t.title)}</option>`).join('')}</select><button class="small" data-a="gm" data-x="task">触发该事件</button></div>
  <div class="row"><label class="note" style="margin:0"><input type="checkbox" data-gdebug ${CFG.debug?'checked':''}> 显示检定骰点</label></div></div>
  <div class="panel gm"><h3>主角状态</h3><div class="grid">
  <label>境界<select data-gs="realm">${Array.from({length:26},(_,i)=>i+1).map(i=>`<option value="${i}" ${S.realm===i?'selected':''}>${realmName(i)}</option>`).join('')}</select></label>
  <label>帝业<select data-gs="rank">${[1,2,3,4,5,6,7,8,9,10].map(i=>`<option value="${i}" ${S.rank===i?'selected':''}>${i}：${rankName(i)}</option>`).join('')}</select></label>
  <label>路线<select data-gs="route"><option value="" ${!S.route?'selected':''}>未选</option><option value="a" ${S.route==='a'?'selected':''}>兵变线</option><option value="b" ${S.route==='b'?'selected':''}>民心线</option></select></label>
  ${GMF.map(k=>`<label>${GML[k]}<input type="number" data-gs="${k}" value="${S[k]}"></label>`).join('')}
  ${Object.keys(ATTR).map(k=>`<label>${ATTR[k]}<input type="number" data-gattr="${k}" value="${S.attr[k]}"></label>`).join('')}</div></div>
  <div class="panel gm"><h3>道侣</h3><div class="btns">${PT.map(t=>`<button class="small" data-a="gm" data-x="addp" data-t="${t.id}" ${S.metT[t.id]?'disabled':''}>结识 ${t.origin[opp()]}</button>`).join('')}<button class="small" data-a="gm" data-x="addas">生成刺客道侣</button></div>
  ${S.partners.map(p=>`<div class="pcard"><div></div><div><h4>${esc(p.name)}</h4><div class="note" style="margin:0">${esc(p.origin)}，喜好 ${p.prefs.join('、')}；禁忌 ${p.taboo}</div>
  <div class="row"><label class="note" style="margin:0">好感 <input type="number" style="width:70px" data-gp="aff" data-id="${p.id}" value="${p.aff}"></label>
  <label class="note" style="margin:0">羁绊进度 <input type="number" style="width:60px" data-gp="bondN" data-id="${p.id}" value="${p.bondN||0}"></label>
  <label class="note" style="margin:0"><input type="checkbox" data-gp="married" data-id="${p.id}" ${p.married?'checked':''}> 已结为道侣</label>
  <button class="small" data-a="gm" data-x="reveal" data-id="${p.id}">揭示喜好</button><button class="small" data-a="gm" data-x="delp" data-id="${p.id}">移除</button></div></div></div>`).join('')}</div>
  <div class="panel gm"><h3>存档</h3><textarea id="gmSave">${esc(JSON.stringify(S))}</textarea>
  <div class="btns" style="margin-top:8px"><button class="small" data-a="exportSave">导出存档文件</button><label class="small">读取存档文件<input type="file" accept=".json" data-file="save" hidden></label><button class="small" data-a="gm" data-x="import">导入上面文本框的存档</button><button class="small" data-a="gm" data-x="reset">${gmResetArm?'确认删除存档？再点一次':'删除存档，重新开局'}</button></div></div>`;
  $('#gm').innerHTML=msg+st+cfg;
}
function gmAction(b){
  const x=b.dataset.x;const send=(cmd,arg)=>{const q=LS.get('xw_gmcmd')||[];q.push({cmd,arg});LS.set('xw_gmcmd',q);gmMsg=`已发送「${b.textContent}」，切到游戏页面就会出现。`};
  const P=S&&b.dataset.id?S.partners.find(p=>p.id===b.dataset.id):null;
  switch(x){
    case 'cfgreset':CFG=Object.assign({},DEFAULT_CFG);LS.del('xw_cfg');break;
    case 'fill':S.xiuwei=xiuNeed(S.realm);break;
    case 'break':S.xiuwei=xiuNeed(S.realm);save();send('break');break;
    case 'promo':case 'assassin':case 'gongdou':case 'random':case 'deed':case 'skip':send(x);break;
    case 'task':send('task',$('#gmTask').value);break;
    case 'silver':S.silver+=1000;break;
    case 'clearq':send('clearq');break;
    case 'mq':if(S.chap<=16)S.chap++;break;
    case 'ap':S.ap+=3;if(S.phase!=='act')S.phase='act';break;
    case 'addp':{const t=PT.find(t=>t.id===b.dataset.t);const p=makePartner(t);p.met=true;p.aff=30;S.partners.push(p);S.metT[t.id]=1;break}
    case 'addas':{const g=opp();const p=makePartner(null,{name:randName(g),g,hue:rand(360)});p.met=true;p.aff=30;S.partners.push(p);break}
    case 'reveal':if(P)P.known=[...new Set([...P.known,...P.prefs,P.taboo])];break;
    case 'delp':S.partners=S.partners.filter(p=>p!==P);break;
    case 'import':try{const o=JSON.parse($('#gmSave').value);if(o&&o.v===1){S=migrate(o);gmMsg='已导入存档。'}}catch(e){gmMsg='存档格式不对。'}break;
    case 'reset':if(!gmResetArm){gmResetArm=true;render();return}gmResetArm=false;S=null;LS.del('xw_save');gmMsg='存档已删除，游戏页面会回到起名界面。';render();return;
  }
  save();render();
}

