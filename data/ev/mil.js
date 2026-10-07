/* 军务事件。普通事件 mil_0xx，大事件 mil_mxx，链式后续 mil_cxx（cat:'chain'）。 */
const EV_MIL=[
// ===== 第 1~3 阶：封地初建 =====
{id:'mil_001', cat:'军务', title:'新兵操练', w:10, cond:{rankMin:1, rankMax:3},
 text:'新募的几百人连队列都站不齐，老兵在一旁笑他们是一群扛锄头的。',
 opts:[
  {label:'亲自下校场，与新兵同吃同练', check:{attr:'gengu', lv:2},
   eff:{train:6, _t:'你跟新兵一起在校场摸爬滚打了一整季，晒脱了一层皮，新兵总算像个兵样了。'}},
  {label:'交给老兵随便带带',
   eff:{train:-3, troops:-50, _t:'老兵带出来的是一身兵油子习气。几十个受不了打骂的新兵，夜里偷偷走了。'}}
 ]},

{id:'mil_002', cat:'军务', title:'黑风寨', w:10, cond:{rankMin:1, rankMax:3},
 text:'城西黑风寨的山匪又劫了一支粮队。寨子据险而守，前任知州剿了两回都没剿下来。',
 opts:[
  {label:'看出山寨缺水少粮，围而断其粮道',check:{attr:'wuxing',lv:2},eff:{next:'mil_c01',minxin:8,_t:'你看准了山寨只有一口水井、存粮撑不过一月。围到第三十天，山匪饿得下山投降，沿途村子再没被抢过。'}},
  {label:'派兵象征性搜一回山',
   eff:{minxin:-4, silver:-60, _t:'私兵在山脚转了一圈就回来了。粮队照旧被劫，商户们开始绕道走。'}}
 ]},

{id:'mil_003', cat:'军务', title:'欠饷', w:10, cond:{rankMin:1, rankMax:3},
 text:'私兵已经两个月没发饷，营里开始有人骂娘，伙房的米也越煮越稀。',
 opts:[
  {label:'查出克扣的人，追回欠饷',check:{attr:'meili',lv:1},eff:{train:8,_t:'克扣军饷的管事被拿下，追回的饷银发下去，营里又有了操练的号子声。'}},
  {label:'拖着再说',
   eff:{train:-4, troops:-80, _t:'饷银一拖再拖。营里先是骂娘，后来有人夜里卷了铺盖走了。'}}
 ]},

{id:'mil_004', cat:'军务', title:'逃兵', w:10, cond:{rankMin:1, rankMax:3},
 text:'夜里有二十几个兵卒翻墙逃了，巡哨在河边把人追了回来，等你发落。',
 opts:[
  {label:'按军法杖责，以儆效尤', check:{attr:'wulue', lv:1},
   eff:{train:5, _t:'二十军棍打完，人还留在营里。从此再没人敢夜里翻墙。'}},
  {label:'斩首示众',
   eff:{xinmo:4, minxin:-3, _t:'人头挂在营门上。城里人说起你，声音都低了。'}}
 ]},

{id:'mil_005', cat:'军务', title:'锈刀断弦', w:10, cond:{rankMin:1, rankMax:3},
 text:'武库里的刀枪大半生了锈，弓弦一拉就断。这样的兵器上了阵，只能拿去吓唬人。',
 opts:[
  {label:'亲自跑一趟关内，暗购军械', check:{attr:'gengu', lv:2},
   eff:{guard:4, _t:'你扮作行商在关内奔波了一个多月，一批上好的弩机悄悄运进王府，卫队换了装备，关卡上没留下一点痕迹。'}},
  {label:'修修补补凑合用',
   eff:{train:-3, silver:-40, _t:'磨掉锈、换根弦，兵器勉强能用。一次操练下来，断了十几把刀。'}}
 ]},

{id:'mil_006', cat:'军务', title:'草原太静', w:10, cond:{rankMin:1, rankMax:3},
 text:'北边草原这阵子格外安静，连放牧的狄人都少见。老兵说，这不是好兆头。',
 opts:[
  {label:'在边境多设烽燧',check:{attr:'wencai',lv:1},eff:{next:'mil_c05',minxin:6,_t:'新烽燧一座座立起来，边村的人夜里敢睡踏实觉了。'}},
  {label:'只当是寻常年景',
   eff:{minxin:-3, xinmo:2, _t:'边村没做任何防备。有牧人说在草原深处看见连片的火光，你夜里睡不安稳。'}}
 ]},

{id:'mil_007', cat:'军务', title:'狄人游骑', w:10, cond:{rankMin:1, rankMax:3},
 text:'一股狄人游骑掠走了边村的牛羊，往北逃去，马蹄印还新鲜。',
 opts:[
  {label:'看出游骑必会回头，以牛羊为饵设伏', check:{attr:'wuxing', lv:2},
   eff:{train:6, _t:'你从马蹄印看出这股游骑没吃饱。伏兵等到天黑，游骑果然回头来抢，被围了个正着。'}},
  {label:'只加固寨墙了事',
   eff:{minxin:-4, silver:-60, _t:'寨墙上添了一圈木刺，丢的牛羊却没人管。边民背后说，王府的兵只会守门。'}}
 ]},

{id:'mil_008', cat:'军务', title:'秋操', w:10, cond:{rankMin:2, rankMax:3, months:[9,10]},
 text:'秋收已毕，正是练兵的时候。可大操要征调民夫车马，会耽误各家冬藏。',
 opts:[
  {label:'只选拔精兵编为亲卫', check:{attr:'xinji', lv:1},
   eff:{guard:4, _t:'你挑走了各营最好的苗子，又给校尉们补足了名额，没人有话说。'}},
  {label:'强征民夫车马',
   eff:{minxin:-4, silver:-50, _t:'征来的民夫心不在焉，大操草草收场。城外几个村子的白菜，烂在了地里。'}}
 ]},

{id:'mil_009', cat:'军务', title:'瘸腿老校尉', w:10, cond:{rankMin:2, rankMax:3}, once:1,
 text:'当年在雁回关跟过你的老校尉找上门来。他瘸了一条腿，想在王府讨口饭吃。',
 opts:[
  {label:'送银安置，记下这份情',check:{attr:'wencai',lv:1},cost:{silver:80},eff:{merit:16,xinmo:-6,_t:'他在城外置了几亩地，逢年过节总托人送来一篮鸡蛋。'}},
  {label:'打发几两银子了事',
   eff:{xinmo:3, minxin:-2, _t:'老校尉接过银子，没说什么，一瘸一拐地走了。这事在老兵里传开，有人背地里叹气。'}}
 ]},

{id:'mil_010', cat:'军务', title:'冒名劫掠', w:10, cond:{rankMin:1, rankMax:3},
 text:'有马贼打着朔州王府的旗号劫商队，商人一纸状子告到了监军那里。',
 opts:[
  {label:'向监军递帖自辩',check:{attr:'xinji',lv:1},eff:{suspicion:-12,_t:'帖子写得有理有据。韩琮看完，说此事他心里有数。'}},
  {label:'闭门不理',
   eff:{suspicion:6, minxin:-3, _t:'马贼还打着你的旗号四处劫掠。监军的密折里写着「疑为王府私兵所为」。'}}
 ]},

{id:'mil_011', cat:'军务', title:'营中聚赌', w:10, cond:{rankMin:1, rankMax:3},
 text:'营中聚赌成风，几个什长把一季的饷银都输光了，还欠了一屁股债。',
 opts:[
  {label:'严禁聚赌，杖责为首者', check:{attr:'wulue', lv:1},
   eff:{train:5, _t:'赌风止住了。挨了板子的什长们，第二天照样出操。'}},
  {label:'睁一只眼闭一只眼',
   eff:{train:-4, silver:-50, _t:'赌债越滚越大，几个什长挪了营里的粮饷去填窟窿。'}}
 ]},

// ===== 第 4~6 阶：一州之主、邻藩角力 =====
{id:'mil_012', cat:'军务', title:'越界', w:10, cond:{rankMin:4, rankMax:6},
 text:'平阳王的兵马追一伙盗匪，越过界碑进了你的地界，还顺手抢了一个村子。',
 opts:[
  {label:'修书质问，索要赔偿', check:{attr:'wencai', lv:2},
   eff:{silver:200, _t:'你的信写得滴水不漏，平阳王只好赔银了事。'}},
  {label:'忍气吞声',
   eff:{minxin:-4, xinmo:2, _t:'你下令开仓给村子补了些粮食，此事就算过去了。边民骂你软弱。'}}
 ]},

{id:'mil_013', cat:'军务', title:'再立一营', w:10, cond:{rankMin:4, rankMax:6},
 text:'各营都已满额，参军们联名请你再立一营。可朝廷那边，正盯着你的兵册。',
 opts:[
  {label:'亲自下乡挨村募兵',check:{attr:'gengu',lv:2},cost:{silver:140},eff:{troops:800,_t:'你骑马跑遍了北边几十个村子，新兵一队队进了营。新营挂在屯田名下，兵部的账上看不出端倪。'}},
  {label:'照参军的意思仓促扩营',
   eff:{suspicion:8, silver:-100, _t:'新营仓促立起，兵没招满几个。京城的邸报上，朔州两个字倒出现得越来越多。'}}
 ]},

{id:'mil_014', cat:'军务', title:'落魄游击', w:10, cond:{rankMin:4, rankMax:6},
 text:'一个在西边打过仗的游击将军流落朔州，听说你在招人，开口要的价钱不低。',
 opts:[
  {label:'以诚相待，礼聘入营',check:{attr:'meili',lv:1},eff:{next:'mil_c02',train:12,_t:'他上任第一天就把三个校尉骂哭了。'}},
  {label:'压价还价',
   eff:{train:-3, xinmo:2, _t:'你压了三回价，他冷笑一声走了。营里的人说，殿下连个人才都留不住。'}}
 ]},

{id:'mil_015', cat:'军务', title:'军屯', w:10, cond:{rankMin:4, rankMax:6},
 text:'有人提议让私兵在城北荒地屯田，兵农两用，自己养活自己。',
 opts:[
  {label:'亲自带老兵下地开荒', check:{attr:'gengu', lv:1},
   eff:{silver:150, _t:'你卷起裤腿跟老兵一起翻地，头一年就省下了一大笔军粮钱。'}},
  {label:'随手圈一片地交差',
   eff:{minxin:-3, silver:-60, _t:'屯田划到了民田头上，几个村子闹了起来。'}}
 ]},

{id:'mil_016', cat:'军务', title:'马政', w:10, cond:{rankMin:4, rankMax:6},
 text:'北地多马，可王府的骑兵还骑着驽马。马市上的狄商，开价一年比一年高。',
 opts:[
  {label:'劫狄人的马群', check:{attr:'wulue', lv:3},
   eff:{wugong:40, _t:'你带着轻骑夜袭了一个部落，赶回上千匹马。'}},
  {label:'照狄商的开价凑合买些',
   eff:{silver:-120, train:-2, _t:'狄商把老马染了毛卖给你。骑兵牵出去跑了两圈，马就喘得站不住。'}}
 ]},

{id:'mil_017', cat:'军务', title:'兵部行文', w:10, cond:{rankMin:4, rankMax:6},
 text:'兵部行文，要朔州王府将护卫人数造册上报。按祖制，藩王护卫不得过三千。',
 opts:[
  {label:'少报一半，把人藏进军屯', check:{attr:'xinji', lv:3},
   eff:{suspicion:-8, _t:'兵册上的数字刚好卡在祖制之内，兵部没再多问。'}},
  {label:'拖着不报',
   eff:{suspicion:8, _t:'兵部又来了一道催文，措辞已经很难看了。'}}
 ]},

{id:'mil_018', cat:'军务', title:'新老营斗殴', w:10, cond:{rankMin:4, rankMax:6},
 text:'新营和老营为了争校场打了起来，伤了几十人。两边的校尉都在你门外等着告状。',
 opts:[
  {label:'两边各打二十军棍', check:{attr:'wulue', lv:1},
   eff:{train:5, _t:'军棍打完，校场上清净了，两边谁也不敢再提。'}},
  {label:'两边和稀泥',
   eff:{train:-4, troops:-50, _t:'你谁也没得罪。两营从此结了仇，几十个人干脆跑去别处投军。'}}
 ]},

{id:'mil_019', cat:'军务', title:'四百俘虏', w:10, cond:{rankMin:4, rankMax:6},
 text:'剿灭一伙流寇后，抓了四百多俘虏。放了怕他们再落草，养着又费粮。',
 opts:[
  {label:'收编入营', check:{attr:'meili', lv:2},
   eff:{next:'mil_c04',troops:300, _t:'俘虏换了号衣。你让老兵一带一，夜里营中也没丢过东西。'}},
  {label:'罚去修城墙',
   eff:{minxin:-3, xinmo:3, _t:'工地上每天都有人被抬出来，城里人看着心里发紧。'}}
 ]},

{id:'mil_020', cat:'军务', title:'安西王借兵', w:10, cond:{rankMin:5, rankMax:6},
 text:'安西王遭西羌围攻，派人星夜赶来借兵。使者说，安西王记得这份情。',
 opts:[
  {label:'婉拒，并把求援信抄送朝廷', check:{attr:'xinji', lv:1},
   eff:{next:'mil_c03',suspicion:-8, _t:'朝廷很满意。你另派人给安西王送去粮草，算是全了情面。'}},
  {label:'虚应一番，迟迟不发兵',
   eff:{xinmo:3, suspicion:5, _t:'使者在城里等了半个月。朝廷听说两藩来往，安西王也记恨上了你。'}}
 ]},

// ===== 第 7~10 阶：靖难起兵前后 =====
{id:'mil_021', cat:'军务', title:'高城难下', w:10, cond:{rankMin:7, rankMax:10},
 text:'起兵之后，挡在南下路上的城池一座比一座高，军中缺云梯，更缺投石车。',
 opts:[
  {label:'参透投石车的机关，督造器械',check:{attr:'wuxing',lv:2},eff:{wugong:60,_t:'你琢磨了几夜，改了投石车的配重。工匠照图赶造，投石车推到城下，三轮就砸开了城门。'}},
  {label:'驱兵蚁附攻城',
   eff:{troops:-200, train:-4, _t:'没有器械，将士们扛着木梯往上爬，一天下来，城下堆满了尸首。'}}
 ]},

{id:'mil_022', cat:'军务', title:'粮道被断', w:10, cond:{rankMin:7, rankMax:10},
 text:'京营一支轻骑绕到后方，烧了两处粮站。前军只剩半月存粮。',
 opts:[
  {label:'亲自奔走各镇向商帮购粮',check:{attr:'gengu',lv:2},eff:{minxin:8,_t:'你带人连跑了七八个镇子，商帮的车队终于跟在了大军后面。百姓说，这支兵不抢粮。'}},
  {label:'就地向百姓征粮',
   eff:{minxin:-7, xinmo:3, _t:'军粮够了。沿途村子的米缸，也空了。'}}
 ]},

{id:'mil_023', cat:'军务', title:'来降的副将', w:10, cond:{rankMin:7, rankMax:10},
 text:'守城的朝廷副将带着部众来投，只求保住家小。可此人前年在别处杀过降卒。',
 opts:[
  {label:'厚待以收人心', check:{attr:'meili', lv:2},
   eff:{troops:400, _t:'你让他当众向被杀降卒的家人赔罪，又厚待他的部众。城里的议论慢慢淡了。'}},
  {label:'含糊收下，不置可否',
   eff:{minxin:-4, train:-3, _t:'城里有人认出了他，背后议论你用人不择。他的部众摸不清你的态度，人心浮动。'}}
 ]},

{id:'mil_024', cat:'军务', title:'军心浮动', w:10, cond:{rankMin:7, rankMax:10},
 text:'南下连战数月，营中传言朝廷三十万大军已过大河。将士思乡，夜里常有哭声。',
 opts:[
  {label:'放归思乡的老兵', check:{attr:'wencai', lv:1},
   eff:{minxin:5, _t:'老兵们回到北境，逢人就说殿下仁厚。'}},
  {label:'严禁传言，抓几个乱说的',
   eff:{train:-4, xinmo:2, _t:'抓了几个传谣的，营里没人再说话，夜里的哭声却没停。'}}
 ]},

{id:'mil_025', cat:'军务', title:'京营动向', w:10, cond:{rankMin:7, rankMax:10},
 text:'细作回报，京营调动频繁，粮车一队队出城，像是在为一场大战集结。',
 opts:[
  {label:'从粮车去向推出京营布防', check:{attr:'wuxing', lv:3},
   eff:{wugong:35, _t:'你盯着粮车的去向推演了三夜，京营的布防图在你案上画了出来。'}},
  {label:'按兵不动，静观其变',
   eff:{train:-3, xinmo:2, _t:'你决定再看看。营里每天都在猜，京营什么时候打过来。'}}
 ]},

{id:'mil_026', cat:'军务', title:'夜袭', w:10, cond:{rankMin:7, rankMax:10},
 text:'京营前锋趁夜摸到营前，被哨兵发现时，喊杀声已经到了栅栏外。',
 opts:[
  {label:'披甲冲在最前，硬顶敌锋', check:{attr:'gengu', lv:3},
   eff:{wugong:45, _t:'你提刀冲在最前，京营前锋被杀退。天亮时，你的甲上全是血。'}},
  {label:'仓促应战',
   eff:{troops:-200, injured:1, _t:'营中乱成一团，天亮才把敌人赶出去。前营烧成了白地，你也挂了彩。'}}
 ]},

{id:'mil_027', cat:'军务', title:'军纪', w:10, cond:{rankMin:7, rankMax:10},
 text:'有兵卒进城后抢了民宅，还伤了人。犯事的，是跟你最久的那一营。',
 opts:[
  {label:'罚饷赔偿，保住老营',check:{attr:'xinji',lv:1},eff:{train:8,_t:'老营的人松了口气。你又亲自登门赔了礼，苦主也就不再闹了。'}},
  {label:'压下不提',
   eff:{minxin:-5, xinmo:2, _t:'犯事的人没受罚。苦主在营门外跪了一天，城里人看大军的眼神变了。'}}
 ]},

{id:'mil_028', cat:'军务', title:'散修从军', w:10, cond:{rankMin:8, rankMax:10},
 text:'一个散修愿以术法助战，开口要的报酬，是你府库里的一枚破障丹。',
 opts:[
  {label:'许以官爵，请他留下', check:{attr:'meili', lv:3},
   eff:{guard:5, _t:'散修留在了王府，做了你的贴身护法。'}},
  {label:'先付重金，再看本事',
   eff:{silver:-150, _t:'散修收了银子，在阵前做了一场法。一阵风过去，什么也没发生。'}}
 ]},

// ===== 链式后续 =====
{id:'mil_c01', cat:'chain', title:'寨中地窖', w:10,
 text:'黑风寨的地窖里搜出一批兵甲，还有一封书信，落款是监军韩琮府上的管事。',
 opts:[
  {label:'兵甲充入武库', check:{attr:'wulue', lv:1},
   eff:{train:4, _t:'兵甲上的官印被磨掉了，悄悄充进了武库。'}},
  {label:'大张旗鼓地清点',
   eff:{suspicion:6, _t:'搜出兵甲的事传遍了全城，书信也不知去向。韩琮开始满城查你的人。'}}
 ]},

{id:'mil_c02', cat:'chain', title:'游击旧部', w:10,
 text:'游击将军写信召来了旧部。几百个西边的老兵站在城门外，个个晒得像炭。',
 opts:[
  {label:'全部收下', check:{attr:'xinji', lv:2},
   eff:{troops:300, _t:'这些人打过仗、见过血。你把他们拆散编进各营，京城那边没察觉。'}},
  {label:'嫌麻烦，打发走',
   eff:{train:-3, xinmo:2, _t:'老兵们在城门外站了一天，掉头走了。游击将军好几天没跟你说话。'}}
 ]},

{id:'mil_c03', cat:'chain', title:'安西王回礼', w:10,
 text:'安西王送来三百匹河西马，还有一封亲笔信，信里称你「七弟」。',
 opts:[
  {label:'收马编为骑兵', check:{attr:'wulue', lv:2},
   eff:{wugong:20, _t:'朔州多了一支骑兵，你把它挂在马场名下，朝廷没看出来。'}},
  {label:'在城门口大张旗鼓地受礼',
   eff:{suspicion:6, _t:'你摆了一场酒迎马。没几天，朝廷就知道两藩走近了。'}}
 ]},

{id:'mil_c04', cat:'chain', title:'俘虏中的校尉', w:10,
 text:'降卒里有一个京营校尉，梗着脖子不肯跪，说要见朔州王一面。',
 opts:[
  {label:'放他回去传话', check:{attr:'wencai', lv:1},
   eff:{merit:8, _t:'他回京之后，京营里多了一种说法：朔州王不杀降。'}},
  {label:'关起来再说',
   eff:{train:-3, _t:'他在营中骂了三天三夜，扰得军心不宁。'}}
 ]},

{id:'mil_c05', cat:'chain', title:'草原会盟', w:10,
 text:'斥候带回消息：狄人几个大部落正在会盟，秋后很可能合兵南下。',
 opts:[
  {label:'亲自奔走各村，督边民坚壁清野',check:{attr:'gengu',lv:1},cost:{silver:120},eff:{minxin:10,_t:'你骑马把边村跑了个遍，边民带着粮食牲口撤进了城堡，入秋时草原上什么也抢不到。'}},
  {label:'上报朝廷，等旨意',
   eff:{minxin:-4, troops:-100, _t:'奏折递上去，朝廷迟迟没回。入秋时狄人南下，边村被抢了个精光。'}}
 ]},

// ===== 大事件 =====
{id:'mil_m01', cat:'军务', major:1, title:'狄人犯边', cond:{rankMin:2, rankMax:5}, once:1, w:6,
 intro:'秋草黄时，狄人几个部落合兵两万南下，连破三座边堡。朔州是挡在他们马前的第一座城。朝廷的援军，至少要等到入冬。',
 steps:[
  {text:'狄人前锋已到城北二十里，城外还有几千边民没撤进来。',
   opts:[
    {label:'开城门接纳边民，亲自带兵断后', check:{attr:'gengu', lv:2},
     eff:{minxin:7, _t:'边民挤满了城里的每一条巷子。你带着断后的人马且战且退，一天一夜没下马，一个不少地回来了。'}},
    {label:'闭城死守',
     eff:{minxin:-6, xinmo:4, _t:'城门在边民的哭喊声里关上了。'}}
   ]},
  {text:'狄人围城，轮番攻打西门。守军已经连着几夜没合眼。',
   opts:[
    {label:'看破狄营换防的空当，夜出劫营', check:{attr:'wuxing', lv:3},
     eff:{troops:300, _t:'你看准狄营三更换防时的空当开门杀出，抢回一大批马匹，还收拢了不少被掳的边军。'}},
    {label:'死守待援，轮番硬顶',
     eff:{troops:-200, train:-4, _t:'守军一批批换上城头，又一批批被抬下来。'}}
   ]},
  {text:'围城一个多月，狄人粮尽北撤。撤退的路，必经雁回关旧道。',
   opts:[
    {label:'追击至雁回关', check:{attr:'wulue', lv:3},
     eff:{wugong:60, _t:'又是雁回关。狄人的尸首铺满了旧道，草原上要很多年才缓得过来。'}},
    {label:'任由狄人从容北撤',
     eff:{minxin:-4, xinmo:3, _t:'狄人赶着掳来的人口牲畜慢慢北去。城头的守军看着，有人哭出了声。'}}
   ]}
 ],
 outro:'入冬时，朝廷的援军终于到了，城外只剩烧焦的营地。'},

{id:'mil_m02', cat:'军务', major:1, title:'平阳王陈兵', cond:{rankMin:4, rankMax:7}, once:1, w:6,
 intro:'平阳王借口追捕逃犯，在两家交界处陈兵八千，营寨连绵数里。他与丞相严崇是儿女亲家。',
 steps:[
  {text:'平阳王的使者到了，话里话外，要你交出两个县的盐井。',
   opts:[
    {label:'先答应，拖着不交', check:{attr:'xinji', lv:2},
     eff:{suspicion:-5, _t:'使者回去复命，平阳王以为你怕了，京城那边也松了口气。'}},
    {label:'割让一个县的盐井求和',
     eff:{silver:-150, minxin:-4, _t:'盐井交了出去，灶户们哭着搬了家。平阳王的胃口，却没小。'}}
   ]},
  {text:'平阳王的兵马越过界河扎营，离最近的县城只有半天路程。',
   opts:[
    {label:'看出敌营囤粮之处，派死士夜焚', check:{attr:'wuxing', lv:3},
     eff:{train:6, _t:'你从敌营炊烟的方位断出了粮草所在。对岸火光冲天。死士们天亮前摸回了营，脸上全是烟灰。'}},
    {label:'只守县城',
     eff:{minxin:-4, silver:-100, _t:'平阳王的兵在城外的村子里放马吃青苗，你的兵只在城头看着。'}}
   ]},
  {text:'两军对峙到入冬，平阳王营中缺粮，派人来议和。',
   opts:[
    {label:'看穿他缺粮的底，要他赔银退兵', check:{attr:'wuxing', lv:2},
     eff:{silver:300, _t:'你一句话点破了他营中的存粮，平阳王咬着牙赔了银子，拔营东归。'}},
    {label:'与他歃血为盟',
     eff:{suspicion:10, _t:'平阳王只留下几百老弱充作诚意。藩王结盟，朝廷最忌讳这个。'}}
   ]}
 ],
 outro:'界河上的冰化开时，对岸的营寨已经空了。'},

{id:'mil_m03', cat:'军务', major:1, title:'左营哗变', cond:{rankMin:3, rankMax:9}, once:1, w:6,
 intro:'欠饷三个月，又逢一场败仗，左营的兵卒杀了督饷官，围住了营门。领头的是个叫石虎的什长。',
 steps:[
  {text:'哗变的兵卒堵在营门口，举着刀，喊着要见你。',
   opts:[
    {label:'调亲卫营围住左营，断其粮水', check:{attr:'wulue', lv:1},
     eff:{guard:4, _t:'围了两天，左营开门，没死一个人。'}},
    {label:'下令强攻营门',
     eff:{troops:-150, xinmo:3, _t:'亲卫营冲了进去。混乱中死了一百多人。'}}
   ]},
  {text:'兵卒们提出三个条件：补发欠饷、严惩克扣军饷的军需官、不追究带头的人。',
   opts:[
    {label:'全部答应',check:{attr:'meili',lv:1},eff:{train:12,_t:'你当众应下，被克扣的饷银一文不少地追了回来，发到每个人手里。石虎跪下给你磕了三个响头。'}},
    {label:'斩石虎以正军法，饷银分期补发',
     eff:{train:-5, xinmo:3, _t:'石虎死前没喊冤。左营从此安静了，安静得让人心里发毛。'}}
   ]},
  {text:'军需官被押上来。他供出，克扣的饷银有一半送进了监军韩琮府里。',
   opts:[
    {label:'拿口供与韩琮做交易', check:{attr:'xinji', lv:3},
     eff:{silver:250, suspicion:-6, _t:'韩琮吐出了这些年的赃银，往后的密折里，再不提左营的事。'}},
    {label:'把军需官交给监军处置',
     eff:{suspicion:5, train:-3, _t:'军需官进了监军府就没了消息。韩琮反参你一本「纵兵作乱」，营里的人也寒了心。'}}
   ]}
 ],
 outro:'左营后来改了番号。那面被血染过的营旗，你让人收进了库里。'},

{id:'mil_m04', cat:'军务', major:1, title:'朝廷点验', cond:{rankMin:4, rankMax:6}, once:1, w:6,
 intro:'圣旨到了：兵部侍郎带着一队禁军来朔州点验王府私兵，凡超出定额的，一律裁撤。朔州的兵，可远远超出了定额。',
 steps:[
  {text:'侍郎进城，茶都没喝一口，就要看兵册。',
   opts:[
    {label:'大宴侍郎，摸他的底',check:{attr:'meili',lv:1},eff:{xinmo:-8,_t:'酒过三巡，侍郎说漏了嘴：真正想查朔州的，是严相。你心里有了底。'}},
    {label:'照实交出兵册',
     eff:{suspicion:10, _t:'侍郎拿着兵册对了两处营房，脸当场就沉了。'}}
   ]},
  {text:'点验那天，校场上黑压压站满了人，侍郎的脸色越来越难看。',
   opts:[
    {label:'把超额兵马分调各处关隘', check:{attr:'wulue', lv:2},
     eff:{suspicion:-8, _t:'第二天校场上只剩定额的人马。侍郎在奏报里写：朔州王恭顺。'}},
    {label:'主动裁撤一批老弱',
     eff:{troops:-400, _t:'一批老弱卸甲离营。侍郎点了点头，什么也没说。'}}
   ]},
  {text:'临行前，侍郎私下找到你：他可以把点验结果写得好看些，条件是你出面弹劾监军韩琮。',
   opts:[
    {label:'答应，亲笔写弹章', check:{attr:'wencai', lv:2},
     eff:{suspicion:-8, _t:'弹章写得句句有据。韩琮被召回京城问话，朔州清净了一阵子。'}},
    {label:'当面回绝，不蹚这浑水',
     eff:{suspicion:5, _t:'侍郎拂袖而去。他的奏报写得不冷不热，末尾多了几句意味深长的话。'}}
   ]}
 ],
 outro:'侍郎的车驾出了城。校场上的人，又一个个回来了。'},

{id:'mil_m05', cat:'军务', major:1, title:'铁门关', cond:{rankMin:8, rankMax:10}, once:1, w:6,
 intro:'南下的大军被挡在铁门关前。关城依山而建，守将是京营老将，关后就是通往玉京的平原。此关不破，靖难只是一句空话。',
 steps:[
  {text:'斥候绘出了关城地形，参军们吵成一团。',
   opts:[
    {label:'亲率奇兵翻越险峰绕后', check:{attr:'gengu', lv:2},
     eff:{train:8, _t:'你亲自带队翻过山脊，从关后杀了下来。将士们看你的眼神，不一样了。'}},
    {label:'屯兵关下，轮番试攻',
     eff:{troops:-300, train:-4, _t:'连攻数次，关城纹丝不动。'}}
   ]},
  {text:'关城守将派人送来一封信：他与已故太子有旧，愿意谈谈。',
   opts:[
    {label:'亲自赴约', check:{attr:'meili', lv:3},
     eff:{troops:500, _t:'守将见了你，沉默良久，说太子当年提起过你。次日一早，关门开了。'}},
    {label:'疑其有诈，趁机攻城',
     eff:{xinmo:5, minxin:-4, _t:'关城在火光中陷落。守将死在城头，手里还攥着太子的旧玉佩。'}}
   ]},
  {text:'关城已破，城中还有守军家眷数千。营中有人提议屠城立威。',
   opts:[
    {label:'亲自走遍关城，安置守军家眷',check:{attr:'gengu',lv:1},cost:{silver:200},eff:{troops:800,_t:'你挨条巷子走了三天，家眷有了着落，降卒也就安心了。'}},
    {label:'放纵劫掠一番',
     eff:{xinmo:8, minxin:-8, _t:'将士们发了一笔横财。往后的每座城，都守得格外拼命。'}}
   ]},
  {text:'消息传到玉京，京营开始收缩布防。站在平原上，远远已能望见京城的方向。',
   opts:[
    {label:'休整一月，补充粮秣',check:{attr:'wencai',lv:1},eff:{train:12,_t:'大军养足了力气。'}},
    {label:'走一步看一步',
     eff:{train:-4, xinmo:3, _t:'大军在平原上停停走走，军令一日三改，将士们越走越没劲。'}}
   ]}
 ],
 outro:'铁门关上换了旗。从这里到玉京，再没有能挡住你的关隘了。'}
];
