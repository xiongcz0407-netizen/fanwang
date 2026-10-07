/* 后宅事件（后宫）。needP:1 单人事件用 {name}{ta}/aff；needP2:1 宫斗事件用 {a}{b}/affA affB。 */
const EV_HAR=[
// ===== 单人事件（needP） =====
{id:'har_001', cat:'后宅', title:'{name}的旧伤', w:10, needP:1,
 cond:{rankMin:1, rankMax:4, partners:1},
 text:'入秋后，{name}早年习武落下的旧伤又疼了起来。{ta}夜里翻来覆去，白天照旧咬着牙不吭声。',
 opts:[
  {label:'翻遍医书，看出旧伤的病根',check:{attr:'wuxing',lv:1},eff:{aff:16,harmony:6,_t:'病根在一处早年错位的筋络。对症下了药，{name}这回总算不疼了。'}},
  {label:'让{ta}自己熬过这一阵', eff:{aff:-4, xinmo:2, _t:'{name}再没提过疼。你后来才知道，{ta}那阵子夜夜坐到天亮。'}}
 ]},
{id:'har_002', cat:'后宅', title:'{name}思乡', w:10, needP:1,
 cond:{rankMin:1, rankMax:5, partners:1},
 text:'{name}站在院中望着南边，随口说起家乡的一道小菜，说北境怎么也做不出那个味道。',
 opts:[
  {label:'带{ta}出城跑马，说说各自的故乡', check:{attr:'wulue', lv:2}, eff:{aff:8, xinmo:-4, _t:'风很大，两人在城外跑了一下午马，到天黑才回城。'}},
  {label:'让厨房照着说法随便仿一道', eff:{aff:-3, xinmo:2, _t:'菜做出来形似神不似。{name}吃了两口，就放下了筷子。'}}
 ]},
{id:'har_003', cat:'后宅', title:'{name}的心事', w:10, needP:1,
 cond:{rankMin:2, rankMax:6, partners:1},
 text:'{name}近来话少了，常常对着一封没拆的信发呆。你一进门，{ta}就把信收进了袖子里。',
 opts:[
  {label:'不问，这个月每天陪{ta}练剑', check:{attr:'wulue', lv:1}, eff:{aff:8, xinmo:-3, _t:'剑练了一个月，公文堆了一案。{name}什么也没说，只是笑得多了些。'}},
  {label:'趁{ta}不在，翻出那封信', eff:{aff:-5, harmony:-3, _t:'信封好了放回原处，{name}还是看出来了。当晚{ta}搬去了偏房。'}}
 ]},
{id:'har_004', cat:'后宅', title:'{name}排戏', w:10, needP:1,
 cond:{rankMin:1, rankMax:5, partners:1},
 text:'{name}说府里太闷，想在后园搭个小台，排一出自己写的戏给大家看。',
 opts:[
  {label:'亲自为这出戏填几支曲子', check:{attr:'wencai', lv:2}, eff:{aff:8, xinmo:-3, _t:'曲子唱出来，{name}在台上回头看了你一眼。'}},
  {label:'说府里不宜张扬', eff:{aff:-3, xinmo:2, _t:'{name}没再提搭台的事，那本戏稿收进了箱底。'}}
 ]},
{id:'har_005', cat:'后宅', title:'与{name}争执', w:10, needP:1,
 cond:{rankMin:2, rankMax:7, partners:1},
 text:'你和{name}为一件小事起了争执，话赶话说重了。{ta}摔门回了自己院里，晚饭也没来吃。',
 opts:[
  {label:'写一封信塞进{ta}门缝', check:{attr:'wencai', lv:2}, eff:{aff:8, harmony:4, _t:'信里没讲一句道理，只说那顿晚饭一个人吃有多难吃。第二天一早，门开了。'}},
  {label:'让{ta}冷静几天，自己专心理政', eff:{aff:-6, xinmo:2, _t:'公文批了一摞，心却静不下来。后宅那扇门一直关着。'}}
 ]},
{id:'har_006', cat:'后宅', title:'{name}吃醋', w:10, needP:1,
 cond:{rankMin:2, rankMax:8, partners:1},
 text:'{name}听说你赴宴时多看了席间琴师几眼，整晚都没给你好脸色。',
 opts:[
  {label:'把那张琴买下来送给{ta}',check:{attr:'wencai',lv:1},eff:{aff:16,xinmo:-4,_t:'{name}抱着琴说：「早说是看琴，何必绕这么大弯子。」'}},
  {label:'一笑置之，不作解释', eff:{aff:-5, harmony:-3, _t:'你没当回事。{name}却记了很久。'}}
 ]},
{id:'har_007', cat:'后宅', title:'{name}病了', w:10, needP:1,
 cond:{rankMin:1, rankMax:6, partners:1},
 text:'{name}染了风寒，烧得昏昏沉沉，嘴里一直在喊一个你没听过的名字。',
 opts:[
  {label:'亲手开炉，炼一枚退热的丹药', check:{attr:'wuxing', lv:2}, eff:{aff:10, harmony:3, _t:'丹药入口，烧退得极快。府里都说殿下有心。'}},
  {label:'交给大夫和丫头照料', eff:{aff:-4, xinmo:2, _t:'{ta}烧了三天才退。醒来问的第一句，是你来过没有。'}}
 ]},
{id:'har_008', cat:'后宅', title:'{name}的娘家人', w:10, needP:1,
 cond:{rankMin:3, rankMax:8, partners:1},
 text:'{name}的娘家来了个远房表兄，想托你在封地谋个差事。{name}在一旁，不好开口。',
 opts:[
  {label:'先考考他的弓马拳脚', check:{attr:'wulue', lv:2}, eff:{aff:8, wengong:15, _t:'他身手确实不错。你让他去护院里做个教头，府里的守卫规矩了许多。'}},
  {label:'给他安排个闲职', eff:{minxin:-3, silver:-50, _t:'闲职不累人，俸银照领。百姓都知道，那是王爷家的亲戚。'}}
 ]},
{id:'har_009', cat:'后宅', title:'{name}的断剑', w:10, needP:1,
 cond:{rankMin:2, rankMax:7, partners:1},
 text:'{name}随身多年的剑断了。那是{ta}师父留下的东西，{ta}捧着两截剑，一句话也说不出来。',
 opts:[
  {label:'以真火亲自淬炼', check:{attr:'gengu', lv:3}, eff:{aff:12, guard:4, _t:'新剑锋芒更胜。{name}说往后夜里由{ta}守在你门外。'}},
  {label:'劝{ta}另换一把', eff:{aff:-5, xinmo:2, _t:'{name}点了点头，把断剑包好收进箱子，再没打开过。'}}
 ]},
{id:'har_010', cat:'后宅', title:'{name}的生辰宴', w:10, needP:1,
 cond:{rankMin:4, rankMax:9, partners:1},
 text:'{name}的生辰到了。照王府的规矩该大办，可这个月府库正紧，管家来请示。',
 opts:[
  {label:'不办宴，只陪{ta}一人赏月', check:{attr:'meili', lv:2}, eff:{aff:10, xinmo:-4, _t:'月色很好，{name}说这是{ta}过得最好的一个生辰。'}},
  {label:'府库紧，一切从简', eff:{aff:-3, harmony:-3, _t:'一桌家常菜就算过了生辰。各院都看在眼里。'}}
 ]},
{id:'har_011', cat:'后宅', title:'{name}的梦魇', w:10, needP:1,
 cond:{rankMin:5, rankMax:10, partners:1},
 text:'{name}近来夜夜惊醒，醒了就坐着不睡。{ta}说梦见了从前的旧事，不肯细讲。',
 opts:[
  {label:'每晚陪{ta}打坐静心', check:{attr:'gengu', lv:2}, eff:{aff:8, xinmo:-4, _t:'你分出一缕真气护着{ta}的心脉。半个月后，{ta}终于睡得着了。'}},
  {label:'劝{ta}别想太多', eff:{aff:-3, xinmo:3, _t:'{name}点头说好，夜里还是坐着。'}}
 ]},
{id:'har_012', cat:'后宅', title:'{name}问名分', w:10, needP:1,
 cond:{rankMin:8, rankMax:10, partners:1},
 text:'外头都在传你将登大位。{name}替你斟了一杯茶，忽然问：「到那时候，我算什么？」',
 opts:[
  {label:'私下许{ta}一个位分', check:{attr:'xinji', lv:2}, eff:{aff:12, _t:'话只说在你们两人之间。{name}点点头，没再追问。'}},
  {label:'随口许{ta}一个位分', eff:{harmony:-6, xinmo:2, _t:'话没出门就传遍了后宅，别的院子都安静得反常。'}}
 ]},

// ===== 宫斗事件（needP2） =====
{id:'har_013', cat:'后宅', title:'点心与汤', w:10, needP2:1,
 cond:{rankMin:1, rankMax:4, married:2},
 text:'{a}送来亲手做的点心，{b}院里的丫头随后也端来一碗汤。两边的下人在书房门口撞了个正着。',
 opts:[
  {label:'先尝{a}的点心，给{b}回一份礼',check:{attr:'xinji',lv:1},eff:{affA:12,xinmo:-4,_t:'{a}的点心你吃了大半。{b}收了回礼，也没说什么。'}},
  {label:'都先放着，等批完公文再说', eff:{affA:-4, affB:-4, _t:'汤凉了，点心也硬了。两边的丫头各自回去学了话。'}}
 ]},
{id:'har_014', cat:'后宅', title:'香囊', w:10, needP2:1,
 cond:{rankMin:3, rankMax:7, married:2},
 text:'{b}近来夜不能寐。大夫从{b}枕边的香囊里验出一味伤神的药，那香囊是{a}早前送的。',
 opts:[
  {label:'彻查香料的来路', check:{attr:'xinji', lv:3}, eff:{affA:5, affB:3, harmony:6, suspicion:-4, _t:'药是香料铺掺的，铺子背后是监军府的人。两人的委屈都洗清了。'}},
  {label:'先禁{a}的足', eff:{affA:-10, harmony:-4, _t:'{a}没有辩解，只让人把剩下的香料全都送到了你面前。'}}
 ]},
{id:'har_015', cat:'后宅', title:'喜脉', w:10, needP2:1, once:1,
 cond:{rankMin:3, rankMax:8, married:2},
 text:'{a}说自己有了身孕，府里大夫却支支吾吾。{b}私下提醒你：那大夫是{a}娘家荐来的人。',
 opts:[
  {label:'另请大夫诊脉', check:{attr:'xinji', lv:2}, eff:{affB:6, harmony:5, _t:'果然是假的。{a}伏地痛哭，说只是怕被冷落。'}},
  {label:'信{a}，好生照料', eff:{silver:-120, affB:-6, next:'har_c01', _t:'补品流水一样送进{a}院里。{b}再没提这件事。'}}
 ]},
{id:'har_016', cat:'后宅', title:'钱袋', w:10, needP2:1,
 cond:{rankMin:2, rankMax:6, married:2},
 text:'账房丢了一袋银子，在{a}的侍女房里搜了出来。侍女哭着说，是{b}院里的人塞进来的。',
 opts:[
  {label:'整顿账房，银钱另派专人看管', check:{attr:'wencai', lv:1}, eff:{harmony:5, _t:'账房换了锁，立了新规矩。府里安静了，谁对谁错也没人再提。'}},
  {label:'信{b}，打发那侍女出府', eff:{affA:-10, harmony:-2, _t:'{a}亲自送侍女到门口，回来后一整天没出院子。'}}
 ]},
{id:'har_017', cat:'后宅', title:'冰桥', w:10, needP2:1,
 cond:{rankMin:1, rankMax:5, married:2, months:[11,12,1,2]},
 text:'{b}在结冰的石桥上摔了一跤，扭伤了脚。{b}的丫头一口咬定，桥面的水是{a}的人泼的。',
 opts:[
  {label:'亲自去桥上看水渍的来路', check:{attr:'wuxing', lv:1}, eff:{affA:6, harmony:5, _t:'水渍是从檐上滴下来的。乱说话的丫头被罚去浣衣房。'}},
  {label:'罚{a}抄经思过', eff:{affA:-8, harmony:-3, _t:'{a}抄了一个月经，字一笔比一笔重。'}}
 ]},
{id:'har_018', cat:'后宅', title:'寝衣里的针', w:10, needP2:1,
 cond:{rankMin:3, rankMax:7, married:2},
 text:'{a}给你绣的寝衣送来时，你在领口摸到一根断针。这件衣服经过{b}院里绣娘的手。',
 opts:[
  {label:'先查那个绣娘', check:{attr:'xinji', lv:3}, eff:{affA:5, affB:5, suspicion:-6, _t:'绣娘是外头安插进来的，受监军府指使。两位道侣都松了口气。'}},
  {label:'当面问{b}', eff:{affB:-10, harmony:-4, _t:'{b}愣了很久，只说了一句：「殿下觉得是，就是吧。」'}}
 ]},
{id:'har_019', cat:'后宅', title:'旧衣', w:10, needP2:1,
 cond:{rankMin:3, rankMax:8, married:2},
 text:'{b}穿了一件旧样式的衣裳来见你，像极了{a}初入府时穿的那身。{a}在廊下看见，转身就走。',
 opts:[
  {label:'冒着寒风追出去', check:{attr:'gengu', lv:2}, eff:{affA:6, harmony:4, _t:'你一路追到后园，说你记得的是人，不是那身衣裳。{a}这才肯回头。'}},
  {label:'让{b}回去换了', eff:{affB:-8, harmony:-2, _t:'{b}低着头退下，那件衣裳再没穿过。'}}
 ]},
{id:'har_020', cat:'后宅', title:'关起门来', w:10, needP2:1,
 cond:{rankMin:4, rankMax:9, married:2},
 text:'{a}和{b}最近走得很近，常关起门说话。下人们传，两位在商量什么大事。',
 opts:[
  {label:'推门进去，三人同坐', check:{attr:'meili', lv:1}, eff:{harmony:8, _t:'两人愣了一下，给你添了一副碗筷。那晚的公文没批完。'}},
  {label:'把内务和库房分给两人各管一摊', eff:{affA:-4, affB:-4, _t:'各忙各的，就没工夫关门说话了。两人都看出了你的用意。'}}
 ]},
{id:'har_021', cat:'后宅', title:'冷院', w:10, needP2:1,
 cond:{rankMin:2, rankMax:8, married:2},
 text:'{a}被冷落了大半年，院门前的草都长高了。{b}在你面前提起，说{a}近来瘦得厉害。',
 opts:[
  {label:'顶着风雪，当晚就去看{a}', check:{attr:'gengu', lv:1}, eff:{affA:10, harmony:4, _t:'{a}正在灯下缝东西，见你满身是雪地进来，针扎破了手指。'}},
  {label:'夸{b}心善，重重有赏', eff:{silver:-80, affA:-4, _t:'{b}谢了赏。那句话，你终究没往心里去。'}}
 ]},
{id:'har_022', cat:'后宅', title:'旧案', w:10, needP2:1, once:1,
 cond:{rankMin:4, rankMax:9, married:2},
 text:'去年{a}因一桩旧事被禁足。如今{b}的侍女临出府前留下一句话：当年那件事，是{b}让她做的。',
 opts:[
  {label:'私下解了{a}的禁足，不提旧案', check:{attr:'meili', lv:2}, eff:{affA:6, xinmo:-3, _t:'{a}出了院子。这份恩典来得不明不白，{a}却也没再追问。'}},
  {label:'当众质问{b}', eff:{affB:-12, harmony:-5, _t:'{b}跪在地上，没认，也没辩。后宅一连几天鸦雀无声。'}}
 ]},
{id:'har_023', cat:'后宅', title:'药方', w:10, needP2:1,
 cond:{rankMin:3, rankMax:8, married:2},
 text:'{a}调养身子的药方被人改了一味。药房管事说，改方子的单子上盖着{b}院里的章。',
 opts:[
  {label:'调来单子，对一对笔迹和章印', check:{attr:'wencai', lv:2}, eff:{affB:6, suspicion:-4, _t:'笔迹对不上，章是偷盖的。改方的是药房学徒，收了外头的银子。'}},
  {label:'收了{b}的印章，交你保管', eff:{affB:-8, harmony:-3, _t:'{b}把印章放在桌上，转身就走。'}}
 ]},
{id:'har_024', cat:'后宅', title:'宴上斗艳', w:10, needP2:1,
 cond:{rankMin:5, rankMax:10, married:2},
 text:'王府设宴款待邻藩使者。{a}抚琴，{b}舞剑，两人暗暗较着劲，席上宾客都看出来了。',
 opts:[
  {label:'当众赞{b}的剑', check:{attr:'wulue', lv:2}, eff:{affB:8, wugong:12, _t:'使者回去说朔州后宅都会舞剑。{a}的琴弦断了一根。'}},
  {label:'硬要两人合奏一曲', eff:{affA:-3, affB:-3, harmony:-5, _t:'两人谁也不肯迁就谁，曲子乱成一团。'}}
 ]},
{id:'har_025', cat:'后宅', title:'假山', w:10, needP2:1,
 cond:{rankMin:1, rankMax:5, married:2},
 text:'后园赏花时，{b}从假山上跌了下来，说是被人从背后推了一把。当时离{b}最近的人，是{a}。',
 opts:[
  {label:'修缮假山，加派护院巡园',check:{attr:'wulue',lv:2},eff:{guard:8,affB:6,_t:'假山重砌了一遍。谁推的，没人再说。'}},
  {label:'禁{a}的足', eff:{affA:-10, harmony:-2, _t:'{a}关上院门前说：「我连{b}的衣角都没碰到。」'}}
 ]},
{id:'har_026', cat:'后宅', title:'流言', w:10, needP2:1,
 cond:{rankMin:5, rankMax:10, married:2},
 text:'府外传起流言，说{a}原是朝廷安插的眼线。散布流言的，是{b}的贴身侍女。',
 opts:[
  {label:'听出两人话里的误会，让两人当面说开', check:{attr:'wuxing', lv:2}, eff:{affA:4, affB:4, xinmo:-4, _t:'话说开了，原来是侍女自作主张。两人各退了一步。'}},
  {label:'罚{b}的侍女，压下流言了事', eff:{affB:-8, harmony:-3, _t:'流言一夜之间断了。{b}来请罪，你没见。'}}
 ]},

// ===== 后宅事务（不针对具体人） =====
{id:'har_027', cat:'后宅', title:'后厨短了米面', w:10,
 cond:{rankMin:1, rankMax:4},
 text:'后厨的米面总对不上数。管事怀疑有人夜里往外偷运，可谁也没抓到现行。',
 opts:[
  {label:'立出入账册，换掉后厨的人',check:{attr:'wencai',lv:1},eff:{harmony:12,_t:'新人手脚干净，饭菜也比从前好吃了。'}},
  {label:'让管事自己看着办', eff:{silver:-60, harmony:-3, _t:'米面照样对不上数，管事只会叫苦。'}}
 ]},
{id:'har_028', cat:'后宅', title:'后宅开销', w:10,
 cond:{rankMin:2, rankMax:6},
 text:'账房报上来，后宅的花销比去年翻了一倍：脂粉、衣料、赏钱，样样都在涨。',
 opts:[
  {label:'开一间绣坊，让后宅自己挣些',check:{attr:'xinji',lv:2},cost:{silver:70},eff:{industry:16,_t:'绣坊的活计在北境卖得不错。花销没减，进项多了。'}},
  {label:'照旧拨银', eff:{silver:-100, _t:'银子照拨，账房的眉头越皱越紧。'}}
 ]},
{id:'har_029', cat:'后宅', title:'地龙', w:10,
 cond:{rankMin:3, rankMax:7, months:[10,11,12,1]},
 text:'北境入冬，后宅几处屋子四面漏风，已经有丫头病倒了。',
 opts:[
  {label:'在后宅布一座聚暖阵', check:{attr:'wuxing', lv:2}, eff:{xiuwei:60, _t:'阵成之后屋里温暖如春，你还能借阵吐纳。'}},
  {label:'各院多发几床棉被', eff:{silver:-50, harmony:-4, _t:'被子发下去了，风还是往屋里灌，又病倒了两个。'}}
 ]},
{id:'har_030', cat:'后宅', title:'走水', w:10, once:1,
 cond:{rankMin:3, rankMax:8},
 text:'夜里后宅西院走水，火借风势，一路烧向库房。院里还有几个丫头没跑出来。',
 opts:[
  {label:'以法术唤雨灭火', check:{attr:'wuxing', lv:3}, eff:{merit:12, minxin:3, next:'har_c02', _t:'一场急雨浇下，火势顿消。百姓都说王府有神灵护着。'}},
  {label:'等救火的人赶来', eff:{silver:-150, harmony:-4, next:'har_c02', _t:'救火的人赶到时，库房已经烧了大半。'}}
 ]},
{id:'har_031', cat:'后宅', title:'老奶娘', w:10, once:1,
 cond:{rankMin:2, rankMax:6},
 text:'一位白发老妇来到王府门前，说是你幼时的奶娘。宫变之后，她一直流落在民间。',
 opts:[
  {label:'接进府里养老',check:{attr:'meili',lv:1},eff:{xinmo:-10,_t:'她还记得你小时候爱吃什么，第二天就下了厨。'}},
  {label:'给些银子打发走', eff:{silver:-50, xinmo:3, _t:'老人家收了银子，在门口站了很久才走。'}}
 ]},
{id:'har_032', cat:'后宅', title:'老管事的账', w:10,
 cond:{rankMin:5, rankMax:9},
 text:'内务账上有一笔银子去向不明，经手的是府里资历最老的管事，从你就藩起就跟着你。',
 opts:[
  {label:'查到底', check:{attr:'xinji', lv:3}, eff:{silver:200, _t:'银子追回来了。老管事被送走那天，府里很多人都去送了。'}},
  {label:'先压着，等年底再说', eff:{silver:-100, harmony:-3, _t:'到了年底，窟窿又大了一截。'}}
 ]},
{id:'har_033', cat:'后宅', title:'教养嬷嬷', w:10, once:1,
 cond:{rankMin:6, rankMax:10},
 text:'京中送来一位教养嬷嬷，说是太后的恩典。嬷嬷规矩极严，后宅怨声不断，而她每月都往京里寄信。',
 opts:[
  {label:'好生供着，哄她宽松些', check:{attr:'meili', lv:2}, eff:{suspicion:-6, _t:'信照常寄，只是信里多了几句王府的好话。'}},
  {label:'由着她管，让后宅忍一忍', eff:{harmony:-6, xinmo:2, _t:'信照常寄，后宅的规矩一天比一天多。'}}
 ]},
{id:'har_034', cat:'后宅', title:'宫规', w:10,
 cond:{rankMin:9, rankMax:10},
 text:'礼部呈上一套宫规，请后宅提前演习：晨昏定省、位分尊卑、出入登记，一条也不能少。',
 opts:[
  {label:'亲手删繁就简', check:{attr:'wencai', lv:2}, eff:{harmony:6, xinmo:-2, _t:'你删去一半繁文缛节，后宅都松了一口气。'}},
  {label:'交给后宅自己看着办', eff:{harmony:-4, suspicion:4, _t:'演习乱成一团。礼部老臣上折，说后宅不知礼数。'}}
 ]},

// ===== 大事件 =====
{id:'har_m01', cat:'后宅', major:1, title:'滴血验亲', once:1, w:10, needP2:1,
 cond:{rankMin:5, rankMax:9, married:2},
 intro:'{a}诞下一子，满府欢喜。没过多久，府里却传出流言，说孩子的眉眼不像你。流言起自{b}的院子。',
 steps:[
  {text:'流言越传越凶，连监军韩琮都在宴上举杯，意味深长地向你道喜。',
   opts:[
    {label:'下令严禁议论', check:{attr:'wulue', lv:1}, eff:{harmony:5, _t:'令一下，府里再没人敢交头接耳。'}},
    {label:'由着流言自己淡下去', eff:{affA:-3, harmony:-5, _t:'流言没有自己淡下去，反倒传到了府外。'}}
   ]},
  {text:'{b}跪在堂前，请求滴血验亲，说是为了王府血脉清白。{a}抱着孩子站在一旁，脸色煞白。',
   opts:[
    {label:'先看出那碗水里的古怪', check:{attr:'wuxing', lv:3}, eff:{harmony:8, affA:6, _t:'水面泛着一层极淡的油光。水里掺了东西，无论是谁的血都融不到一起。'}},
    {label:'准了', eff:{affA:-10, harmony:-3, _t:'{a}没有哭，只是把孩子抱得更紧了。'}}
   ]},
  {text:'真相渐渐浮出水面：{b}的侍女招认，是{b}收买了稳婆和下人，一手造出这场风波。',
   opts:[
    {label:'削去{b}的份例，禁足思过', check:{attr:'xinji', lv:2}, eff:{affA:12, harmony:8, _t:'{b}被禁足后院，再没敢出声。{a}抱着孩子在门口看了很久。'}},
    {label:'罚{b}禁足一年', eff:{affA:-4, affB:-6, _t:'处置不轻不重。{a}心里那口气没消，{b}也不服。'}}
   ]}
 ],
 outro:'孩子一天天长大，眉眼越来越像你。府里再没人提起那碗水。'},

{id:'har_m02', cat:'后宅', major:1, title:'御赐的香', once:1, w:10,
 cond:{rankMin:4, rankMax:8},
 intro:'你近来修为迟滞，夜夜心浮气躁。一位云游的老丹师来府中做客，在你寝殿里嗅了片刻，脸色就变了。',
 steps:[
  {text:'丹师验出，你寝殿的安神香里掺了蚀灵散，长年熏染会让修士根基虚浮。这香是早年宫里赐下的。',
   opts:[
    {label:'立刻停用，闭门调息', check:{attr:'wuxing', lv:1}, eff:{xinmo:-5, _t:'香停了。你闭门调息几夜，心火渐渐压了下去。'}},
    {label:'照旧点着，先不声张', eff:{xinmo:4, xiuwei:-60, _t:'香照旧点着，你打坐时越来越难入定。'}}
   ]},
  {text:'顺着香料查下去，经手的是府中掌香的宫女。她是当年随御赐之物一同来的。',
   opts:[
    {label:'带亲卫当场拿下，连夜审问', check:{attr:'wulue', lv:3}, eff:{harmony:6, wengong:20, _t:'宫女招了：香是严相府里配的，只借了宫中的名头。'}},
    {label:'找个由头打发她回京', eff:{suspicion:6, harmony:-3, _t:'宫女被送回京城。没过多久，宫里就有人问起朔州为何退了人。'}}
   ]},
  {text:'证据在手。可这香顶着御赐的名头，揭出来，就是当众打皇兄的脸。',
   opts:[
    {label:'密奏皇兄，只指严相', check:{attr:'wencai', lv:3}, eff:{wengong:40, suspicion:-10, _t:'皇兄震怒，严相罚俸半年。这是你第一次在朝中占了上风。'}},
    {label:'把证据锁进暗格，什么也不做', eff:{xinmo:4, xiuwei:-80, _t:'证据锁好了，余毒却还在。你打坐时总觉得经脉里有东西在磨。'}}
   ]}
 ],
 outro:'那只香炉一直摆在你书房里，再没点过。'},

{id:'har_m03', cat:'后宅', major:1, title:'偏院翻案', once:1, w:10, needP2:1,
 cond:{rankMin:3, rankMax:8, married:2},
 intro:'半年前，下人在{a}床下搜出一只扎满针的布偶，上面写着你的生辰八字。{a}被关进后园偏院，再没出来过。',
 steps:[
  {text:'这个月，一个老仆偷偷来报：搜出布偶那天早上，有人看见{b}院里的嬷嬷进过{a}的屋子。',
   opts:[
    {label:'亲自换上便服，跟着那个嬷嬷出府', check:{attr:'gengu', lv:2}, eff:{harmony:4, _t:'你跟了她三天。嬷嬷常往府外跑，和一个绣坊掌柜来往频繁。'}},
    {label:'只当老仆胡言', eff:{affA:-5, xinmo:3, _t:'你把老仆打发走了。夜里却总想起偏院那扇门。'}}
   ]},
  {text:'嬷嬷被拿住了，只说布偶是她自己扎的，咬死不肯牵扯旁人。',
   opts:[
    {label:'许她出府养老，换一句实话',check:{attr:'meili',lv:2},eff:{xinmo:-8,_t:'嬷嬷得了出府养老的许诺，说了实话，第二天就出了城。'}},
    {label:'用刑逼她开口', eff:{harmony:-5, affA:-4, _t:'嬷嬷熬不住刑，招了又翻。案子就这样僵住了。'}}
   ]},
  {text:'真相大白：{b}当年嫉妒{a}得宠，设下了这个局。{a}被扶出偏院，站在日头底下眯着眼。',
   opts:[
    {label:'当众为{a}正名，重罚{b}', check:{attr:'wencai', lv:2}, eff:{affA:15, harmony:8, _t:'满府都听见了你的话。{b}被罚禁足三个月。'}},
    {label:'私下处置，保全{b}的体面', eff:{affA:-4, xinmo:3, _t:'{a}的冤屈洗清了，可没几个人知道。{a}谢恩时，眼里没有光。'}}
   ]}
 ],
 outro:'你下令烧掉了偏院。布偶上那几个字，你认得，是模仿你的笔迹写的。'},

{id:'har_m04', cat:'后宅', major:1, title:'双凤夺权', once:1, w:10, needP2:1,
 cond:{rankMin:5, rankMax:9, married:2},
 intro:'你闭关三月出来，发现府里的规矩全变了。内务账册在{a}手里，护院的腰牌换成了{b}的人。',
 steps:[
  {text:'管事们见了你，说话吞吞吐吐。几个老人被调去了马厩和柴房。',
   opts:[
    {label:'召两人来问个明白', check:{attr:'meili', lv:2}, eff:{affA:3, affB:3, harmony:5, _t:'两人说怕你闭关时府里出乱子，才先管了起来。'}},
    {label:'装作什么也没看见', eff:{harmony:-4, xinmo:3, _t:'你什么也没问。管事们说话更吞吞吐吐了。'}}
   ]},
  {text:'查账发现，这三个月两人替府里省下了一大笔银子，却也把几个跟了你多年的旧管事撵走了。',
   opts:[
    {label:'亲自登门，把旧管事一个个请回来', check:{attr:'gengu', lv:1}, eff:{harmony:6, _t:'你一家家跑了一整天。旧人回府那天，两位道侣也到了，各自敬了一杯茶。'}},
    {label:'两头都不过问', eff:{harmony:-5, affA:-3, affB:-3, _t:'省下的银子没人记，撵走的旧人没人送。府里的人心散了。'}}
   ]},
  {text:'{a}私下来找你，说一切都是{b}的主意。当晚，{b}也来了，说的是同一番话。',
   opts:[
    {label:'两人都不信，内务收归自己', check:{attr:'xinji', lv:3}, eff:{xinmo:-6, harmony:6, _t:'你把权收了回来，两人互相拆台的话，你一句也没往外传。'}},
    {label:'信{a}', eff:{affB:-12, harmony:-4, _t:'{b}被收了权，从此不再与{a}来往。'}}
   ]}
 ],
 outro:'后宅重归平静。只是从那以后，你闭关前总要先把腰牌收进自己袖中。'},

{id:'har_m05', cat:'后宅', major:1, title:'登基前夜', once:1, w:10, needP2:1,
 cond:{rankMin:8, rankMax:10, married:2},
 intro:'大事将成，已有人私下称你「陛下」。后宅也跟着动了：各家娘家开始走动，打听将来的位分。',
 steps:[
  {text:'{a}的娘家送来一份厚礼，附信说愿倾全族之力相助，只求将来立{a}为后。',
   opts:[
    {label:'收下礼，含糊回应', check:{attr:'xinji', lv:2}, eff:{silver:200, _t:'礼收了，话没说死。你回了一份厚礼，别的院子也挑不出理。'}},
    {label:'满口应承立后之事', eff:{harmony:-6, affB:-6, _t:'话传得很快。{b}院里的灯，那几天熄得很早。'}}
   ]},
  {text:'消息传到{b}耳中。{b}连夜求见，说娘家虽然势弱，愿把仅有的一支私兵交给你。',
   opts:[
    {label:'收下这支兵马', check:{attr:'wulue', lv:2}, eff:{troops:300, _t:'兵马入营那天，你亲自点了名。{b}站在廊下，看了很久。'}},
    {label:'拖着不给回音', eff:{affB:-5, xinmo:2, _t:'{b}等了几天，没等到回音，再没提起这件事。'}}
   ]},
  {text:'登基前夜，两人各在院中设下香案为你祈福。下人们却在暗地里分成了两派。',
   opts:[
    {label:'当众宣布：后位暂悬', check:{attr:'meili', lv:3}, eff:{harmony:12, _t:'你一句话压下了两派。两人谢恩时，谁也没看谁。'}},
    {label:'哪儿也不去，独坐书房', eff:{affA:-5, affB:-5, _t:'两院的香都烧到了天亮，谁也没等到你。'}}
   ]}
 ],
 outro:'天亮了。不管你去了哪里，后宅从此成了后宫。'},

{id:'har_m06', cat:'后宅', major:1, title:'册立中宫', once:1, w:10, needP2:1,
 cond:{rankMin:9, rankMax:10, married:2},
 intro:'礼部上奏，请立中宫。呈上来的名单上只有两个名字：{a}，{b}。',
 steps:[
  {text:'朝臣分作两派。{a}出身更好，{b}陪你的年头更久。两派的折子堆满了案头。',
   opts:[
    {label:'召群臣廷议', check:{attr:'wencai', lv:3}, eff:{wengong:40, _t:'你引经据典，把两派都驳得说不出话。'}},
    {label:'把折子都压着', eff:{harmony:-6, xinmo:3, _t:'折子越压越多，话传进后宫，两边都更急了。'}}
   ]},
  {text:'有人呈上一封匿名信，揭{b}早年在江湖上伤过人命，说这样的人不配母仪天下。',
   opts:[
    {label:'看出这封信里的破绽', check:{attr:'wuxing', lv:3}, eff:{affB:8, harmony:8, _t:'信纸是京里的贡笺，信是伪造的，出自{a}娘家的门客。{a}本人并不知情。'}},
    {label:'把信转给礼部议处', eff:{affB:-8, harmony:-6, _t:'信在礼部传了一圈，流言已经传到了宫外。'}}
   ]},
  {text:'册立的日子近了。礼部送来金册，空着一处，等你落笔。',
   opts:[
    {label:'写下{b}的名字', check:{attr:'meili', lv:2}, eff:{affB:15, minxin:5, _t:'百姓说新君念旧情。{a}的娘家，此后再没进过宫。'}},
    {label:'迟迟不肯落笔', eff:{harmony:-8, affA:-5, affB:-5, _t:'金册在案上放了一个月。两人都觉得被辜负了，后宫从此分成了两半。'}}
   ]}
 ],
 outro:'金册收进了太庙。很多年后，宫里的人还会说起那一处落笔。'},

// ===== 链式后续 =====
{id:'har_c01', cat:'chain', title:'迟迟不显', w:10,
 text:'早先报喜的那位道侣，肚子迟迟不见动静。府里议论纷纷，连监军都派人来问候胎象。',
 opts:[
  {label:'对外称胎象不稳，需静养',check:{attr:'xinji',lv:1},eff:{harmony:10,_t:'话圆过去了，府里的议论也渐渐少了。'}},
  {label:'由着府里议论', eff:{harmony:-6, suspicion:3, _t:'议论越传越远，流言传到了府外。'}}
 ]},
{id:'har_c02', cat:'chain', title:'火油', w:10,
 text:'火场清理完，有人在西院墙根下找到一只空油罐。这场火，不是天灾。',
 opts:[
  {label:'亲自顺着油罐一路查下去', check:{attr:'gengu', lv:2}, eff:{suspicion:-6, _t:'你跑遍了城里的油坊。油罐是从监军府后门出来的。你把证据收好，没有声张。'}},
  {label:'当作意外处理', eff:{harmony:-4, xinmo:2, _t:'油罐被扔进了废料堆。府里人夜里都睡不安稳。'}}
 ]},
{id:'har_c03', cat:'后宅', title:'{name}的师门来客', w:6, needP:1,
 text:'{name}的旧师门派人登门。来人言辞客气，却句句都在打探王府的虚实。',
 opts:[
  {label:'当场拿下', check:{attr:'wulue', lv:2}, eff:{guard:4, wugong:10, _t:'来人身上搜出一份王府布防图。你加强了守卫。'}},
  {label:'敷衍几句送走', eff:{suspicion:5, _t:'来人碰了个软钉子，回去后话就不好听了。'}}
 ]}
];
