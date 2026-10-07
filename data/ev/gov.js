/* 治理类事件。cat:'治理'，链式后续 cat:'chain'。 */
const EV_GOV=[
// ===== 第 1~3 阶：封地小事 =====
{id:'gov_001',cat:'治理',title:'秋税',w:10,cond:{rankMin:1,rankMax:3,months:[8,9,10]},
 text:'今年秋粮歉收，各县报上来的税额只有往年七成。户房主事来问：照旧催缴，还是缓一缓？',
 opts:[
  {label:'减免三成',check:{attr:'wencai',lv:1},cost:{silver:100},eff:{minxin:8,merit:10,_t:'告示贴出去，城门口有老人对着告示作揖。'}},
  {label:'照额催缴',eff:{minxin:-5,xinmo:2,_t:'税银收齐了，几个村的里正却再没来过王府。'}}]},

{id:'gov_002',cat:'治理',title:'争水',w:10,cond:{rankMin:1,rankMax:3,months:[5,6,7]},
 text:'上游周家庄截了河水浇田，下游王家坳的人扛着锄头去扒坝，两边打伤了好几个。',
 opts:[
  {label:'定下分时放水的规矩',check:{attr:'wencai',lv:2},eff:{wengong:25,minxin:3,_t:'水牌立在河边，两村各派一人看着。'}},
  {label:'偏向人多势大的周家庄',eff:{minxin:-4,xinmo:2,_t:'周家庄送来一份谢礼，王家坳的人背地里骂你。'}}]},

{id:'gov_003',cat:'治理',title:'义学',w:10,cond:{rankMin:1,rankMax:2},
 text:'朔州识字的人太少，衙门里连个像样的书办都招不到。长史提议在王府边上开一间义学。',
 opts:[
  {label:'请流放来此的旧翰林执教',check:{attr:'meili',lv:2},eff:{minxin:5,xinmo:-3,_t:'老翰林答应了，每晚还拉着你论文章。'}},
  {label:'先放一放，等明年再说',eff:{wengong:-10,minxin:-2,_t:'衙门里还是招不到书办，公文堆了半屋子。'}}]},

{id:'gov_004',cat:'治理',title:'盗牛案',w:10,cond:{rankMin:1,rankMax:3},
 text:'一个佃户被指偷了豪强家的耕牛，县令只审了一堂就判了流放。佃户的妻子抱着孩子跪在府门口。',
 opts:[
  {label:'细读卷宗，看出供词里的破绽',check:{attr:'wuxing',lv:2},eff:{merit:10,minxin:4,next:'gov_c01',_t:'那头牛在豪强自家的庄子里找到了。'}},
  {label:'维持原判，给县令留面子',eff:{xinmo:4,minxin:-3,_t:'县衙上下对王府越发恭顺，那女人哭着走了。'}}]},

{id:'gov_005',cat:'治理',title:'狄人互市',w:10,cond:{rankMin:2,rankMax:3},
 text:'雁回关外的狄人部落派来使者，想用皮毛和马匹换朔州的茶和铁锅。',
 opts:[
  {label:'只许以货易货，由王府专营',check:{attr:'xinji',lv:3},eff:{next:'gov_c03',silver:300,_t:'王府赚了一大笔，狄人也挑不出毛病。'}},
  {label:'闭关拒使',eff:{wugong:-10,minxin:-2,_t:'使者悻悻而去，入秋后关外的马贼多了起来。'}}]},

{id:'gov_006',cat:'治理',title:'流民叩关',w:10,cond:{rankMin:1,rankMax:3,months:[11,12,1,2]},
 text:'入冬后，一批关内流民走到朔州城下，男女老少百余口，有人冻掉了脚趾。',
 opts:[
  {label:'挑出青壮编入私兵',check:{attr:'wulue',lv:2},eff:{troops:200,_t:'王府多了两百个能扛枪的人，老弱也分到了口粮。'}},
  {label:'闭门不纳',eff:{minxin:-4,xinmo:3,_t:'城门外的哭声响了一夜，第二天就没了动静。'}}]},

{id:'gov_007',cat:'治理',title:'题序',w:10,cond:{rankMin:2,rankMax:3},
 text:'城东周家新修族谱，请王爷题一篇序，随帖送来一匣银锭。周家的隐田，衙门里人人知道。',
 opts:[
  {label:'退礼，借机清丈周家田亩',check:{attr:'xinji',lv:3},eff:{wengong:40,_t:'清出隐田八百亩，周家人脸色铁青。'}},
  {label:'随手应付几句',eff:{wengong:-10,minxin:-3,_t:'序写得干巴巴，周家拿去四处说，百姓更觉得王府和豪强是一伙的。'}}]},

{id:'gov_008',cat:'治理',title:'蝗灾',w:10,cond:{rankMin:1,rankMax:3,months:[6,7,8]},
 text:'西边飞来一片蝗虫，遮天蔽日。落过的地方，庄稼只剩秆子。',
 opts:[
  {label:'带头下田捕蝗，以蝗换粮',check:{attr:'gengu',lv:1},cost:{silver:120},eff:{minxin:10,_t:'你挽起裤腿下了田，孩子们提着布袋满田跑，一斗蝗换一升米。'}},
  {label:'闭门祈天',eff:{minxin:-5,silver:-80,_t:'蝗群吃光了半个县的庄稼，秋税也跟着没了着落。'}}]},

{id:'gov_009',cat:'治理',title:'童生试',w:10,cond:{rankMin:2,rankMax:3},
 text:'州县童生试开考，考场里搜出三份夹带，其中一份出自王府长史的侄子。',
 opts:[
  {label:'看破夹带的手法，一体革名',check:{attr:'wuxing',lv:2},eff:{minxin:5,_t:'三人一体革名。长史自知理亏，上表请罪，你留他戴罪办事。'}},
  {label:'只革另外两人',eff:{xinmo:4,minxin:-3,_t:'长史私下送来一份谢礼。考生们都看在眼里。'}}]},

{id:'gov_010',cat:'治理',title:'义仓',w:10,cond:{rankMin:1,rankMax:3,months:[9,10,11]},
 text:'今秋府库存粮有余。仓官说，关内粮价正高，现在卖出去能赚不少。',
 opts:[
  {label:'亲自押粮车入关，趁高价卖出',check:{attr:'gengu',lv:2},eff:{silver:220,_t:'你随粮车走了半个月，价钱卖得正好。'}},
  {label:'拖着不办',eff:{silver:-60,minxin:-2,_t:'粮食在仓里受了潮，烂了小半。'}}]},

// ===== 第 4~6 阶：一州/多州治理 =====
{id:'gov_011',cat:'治理',title:'私盐',w:10,cond:{rankMin:4,rankMax:6},
 text:'州里私盐贩子成群结队，官盐铺子门可罗雀，盐税一年比一年少。',
 opts:[
  {label:'派兵缉私',check:{attr:'wulue',lv:2},eff:{silver:250,_t:'缴了几十车私盐，盐税回来了。'}},
  {label:'照旧放任',eff:{silver:-100,minxin:-3,_t:'盐枭越发猖狂，官盐铺子关了一半。'}}]},

{id:'gov_012',cat:'治理',title:'漕粮滞闸',w:10,cond:{rankMin:4,rankMax:6,months:[10,11,12]},
 text:'入冬前最后一批漕粮卡在闸口。闸官说要等上头批文，船工们在冷风里等了半个月。',
 opts:[
  {label:'派人进京疏通',check:{attr:'meili',lv:1},eff:{suspicion:-10,_t:'批文下来了，顺带还有一句「朔州王办事妥帖」。'}},
  {label:'干等批文',eff:{minxin:-3,silver:-100,_t:'批文还没下来，河就封了，半船粮冻在了闸口。'}}]},

{id:'gov_013',cat:'治理',title:'年终考课',w:10,cond:{rankMin:4,rankMax:6,months:[12,1]},
 text:'年终要给各州县官员评等。底下报上来的考语，人人都是「勤勉」。',
 opts:[
  {label:'照实评等，罢黜庸官',check:{attr:'wencai',lv:2},eff:{wengong:30,_t:'罢了三个人，剩下的都打起了精神。'}},
  {label:'一团和气，人人中上',eff:{minxin:-3,xinmo:2,_t:'年节时各处的孝敬比往年都厚，底下办事的人却越发懒散了。'}}]},

{id:'gov_014',cat:'治理',title:'越境的佃户',w:10,cond:{rankMin:4,rankMax:6},
 text:'平阳王今年又加了赋，他封地上一整个村子的佃户连夜越境，投奔朔州。',
 opts:[
  {label:'写信劝平阳王减赋',check:{attr:'meili',lv:3},eff:{wengong:35,merit:10,_t:'平阳王减了一成赋，佃户们回去了。'}},
  {label:'送还平阳王，卖个人情',eff:{xinmo:5,minxin:-3,_t:'平阳王回了重礼。押送的兵说，那些人一路都在哭。'}}]},

{id:'gov_015',cat:'治理',title:'名儒北来',w:10,cond:{rankMin:4,rankMax:6},
 text:'江南名儒沈先生想在朔州开书院。他早年因非议严崇被罢了官，至今是丞相府的眼中钉。',
 opts:[
  {label:'暗中资助，不挂王府名号',check:{attr:'xinji',lv:2},eff:{minxin:4,merit:6,next:'gov_c02',_t:'书院以沈先生自己的名义开了张。'}},
  {label:'婉言谢绝',eff:{wengong:-10,xinmo:2,_t:'沈先生回了江南。听说他临走前叹了口气。'}}]},

{id:'gov_016',cat:'治理',title:'并税折银',w:10,cond:{rankMin:5,rankMax:6},
 text:'户房递上条陈：把田赋、丁役和各色杂税并成一项，按田亩折银征收。',
 opts:[
  {label:'先在一县试行',check:{attr:'xinji',lv:1},eff:{minxin:3,_t:'试行的县里，农户们说缴税省了不少腿脚。'}},
  {label:'仓促推行',eff:{minxin:-5,silver:-100,_t:'各县折价不一，百姓排着队到衙门理论。'}}]},

{id:'gov_017',cat:'治理',title:'能吏贪墨',w:10,cond:{rankMin:4,rankMax:6},
 text:'云阳知县修桥铺路、断案如神，是州里最能干的人。他也贪了三千两。',
 opts:[
  {label:'看准他是可用之才，罚俸留任',check:{attr:'wuxing',lv:2},eff:{wengong:25,_t:'他干活更卖命了，贪的银子也一分分吐了出来。'}},
  {label:'睁一只眼闭一只眼',eff:{minxin:-4,xinmo:3,_t:'百姓都说王府护短，底下的人胆子也大了。'}}]},

{id:'gov_018',cat:'治理',title:'军屯侵田',w:10,cond:{rankMin:5,rankMax:6},
 text:'驻军的屯田越扩越大，把附近几个村子的地也圈了进去。村民告状告到了王府。',
 opts:[
  {label:'把田退给百姓',check:{attr:'wulue',lv:2},eff:{minxin:6,_t:'田退回去了。你亲自去营里说清楚，军官们也没话讲。'}},
  {label:'两边各打五十大板',eff:{minxin:-3,train:-3,_t:'村民不满意，营里也憋着气。'}}]},

{id:'gov_019',cat:'治理',title:'修州志',w:10,cond:{rankMin:4,rankMax:6},
 text:'州志已经六十年没修了。主笔的老学究问：青霄宗当年的事，写还是不写？',
 opts:[
  {label:'为母族宗门正名',check:{attr:'wencai',lv:3},eff:{xinmo:-8,merit:10,_t:'那一卷写完，你在灯下坐了很久。'}},
  {label:'敷衍交差',eff:{wengong:-10,suspicion:4,_t:'主笔看你拿不定主意，把旧事写得含含糊糊，京城反倒起了疑。'}}]},

// ===== 第 7~10 阶：争天下前后 =====
{id:'gov_020',cat:'治理',title:'侍郎来信',w:10,cond:{rankMin:7,rankMax:9},
 text:'户部侍郎托商队捎来一封密信，说朝中不少人心向殿下，愿为内应。',
 opts:[
  {label:'看出信中破绽，先晾着他',check:{attr:'wuxing',lv:2},eff:{suspicion:-6,_t:'信里几处措辞露了底，原来他是严崇派来试探的。你没有上钩。'}},
  {label:'贸然回信结交',eff:{suspicion:8,_t:'信送出去了。没过多久，严崇手里就多了一封你的亲笔信。'}}]},

{id:'gov_021',cat:'治理',title:'檄文',w:10,cond:{rankMin:7,rankMax:9},
 text:'幕僚们为一篇告天下书争了一整夜：是直斥严崇乱政，还是措辞留有余地。',
 opts:[
  {label:'直斥严崇乱政',check:{attr:'wencai',lv:3},eff:{wengong:45,minxin:5,_t:'文章传遍各州，茶楼里有人当众诵读。'}},
  {label:'仓促成文',eff:{suspicion:8,minxin:-3,_t:'文辞失当，被人抓住「影射君上」四个字大做文章。'}}]},

{id:'gov_022',cat:'治理',title:'自开恩科',w:10,cond:{rankMin:7,rankMax:10},
 text:'各地读书人投奔而来，王府却没有名目安置。有人提议，自开一科取士。',
 opts:[
  {label:'广开恩科，不问出身',check:{attr:'meili',lv:2},cost:{silver:150},eff:{wengong:70,_t:'考场里坐满了人，天下寒士都知道朔州肯用人。'}},
  {label:'暂不开科',eff:{minxin:-3,wengong:-10,_t:'读书人等不到出路，有一半又走了。'}}]},

{id:'gov_023',cat:'治理',title:'新附之城',w:10,cond:{rankMin:8,rankMax:10},
 text:'邻近的一座州城开门归附。城里的旧官跪在道旁，等着殿下发落。',
 opts:[
  {label:'旧官一律留用，照发俸禄',check:{attr:'meili',lv:1},cost:{silver:100},eff:{minxin:10,_t:'城里市面照常，像什么都没发生过。'}},
  {label:'纵兵入城接管',eff:{minxin:-5,xinmo:3,_t:'兵丁进城后抢了几家铺子，街坊们看王府的眼神变了。'}}]},

{id:'gov_024',cat:'治理',title:'府库告急',w:10,cond:{rankMin:8,rankMax:10},
 text:'账房说，照眼下的开销，府库撑不过这个冬天。',
 opts:[
  {label:'亲赴晋地，当面向晋商借银',check:{attr:'gengu',lv:2},eff:{silver:300,_t:'你骑马往返二十天，银子到了，条款也谈得不吃亏。'}},
  {label:'裁减王府用度，从后宅起',eff:{harmony:-6,xinmo:2,_t:'账面上省了一点，后宅里却有人摔了茶盏。'}}]},

{id:'gov_025',cat:'治理',title:'万民书',w:10,once:1,cond:{rankMin:8,rankMax:10},
 text:'城里的百姓凑钱请人写了一卷万民书，上面按满了红手印，求殿下「为天下做主」。',
 opts:[
  {label:'收进府库，暂不示人',check:{attr:'xinji',lv:2},eff:{minxin:5,_t:'百姓说殿下记着他们。'}},
  {label:'当众焚毁，以示无意',eff:{minxin:-5,xinmo:3,_t:'火光里，有个老汉哭出了声。'}}]},

{id:'gov_026',cat:'治理',title:'老臣出山',w:10,cond:{rankMin:7,rankMax:9},
 text:'先帝朝的老尚书致仕后隐居在朔州城南。他门生故吏遍布六部。',
 opts:[
  {label:'亲往城南，在门外候了一夜',check:{attr:'gengu',lv:1},cost:{silver:150},eff:{wengong:60,_t:'老尚书开门见你一身霜，第二天便带着两车书来了。'}},
  {label:'派个属官去请',eff:{wengong:-10,xinmo:3,_t:'老尚书说自己是先帝的臣，不事二主，连门都没开。'}}]},

{id:'gov_027',cat:'治理',title:'粮价飞涨',w:10,cond:{rankMin:7,rankMax:9},
 text:'兵荒马乱，粮商囤积居奇，一斗米的价钱翻了五倍。',
 opts:[
  {label:'看穿粮商囤货的底细，逼其限价',check:{attr:'wuxing',lv:2},eff:{industry:10,_t:'你算准他们的存粮撑不过开春。粮商们签了约，王府许他们日后专营官粮。'}},
  {label:'斩一个囤粮大户示众',eff:{xinmo:6,minxin:-2,_t:'第二天，各家粮铺都开了门，可人人都说王府杀人立威。'}}]},

{id:'gov_028',cat:'治理',title:'修律',w:10,cond:{rankMin:9,rankMax:10},
 text:'新朝将立，刑部旧人请示：律令是重修，还是沿用大胤旧律。',
 opts:[
  {label:'沿用旧律，只删严党所增',check:{attr:'xinji',lv:1},eff:{wengong:25,_t:'省事，又拔掉了严党留下的钉子。'}},
  {label:'照搬旧律，原样颁行',eff:{minxin:-4,xinmo:2,_t:'百姓说换汤不换药。'}}]},

// ===== 链式后续 =====
{id:'gov_c01',cat:'chain',title:'县令的靠山',
 text:'复审时查明，县令草草结案，是因为豪强每年给他送银子。这豪强的女婿在监军府当差。',
 opts:[
  {label:'顶住监军府的压力，一并查办',check:{attr:'gengu',lv:3},eff:{wengong:35,_t:'县令革职，豪强罚没半数田产。监军府那边没了声音。'}},
  {label:'不了了之',eff:{xinmo:3,minxin:-3,_t:'案子搁下了，豪强照旧横行乡里。'}}]},

{id:'gov_c02',cat:'chain',title:'书院开讲',
 text:'书院开讲那天来了三百多个士子，有几个是从平阳王的封地赶来的。沈先生请你上台讲几句。',
 opts:[
  {label:'登台讲学',check:{attr:'wencai',lv:2},eff:{wengong:30,_t:'你讲了治水与吏治，台下有人连夜抄录。'}},
  {label:'上台随口说几句',eff:{suspicion:5,_t:'你多说了两句时政，被人记了下来。'}}]},

{id:'gov_c03',cat:'chain',title:'马市开张',
 text:'互市开张，狄人马商赶来三百匹好马，开价不低。',
 opts:[
  {label:'买马充实私兵',check:{attr:'wulue',lv:1},eff:{train:12,_t:'骑兵营第一次有了整齐的马匹。'}},
  {label:'任由马商自行买卖',eff:{suspicion:5,silver:-50,_t:'马匹流到了关内，有人说朔州在贩卖军马，王府却一文税也没收着。'}}]},

// ===== 大事件 =====
{id:'gov_m01',cat:'治理',major:1,title:'桑干河决',w:6,once:1,cond:{rankMin:2,rankMax:5,months:[6,7,8]},
 intro:'入夏以来暴雨不停，桑干河水一夜涨了三尺。下游七个村子挨着河堤，河工说堤撑不过这个月。',
 steps:[
  {text:'河堤已经开始渗水，雨还在下。',opts:[
   {label:'调私兵上堤加固',check:{attr:'wulue',lv:1},eff:{minxin:6,_t:'堤保住了，兵士们轮班守了三天三夜。'}},
   {label:'等雨停再说',eff:{minxin:-5,silver:-100,_t:'堤在半夜塌了一段，两个村子泡在了水里。'}}]},
  {text:'水退了，村里一片泥泞，倒塌的房屋压着粮食。灾民挤在高地上，开始有人发热。',opts:[
   {label:'开仓赈济，亲守粥棚',check:{attr:'gengu',lv:1},cost:{silver:120},eff:{merit:30,_t:'粥棚从河边一直排到城门。'}},
   {label:'让灾民自谋生路',eff:{minxin:-4,xinmo:3,_t:'高地上的病一天天重了，死了不少老人孩子。'}}]},
  {text:'朝廷的赈灾银拨下来了，经手的是监军韩琮。到朔州的数目，比公文上少了四成。',opts:[
   {label:'隐忍不发，记下这笔账',check:{attr:'wuxing',lv:2},eff:{suspicion:-6,_t:'你在账册上画了个圈，什么也没说。'}},
   {label:'当面质问韩琮',eff:{suspicion:8,xinmo:2,_t:'韩琮一推六二五，转头参你「虚报灾情」。'}}]}],
 outro:'秋后，河边的村子重新起了炊烟。'},

{id:'gov_m02',cat:'治理',major:1,title:'流民潮',w:6,once:1,cond:{rankMin:3,rankMax:5,months:[11,12,1,2]},
 intro:'关内大旱，成千上万的流民往北走，朔州是最近一处有粮的地方。监军韩琮传话：流民里混着奸细，城门不得开。',
 steps:[
  {text:'第一批流民到了城下，城外黑压压一片，风里能听见孩子哭。',opts:[
   {label:'开城门放人',check:{attr:'meili',lv:2},eff:{minxin:7,_t:'城门开了，人群一路叩谢着进了城。'}},
   {label:'依监军之令紧闭城门',eff:{minxin:-5,xinmo:4,_t:'城下的哭声一夜没停，天亮时城根下躺着几具冻僵的尸首。'}}]},
  {text:'流民越来越多，粥棚已经不够分。有人提议把青壮编成屯田队，往北开荒。',opts:[
   {label:'挑青壮编入私兵',check:{attr:'wulue',lv:2},eff:{troops:300,_t:'王府的兵营一下子挤满了。'}},
   {label:'照旧施粥，走一步看一步',eff:{silver:-150,minxin:-3,_t:'粥越熬越稀，营地里开始有人抢粮。'}}]},
  {text:'流民里果然混进了几个可疑的人，在营中散布谣言，说王爷要把他们送给狄人换马。',opts:[
   {label:'只身进营，与流民同吃同住',check:{attr:'gengu',lv:2},eff:{minxin:6,_t:'你在营里住了三天，谣言不攻自破。'}},
   {label:'下令封营，不许出入',eff:{minxin:-5,xinmo:3,_t:'封营坐实了谣言，营里人心惶惶。'}}]}],
 outro:'开春以后，流民里有一半留在了朔州。'},

{id:'gov_m03',cat:'治理',major:1,title:'盐政改制',w:6,once:1,cond:{rankMin:4,rankMax:6},
 intro:'朔州的盐由几家官商把持，盐价是关内的两倍。户房递上改制条陈：废除盐引，许民自运自销，王府只收盐税。',
 steps:[
  {text:'条陈还没公布，盐商们就联名求见，抬来一箱厚礼。',opts:[
   {label:'把条陈公之于众，请百姓评议',check:{attr:'wencai',lv:1},eff:{minxin:5,_t:'条陈贴满了城门，盐商们再不好私下来往。'}},
   {label:'收礼，改制缓行',eff:{minxin:-5,xinmo:2,_t:'盐商们满意地走了。改制的消息却已经传开，百姓骂王府收了黑钱。'}}]},
  {text:'盐商们暗中罢市，城里的盐铺一夜之间全关了门，百姓开始抢盐。',opts:[
   {label:'看穿盐商串联的门道，逐个击破',check:{attr:'wuxing',lv:3},eff:{industry:15,_t:'你看出领头的只有三家，其余都是被裹挟的。铺子一家接一家重新开门，盐价降了一半。'}},
   {label:'等盐商自己开门',eff:{minxin:-6,_t:'盐价一天一个样，城里开始有人为一包盐打架。'}}]},
  {text:'朔州盐价降了，邻藩的私盐反倒往这边倒卖。安西王派人来商量，想合伙。',opts:[
   {label:'与安西王合办盐路',check:{attr:'meili',lv:2},eff:{silver:250,_t:'两藩的盐车往来不绝，账目分得清清楚楚。'}},
   {label:'两边都不管',eff:{minxin:-3,silver:-100,_t:'私盐冲垮了盐市，盐税也收不上来。'}}]}],
 outro:'朔州的百姓头一回吃上了便宜盐。'},

{id:'gov_m04',cat:'治理',major:1,title:'州试舞弊案',w:6,once:1,cond:{rankMin:5,rankMax:7},
 intro:'王府主持的州试放榜，头名是严崇的远房侄孙。落榜的士子聚在贡院门口，抬着孔子像哭庙。',
 steps:[
  {text:'士子们要求重考。主考官是你亲手提拔的，跪在殿外喊冤。',opts:[
   {label:'先安抚士子，许诺彻查',check:{attr:'meili',lv:1},cost:{silver:100},eff:{minxin:10,_t:'士子们散了，等着你给说法。'}},
   {label:'维持原榜',eff:{minxin:-5,xinmo:2,_t:'士子们闹了三天，贡院的墙上贴满了揭帖。'}}]},
  {text:'调包的是王府一名书吏，他说有人给了他两百两银子。顺着银子查下去，线头指向监军府。',opts:[
   {label:'拿证据和韩琮做交易',check:{attr:'xinji',lv:3},eff:{silver:300,_t:'韩琮私下赔了一大笔银子，此事再没人提。'}},
   {label:'只办书吏，到此为止',eff:{xinmo:5,minxin:-2,_t:'书吏被斩，真正的主使安然无恙。'}}]},
  {text:'案子了结，榜单怎么办，士子们还在等。',opts:[
   {label:'比对笔迹，找出被调包的士子补录',check:{attr:'wuxing',lv:2},eff:{merit:10,_t:'冤屈的人得了功名，旁人也说不出什么。'}},
   {label:'维持现榜，草草了结',eff:{minxin:-4,wengong:-10,_t:'士子们心灰意冷，有几个当场烧了书。'}}]}],
 outro:'此后朔州的考场，再没人敢递条子。'},

{id:'gov_m05',cat:'治理',major:1,title:'万民请愿',w:6,once:1,cond:{rankMin:8,rankMax:10},
 intro:'三州父老推举了九位耆老，背着一卷万民书走了一个多月来到王府。书上写着：天下苦严党久矣，请殿下入京清君侧。',
 steps:[
  {text:'九位耆老跪在府门外，不肯起身。府外围满了百姓。',opts:[
   {label:'请入偏厅，闭门相谈',check:{attr:'xinji',lv:2},eff:{wengong:40,_t:'谈到深夜，耆老们答应替你联络各州乡绅。'}},
   {label:'闭门不见',eff:{minxin:-6,xinmo:3,_t:'耆老们在门外跪到天黑，百姓骂王府薄情。'}}]},
  {text:'消息传到玉京。新帝下诏申饬，命你交出带头的耆老。',opts:[
   {label:'抗旨不交',check:{attr:'wulue',lv:3},eff:{merit:15,_t:'传旨的太监空手回了京，朝廷一时也不敢动兵。'}},
   {label:'交出带头的耆老',eff:{minxin:-6,xinmo:5,_t:'囚车出城那天，满街的人都别过了脸。'}}]},
  {text:'各州百姓纷纷效仿，万民书一卷接一卷送来，有的写在布上，有的按满了手印。',opts:[
   {label:'刊印万民书，传檄天下',check:{attr:'wencai',lv:3},cost:{silver:250},eff:{wengong:120,_t:'刻版连夜赶工，书页飞向四方。'}},
   {label:'束之高阁',eff:{minxin:-4,xinmo:2,_t:'万民书堆满了库房，各州百姓渐渐冷了心。'}}]},
  {text:'严崇派人散布消息，说万民书是王府伪造的，还抓了几个按过手印的百姓。',opts:[
   {label:'发兵救人',check:{attr:'wulue',lv:3},eff:{wugong:45,minxin:5,_t:'人救回来了，押解的官兵一触即溃。'}},
   {label:'发文辟谣，按兵不动',eff:{minxin:-5,xinmo:3,_t:'文书没人信，被抓的百姓也没能回来。'}}]}],
 outro:'从这以后，「民心所向」四个字，不再只是一句客套话。'}
];
