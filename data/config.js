/* 可以用记事本修改。改完保存，刷新网页即可生效。 */
/* 默认数值参数。GM 页面里改过的参数会优先生效，点「恢复默认配置」回到这里的数值。 */
const DEFAULT_CFG={
  // 开局
  startAttr:20,startSilver:500,startTroops:100,startMinxin:30,startSuspicion:20,startHarmony:70,
  // 行动力与检定
  apMonth:3,apInjured:1,checkGap:5,critRatio:0.2,diffPerRank:0.12,actEventChance:0.4,
  // 属性上限（按大境界：练气/筑基/金丹/元婴/化神）
  capQi:35,capZhu:40,capJin:45,capYuan:60,capHua:70,capLian:80,capHe:90,capDa:100,trainBase:2,trainChance:2,dismissPerCm:1.5,dismissHarmony:3,trainStep:12,overflowRate:20,trainDecay:2,xiuBank:1.5,courtPerSusp:0.3,emperorIncome:0.5,giftAttrChance:5,
  // 修行（修为倍率按大境界放大，见 REALM_MUL）
  retreatBase:75,naturalPerGengu:0.3,dualMul:0.6,dualHigherBonus:0.5,studyXiuwei:20,
  normalBase:80,normalGengu:0.2,normalCap:98,bottleBase:60,bottleGengu:0.2,bottleWuxing:0.1,pillBonus:20,pillCost:200,pillRepeat2:1.5,pillRepeat3:2,pillWuxingStep:25,
  // 渡劫消耗功德（基础值，会按阶段放大显示）
  meritZhu:250,meritJin:450,meritYuan:1500,meritHua:4000,meritLian:1000,meritHe:7000,meritDa:1000,meritFei:10500,tribAttrGain:2,xinmoStop:60,xinmoNoBreak:80,tribDiffPerMajor:0.35,
  // 帝业：每升一阶，奖励放大 rankScale（第1阶×1，第10阶×5.5）
  rankScale:0.5,lingPerRank:0.15,promoFailLoss:15,promoBribeRate:40,danMax:2,feudExec:2,promoReqPlus:6,
  // 经济
  incomeBase:70,incomePerMinxin:1.0,incomeRankScale:0.1,industryPerRank:65,industryDouble:0.5,upkeepPer100:1.5,freeTroopsPerRank:1500,minxinDecay:1,minxinDecayStep:25,minxinDecayPer3Rank:1,minxinDecayRatio:40,
  // 兵力
  courtStart:100000,courtGrowth:0.01,warChance:0.6,warLossMin:10,warLossMax:30,warRecover:5,
  recruitMin:40,recruitOffset:30,recruitMul:1,desertBelow:20,desertRate:0.05,
  suspPerRatio:5,bribeBase:50,bribePerRatio:15,bribeCap:300,bribeDrop:15,
  // 心魔：帝业带来权欲（第4阶起每月+2，第7阶+3，第10阶+4），每个大境界的定力每月抵消1
  xinmoRank4:4,xinmoRank7:6,xinmoRank10:8,xinmoResistPerMajor:1,deedXinmo:2,
  // 事件概率
  courtEventChance:25,randomEventChance:20,gongdouChance:12,encounterBase:15,encounterMeili:0.1,
  // 道侣
  partnerMax:3,revengeMonths:3,revengeOffset:11,revengeSpread:6,shameSilver:300,shameMinxin:8,shameSusp:10,shameXinmo:10,dualRewardMul:0.6,marryAff:90,brideCm:10,warTrainStep:10,talkMarried:1,splitAff:50,splitCost:300,splitKeepAff:55,splitXinmo:5,splitHarmony:5,knownMax:5,leaveMonths:6,keepCost:150,xinmoSlowFrom:30,harmonyPerWife:1,raidGuardWear:5,tribHit:40,tribRollLo:6,tribRollHi:2,routeBSusp80:1,routeBSusp90:2,routeBSuspLo:70,routeBSuspHi:85,routeBPromoSusp:20,houseEventChance:0.2,promoActBase:4,promoActPerRank:2,meritStudyCost:60,tortureXinmo:30,assassinDualMul:1.8,assassinPen:25,assassinPenLate:15,assassinBondMonths:12,divorceXinmo:15,guardWifeMax:15,neglectMonths:3,harmonyLowXinmo:2,talkPerMonth:2,affLike:6,affRandLo:-2,affRandHi:3,affUpP:0.65,assassinRandHi:2,favShow:0.7,
  // 年末
  pleaWindow:84,meritCalmCost:15,meritCalmXinmo:8,meritGuardRatio:0.3,xinmoDeathMonths:3,assassinRatio:0.95,assassinEdge:10,guardMax:30,assassinMonthly:3,assassinPerSusp:30,assassinFreeYears:2,assassinGuardWear:10,assassinCmHigh:5,assassinCmMid:25,raidChance:2,raidPerSusp:30,yearEndWarnMonth:9,overduePenaltySusp:10,overduePenaltyXinmo:5,
  allowFemale:0,debug:0};
const CFGL={startAttr:'开局属性',startSilver:'开局银两',startTroops:'开局私兵',startMinxin:'开局民心',startSuspicion:'开局猜忌',startHarmony:'开局后宅安宁',
  apMonth:'每月行动力',apInjured:'负伤时行动力',checkGap:'属性每差1点成功率−%',critRatio:'大成功系数',diffPerRank:'每阶难度增幅',actEventChance:'行动后随机事件概率(0~1)',
  capQi:'练气属性上限',capZhu:'筑基属性上限',capJin:'金丹属性上限',capYuan:'元婴属性上限',capHua:'化神属性上限',capLian:'炼虚属性上限',capHe:'合体属性上限',capDa:'大乘属性上限',trainBase:'属性历练基础次数',trainChance:'属性提升几率系数(几率=系数÷需要次数)',dismissPerCm:'遣散费=才貌×几',dismissHarmony:'遣散降后宅安宁',trainStep:'属性每多几点历练次数+1',emperorIncome:'登基后私库收入比例',xiuBank:'修为最多存到本层的几倍',courtPerSusp:'起兵后每点猜忌变化=朝廷兵力%',trainDecay:'训练度每月自然下降',overflowRate:'登基后功绩折功德比例(几点折1)',giftAttrChance:'道侣礼物给属性的概率%（已停用）',
  retreatBase:'闭关基础修为',naturalPerGengu:'每点根骨月修为',dualMul:'双修倍率（已停用）',dualHigherBonus:'道侣境界高加成（已停用）',studyXiuwei:'参悟功法修为',
  normalBase:'普通突破基础%',normalGengu:'普通突破根骨系数',normalCap:'突破成功率上限%',bottleBase:'瓶颈突破基础%',bottleGengu:'瓶颈根骨系数',bottleWuxing:'瓶颈悟性系数',pillBonus:'破障丹加成%',pillWuxingStep:'悟性每多少点一炉多出1颗丹',pillCost:'破障丹价格',pillRepeat2:'同月第2炉价格倍数',pillRepeat3:'同月第3炉起价格倍数',
  meritZhu:'筑基耗功德',meritJin:'金丹耗功德',meritYuan:'元婴耗功德',meritHua:'化神耗功德',meritLian:'炼虚耗功德',meritHe:'合体耗功德',meritDa:'大乘耗功德',meritFei:'飞升耗功德',tribAttrGain:'渡劫成功全部属性提升（没完美渡劫少 1）',tribDiffPerMajor:'每大境界渡劫难度增幅',xinmoStop:'心魔停滞线',xinmoNoBreak:'心魔禁渡劫线',
  rankScale:'每阶奖励放大',promoFailLoss:'晋升失败文功武功损失%',promoBribeRate:'晋升打点价格=该阶晋升银两的%',danMax:'护身丹最多存几颗',feudExec:'处决刺客后以后刺客难度+几',promoReqPlus:'第5阶起晋升关卡属性要求额外加几',lingPerRank:'每阶修行灵脉加成',incomeBase:'月收入基数',incomePerMinxin:'每点民心收入',incomeRankScale:'每阶收入增幅',industryPerRank:'产业价格基准(×帝业阶)',industryDouble:'产业每多几份基准价格翻倍',freeTroopsPerRank:'每阶免饷府兵人数',upkeepPer100:'每百私兵月军饷',minxinDecayStep:'民心每多少点每月多掉1',minxinDecay:'民心每月自然下降',minxinDecayPer3Rank:'每5阶民心多降',minxinDecayRatio:'兵力比每几%民心多降1',
  courtStart:'朝廷兵力开局',courtGrowth:'朝廷兵力年增长',warChance:'每年朝廷打仗概率',warLossMin:'打仗损兵最少%',warLossMax:'打仗损兵最多%',warRecover:'战后每月恢复%',
  recruitMin:'投奔民心门槛',recruitOffset:'投奔民心偏移',recruitMul:'投奔倍率(再×人口)',desertBelow:'逃散民心线',desertRate:'逃散比例',
  suspPerRatio:'兵力比每几%月猜忌+1',bribeBase:'打点基础价',bribePerRatio:'兵力比每1%打点加价',bribeCap:'打点价上限(×帝业倍率)',bribeDrop:'打点降猜忌',
  xinmoRank4:'第4阶起月心魔',xinmoRank7:'第7阶起月心魔',xinmoRank10:'第10阶月心魔',xinmoResistPerMajor:'每大境界抵消月心魔',deedXinmo:'善事降心魔',
  courtEventChance:'朝廷事件月概率%',randomEventChance:'突发事件月概率%',gongdouChance:'宫斗月概率%',encounterBase:'偶遇基础%（已停用）',encounterMeili:'每点魅力偶遇%（已停用）',
  partnerMax:'道侣上限',marryAff:'提亲所需好感',brideCm:'聘礼：每点才貌多少银两（再乘帝业倍率）',revengeMonths:'逼供后刺客报复几次',revengeOffset:'报复刺客身手比刺杀要求高多少',revengeSpread:'报复刺客身手浮动',shameSilver:'羞辱换钱基础银两',shameMinxin:'报复得手民心下降',shameSusp:'报复得手猜忌上升',shameXinmo:'报复得手心魔上升',dualRewardMul:'每次双修奖励倍率',warTrainStep:'训练度每几点让年末战乱属性+1',talkMarried:'道侣每月互动次数',splitAff:'道侣好感低于多少会提出和离',splitCost:'挽回提出和离的道侣花费(×帝业倍率)',splitKeepAff:'挽回后好感',splitXinmo:'和离心魔',splitHarmony:'和离后宅安宁下降',knownMax:'后宅最多几人(含道侣)',leaveMonths:'未成亲者几个月不看望会离开',keepCost:'挽留未成亲者花费(×帝业倍率)',xinmoSlowFrom:'心魔超过多少后修为变慢(每点-1%)',harmonyPerWife:'第2位起每位道侣每月后宅安宁下降',raidGuardWear:'每次夜袭消耗守卫',tribHit:'天雷没挡住扣护体',tribRollLo:'天雷根骨要求最多比基准低',tribRollHi:'天雷根骨要求最多比基准高',routeBSusp80:'民心线民心达到低档时每月猜忌下降',routeBSusp90:'民心线民心达到高档时每月猜忌下降',routeBSuspLo:'民心线降猜忌低档民心',routeBSuspHi:'民心线降猜忌高档民心',routeBPromoSusp:'民心线晋升后猜忌下降',houseEventChance:'看望道侣时遇到后宅事件的概率',promoActBase:'晋升要求治理/军务次数基数',promoActPerRank:'晋升要求治理/军务次数每阶增加',meritStudyCost:'以功德悟道花费(×帝业倍率)',tortureXinmo:'严刑逼供心魔',assassinDualMul:'刺客道侣双修倍率',assassinPen:'刺客道侣双修惩罚几率%',assassinPenLate:'刺客羁绊走完后惩罚几率%',assassinBondMonths:'刺客第三段羁绊需成亲满几个月',divorceXinmo:'休离道侣心魔',guardWifeMax:'武类道侣防刺客加成上限',neglectMonths:'冷落月数',harmonyLowXinmo:'后宅不宁月心魔',talkPerMonth:'未成亲者每月互动次数',affLike:'最喜欢的相处方式加好感',affRandLo:'其他相处方式：不顺利时扣多少好感',affRandHi:'其他相处方式：顺利时加多少好感',affUpP:'其他相处方式顺利的几率',assassinRandHi:'刺客道侣其他相处方式顺利时加多少好感',favShow:'看望时出现她最喜欢的相处方式的几率',
  pleaWindow:'请罪记录保留几个月',meritCalmCost:'功德化解心魔花费(×帝业倍率)',meritCalmXinmo:'功德化解心魔量',meritGuardRatio:'功德护体额外比例',xinmoDeathMonths:'心魔满几个月走火入魔',assassinRatio:'刺客属性比例',assassinEdge:'刺客出其不意加难度',raidChance:'每月刺客夜袭基础概率%',raidPerSusp:'猜忌每多少点夜袭概率+1%',assassinMonthly:'第3年起每月刺客基础几率%',assassinPerSusp:'猜忌每几点刺客几率+1%',assassinFreeYears:'开局几年不来刺客',assassinGuardWear:'每次刺杀守卫消耗',assassinCmHigh:'刺客高才貌几率%',assassinCmMid:'刺客中才貌几率%',guardMax:'府中守卫加成上限',yearEndWarnMonth:'几月起预告年末大事',overduePenaltySusp:'章节逾期猜忌',overduePenaltyXinmo:'章节逾期心魔',
  allowFemale:'开放女主(0/1)',debug:'显示骰点(0/1)'};

/* 帝业晋升条件：累计功绩和境界。第7~10阶另有路线条件（a 兵变线：兵力比%；b 民心线：民心）。 */
/* 帝业晋升要求（每阶单独挣，晋升时扣掉文功、武功、银两；民心、兵力比、境界只看门槛不扣）。
   wen/wu：前 6 阶；7~10 阶按路线：兵变线 wenA/wuA，民心线 wenB/wuB。silver：仪典/军资花费。minxin：民心门槛。
   a：兵变线兵力比门槛%；b：民心线民心门槛。数值按前期量级写，不再自动放大。 */
const RANK_REQ={
  2:{wen:100,wu:100,silver:400,minxin:35,realm:3},
  3:{wen:700,wu:700,silver:1000,minxin:40,realm:7},
  4:{wen:2400,wu:2400,silver:2400,minxin:45,realm:14},
  5:{wen:3850,wu:3850,silver:5300,minxin:50,realm:15},
  6:{wen:6750,wu:6750,silver:9000,minxin:55,realm:17},
  7:{wenA:8750,wuA:9800,wenB:9800,wuB:8750,silver:10400,silverB:12400,minxin:50,realm:18,a:20,b:55},
  8:{wenA:11700,wuA:13050,wenB:13050,wuB:11700,silver:12000,silverB:14400,minxin:50,realm:19,a:30,b:60},
  9:{wenA:14050,wuA:15550,wenB:15550,wuB:14050,silver:12400,silverB:14800,minxin:55,realm:21,a:40,b:65},
  10:{wenA:16600,wuA:18450,wenB:18450,wuB:16600,silver:13600,silverB:16400,minxin:55,realm:22,a:45,b:65}};
/* 大境界修为倍率（闭关、吐纳、事件里的修为都乘这个） */
const REALM_MUL=[1,1,3,10,30,30,100,100];   // 练气 筑基 金丹 元婴 化神 炼虚 合体 大乘
/* 每个小境界需要的修为 */
const XIU_NEED=[0,200,400,440,530,620,730,860,940,1000,1300,1400,1500,1700,4600,7500,12000,17000,62000,100000,160000,210000,162000,162000,243000,243000,365000,365000,527000,527000,499000,499000,743000,743000,999000,999000,1350000,1350000];

/* 跳过随机事件的惩罚（按事件类别）。某个任务想单独设置，就在任务里写 skipEff:{...}。 */
const SKIP_PENALTY={治理:{minxin:-2},军务:{train:-3},游历:{xinmo:2},修行:{xinmo:2},后宅:{harmony:-3},突发:{minxin:-2},朝廷:{suspicion:4},
  chain:{xinmo:2},奇遇:{xinmo:2},羁绊:{aff:-5},默认:{xinmo:1}};

/* 立绘图片路径。以后每个角色有自己的立绘时再改。 */
/* 选项属性要求：基准 = max(按帝业阶位, 按大境界)，再加难度档（易/中/难）。 */
const REQ_RANK=[0,20,23,26,31,37,44,50,54,59,65];
const REQ_MAJOR=[0,0,0,0,63,63,81,81];
const REQ_LV=[0,-5,0,8];
const PORTRAIT='images/wangye.jpg';
/* 换过图片后把这个数字加 1，玩家的浏览器才会重新下载新图 */
const IMG_V=3;
/* 道侣立绘池：结识时随机分一张没用过的，之后永久绑定。加图就往列表里加文件名。
   F 是女性道侣（男主线），M 是男性道侣（女主线）；M 为空时用上面的 PORTRAIT。 */
const DAOLV_IMGS_F=['images/daolv1.jpg','images/daolv2.jpg','images/daolv3.jpg','images/daolv4.jpg','images/daolv5.jpg','images/daolv6.jpg','images/daolv7.jpg','images/daolv8.jpg','images/daolv9.jpg','images/daolv10.jpg','images/daolv11.jpg','images/daolv12.jpg','images/daolv13.jpg','images/daolv14.jpg','images/daolv15.jpg','images/daolv16.jpg','images/daolv17.jpg','images/daolv18.jpg','images/daolv19.jpg','images/daolv20.jpg','images/daolv21.jpg','images/daolv22.jpg'];
const DAOLV_IMGS_M=[];
/* 各属性检定的要求修正（让六项属性的达标率接近）：正数更难，负数更容易 */
const ATTR_REQ_ADJ={wencai:-2,wulue:2,xinji:-2,meili:0,gengu:1,wuxing:-2};
/* 道侣才貌：当前标准（按帝业阶位），以及才貌与标准之差对应的双修倍率 */
const CM_STD=[0,30,34,38,42,50,58,66,74,82,90];
const CM_TIER=[[15,1.5,'远胜门第'],[5,1.2,'略胜门第'],[-4,1.0,'门当户对'],[-15,0.6,'略逊门第'],[-30,0.3,'配不上门第'],[-999,0.1,'远配不上门第']];
