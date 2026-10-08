/* 可以用记事本修改。改完保存，刷新网页即可生效。 */
/* train：做这件事有概率提升哪项属性（每项属性只由一件事负责）；trainMul：几率倍数（不显示给玩家）。不超过当前境界上限。
   玩家主动行动：每个消耗 1 点行动力，收益固定，会直接显示给玩家。
   做完之后，有 CFG.actEventChance 的概率顺带遇到一件该方向的随机事件（不占行动力，不能跳过）。
   cost：消耗；eff：收益；tip：额外说明；cond：什么时候显示；evBonus：额外提高随机事件概率；lottery：寻访机缘，结果由 engine.js 的 seekDraw 抽取。
   特殊收益：industry（每月收入永久增加）、guard（今年年末防刺客加成）。
   收益数字按前期写，结算时自动按阶段放大（功绩/银两/功德/私兵 × 帝业倍率，修为 × 大境界倍率）。 */
const ACTIONS={
 修行:[
  {id:'retreat',train:'gengu',label:'闭关修炼',text:'你闭门谢客，静坐运功。',
   eff:()=>S.xiuwei>=xiuNeed(S.realm)*CFG.xiuBank?{}:({xiuwei:Math.round(CFG.retreatBase*(1+S.attr.wuxing/50)*lingMul()*(1+0.1*(S.dongtian||0))*(S.hurt?0.5:1))}),tip:()=>'悟性越高修为越多；帝业越高灵脉越足'+(S.dongtian?'；有洞天福地加成':'')+'；负伤时减半'},
  {id:'pill',label:'炼制破障丹',text:'丹炉昼夜不熄，终于开炉取丹。',
   noDim:true,cost:()=>({silver:Math.round(CFG.pillCost*[1,CFG.pillRepeat2,CFG.pillRepeat3][Math.min(actN('pill'),2)])}),eff:()=>({pill:pillYield()}),tip:()=>(pillYield()>=2?`悟性已到 ${CFG.pillWuxingStep}，一炉出 2 颗`:`悟性到 ${CFG.pillWuxingStep} 后一炉出 2 颗`)+'；突破小境界要用，境界越高要得越多，瓶颈要双倍，渡劫不用'},
  {id:'study',train:'wuxing',trainMul:2,label:'参悟功法',text:'你把绢书上的口诀翻来覆去琢磨，渐渐摸到了一点门道。',
   eff:()=>({xiuwei:Math.round(CFG.studyXiuwei*lingMul())}),tip:'修为不多，主要用来提升悟性'}],
 治理:[
  {id:'patrol',train:'xinji',trainMul:2,label:'巡视民情',text:'你带着两个随从走街串巷，听了一整天的家长里短。',
   eff:()=>({minxin:4,wengong:5+Math.floor(S.attr.wencai/5)}),tip:'文才越高，文功越多'},
  {id:'office',train:'wencai',label:'处理公务',text:'你把积压的公文批完，又理了一遍封地的账。',
   eff:()=>({wengong:20+Math.floor(S.attr.wencai/2)}),tip:'文才越高，文功越多'},
  {id:'industry',label:'发展产业',text:'你出资修了作坊和集市，商户们开始陆续进驻。',
   cost:()=>({silver:Math.round(150*indPriceMul())}),eff:()=>({wengong:15,industry:15}),tip:()=>`产业收入永久有效；产业越多，再扩张越贵；现有产业每月 ${S.industry} 两`}],
 军务:[
  {id:'drill',label:'操练私兵',text:'校场上喊杀声震天。',
   eff:()=>({train:5}),tip:'训练度越高，私兵越能打，剿匪、打仗、防刺客都有好处；不练会慢慢下降'},
  {id:'bandit',train:'wulue',label:'剿匪巡境',text:'你带兵把封地边界走了一圈，顺手端掉了一伙毛贼。',
   eff:()=>({wugong:Math.round((32+Math.floor(S.attr.wulue/2))*(1+S.train/200))}),tip:'武略越高、私兵训练度越高，武功越多'},
  {id:'guard',label:'加强府中守卫',text:'你在府中加设暗哨，换了一批可靠的护院。',
   cost:()=>({silver:120}),eff:()=>({guard:Math.min(5,CFG.guardMax-S.guard)}),maxed:()=>S.guard>=CFG.guardMax,tip:()=>`最多 +${CFG.guardMax}，现在 +${S.guard}；每次刺杀 −${CFG.assassinGuardWear}，夜袭 −${CFG.raidGuardWear}；防夜袭需要总加成 ${raidReq()}，你现在 ${guardBonus()}`}],
 游历:[
  {id:'xia',label:'行侠仗义',text:'你在乡间路见不平，顺手管了几桩闲事。',
   eff:()=>({merit:12,xinmo:-2}),tip:'渡劫要消耗功德；也是降心魔的主要办法'},
  {id:'seek',label:'寻访机缘',text:'你带着盘缠，循着传闻进山访古。',lottery:true,
   cost:()=>({silver:40}),eff:()=>({}),tip:()=>{const P=Object.fromEntries(SEEK_P);return '全凭运气，有好有坏；道侣只能这样遇到；本月再次寻访，好处减少，坏事不减'}},
  {id:'friend',train:'meili',trainMul:2,label:'结交名士',text:'你在茶楼设宴，与本地文人谈诗论道。',
   cost:()=>({silver:60}),eff:()=>({wengong:10,suspicion:S.route==='b'&&S.rank>=7?-6:-3}),tip:()=>'名士替你在京中说话'+(S.route==='b'&&S.rank>=7?'；民心线降猜忌翻倍':'')}],
 后宅:[
  {id:'reward',label:'赏赐后宅',text:'你给府里上下都添了新衣和赏钱。',
   cost:()=>({silver:80}),eff:()=>({harmony:8}),cond:()=>S.partners.length>0,tip:'后宅不宁，心魔会加重'},
  {id:'calm',label:'独处静心',text:'你一个人在后园坐了很久。',
   eff:()=>({xinmo:-2,harmony:-2}),tip:'独处太久，后宅也会有怨言'}]
};
