export const APPOINTMENT_URL = 'https://master.d29yyigp5o4a8q.amplifyapp.com/EntryPage'
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/profile.php?id=61564963711521'
export const INSTAGRAM_URL = 'https://www.instagram.com/lee_jhow'

export const clinicLocations = [
  {
    id: 'hansheng',
    name: '菡生婦幼診所',
    address: '新北市板橋區中山路一段104號',
    phone: '(02) 2951-8999',
    phoneHref: 'tel:+886229518999',
    transit: '捷運府中站 3 號出口、板橋站（板南線 1 號出口或環狀線 4 號出口）步行約 10–15 分鐘；搭高鐵或火車可由板橋車站南三門步行前往。',
    parking: '台灣聯通停車場（府中場）位於同棟大樓地下室，非診所自行營運。周邊另有民權立體停車場、新板特區各場可選擇。',
    mapQuery: '菡生婦幼診所 新北市板橋區中山路一段104號',
  },
  {
    id: 'youyou',
    name: '宥宥婦幼診所',
    address: '新北市蘆洲區長榮路58號（兒童成長發育專科在二樓）',
    phone: '(02) 8283-9090',
    phoneHref: 'tel:+886282839090',
    transit: '捷運蘆洲線三民高中站步行約 5–8 分鐘；亦可搭乘橘 16、橘 17、橘 18 等公車，於長榮中原路口或長榮光明路口下車。',
    parking: '大樓附設停車場，車位有限，建議提早到達。若遇滿場，可使用周邊路邊停車格或其他附近停車場。',
    mapQuery: '宥宥婦幼診所 新北市蘆洲區長榮路58號',
  },
]

export const directoryItems = [
  { id: 'about', label: '關於我', path: '/about' },
  { id: 'cases', label: '真實案例', path: '/cases' },
  { id: 'bone-age', label: '骨齡檢測', path: '/bone-age' },
  { id: 'short-stature', label: '身材矮小或落後', path: '/short-stature' },
  { id: 'puberty', label: '性早熟與青春期', path: '/puberty' },
  { id: 'gh', label: '生長激素治療', path: '/gh' },
  { id: 'gnrh', label: '抑制青春期治療', path: '/gnrh' },
  { id: 'nutrition', label: '兒童營養與其他', path: '/nutrition' },
]

export const secondLevel = {
  cases: [
    { id: 'precocious', label: '性早熟', path: '/cases/precocious' },
    { id: 'rapid', label: '青春期進展快', path: '/cases/rapid' },
    { id: 'sga', label: '出生體重過輕', path: '/cases/sga' },
    { id: 'iss', label: '特發性矮小', path: '/cases/iss' },
  ],
  'bone-age': [
    { id: 'meaning', label: '骨齡評估的意義', path: '/bone-age/meaning' },
    { id: 'machine', label: '診所骨齡機介紹', path: '/bone-age/machine' },
  ],
  'short-stature': [
    { id: 'overview', label: '身材矮小或落後', path: '/short-stature/overview' },
    { id: 'sga', label: '出生體重過輕併矮小', path: '/short-stature/sga' },
  ],
  puberty: [
    { id: 'precocious', label: '性早熟', path: '/puberty/precocious' },
    { id: 'rapid', label: '青春期進展過快', path: '/puberty/rapid' },
    { id: 'gender', label: '青少年性別不安', path: '/puberty/gender' },
    { id: 'delayed', label: '青春期過晚', path: '/puberty/delayed' },
  ],
  nutrition: [
    { id: 'diet', label: '兒童營養', path: '/nutrition/diet' },
    { id: 'myths', label: '兒童長高迷思', path: '/nutrition/myths' },
  ],
}

export const caseMenu = [
  { id: 'precocious', label: '性早熟', path: '/cases/precocious' },
  { id: 'rapid', label: '青春期較早', path: '/cases/rapid' },
  { id: 'iss', label: '特發性矮小', path: '/cases/iss' },
  { id: 'sga', label: '出生體重過輕併矮小', path: '/cases/sga' },
]

export const articleMenu = [
  { id: 'latest', label: '最新文章', path: '/articles/latest' },
  { id: 'bone-age', label: '骨齡檢測與評估', path: '/articles/bone-age' },
  { id: 'short-stature', label: '身材矮小與身高落後', path: '/articles/short-stature' },
  { id: 'puberty', label: '性早熟與青春期', path: '/articles/puberty' },
  { id: 'sga', label: '出生體重過輕 (SGA)', path: '/articles/sga' },
  { id: 'gh', label: '生長激素治療', path: '/articles/gh' },
  { id: 'gnrh', label: '青春期抑制針治療', path: '/articles/gnrh' },
  { id: 'nutrition', label: '兒童營養與長高迷思', path: '/articles/nutrition' },
  { id: 'gender', label: '青少年跨性別議題', path: '/articles/gender' },
]

export const aboutStory = [
  {
    lines: [
      '在行醫的過程中，我始終相信最重要的價值是：',
      '基於「**醫學實證和臨床經驗**」，給予「**真誠且理解人心的照護**」',
    ],
  },
  {
    lines: [
      '因為我深知，父母對孩子身高和發育的焦慮，不只是外表的問題，',
      '這件事還牽動著孩子與父母的自信和生活品質。',
      '許多不安，源自於同儕比較的壓力與醫學資訊的落差。',
      '我傾聽每位家長的聲音，以專業釐清迷思、化解不必要的擔憂。',
    ],
  },
  {
    lines: [
      '同時，要發揮孩子最大的成長潛力，絕不能仰賴憑空臆測或人云亦云的療法，',
      '而是需要**醫學實證與豐富的臨床經驗**作為基石。',
    ],
  },
  {
    lines: [
      '**兒童成長議題是一道寬廣的光譜——**',
      '從需要及早揪出的內分泌疾病、游移在邊界的亞疾病/亞健康狀態，',
      '到好還想更好、追求更理想身高的個體化需求。',
      '這需要深厚的底蘊，才能提供全光譜的照護。',
    ],
  },
  {
    lines: [
      '歷經台大兒科、台大兒童內分泌科的完整訓練，',
      '我取得了**兒科專科、兒科內分泌次專科、**',
      '**兒科青少年次專科、台灣糖尿病與內分泌學會次專科的四個專科執照**。',
    ],
  },
  {
    lines: [
      '結合醫學中心多年主治醫師的臨床淬鍊，',
      '融入多年第一線兒童成長發育的自費治療經驗，',
      '在這個寬廣的光譜內，無論是敏銳診斷潛在疾病、',
      '客觀評估各類自費藥物和輔助方案，',
      '我都堅持**精準診斷、充分告知**，在安全與效益之間取得最佳平衡。',
    ],
  },
  {
    lines: [
      '如浩醫師將持續以個人化照護陪伴每個家庭，',
      '關注每位孩子的獨特狀況，從成長發育、一般兒科醫學、',
      '甚至到青春期的各種困擾。',
      '最重要的是，緩解父母的焦慮，',
      '以一顆真誠的心陪伴孩子，讓孩子自信且健康地茁壯長大。',
    ],
  },
]

export const aboutOrigin = {
  title: '網站緣起',
  lead: '關於這裡：陪伴孩子成長的專屬空間',
  blocks: [
    {
      text: '每一次在門診，看著家長們為了孩子的成長發育焦急詢問，我總希望能為大家多做些什麼。',
    },
    {
      text: '過去，我在社群平台上分享了許多專業文章，但龐雜的資訊往往隨著時間被淹沒，難以有系統地分類與檢索。因此，我決定打造這個網站，為大家提供一個清晰的知識平台。**必須強調的是，這個網站並不能取代看診，因為再豐富的內容，也無法取代身體檢查、骨齡、家族史與過去生長曲線這些寶貴的臨床評估。**這裡就像是一座小而美的圖書館，我希望能在這個網站呈現我的專業、真誠與美感。',
    },
    {
      text: '有了這個空間，您可以在帶孩子就診前，先對相關觀念有初步的理解，讓看診過程更安心順利；若是門診中礙於時間，有來不及詳細吸收的細節，您也能隨時回到這裡，依照文章分類，慢慢地將疑惑釐清。',
    },
    {
      text: '兒童的成長發育，其實是一個相當廣泛且細緻的領域。有時候，「長不高」、「長太快」的表象下可能暗藏著需要及早介入的醫療狀況；而各種治療手段與療程，更需要建立在深厚的學理基礎與豐富的臨床經驗之上。在這個網站裡，我希望能完整展現身為兒童內分泌次專科醫師的價值。除了嚴謹的衛教知識，在自費的領域，我也會分享實際的治療案例，讓治療不再是「憑空臆測」，而是帶您深入了解醫師如何透過專業評估與精準治療，來幫助孩子的身高。',
    },
    { divider: true },
    {
      text: '無論您是為了孩子成長而來尋找解答的家長，或是希望與我進行商業合作、專業邀約的夥伴，都期待您能在這裡找到需要的方向與契機。',
    },
    {
      text: '歡迎您慢慢探索，讓我們一起為孩子的未來努力。',
    },
  ],
}

export const aboutProfile = {
  name: '李如浩醫師',
  english: 'JU-HAO LEE, MD',
  current: [
    '菡生婦幼診所兒童成長發育專科 主治醫師',
    '宥宥婦幼診所兒童成長發育專科 主治醫師',
  ],
  education: [
    '輔大醫學系書卷獎畢業',
    '台大醫院不分科住院醫師',
    '台大兒童醫院小兒科住院醫師',
    '台大兒童醫院小兒科總醫師',
    '台大兒童醫院兒童內分泌科研修醫師',
    '台大醫學院臨床醫學研究所碩士',
    '台大醫學院臨床醫學研究所博士候選人',
    '亞東醫院小兒遺傳內分泌科主治醫師',
  ],
  licenses: [
    '兒科專科醫師（兒專醫字第4801號）',
    { text: '民國109年兒科內分泌學次專科筆試滿分榜首', highlight: true },
    '兒科內分泌學次專科醫師（臺兒內專醫字第099號）',
    '中華民國內分泌暨新陳代謝專科醫師（中內糖專醫字第814號）',
    '兒科青少年醫學次專科醫師（第560號）',
  ],
  teaching: [
    '默克藥廠研討會講師',
    '益普生藥廠研討會講師',
  ],
}

export const specialties = [
  {
    id: 'height',
    title: '兒童身高評估與治療',
    detail: '身材矮小、低於遺傳身高、身高期待落差、出生體重過輕矮小',
    path: '/short-stature',
  },
  {
    id: 'puberty-eval',
    title: '青春期評估與治療',
    detail: '性早熟、青春期較早、青春期發育遲緩',
    path: '/puberty',
  },
  {
    id: 'bone',
    title: '骨齡評估與判讀',
    detail: '骨齡過快或過慢的評估和解讀、以骨齡推估預測之成年身高',
    path: '/bone-age',
  },
  {
    id: 'gender',
    title: '青少年性別不安',
    detail: '跨性別青少年之青春期阻斷療法／無成人跨性別醫療',
    path: '/puberty/gender',
  },
  {
    id: 'weight',
    title: '兒童體重問題',
    detail: '體重過輕、過重與肥胖',
    path: '/nutrition',
  },
  {
    id: 'endocrine',
    title: '兒童內分泌諮詢',
    detail: '糖尿病、甲狀腺等疾病之評估與轉介／無常規用藥',
    path: '/about',
  },
  {
    id: 'gene',
    title: '基因檢測結果判讀',
    detail: '他院基因檢測結果之解讀：包括染色體、全外顯子基因檢測等',
    path: '/about',
  },
]

export const sectionMeta = {
  cases: {
    title: '真實案例分享',
    intro: '以門診常見情境說明評估思路。個別案例將陸續整理刊出；若孩子有相關狀況，仍建議透過門診做個人化評估。',
  },
  'cases/precocious': {
    title: '真實案例：性早熟',
    intro: '性早熟需同時看臨床表徵、生長曲線與必要時的骨齡與抽血，不能單憑「長得快」或「骨齡快」下診斷。',
  },
  'cases/rapid': {
    title: '真實案例：青春期進展快／青春期較早',
    intro: '青春期開始後若進展過快，可能壓縮剩餘生長空間。評估重點是發育速度、骨齡進展與預測身高。',
  },
  'cases/sga': {
    title: '真實案例：出生體重過輕',
    intro: '小於妊娠週數（SGA）的孩子，部分在幼兒期未能追趕生長，成年身高可能受到影響，需長期追蹤。',
  },
  'cases/iss': {
    title: '真實案例：特發性矮小',
    intro: '特發性矮小是指排除特定疾病後仍明顯矮小的狀態。是否治療，需對焦家族遺傳、預測身高與家庭期待。',
  },
  'bone-age': {
    title: '骨齡檢測',
    intro: '骨齡反映體內成熟度，是輔助工具，不能單獨診斷矮小或性早熟。重點是找出家長真正擔心的核心問題。',
  },
  'bone-age/meaning': {
    title: '骨齡評估的意義',
    intro: '骨齡快不等於性早熟，骨齡慢也不等於一定會長很高。判讀必須結合理學檢查與生長曲線。',
    image: '/topics/bone-age-hand.png',
  },
  'bone-age/machine': {
    title: '診所骨齡機介紹',
    intro: '診所提供骨齡檢查，方便在門診當下完成評估，並由兒童內分泌專科醫師判讀。',
  },
  'short-stature': {
    title: '身材矮小或落後',
    intro: '矮小要看身高百分位與生長速率；落後可能來自營養、慢性疾病、內分泌問題或青春期時序。',
  },
  'short-stature/overview': {
    title: '身材矮小或落後',
    intro: '從生長曲線、遺傳身高到預測身高，先釐清「現在矮不矮」與「以後可能多高」，再討論要不要治療。',
  },
  'short-stature/sga': {
    title: '出生體重過輕併矮小',
    intro: 'SGA 孩子若兩歲後仍明顯矮小，是兒童內分泌門診需要特別關注的族群，部分符合生長激素治療條件。',
  },
  puberty: {
    title: '性早熟與青春期',
    intro: '青春期太早、進展太快、太晚，或性別不安，評估方式與治療目標各不相同，需要專科個別化討論。',
  },
  'puberty/precocious': {
    title: '性早熟',
    intro: '性早熟的定義是年紀太小進入青春期，而且一定會有身體變化。骨齡快本身並不是性早熟。',
  },
  'puberty/rapid': {
    title: '青春期進展過快',
    intro: '即使不是性早熟，青春期進展過快仍可能影響最終身高。是否用藥要看「用幾年骨齡，換到多少身高」。',
  },
  'puberty/gender': {
    title: '青少年性別不安',
    intro: '提供跨性別青少年之青春期阻斷療法評估與討論。本門診不提供成人跨性別醫療。',
  },
  'puberty/delayed': {
    title: '青春期過晚',
    intro: '青春期明顯晚於同儕時，需區分體質性延遲與需要檢查的內分泌或慢性問題。相關衛教將陸續補充。',
  },
  gh: {
    title: '生長激素治療',
    intro: '生長激素有明確適應症與劑量考量，效果因人而異。是否使用、劑量、停藥時機都需要專科追蹤。',
  },
  gnrh: {
    title: '抑制青春期治療',
    intro: '青春期抑制針的目標不是「骨齡變慢」本身，而是在安全前提下爭取更理想的成年身高，並充分告知效益與限制。',
  },
  nutrition: {
    title: '兒童營養與其他',
    intro: '營養、睡眠與生活型態是成長的基礎；許多「長高秘方」缺少實證，需要一一釐清。',
  },
  'nutrition/diet': {
    title: '兒童營養',
    intro: '碳水化合物、乳製品、維生素 D 等常見問題，用研究與臨床經驗回答，而不是網路傳言。',
  },
  'nutrition/myths': {
    title: '兒童長高迷思',
    intro: '精胺酸、Clonidine、補品與各種偏方，門診最常被問到的迷思整理於此。',
  },
}

export const casePages = {
  precocious: { relatedArticleCats: ['puberty', 'bone-age'] },
  rapid: { relatedArticleCats: ['puberty', 'gnrh'] },
  sga: { relatedArticleCats: ['sga'] },
  iss: { relatedArticleCats: ['short-stature', 'gh'] },
}

function para(text) {
  return text.trim()
}

export const articles = [
  {
    id: 'bone-find-the-real-problem',
    title: '找到骨齡背後的問題',
    excerpt: '許多家長來看診的主訴是「想要照骨齡」。骨齡只是輔助工具，重點是醫師要找出真正擔心的核心問題。',
    facebookUrl: 'https://www.facebook.com/share/p/1beLWaPTCs/',
    dirs: ['bone-age'],
    subs: ['meaning'],
    articleCats: ['bone-age'],
    content: [
      para('近期滿多家長來看診的主訴是「想要照骨齡」。'),
      para('理論上，如果使用健保資源，檢查是用健保點數去支付的，就要有相對應的適應症。所以，如果小朋友沒有什麼問題、沒有疾病或嚴重的狀況，去大醫院使用健保資源照骨齡，事實上是違反了公平正義原則。'),
      para('但是，對於我們自費的診所來說，今天不管基於任何理由，照骨齡這個服務我們都可以幫忙。'),
      para('不過，比起盲目跟風照骨齡，重要的是醫師更需要敏銳找出「家長真正擔心的核心問題」。'),
      para('骨齡只是單純反映體內的成熟度。骨齡不能診斷矮小，骨齡也不能診斷性早熟，骨齡也不能單用來診斷疾病。'),
      para('矮小是要看身高和百分位；性早熟是要看臨床表徵和理學檢查；疾病要分析生長曲線和各種蛛絲馬跡。'),
      para('舉例來說，A 小朋友身高一直沿著 50 百分位，但生日在 8 月。家長覺得跟同屆比起來身高有點矮，想來照骨齡看看。這樣的孩子其實很多人骨齡都正常，而且骨齡僅僅是反應成熟度，不能回答家長的擔憂。我和家長說明：八月出生的孩子對比其他同屆孩子相對年幼，和同年齡相比的話，生長曲線其實完全落在平均值。家長就能放下心中的不安。A 小朋友的重點在於生長曲線。'),
      para('B 小朋友身高一直都高，同時也一直有體重暴增的問題。家長希望照骨齡看有沒有早熟，結果骨齡快了三年。理學檢查發現睪丸大小都在青春期前，骨齡快的原因不在於性早熟，而在於肥胖問題。要解決這個問題，不是打青春期抑制針，是要控制體重和調整生活型態。B 小朋友的重點在於理學檢查。'),
      para('C 小朋友家長認為沒什麼問題，只是小朋友身高一直都高，想來照骨齡看看，結果發現骨齡超前，而且理學檢查顯示胸部發育已經很明顯，實際上根本是性早熟的問題。回溯生長曲線發現，早在過去身高便提前加速，屬於快速進展型性早熟，因而建議施打青春期抑制針。C 小朋友的重點在理學檢查＋骨齡＋生長曲線。'),
      para('D 小朋友身高一直都矮小，家長一開始不以為意，主訴也是來照骨齡。檢視生長曲線才發現，近一年長高不到四公分，身高最近跌破 3 百分位，學校也沒發通知單。這時候比起骨齡，更重要的是抽血，去排除內分泌的疾病。D 小朋友的重點在生長曲線＋抽血。'),
      para('以上四個例子就是要強調：分析這些個案，重點都是綜合評估。單照骨齡，其實沒有辦法解決這四位孩子的問題。'),
      para('我服務的門診，目標是直接點出核心，把疾病排除，並且對焦孩童和家長對身高的期待，來討論有什麼方式（不論是藥物或非藥物）達成最終身高的期待。最重要的是，讓家長放心、安心。'),
      para('許多家長都有誤會，以為照骨齡就能找到問題。其實骨齡只是一項輔助工具，不是照了就能得到核心問題的答案。重點是需要專業醫師的敏銳度，才能找到問題真正的核心。'),
    ],
  },
  {
    id: 'bone-age-not-precocious',
    title: '骨齡快不等於性早熟',
    excerpt: '骨齡快，就一定要打針嗎？門診常遇到這個迷思。骨齡快不等於性早熟，更不代表抑制針對長高一定有幫助。',
    facebookUrl: 'https://www.facebook.com/share/p/1DZ46eKKR2/',
    dirs: ['bone-age'],
    subs: ['meaning'],
    articleCats: ['bone-age', 'puberty'],
    content: [
      para('骨齡快，就一定要打針嗎？門診常遇到各種迷思。今天想跟各位家長聊聊「骨齡快」這件事。'),
      para('首先要釐清一個觀念：骨齡快不等於性早熟，更不代表打抑制針對長高一定有幫助。這觀念不僅家長會搞混，有時連非專業的醫師，也容易把兩者混為一談。'),
      para('什麼才是「性早熟」？照骨齡雖然很重要，但請大家注意：不是快兩年就是性早熟。性早熟的定義是「年紀太小進入青春期」，而且 100% 會有身體變化。例如：女生長出乳腺組織（雌激素）；男生陰莖延長（雄性素）、睪丸變大（腦垂體激素）。'),
      para('如果完全沒身體變化，單純只是骨齡快，那根本不是性早熟。對詞彙精準度的掌握，不只是我的職業病，更是為了能「對症下藥」。'),
      para('臨床上常看到骨齡快兩年，但完全沒青春期訊號。例如有些體重過重的男孩，下體其實還沒發育。這類個案，有些經過提醒與調整生活，什麼藥物都不用；幾年過去，骨齡增加的速度就會減緩，效果甚至不輸青春期的人打抑制針，因為我們找到了「骨齡快的源頭」。'),
      para('即便進入青春期、骨齡快了一兩年，有的我建議進入療程，有的我會選擇追蹤。這取決於醫師的經驗和知識：「是用幾年骨齡，換到多少身高？」'),
      para('例如實際年齡 12 歲、骨齡 13 歲半的青春期男生。有些類似的個案追蹤 1 年，骨齡也只增加 1 年，這年身高衝刺了 12 公分＝骨齡大 1 歲，長了 12 公分。有的打了抑制針，治療了 3 年，骨齡只增加 1 年；骨齡雖然變慢了，但 1 年卻只長了 3 公分＝骨齡大 1 歲，長了 9 公分。如果是上面的狀況，打針真的有比較好嗎？'),
      para('當然，有些情況不能等。來就診的時候太晚，骨齡已經非常大了，甚至預測身高不理想的孩子，有的我會建議生長激素合併治療。'),
      para('關於藥物，從是否使用、劑量與劑型、藥物搭配與停藥時機、生活型態的配合，每一環都影響最終效果，也就是孩子的「成年身高」。雖然每個人體質不同，效果不能一概而論，但醫師的工作是抽絲剝繭。我們一起盡人事，最大化孩子的成人身高。'),
      para('如果你也擔心孩子的骨齡，建議找專業兒童內分泌科醫師進行全面評估。'),
    ],
  },
  {
    id: 'how-long-can-boys-grow',
    title: '男生可以長到幾歲？',
    excerpt: '很多家長常問：小朋友可以長到幾歲？答案必須回到骨齡、青春期階段，而不是只看實際年齡。',
    facebookUrl: 'https://www.facebook.com/share/p/1PMo2LjeUk/',
    dirs: ['bone-age'],
    subs: ['meaning'],
    articleCats: ['bone-age'],
  },
  {
    id: 'what-is-bone-age',
    title: '骨齡是什麼？為什麼要照骨齡？',
    excerpt: '說明骨齡的意義、什麼時候需要檢查，以及它在成長評估裡扮演的角色。',
    facebookUrl: 'https://www.facebook.com/share/p/1DTyT6hC91/',
    dirs: ['bone-age'],
    subs: ['meaning'],
    articleCats: ['bone-age'],
  },
  {
    id: 'hidden-disease-case',
    title: '從骨齡與生長評估發現潛藏疾病',
    excerpt: '分享一個診斷出潛藏疾病的案例：骨齡與生長資料有時能幫我們及早發現問題。',
    facebookUrl: 'https://www.facebook.com/share/p/1DPddNzc73/',
    dirs: ['bone-age'],
    subs: ['meaning'],
    articleCats: ['bone-age'],
  },
  {
    id: 'clinic-bone-age-machine',
    title: '診所骨齡檢查：當下評估、專科判讀',
    excerpt: '常常有家長來就診是希望幫小朋友照骨齡。孩子成長的評估，骨齡只是其中一環。',
    facebookUrl: 'https://www.facebook.com/share/p/1ERrPKfGSC/',
    dirs: ['bone-age'],
    subs: ['machine'],
    articleCats: ['bone-age'],
  },
  {
    id: 'gh-effectiveness',
    title: '生長激素的療效？',
    excerpt: '這幾個月很多家長向我諮詢生長激素。療效不能一句話概括，要看適應症、劑量與追蹤。',
    facebookUrl: 'https://www.facebook.com/share/p/1EdYwBSdCd/',
    dirs: ['short-stature', 'gh'],
    subs: ['overview'],
    articleCats: ['short-stature', 'gh'],
  },
  {
    id: 'resistance-training',
    title: '小朋友做阻力訓練，會不會影響長高？',
    excerpt: '曾經有爸媽問：小朋友做阻力訓練（像低強度重訓）會不會不好？成長中的孩子該如何看待運動強度。',
    facebookUrl: 'https://www.facebook.com/share/p/1JRCknchKf/',
    dirs: ['short-stature'],
    subs: ['overview'],
    articleCats: ['short-stature', 'nutrition'],
  },
  {
    id: 'growth-chart',
    title: '為什麼初診一定要看生長曲線',
    excerpt: '看過診所門診的家長應該都知道：每個初診我都會打開電腦，把生長曲線攤開來看。',
    facebookUrl: 'https://www.facebook.com/share/p/1Q555hpAup/',
    dirs: ['short-stature'],
    subs: ['overview'],
    articleCats: ['short-stature'],
  },
  {
    id: 'summer-clinic-height',
    title: '暑假看診：身高、遺傳身高與預測身高',
    excerpt: '暑假不少孩子來看診。遺傳身高是參考，預測身高則要結合骨齡與目前發育狀況。',
    facebookUrl: 'https://www.facebook.com/share/p/1JoR55E7xF/',
    dirs: ['short-stature'],
    subs: ['overview'],
    articleCats: ['short-stature'],
  },
  {
    id: 'predict-adult-height',
    title: '照完骨齡，可以告訴我以後會長到多高嗎？',
    excerpt: '其實是可以預測的。但預測身高是機率與區間，不是保證，也會隨追蹤而更新。',
    facebookUrl: 'https://www.facebook.com/share/p/1BqbDZBtHe/',
    dirs: ['short-stature', 'bone-age'],
    subs: ['overview', 'meaning'],
    articleCats: ['short-stature', 'bone-age'],
  },
  {
    id: 'sga-birth-weight',
    title: '看身高，我一定會問出生週數與體重',
    excerpt: '成為兒童內分泌科醫師以來，所有看身高問題的孩子，我都會問出生的週數、體重。這是 SGA 評估的起點。',
    facebookUrl: 'https://www.facebook.com/share/p/1Eydp94iuB/',
    dirs: ['short-stature'],
    subs: ['sga'],
    articleCats: ['sga'],
  },
  {
    id: 'sga-series-2',
    title: 'SGA 系列第二彈',
    excerpt: '小於妊娠週數（SGA）系列文章第二彈，接續說明這個族群在成長門診裡為什麼特別重要。',
    facebookUrl: 'https://www.facebook.com/share/p/1dFWWhJZ7H/',
    dirs: ['short-stature'],
    subs: ['sga'],
    articleCats: ['sga'],
  },
  {
    id: 'sga-series-3',
    title: 'SGA 系列第三彈：可能會有的問題',
    excerpt: '今天來聊聊 SGA 孩子可能會有的健康與生長議題，以及為什麼需要定期追蹤。',
    facebookUrl: 'https://www.facebook.com/share/p/1Eb9EtLzhC/',
    dirs: ['short-stature'],
    subs: ['sga'],
    articleCats: ['sga'],
  },
  {
    id: 'sga-series-4',
    title: 'SGA 系列第四彈：什麼是小於妊娠週數？',
    excerpt: '回到定義：什麼是小於妊娠週數？以及這個診斷之後，家長最需要掌握的追蹤重點。',
    facebookUrl: 'https://www.facebook.com/share/p/1DACeuTQvC/',
    dirs: ['short-stature'],
    subs: ['sga'],
    articleCats: ['sga'],
  },
  {
    id: 'sga-review',
    title: 'SGA 衛教回顧：門診裡再次被問到的問題',
    excerpt: '去年寫過 SGA 一連串衛教文。最近門診又遇到許多相關提問，再把重點整理一次。',
    facebookUrl: 'https://www.facebook.com/share/p/18yqPKi5kq/',
    dirs: ['short-stature'],
    subs: ['sga'],
    articleCats: ['sga'],
  },
  {
    id: 'puberty-growth-slowdown',
    title: '青春期長高變慢時，該注意什麼',
    excerpt: '暑假不少家長覺得孩子最近長高變慢。如果發生在青春期特定階段，意義可能和想像中不同。',
    facebookUrl: 'https://www.facebook.com/share/p/1FTwmS7iL1/',
    dirs: ['puberty'],
    subs: ['rapid', 'precocious'],
    articleCats: ['puberty'],
  },
  {
    id: 'adolescent-gender-dysphoria',
    title: '青少年性別不安／青少年跨性別',
    excerpt: '浩浩醫師今天要來談青少年性別不安。本門診提供青春期阻斷療法之評估，不提供成人跨性別醫療。',
    facebookUrl: 'https://www.facebook.com/share/p/1Hy4JvBEqZ/',
    dirs: ['puberty'],
    subs: ['gender'],
    articleCats: ['gender', 'puberty'],
  },
  {
    id: 'gh-plus-gnrh',
    title: '生長激素與青春期抑制針合併治療',
    excerpt: '什麼時候會考慮生長激素與抑制針一起用？合併治療不是預設答案，要看骨齡、預測身高與剩餘生長空間。',
    facebookUrl: 'https://www.facebook.com/share/p/1CmjKb8qAd/',
    dirs: ['gh', 'gnrh'],
    subs: [],
    articleCats: ['gh', 'gnrh'],
  },
  {
    id: 'gh-dose-effect',
    title: '生長激素的劑量與效果',
    excerpt: '生長激素衛教第二彈：劑量怎麼訂、效果怎麼看，以及為什麼不能和其他孩子的公分數直接比較。',
    facebookUrl: 'https://www.facebook.com/share/p/1FBBbKLXPc/',
    dirs: ['gh'],
    subs: [],
    articleCats: ['gh'],
  },
  {
    id: 'gnrh-therapy',
    title: '抑制青春期治療',
    excerpt: '青春期抑制針是什麼、適合誰、效果如何評估。請見圖文與門診個別化討論。',
    facebookUrl: 'https://www.facebook.com/share/1BMPw17Y65/',
    dirs: ['gnrh'],
    subs: [],
    articleCats: ['gnrh'],
  },
  {
    id: 'how-much-carb',
    title: '小朋友長高要吃多少飯？碳水吃太多是不是不好？',
    excerpt: '碳水化合物不是敵人。長高需要足夠熱量與均衡飲食，而不是盲目少吃碳水。',
    facebookUrl: 'https://www.facebook.com/share/p/19AfkGcpjt/',
    dirs: ['nutrition'],
    subs: ['diet'],
    articleCats: ['nutrition'],
  },
  {
    id: 'milk-and-height',
    title: '每天喝牛奶或無糖乳製品，有助身高成長',
    excerpt: '許多研究顯示，每天喝牛奶（鮮奶）或無糖乳製品，有助於身高成長。',
    facebookUrl: 'https://www.facebook.com/share/p/1C2p2R6wAX/',
    dirs: ['nutrition'],
    subs: ['diet'],
    articleCats: ['nutrition'],
  },
  {
    id: 'vitamin-d',
    title: '維生素 D 21 ng/mL，算不算夠？',
    excerpt: '朋友健檢後問：維生素 D 驗出來 21 ng/mL。兒童與成人的判讀、補充，不能直接套用同一句話。',
    facebookUrl: 'https://www.facebook.com/share/p/1C68P1r1HF/',
    dirs: ['nutrition'],
    subs: ['diet'],
    articleCats: ['nutrition'],
  },
  {
    id: 'puberty-growth-numbers',
    title: '懂了青春期長高數字，就不會被牽著走',
    excerpt: '最近有位家長跟我說，被其他資訊搞得很焦慮。先把青春期長高的數字看懂，就比較不會被帶著跑。',
    facebookUrl: 'https://www.facebook.com/share/p/1Ec4pLUJDM/',
    dirs: ['nutrition', 'puberty'],
    subs: ['myths'],
    articleCats: ['nutrition', 'puberty'],
  },
  {
    id: 'height-myth-graphic',
    title: '兒童長高迷思（圖文）',
    excerpt: '門診最常被問到的長高迷思，用圖文一次說清楚。',
    facebookUrl: 'https://www.facebook.com/share/19CkQm1V5V/',
    dirs: ['nutrition'],
    subs: ['myths'],
    articleCats: ['nutrition'],
  },
  {
    id: 'clonidine-myth',
    title: 'Clonidine 對長高的效果？',
    excerpt: '上次有家長問 Clonidine 對長高的效果，該家長剛好也是醫師。這類藥物不能被當成「長高神藥」。',
    facebookUrl: 'https://www.facebook.com/share/p/1FA9CMDgVp/',
    dirs: ['nutrition'],
    subs: ['myths'],
    articleCats: ['nutrition'],
  },
  {
    id: 'arginine-myth',
    title: '精胺酸到底會不會幫助長高？',
    excerpt: '常有家長會問精胺酸到底會不會幫助長高。過去看過不少補充品宣傳，需要回到實證來談。',
    facebookUrl: 'https://www.facebook.com/share/p/1CPYu8sShq/',
    dirs: ['nutrition'],
    subs: ['myths'],
    articleCats: ['nutrition'],
  },
]

export function getArticle(id) {
  return articles.find((item) => item.id === id)
}

export function filterArticles({ dir, sub, articleCat } = {}) {
  return articles.filter((item) => {
    if (dir && !(item.dirs || []).includes(dir)) return false
    if (sub && !(item.subs || []).includes(sub)) return false
    if (articleCat && articleCat !== 'latest' && !(item.articleCats || []).includes(articleCat)) {
      return false
    }
    return true
  })
}

const heroHeadlines = {
  cases: '用真實門診情境說清楚',
  'cases/precocious': '性早熟，不能只看長得快',
  'cases/rapid': '青春期進展快，剩餘生長空間會被壓縮',
  'cases/sga': '出生體重過輕，不一定會自己追上',
  'cases/iss': '找不到病因的矮小，仍需要清楚評估',
  'bone-age': '找到骨齡背後的問題',
  'bone-age/meaning': '骨齡快，不代表性早熟',
  'bone-age/machine': '門診當下完成骨齡評估',
  'short-stature': '先釐清現在矮不矮、以後可能多高',
  'short-stature/overview': '從生長曲線讀出身高的下一步',
  'short-stature/sga': 'SGA 孩子的追趕生長與治療時機',
  puberty: '青春期太早、太快或太晚，評估方式不同',
  'puberty/precocious': '性早熟一定會有身體變化',
  'puberty/rapid': '用幾年骨齡，換到多少身高',
  'puberty/gender': '青少年性別不安的專科評估',
  'puberty/delayed': '青春期來得比較晚時，該檢查什麼',
  gh: '生長激素不是長高保證，而是適應症治療',
  gnrh: '抑制青春期，是為了爭取更理想的成年身高',
  nutrition: '成長需要營養，但不需要神秘偏方',
  'nutrition/diet': '把長高相關的營養問題說清楚',
  'nutrition/myths': '門診最常被問到的長高迷思',
}

export function getSectionMeta(view, sub) {
  const key = sub ? `${view}/${sub}` : view
  const meta = sectionMeta[key] || sectionMeta[view] || { title: '李如浩醫師', intro: '' }
  return {
    ...meta,
    headline: meta.headline || heroHeadlines[key] || heroHeadlines[view] || meta.title,
    image: meta.image || '',
  }
}
