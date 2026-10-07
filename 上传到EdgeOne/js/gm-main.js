/* GM 页面（gm.html）的事件绑定。改动直接写进浏览器存储，游戏页面会自动同步。 */
render=renderGM;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;
  if(a!=='gm')gmResetArm=false;
  fileMsg='';gmMsg='';
  if(a==='exportSave'){if(S)download(`存档_${S.name}_第${S.year}年${MONTHS[S.month]}.json`,S);return}
  if(a==='exportCfg'){download('游戏参数.json',CFG);return}
  if(a==='refresh'){S=migrate(LS.get('xw_save'));renderGM();return}
  if(a==='gm')gmAction(b);
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.file){loadFile(t);return}
  if(t.dataset.gc){const v=parseFloat(t.value);if(!isNaN(v)){CFG[t.dataset.gc]=v;LS.set('xw_cfg',CFG)}return}
  if(t.hasAttribute('data-gdebug')){CFG.debug=t.checked?1:0;LS.set('xw_cfg',CFG);renderGM();return}
  if(!S)return;
  if(t.dataset.gs==='route'){S.route=t.value||null;save();return}
  if(t.dataset.gs){const v=parseFloat(t.value);if(!isNaN(v)){S[t.dataset.gs]=v;if(t.dataset.gs==='realm')S.xiuwei=Math.min(S.xiuwei,xiuNeed(v));save()}return}
  if(t.dataset.gattr){const v=parseInt(t.value);if(!isNaN(v)){S.attr[t.dataset.gattr]=v;save()}return}
  if(t.dataset.gp){const p=S.partners.find(x=>x.id===t.dataset.id);if(!p)return;const k=t.dataset.gp;
    if(k==='aff')p.aff=clamp(parseInt(t.value)||0,0,100);else if(k==='bondN'){p.bondN=clamp(parseInt(t.value)||0,0,3);p.bonded=p.bondN>0}else p[k]=t.checked;save()}
});
/* 游戏页面存档变了，这里跟着刷新（正在输入时不打断） */
window.addEventListener('storage',e=>{
  if(e.key==='xw_save'){S=migrate(LS.get('xw_save'));}
  else if(e.key==='xw_cfg'){CFG=Object.assign({},DEFAULT_CFG,LS.get('xw_cfg')||{})}
  else return;
  const f=document.activeElement;if(f&&/INPUT|TEXTAREA|SELECT/.test(f.tagName))return;renderGM();
});
renderGM();
