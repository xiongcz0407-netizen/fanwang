/* ================= 事件绑定 ================= */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;
  if(!['restartAsk','restart','restartNo'].includes(a))restartArm=false;
  if(a==='zoom'){zoomOpen(b.dataset.src,b.dataset.name);return}
  if(a==='unzoom'){zoomClose();return}
  fileMsg='';
  if(a==='opt'){const sc=queue[0];if(!sc)return;const o=sc.options[+b.dataset.i];queue.shift();o.run();tab='play';render();return}
  if(a==='act'){doAction(b.dataset.d);tab='play';render();return}
  if(a==='bribe'){const c=bribeCost();if(S.silver>=c){const d=Math.min(CFG.bribeDrop,S.suspicion);
    queue.unshift({who:me(),tag:'打点朝廷',title:'打点朝廷？',text:`这次要花银 ${c}${S.bribeMi===mi()?'（本月第二次起翻倍）':''}。\n银两 ${S.silver} → ${S.silver-c}\n猜忌 ${S.suspicion} → ${S.suspicion-d}`,
      options:[{label:'确定打点',run(){markPhase();if(S.silver<c)return;S.silver-=c;S.bribeMi=mi();S.suspicion=clamp(S.suspicion-CFG.bribeDrop,0,100);logAdd('打点朝廷');result('打点朝廷',`银子送进了京城几位大人的府上。\n（银两 −${c}，猜忌 −${d}）`)}},{label:'算了',run(){}}]})}render();return}
  if(a==='endmonth'){
    /* 后宅还有人本月没互动（道侣没双修/相处、结缘的还能相处）：先问一句 */
    const left=queue.length?[]:S.partners.filter(p=>talkLeft(p)>0);
    if(left.length){const ls=left.map(p=>`· ${p.name}${p.married?'（道侣，本月还没双修或相处）':`（本月还能相处 ${talkLeft(p)} 次）`}`).join('\n');
      queue.unshift({who:me(),tag:'结束本月',title:'结束本月？',text:`后宅还有人这个月没去看：\n${ls}\n\n要直接进入下个月吗？`,
        options:[{label:'去后宅',hint:'先去后宅看看',run(){doAction('后宅')}},{label:'进入下个月',hint:'这个月不去后宅了',run(){endMonth()}}]});tab='play';render();return}
    endMonth();tab='play';render();return}
  if(a==='accept'){S.accept=!S.accept;render();return}
  if(a==='promoAsk'){if(S.rank<10&&promoReady(S.rank+1)&&mi()>=S.promoCD&&!queue.length){S.promoPause=false;startPromo(S.rank+1);tab='play'}render();return}
  if(a==='tab'){tab=b.dataset.t;render();return}
  if(a==='tCont'){title=false;titleMsg='';tab='play';render();return}
  if(a==='tNewAsk'){titleSub='newConfirm';titleMsg='';render();return}
  if(a==='tNew'){title=false;titleSub='';titleMsg='';S=null;queue=[];LS.del('xw_save');render();return}
  if(a==='tCode'){titleSub='code';titleMsg='';render();return}
  if(a==='tBack'){titleSub='';titleMsg='';render();return}
  if(a==='tCopy'){copyText(saveCode(),ok=>{titleMsg=ok?'存档码已复制，粘贴到微信或备忘录保存好。':'复制失败，请先继续游戏，到「存档」页手动复制。';render()});return}
  if(a==='tLoadCode'){const v=$('#tcode').value;if(!v.trim()){titleMsg='先把存档码粘贴到文字框里。';render();return}
    const o=parseCode(v);if(!o){titleMsg='存档码不对：检查有没有复制完整，或者是不是旧版本的存档码。';render();return}
    if(typeof ACCT!=='undefined'&&ACCT&&ACCT.name&&cloudSlots){SLOT=null;LS.del('xw_slot');LS.del('xw_savemeta');S=migrate(o);queue=[];S.copyMi=mi();LS.set('xw_save',S);titleSub='';titleMsg='';
      cloudMsg=cloudSlots.some(x=>!x)?'存档码已读取。在下面选一个空的存档位，点「把这台设备上的存档放进来」。':'存档码已读取，但三个存档位都满了。先删掉一个，再把它放进来。';render();return}
    if(typeof ACCT!=='undefined'){ACCT={local:1};LS.set('xw_acct',ACCT);SLOT=null;LS.del('xw_slot')}
    loadCode(v);S.copyMi=mi();save();title=false;titleSub='';titleMsg='';tab='play';fileMsg='';render();return}
  if(a==='toTitle'){if(queue.length){fileMsg='眼前还有事没处理完，先回「行动」页处理好，再回标题页。';render();return}save();title=true;titleSub='';titleMsg='';render();return}
  if(a==='create'){const n=$('#cname').value.trim();if(!n){$('#cerr').textContent='先给主角起个名字。';return}
    const gr=document.querySelector('input[name=cg]:checked');newGame(n.slice(0,8),gr?gr.value:'m');tab='play';render();return}
  if(a==='restartAsk'){restartArm=true;render();return}
  if(a==='restartNo'){restartArm=false;render();return}
  if(a==='restart'){restartArm=false;S=null;queue=[];tab='play';LS.del('xw_save');render();return}
  if(a==='copyCode'){if(!S)return;const busy=queue.length>0;const c=busy?saveCode(LS.get('xw_save')||S):saveCode();const mark=()=>{if(!busy){S.copyMi=mi();save()}};
    copyText(c,ok=>{if(ok){mark();fileMsg=busy?'存档码已复制。眼前还有事没处理完，复制的是处理这些事之前的进度。':'存档码已复制，粘贴到微信「文件传输助手」或备忘录保存好。';render()}
      else{fileMsg='自动复制失败：存档码已放进下面的文字框，长按 →「全选」→「拷贝」。';render();const box=$('#codeBox');box.value=c;box.select();mark()}});return}
  if(a==='pasteCode'){const v=$('#codeBox').value;if(!v.trim()){fileMsg='先把存档码粘贴到文字框里。';render();return}
    fileMsg=loadCode(v)?`已读取存档：${S.name}，${dateTxt()}`:'存档码不对，检查一下有没有复制完整。';render();return}
  if(a==='exportSave'){if(S){const o=queue.length?(LS.get('xw_save')||S):S;download(`存档_${o.name}_第${o.year}年${MONTHS[o.month]}.json`,o)}return}
});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.file)loadFile(t)});
/* 切到后台或关闭前，事件处理完就存一下 */
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&!queue.length)save()});
window.addEventListener('pagehide',()=>{if(S&&!queue.length)save()});

/* ================= 与 GM 页（gm.html）同步 =================
   GM 页改了存档或参数会写进浏览器存储，这里收到后自动刷新；
   「触发事件」类操作由 GM 页写进 xw_gmcmd，游戏页面取出后在这里执行。 */
function gmExec(c){
  if(!S)return;
  switch(c.cmd){
    case 'break':{const bi=breakInfo();if(bi.ok)bi.run();else result('GM',bi.label+'：'+bi.hint);break}
    case 'promo':if(S.rank<10){if(S.rank>=6&&!S.route)S.route='b';startPromo(S.rank+1)}break;
    case 'assassin':assassination();break;
    case 'gongdou':{const t=married().length>=2?pickFrom(ALL_EV.filter(t=>t.cat==='后宅'&&t.needP2)):null;t?queue.unshift(sceneFor(t,'宫斗')):result('GM','宫斗需要至少两位已结为道侣的角色。');break}
    case 'random':{const t=pick1(ALL_EV.filter(t=>t.cat==='突发'));queue.unshift(taskScene(t));break}
    case 'court':{const t=pick1(ALL_EV.filter(t=>t.cat==='朝廷'&&condOK(t.cond)));if(t)queue.unshift(sceneFor(t));break}
    case 'yearend':yearEndEvent();break;
    case 'trib':{const k=TRIB_AT[S.realm];if(k)queue.unshift(tribScene(k));else result('GM','当前不在大境界关口（每个大境界的圆满，练气是九层）。');break}
    case 'deed':deedScene();break;
    case 'task':{const t=TASKMAP[c.arg];if(t)queue.unshift(taskScene(t));break}
    case 'skip':queue=[];S.ap=0;if(['act','start'].includes(S.phase))S.phase='random';break;
    case 'clearq':queue=[];break;
  }
  tab='play';
}
function gmPull(){const cmds=LS.get('xw_gmcmd')||[];if(!cmds.length)return false;LS.del('xw_gmcmd');cmds.forEach(gmExec);return true}
window.addEventListener('storage',e=>{
  if(e.key==='xw_cfg')CFG=Object.assign({},DEFAULT_CFG,LS.get('xw_cfg')||{});
  if(e.key==='xw_save'){S=migrate(LS.get('xw_save'));if(!S)queue=[]}
  if(e.key==='xw_gmcmd')gmPull();
  if(['xw_cfg','xw_save','xw_gmcmd'].includes(e.key))render();
});
window.addEventListener('focus',()=>{if(gmPull())render()});
gmPull();
render();

/* 立绘放大：点一下打开，再点一下（任意位置）关闭 */
function zoomOpen(src,name){zoomClose();const d=document.createElement('div');d.id='zoomlay';d.dataset.a='unzoom';
  d.innerHTML=`<div class="zbox"><img src="${esc(src)}" alt="${esc(name||'')}">${name?`<span class="seal">${[...name].slice(0,4).map(esc).join('')}</span>`:''}</div>`;document.body.appendChild(d)}
function zoomClose(){const d=document.getElementById('zoomlay');if(d)d.remove()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')zoomClose()});

/* ================= 加载界面：打开游戏时先下载图片 =================
   先下：七张背景、王爷、后宅里现有的道侣（等它们下完再进游戏，最多等 8 秒）；
   进游戏后再在后台把其余立绘悄悄下完，以后遇到新道侣也不用等。 */
(function(){
  const el=document.getElementById('loading');if(!el)return;
  const u=src=>typeof imgUrl==='function'?imgUrl(src):src;
  const bgs=Object.values(typeof BG!=='undefined'?BG:{}).map(k=>u('images/bg_'+k+'.jpg'));
  const mine=[u(PORTRAIT)].concat(((S&&S.partners)||[]).map(p=>p.img).filter(Boolean).map(u));
  const first=[...new Set(bgs.concat(mine))];
  const rest=[...new Set([...(typeof DAOLV_IMGS_F!=='undefined'?DAOLV_IMGS_F:[]),...(typeof DAOLV_IMGS_M!=='undefined'?DAOLV_IMGS_M:[])].map(u))].filter(x=>!first.includes(x));
  const keep=[];/* 留住引用，避免下好的图被浏览器丢掉 */
  const load=src=>new Promise(res=>{const im=new Image();keep.push(im);im.onload=im.onerror=()=>{(im.decode?im.decode().catch(()=>{}):Promise.resolve()).then(res)};im.src=src});
  let n=0;const bar=document.getElementById('lbari'),txt=document.getElementById('ltxt');
  const tick=()=>{n++;if(bar)bar.style.width=Math.round(n/first.length*100)+'%';if(txt)txt.textContent=`正在加载…… ${n}/${first.length}`};
  let ended=false;const end=()=>{if(ended)return;ended=true;el.classList.add('done');setTimeout(()=>el.remove(),500);
    rest.reduce((p,src)=>p.then(()=>load(src)),Promise.resolve())};
  Promise.all(first.map(src=>load(src).then(tick))).then(end);
  setTimeout(end,8000);
})();
