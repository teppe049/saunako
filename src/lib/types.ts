export interface FaqEntry {
  q: string;
  a: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  thumbnail: string;
  author: string;
  facilityIds: number[];
  readingTime: number;
  published: boolean;
  faq?: FaqEntry[];
}

export const ARTICLE_CATEGORIES = [
  { slug: 'area-guide', label: 'エリアガイド' },
  { slug: 'beginners', label: 'サウナ入門' },
  { slug: 'ranking', label: 'ランキング' },
  { slug: 'column', label: 'コラム' },
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]['slug'];

export interface Plan {
  name: string;
  price: number;
  duration: number;
  capacity: number;
}

export interface TimeSlotGroup {
  label: string;
  startTimes: string[];
  note?: string;
}

export interface Facility {
  id: number;
  slug: string;
  name: string;
  prefecture: string;
  prefectureLabel: string;
  city: string;
  area: string;
  address: string;
  nearestStation: string | null;
  walkMinutes: number | null;
  priceMin: number;
  duration: number;
  capacity: number;
  features: {
    waterBath: boolean;
    waterBathTemp: string | null;
    selfLoyly: boolean;
    outdoorAir: boolean;
    coupleOk: boolean;
    bluetooth: boolean | null;
    wifi: boolean | null;
  };
  businessHours: string;
  holidays: string;
  website: string;
  phone: string;
  bookingUrl: string | null;
  amenities: string[];
  note: string | null;
  images: string[];
  lat: number | null;
  lng: number | null;
  description: string;
  seoDescription: string | null;
  seoTitle?: string | null;
  saunakoCommentShort: string;
  saunakoCommentLong: string;
  updatedAt: string;
  /** 情報を実地・公式サイトで確認した日（YYYY-MM-DD、任意） */
  verifiedAt?: string | null;
  openedAt: string | null;
  closedAt: string | null;
  plans: Plan[] | null;
  timeSlots: TimeSlotGroup[] | null;
  slotType: 'fixed' | 'free' | null;
}

export interface Prefecture {
  code: string;
  label: string;
}

export const PREFECTURES: Prefecture[] = [
  { code: 'hokkaido', label: '北海道' },
  { code: 'aomori', label: '青森県' },
  { code: 'iwate', label: '岩手県' },
  { code: 'miyagi', label: '宮城県' },
  { code: 'akita', label: '秋田県' },
  { code: 'yamagata', label: '山形県' },
  { code: 'fukushima', label: '福島県' },
  { code: 'ibaraki', label: '茨城県' },
  { code: 'tochigi', label: '栃木県' },
  { code: 'gunma', label: '群馬県' },
  { code: 'saitama', label: '埼玉県' },
  { code: 'chiba', label: '千葉県' },
  { code: 'tokyo', label: '東京都' },
  { code: 'kanagawa', label: '神奈川県' },
  { code: 'niigata', label: '新潟県' },
  { code: 'yamanashi', label: '山梨県' },
  { code: 'nagano', label: '長野県' },
  { code: 'toyama', label: '富山県' },
  { code: 'ishikawa', label: '石川県' },
  { code: 'fukui', label: '福井県' },
  { code: 'shizuoka', label: '静岡県' },
  { code: 'gifu', label: '岐阜県' },
  { code: 'mie', label: '三重県' },
  { code: 'aichi', label: '愛知県' },
  { code: 'shiga', label: '滋賀県' },
  { code: 'kyoto', label: '京都府' },
  { code: 'osaka', label: '大阪府' },
  { code: 'hyogo', label: '兵庫県' },
  { code: 'nara', label: '奈良県' },
  { code: 'wakayama', label: '和歌山県' },
  { code: 'tottori', label: '鳥取県' },
  { code: 'shimane', label: '島根県' },
  { code: 'okayama', label: '岡山県' },
  { code: 'hiroshima', label: '広島県' },
  { code: 'yamaguchi', label: '山口県' },
  { code: 'tokushima', label: '徳島県' },
  { code: 'kagawa', label: '香川県' },
  { code: 'ehime', label: '愛媛県' },
  { code: 'kochi', label: '高知県' },
  { code: 'fukuoka', label: '福岡県' },
  { code: 'saga', label: '佐賀県' },
  { code: 'nagasaki', label: '長崎県' },
  { code: 'kumamoto', label: '熊本県' },
  { code: 'oita', label: '大分県' },
  { code: 'miyazaki', label: '宮崎県' },
  { code: 'kagoshima', label: '鹿児島県' },
  { code: 'okinawa', label: '沖縄県' },
];

export interface RegionGroup {
  code: string;
  label: string;
  prefectures: Prefecture[];
}

export function getRegionByCode(code: string): RegionGroup | undefined {
  return REGION_GROUPS.find((r) => r.code === code);
}

export const REGION_GROUPS: RegionGroup[] = [
  {
    code: 'hokkaido',
    label: '北海道',
    prefectures: [
      { code: 'hokkaido', label: '北海道' },
    ],
  },
  {
    code: 'tohoku',
    label: '東北',
    prefectures: [
      { code: 'aomori', label: '青森県' },
      { code: 'iwate', label: '岩手県' },
      { code: 'miyagi', label: '宮城県' },
      { code: 'akita', label: '秋田県' },
      { code: 'yamagata', label: '山形県' },
      { code: 'fukushima', label: '福島県' },
    ],
  },
  {
    code: 'koshinetsu-hokuriku',
    label: '甲信越・北陸',
    prefectures: [
      { code: 'niigata', label: '新潟県' },
      { code: 'yamanashi', label: '山梨県' },
      { code: 'nagano', label: '長野県' },
      { code: 'toyama', label: '富山県' },
      { code: 'ishikawa', label: '石川県' },
      { code: 'fukui', label: '福井県' },
    ],
  },
  {
    code: 'kanto',
    label: '関東',
    prefectures: [
      { code: 'tokyo', label: '東京都' },
      { code: 'kanagawa', label: '神奈川県' },
      { code: 'saitama', label: '埼玉県' },
      { code: 'chiba', label: '千葉県' },
      { code: 'ibaraki', label: '茨城県' },
      { code: 'gunma', label: '群馬県' },
      { code: 'tochigi', label: '栃木県' },
    ],
  },
  {
    code: 'tokai',
    label: '東海',
    prefectures: [
      { code: 'shizuoka', label: '静岡県' },
      { code: 'gifu', label: '岐阜県' },
      { code: 'mie', label: '三重県' },
      { code: 'aichi', label: '愛知県' },
    ],
  },
  {
    code: 'kansai',
    label: '関西',
    prefectures: [
      { code: 'shiga', label: '滋賀県' },
      { code: 'kyoto', label: '京都府' },
      { code: 'osaka', label: '大阪府' },
      { code: 'hyogo', label: '兵庫県' },
      { code: 'nara', label: '奈良県' },
      { code: 'wakayama', label: '和歌山県' },
    ],
  },
  {
    code: 'chugoku',
    label: '中国',
    prefectures: [
      { code: 'tottori', label: '鳥取県' },
      { code: 'shimane', label: '島根県' },
      { code: 'okayama', label: '岡山県' },
      { code: 'hiroshima', label: '広島県' },
      { code: 'yamaguchi', label: '山口県' },
    ],
  },
  {
    code: 'shikoku',
    label: '四国',
    prefectures: [
      { code: 'tokushima', label: '徳島県' },
      { code: 'kagawa', label: '香川県' },
      { code: 'ehime', label: '愛媛県' },
      { code: 'kochi', label: '高知県' },
    ],
  },
  {
    code: 'kyushu-okinawa',
    label: '九州・沖縄',
    prefectures: [
      { code: 'fukuoka', label: '福岡県' },
      { code: 'saga', label: '佐賀県' },
      { code: 'nagasaki', label: '長崎県' },
      { code: 'kumamoto', label: '熊本県' },
      { code: 'oita', label: '大分県' },
      { code: 'miyazaki', label: '宮崎県' },
      { code: 'kagoshima', label: '鹿児島県' },
      { code: 'okinawa', label: '沖縄県' },
    ],
  },
];

export interface AreaGroup {
  slug: string;
  label: string;
  cities: string[];
}

/**
 * エリアページのCTR改善用・都道府県固有の追加コンテンツ。
 * ページ内の「エリア別ガイドパネル」「固有FAQ」「Tipsコメント」を出し分ける。
 * まずCTRが低い高impページ（tokyo等）から段階的に追加する。
 */
export interface AreaGuidePanel {
  /** AREA_GROUPS の slug と対応させ、施設数と /area/{pref}/{slug} リンクを動的に引く */
  slug: string;
  /** パネルに表示する見出し（例: 池袋・赤羽） */
  label: string;
  /** 駅チカ性・価格帯・客層など、検索意図に刺さる一言ガイド */
  description: string;
}

export interface PrefectureGuide {
  areaGuides: AreaGuidePanel[];
  extraFaqs: { question: string; answer: string }[];
  /** サウナ子コメントに続けて出す、エリア選びのTips（任意） */
  tipsComment?: string;
}

export const AREA_GROUPS: Record<string, AreaGroup[]> = {
  // 北海道: 県単位（16施設、道央/道北等は旅行者に通じないため）
  aomori: [
    { slug: 'aomori-city', label: '青森市', cities: ['青森市'] },
    { slug: 'hachinohe', label: '八戸', cities: ['八戸市'] },
    { slug: 'tsugaru', label: '津軽', cities: ['平川市'] },
    { slug: 'towada', label: '十和田', cities: ['十和田市'] },
  ],
  iwate: [
    { slug: 'morioka', label: '盛岡', cities: ['盛岡市'] },
    { slug: 'other', label: 'その他', cities: ['紫波郡紫波町', '岩手郡岩手町', '北上市'] },
  ],
  // 宮城: 県単位（12施設、仙台2+分散10）
  akita: [
    { slug: 'yokote', label: '横手', cities: ['横手市'] },
    { slug: 'other', label: 'その他', cities: ['山本郡八峰町'] },
  ],
  yamagata: [
    { slug: 'yamagata-city', label: '山形市', cities: ['山形市'] },
    { slug: 'tendo', label: '天童', cities: ['天童市'] },
    { slug: 'yonezawa', label: '米沢', cities: ['米沢市'] },
    { slug: 'zaou', label: '蔵王', cities: ['上山市'] },
    { slug: 'shonai', label: '庄内', cities: ['鶴岡市'] },
  ],
  fukushima: [
    { slug: 'fukushima-city', label: '福島市', cities: ['福島市'] },
    { slug: 'iwaki', label: 'いわき', cities: ['いわき市'] },
    { slug: 'koriyama', label: '郡山', cities: ['郡山市'] },
    { slug: 'aizu-hamadori', label: '会津・浜通り', cities: ['耶麻郡猪苗代町', '二本松市', '南相馬市'] },
    { slug: 'shirakawa', label: '白河', cities: ['白河市'] },
  ],
  tokyo: [
    { slug: 'roppongi-azabu', label: '六本木・麻布', cities: ['港区'] },
    { slug: 'shinjuku-kagurazaka', label: '新宿・神楽坂', cities: ['新宿区', '千代田区'] },
    { slug: 'ginza-tsukiji', label: '銀座・築地', cities: ['中央区'] },
    { slug: 'shibuya-ebisu-daikanyama', label: '渋谷・恵比寿・代官山', cities: ['渋谷区', '目黒区'] },
    { slug: 'shimokitazawa-setagaya', label: '下北沢・世田谷', cities: ['世田谷区', '杉並区', '中野区'] },
    { slug: 'ueno-asakusa', label: '上野・浅草', cities: ['台東区', '墨田区', '文京区', '江東区'] },
    { slug: 'ikebukuro', label: '池袋・赤羽', cities: ['北区', '豊島区'] },
    { slug: 'shinagawa', label: '品川', cities: ['品川区'] },
    { slug: 'tama', label: '多摩', cities: ['小金井市'] },
  ],
  osaka: [
    { slug: 'minami', label: 'ミナミ（心斎橋・難波）', cities: ['大阪市中央区', '大阪市西区', '大阪市'] },
    { slug: 'kita', label: 'キタ（梅田・北新地）', cities: ['大阪市北区', '大阪市福島区'] },
    { slug: 'yao-hirakata', label: '八尾・枚方', cities: ['八尾市', '枚方市', '茨木市'] },
  ],
  // 京都: 県単位（13施設、京都市内11+離れた2施設）
  kanagawa: [
    { slug: 'yokohama', label: '横浜', cities: ['横浜市中区', '横浜市青葉区', '横浜市港北区'] },
    { slug: 'kawasaki', label: '川崎', cities: ['川崎市川崎区', '川崎市多摩区'] },
    { slug: 'shonan', label: '湘南・鎌倉', cities: ['藤沢市', '鎌倉市'] },
    { slug: 'atsugi', label: '厚木・県央', cities: ['厚木市', '海老名市'] },
    { slug: 'odawara', label: '小田原・西湘', cities: ['小田原市'] },
  ],
  saitama: [
    { slug: 'urawa-omiya', label: '浦和・大宮', cities: ['さいたま市浦和区', 'さいたま市大宮区', 'さいたま市中央区'] },
    { slug: 'kawaguchi-warabi', label: '川口・蕨', cities: ['川口市'] },
    { slug: 'chichibu', label: '秩父', cities: ['秩父市'] },
    { slug: 'other', label: 'その他', cities: ['日高市'] },
  ],
  chiba: [
    { slug: 'funabashi-ichikawa', label: '船橋・市川', cities: ['船橋市'] },
    { slug: 'urayasu-ichikawa', label: '浦安・市川', cities: ['浦安市'] },
    { slug: 'matsudo-kashiwa', label: '松戸・柏', cities: ['松戸市', '柏市'] },
    { slug: 'tateyama-minamiboso', label: '館山・南房総', cities: ['館山市'] },
    { slug: 'other', label: 'その他', cities: ['安房郡鋸南町'] },
  ],
  gunma: [
    { slug: 'ota-kiryu', label: '太田・桐生', cities: ['太田市', '桐生市'] },
    { slug: 'takasaki-maebashi', label: '高崎・前橋', cities: ['高崎市', '前橋市'] },
    { slug: 'minakami-numata', label: 'みなかみ・沼田', cities: ['利根郡みなかみ町', '沼田市'] },
    { slug: 'kanra', label: '甘楽', cities: ['甘楽郡甘楽町'] },
  ],
  tochigi: [
    { slug: 'nasu-shiobara', label: '那須・塩原', cities: ['那須郡那須町', '那須塩原市'] },
    { slug: 'utsunomiya-oyama', label: '宇都宮・小山', cities: ['宇都宮市', '小山市'] },
    { slug: 'nikko-kenoh', label: '日光・県央', cities: ['日光市', '塩谷郡塩谷町', '芳賀郡茂木町'] },
  ],
  ibaraki: [
    { slug: 'mito', label: '水戸・笠間', cities: ['水戸市', '笠間市'] },
    { slug: 'tsukuba', label: 'つくば', cities: ['つくば市'] },
    { slug: 'other', label: 'その他', cities: ['古河市', '久慈郡大子町', '高萩市', '鹿嶋市'] },
  ],
  // 新潟: 県単位（11施設、新潟市5+分散6）
  yamanashi: [
    { slug: 'kofu', label: '甲府', cities: ['甲府市'] },
    { slug: 'fujigoko', label: '富士五湖', cities: ['南都留郡富士河口湖町', '南都留郡山中湖村', '富士吉田市'] },
    { slug: 'hokuto', label: '北杜', cities: ['北杜市'] },
    { slug: 'isawa', label: '石和', cities: ['笛吹市'] },
  ],
  nagano: [
    { slug: 'ueda-bessho', label: '上田・別所温泉', cities: ['上田市'] },
    { slug: 'nagano-shinano', label: '長野市・信濃町', cities: ['長野市', '信濃町'] },
    { slug: 'karuizawa-nanshin', label: '軽井沢・南信', cities: ['軽井沢町', '飯田市', '伊那市', '山ノ内町', '須坂市'] },
    { slug: 'matsumoto-tateshina', label: '松本・蓼科', cities: ['松本市', '茅野市'] },
    { slug: 'hakuba', label: '白馬', cities: ['白馬村', '北安曇郡白馬村'] },
  ],
  toyama: [
    { slug: 'toyama-city', label: '富山市', cities: ['富山市'] },
    { slug: 'tateyama', label: '立山', cities: ['中新川郡立山町'] },
    { slug: 'takaoka', label: '高岡', cities: ['高岡市'] },
    { slug: 'other', label: 'その他', cities: ['滑川市', '魚津市', '黒部市'] },
  ],
  ishikawa: [
    { slug: 'kanazawa', label: '金沢', cities: ['金沢市', '野々市市'] },
    { slug: 'komatsu', label: '小松', cities: ['小松市'] },
  ],
  fukui: [
    { slug: 'fukui-city', label: '福井市', cities: ['福井市'] },
    { slug: 'echizen', label: '越前', cities: ['越前市'] },
  ],
  shizuoka: [
    { slug: 'hamamatsu-kakegawa', label: '浜松・掛川', cities: ['浜松市中央区', '袋井市', '御前崎市', '島田市', '榛原郡川根本町', '沼津市', '磐田市'] },
    { slug: 'shizuoka-city', label: '静岡市', cities: ['静岡市駿河区', '静岡市葵区', '静岡市清水区'] },
    { slug: 'fuji-gotemba', label: '富士・御殿場', cities: ['富士市', '御殿場市'] },
    { slug: 'izu', label: '伊豆', cities: ['伊豆の国市', '下田市'] },
  ],
  gifu: [
    { slug: 'gifu-city', label: '岐阜市', cities: ['岐阜市'] },
    { slug: 'yoro', label: '養老', cities: ['養老郡養老町'] },
    { slug: 'other', label: 'その他', cities: ['山県市'] },
  ],
  mie: [
    { slug: 'komono', label: '菰野', cities: ['三重郡菰野町'] },
    { slug: 'iga', label: '伊賀', cities: ['伊賀市'] },
    { slug: 'tsu', label: '津', cities: ['津市'] },
    { slug: 'ise-shima', label: '伊勢志摩', cities: ['志摩市', '伊勢市', '鳥羽市'] },
    { slug: 'higashi-kishu', label: '東紀州', cities: ['北牟婁郡紀北町'] },
  ],
  aichi: [
    { slug: 'nagoya-sakae', label: '名古屋・栄', cities: ['名古屋市', '名古屋市中村区', '名古屋市中区', '名古屋市港区'] },
    { slug: 'mikawa-chita', label: '三河・知多', cities: ['刈谷市', '岡崎市', '常滑市', '蒲郡市'] },
    { slug: 'owari', label: '尾張', cities: ['岩倉市', '一宮市'] },
  ],
  kyoto: [
    { slug: 'kawaramachi-sanjo', label: '河原町・三条', cities: ['京都市中京区', '京都市東山区'] },
    { slug: 'shijo-karasuma', label: '四条・烏丸', cities: ['京都市下京区'] },
    { slug: 'kitayama-kamigyo', label: '北山・上京', cities: ['京都市左京区', '京都市上京区'] },
    { slug: 'fushimi', label: '伏見', cities: ['京都市伏見区'] },
    { slug: 'kyotanabe-tango', label: '京田辺・京丹後', cities: ['京田辺市', '京丹後市'] },
  ],
  shiga: [
    { slug: 'otsu', label: '大津', cities: ['大津市'] },
    { slug: 'nagahama', label: '長浜', cities: ['長浜市'] },
    { slug: 'other', label: 'その他', cities: ['蒲生郡日野町', '犬上郡多賀町', '甲賀市'] },
  ],
  hyogo: [
    { slug: 'kobe', label: '神戸', cities: ['神戸市中央区', '神戸市東灘区', '神戸市西区'] },
    { slug: 'hanshin', label: '阪神', cities: ['西宮市', '宝塚市'] },
    { slug: 'sanda', label: '三田', cities: ['三田市'] },
    { slug: 'kakogawa', label: '加古川', cities: ['加古川市'] },
    { slug: 'himeji', label: '姫路', cities: ['姫路市'] },
    { slug: 'tajima-tanba', label: '但馬・丹波', cities: ['養父市', '丹波篠山市'] },
  ],
  nara: [
    { slug: 'nara-city', label: '奈良市', cities: ['奈良市'] },
    { slug: 'other', label: 'その他', cities: ['山辺郡山添村'] },
  ],
  wakayama: [
    { slug: 'wakayama-city', label: '和歌山市', cities: ['和歌山市'] },
    { slug: 'arida', label: '有田', cities: ['有田郡湯浅町'] },
    { slug: 'nanki', label: '南紀', cities: ['田辺市'] },
  ],
  tottori: [
    { slug: 'tottori-city', label: '鳥取市', cities: ['鳥取市'] },
    { slug: 'daisen', label: '大山', cities: ['西伯郡大山町'] },
    { slug: 'iwami', label: '岩美', cities: ['岩美郡岩美町'] },
  ],
  shimane: [
    { slug: 'matsue', label: '松江', cities: ['松江市'] },
    { slug: 'izumo', label: '出雲', cities: ['出雲市'] },
    { slug: 'iwami', label: '石見', cities: ['益田市', '浜田市'] },
  ],
  okayama: [
    { slug: 'okayama-city', label: '岡山市', cities: ['岡山市'] },
    { slug: 'kurashiki', label: '倉敷', cities: ['倉敷市'] },
    { slug: 'other', label: 'その他', cities: ['久米郡久米南町'] },
  ],
  hiroshima: [
    { slug: 'hiroshima-city', label: '広島市', cities: ['広島市'] },
    { slug: 'kure', label: '呉', cities: ['呉市'] },
  ],
  yamaguchi: [
    { slug: 'yamaguchi-city', label: '山口市', cities: ['山口市'] },
    { slug: 'other', label: 'その他', cities: ['熊毛郡平生町', '山陽小野田市', '周南市'] },
  ],
  tokushima: [
    { slug: 'other', label: 'その他', cities: ['名西郡神山町', '三好市'] },
  ],
  kagawa: [
    { slug: 'seisan', label: '西讃', cities: ['観音寺市', '三豊市'] },
    { slug: 'shodoshima', label: '小豆島', cities: ['小豆郡土庄町'] },
  ],
  ehime: [
    { slug: 'matsuyama', label: '松山', cities: ['松山市', '東温市'] },
  ],
  kochi: [
    { slug: 'kochi-city', label: '高知市', cities: ['高知市'] },
    { slug: 'niyodogawa', label: '仁淀川', cities: ['吾川郡仁淀川町', '吾川郡いの町'] },
  ],
  fukuoka: [
    { slug: 'fukuoka-city', label: '福岡市（天神・中洲）', cities: ['福岡市中央区', '福岡市南区', '福岡市博多区', '福岡市早良区'] },
    { slug: 'chikuho-kitakyushu', label: '筑豊・北九州', cities: ['北九州市小倉北区', '福津市', '筑紫野市'] },
    { slug: 'kurume', label: '久留米', cities: ['久留米市'] },
  ],
  saga: [
    { slug: 'saga-city', label: '佐賀市', cities: ['佐賀市'] },
  ],
  nagasaki: [
    { slug: 'nagasaki-city', label: '長崎市', cities: ['長崎市'] },
    { slug: 'shimabara', label: '島原', cities: ['南島原市'] },
    { slug: 'sasebo', label: '佐世保', cities: ['佐世保市'] },
  ],
  kumamoto: [
    { slug: 'kumamoto-city', label: '熊本市', cities: ['熊本市'] },
    { slug: 'other', label: 'その他', cities: ['上益城郡益城町'] },
  ],
  oita: [
    { slug: 'oita-city', label: '大分市', cities: ['大分市'] },
    { slug: 'yufuin', label: '湯布院', cities: ['由布市'] },
  ],
  miyazaki: [
    { slug: 'miyazaki-city', label: '宮崎市', cities: ['宮崎市'] },
  ],
  kagoshima: [
    { slug: 'kagoshima-city', label: '鹿児島市', cities: ['鹿児島市'] },
    { slug: 'osumi', label: '大隅', cities: ['鹿屋市'] },
    { slug: 'kirishima', label: '霧島', cities: ['霧島市'] },
    { slug: 'other', label: 'その他', cities: ['薩摩川内市'] },
  ],
  okinawa: [
    { slug: 'naha', label: '那覇', cities: ['那覇市'] },
    { slug: 'yanbaru', label: 'やんばる', cities: ['国頭郡大宜味村'] },
  ],
};

/**
 * 都道府県固有のエリアガイド・FAQ。CTRの低い高impページから順に追加していく。
 * areaGuides の slug は AREA_GROUPS[prefecture] の slug と一致させること
 * （施設数とリンクをページ側で AREA_GROUPS / areaCounts から動的に引くため）。
 */
export const PREFECTURE_GUIDES: Record<string, PrefectureGuide> = {
  // 東京: area/tokyo が高imp・低CTR（276imp/2.9%）。「池袋/新宿/渋谷 個室サウナ」など
  // 地名クエリが8〜11位でクリック0のため、主要エリアのマイクロページへ導線を張る。
  tokyo: {
    areaGuides: [
      { slug: 'shinjuku-kagurazaka', label: '新宿・神楽坂', description: '9施設・2,500円〜。歌舞伎町タワーなど駅チカで仕事帰りにサクッと。' },
      { slug: 'ikebukuro', label: '池袋・赤羽', description: '4施設・3,300円〜。うち3施設がカップルOK。北エリアの穴場。' },
      { slug: 'shibuya-ebisu-daikanyama', label: '渋谷・恵比寿・代官山', description: '8施設・3,300円〜。外気浴付きの上質系が多くデート向き。' },
      { slug: 'roppongi-azabu', label: '六本木・麻布', description: '17施設と都内最多。赤坂含むラグジュアリー志向の激戦区。' },
      { slug: 'ginza-tsukiji', label: '銀座・築地', description: '4施設・3,490円〜。24時間営業や深夜利用できる店も。' },
      { slug: 'ueno-asakusa', label: '上野・浅草', description: '10施設・4,000円〜。下町の貸切サウナ。観光ついでにも。' },
      { slug: 'shimokitazawa-setagaya', label: '下北沢・世田谷', description: '10施設・990円〜と都内最安クラス。ソロ活・コスパ重視ならここ。' },
    ],
    extraFaqs: [
      {
        question: '池袋・新宿・渋谷の駅チカで個室サウナを探すには？',
        answer: '東京都ページ上部の「エリア別ガイド」から各エリアの一覧に進めます。新宿・神楽坂、池袋・赤羽、渋谷・恵比寿・代官山ごとに施設数と特徴をまとめているので、最寄りエリアから絞り込むのがおすすめです。',
      },
      {
        question: '東京でデート・カップル利用できる個室サウナが多いエリアは？',
        answer: '渋谷・恵比寿・代官山エリアは外気浴付きの上質な貸切サウナが多く、デート利用に向いています。男女で利用できる施設は事前予約制のことが多いので、予約状況を早めに確認しましょう。',
      },
      {
        question: '都内で安い個室サウナはどこ？1人いくらから入れる？',
        answer: '東京の個室サウナは1人990円台から利用できます。下北沢・世田谷エリアは平均4,359円と都内で最も手頃で、Sauna3（サウナサン）やHUBHUB 下北沢などが該当します。平日日中の枠や60分の短時間プランを選ぶとさらに安くなるため、各施設ページの料金プランで最短利用時間と単価を比較するのがおすすめです。',
      },
      {
        question: '東京の個室サウナの料金相場はエリアでどのくらい違う？',
        answer: 'エリアによって倍以上の差があります。各施設の最短利用プランで比べると、下北沢・世田谷が平均4,359円と最も手頃で、銀座・築地が5,585円、池袋・赤羽が5,700円、渋谷・恵比寿・代官山が10,588円、六本木・麻布は12,137円と高価格帯です。予算重視なら世田谷・銀座・池袋、設備や雰囲気重視なら渋谷・六本木を選ぶと失敗しません。',
      },
    ],
    tipsComment: '💡 東京はエリアで色が違うの。六本木・麻布が17施設で都内最多、下北沢・世田谷は990円〜入れてコスパ最強、渋谷・恵比寿は外気浴付きのデート向き、新宿・池袋は駅チカで仕事帰り向き。予算重視なら世田谷、雰囲気重視なら渋谷から見てみて！',
  },
  // 京都: area/kyoto が299imp/CTR0.67%と最低水準。「kudochi sauna 京都」「クドチ サウナ 京都」等の
  // 指名検索（計139imp・CTR0%）が施設ページでなくこのエリアページに着地しているため、
  // 河原町・烏丸のエリア導線とFAQで店舗ページへ振り分ける。
  kyoto: {
    areaGuides: [
      { slug: 'kawaramachi-sanjo', label: '河原町・三条', description: '京都随一の繁華街。観光や食事の後にそのまま寄れる駅チカ個室サウナが集まる。' },
      { slug: 'shijo-karasuma', label: '四条・烏丸', description: '鴨川沿い・高瀬川沿いの静かな個室サウナ。京都らしい景色とセットで。' },
      { slug: 'kitayama-kamigyo', label: '北山・上京', description: '町家リノベ系や隠れ家系。落ち着いた雰囲気で過ごしたい人向け。' },
      { slug: 'fushimi', label: '伏見', description: '市街から少し離れた穴場エリア。車で行けるゆったり系。' },
      { slug: 'kyotanabe-tango', label: '京田辺・京丹後', description: '日本海側・郊外のバレルサウナや温浴施設併設タイプ。' },
    ],
    extraFaqs: [
      {
        question: 'KUDOCHI sauna 京都河原町店はどこにある？予約は必要？',
        answer: 'KUDOCHI sauna 京都河原町店は京都市中京区河原町通三条下る山崎町のAD-G四条河原町7階にあり、河原町駅から徒歩圏内です。完全個室・完全予約制のため、当日でも空きがあれば利用できますが週末は埋まりやすいので事前予約がおすすめです。料金・空き状況は施設ページから確認できます。',
      },
      {
        question: '京都の河原町・四条エリアで個室サウナを探すには？',
        answer: '京都府ページ上部の「エリア別ガイド」から河原町・三条、四条・烏丸それぞれの一覧に進めます。河原町・三条は観光や食事のあとに寄れる駅チカ系、四条・烏丸は鴨川や高瀬川沿いの静かな個室サウナが中心です。',
      },
      {
        question: '京都でカップル・男女で入れる個室サウナはある？',
        answer: '京都には男女で一緒に利用できる完全個室サウナが複数あります。町家をリノベーションしたタイプや水着着用で入れるタイプなど条件が施設ごとに異なるので、各施設ページの「カップルOK」表記と予約時の人数条件を確認してください。',
      },
    ],
    tipsComment: '💡 京都はエリアで雰囲気がぜんぜん違うの。河原町・三条は観光帰りにサッと寄れる駅チカ系、四条・烏丸は鴨川沿いで静かめ、北山・上京は町家リノベの隠れ家系。上の「エリア別ガイド」から選ぶと迷わないよ！',
  },
  // 福岡: area/fukuoka 110imp/CTR5.5%だが「福岡 プライベートサウナ」系の取りこぼしが残る。
  // 天神・中洲／久留米の地名クエリをマイクロページへ流す。
  fukuoka: {
    areaGuides: [
      { slug: 'fukuoka-city', label: '福岡市（天神・中洲）', description: '天神・博多・中洲の駅チカ個室サウナ。仕事帰りや出張ついでに。' },
      { slug: 'chikuho-kitakyushu', label: '筑豊・北九州', description: '小倉・福津など県北エリア。車で行けるゆったり系が中心。' },
      { slug: 'kurume', label: '久留米', description: '久留米市内の個室サウナ。県南から通いやすい穴場エリア。' },
    ],
    extraFaqs: [
      {
        question: '福岡の天神・博多で個室サウナを探すには？',
        answer: '福岡県ページ上部の「エリア別ガイド」から「福岡市（天神・中洲）」の一覧に進めます。天神・博多・中洲は駅から徒歩圏の完全個室サウナが集まっており、出張や仕事帰りの利用にも向いています。',
      },
      {
        question: '福岡で安く個室サウナに入れる施設は？',
        answer: '福岡には1人あたり3,000円台から利用できる個室サウナがあります。平日日中の枠や短時間プランを選ぶと割安になることが多いので、各施設ページの料金プラン一覧で最短利用時間と単価を比較するのがおすすめです。',
      },
    ],
    tipsComment: '💡 福岡は天神・博多エリアに駅チカの個室サウナが集中してるよ。北九州や久留米は車前提だけど、そのぶん広くてゆったりしてるところが多いの。上の「エリア別ガイド」から選んでみて！',
  },
  // 広島: area/hiroshima 149imp/CTR4.0%・11.2位。「広島 個室サウナ」10.1位／「広島 サウナ 個室」12位で
  // 1ページ目ボーダー。市内／呉の導線とFAQで情報量を足して押し上げる。
  hiroshima: {
    areaGuides: [
      { slug: 'hiroshima-city', label: '広島市', description: '広島駅・紙屋町周辺の個室サウナ。市内観光や出張の合間に。' },
      { slug: 'kure', label: '呉', description: '呉市内の個室サウナ。海沿いエリアでゆったり過ごしたい人向け。' },
    ],
    extraFaqs: [
      {
        question: '広島市内で個室サウナを探すには？',
        answer: '広島県ページ上部の「エリア別ガイド」から「広島市」の一覧に進めます。広島駅・紙屋町周辺には完全個室・貸切タイプのサウナがあり、観光や出張の合間に立ち寄りやすい立地です。',
      },
      {
        question: '広島でカップルで入れる個室サウナはある？',
        answer: '広島には男女で一緒に利用できる貸切サウナがあります。水着着用の有無や2名以上の予約条件が施設ごとに違うので、各施設ページの「カップルOK」表記と料金プランの人数条件を確認してください。',
      },
    ],
    tipsComment: '💡 広島市内は駅チカで立ち寄りやすい個室サウナ、呉は海沿いでゆったり系。安芸太田や北広島には自然の中のバレルサウナもあるよ。上の「エリア別ガイド」から探してみて！',
  },
  // 愛知: area/aichi 75imp/CTR1.3%・10.5位と低迷。一方 articles/aichi-private-sauna-guide は
  // 175imp/CTR5.1%と好調で、「岡崎 プライベートサウナ」等の三河クエリが取れている。
  // エリアページ側に名古屋・栄／三河・知多の導線を張って受け皿を作る。
  aichi: {
    areaGuides: [
      { slug: 'nagoya-sakae', label: '名古屋・栄', description: '栄・名駅周辺の個室サウナ。県内最多で選択肢が豊富。' },
      { slug: 'mikawa-chita', label: '三河・知多', description: '岡崎・刈谷・常滑など。車で行ける郊外型のゆったり系。' },
      { slug: 'owari', label: '尾張', description: '一宮・岩倉エリア。市街地から少し外れた穴場。' },
    ],
    extraFaqs: [
      {
        question: '名古屋・栄で個室サウナを探すには？',
        answer: '愛知県ページ上部の「エリア別ガイド」から「名古屋・栄」の一覧に進めます。栄・名駅周辺は県内で最も施設数が多く、駅から徒歩圏の完全個室サウナが揃っています。',
      },
      {
        question: '岡崎・刈谷など三河エリアに個室サウナはある？',
        answer: '三河・知多エリアには岡崎市・刈谷市・常滑市・蒲郡市の個室サウナがあります。多くは車でのアクセスが前提ですが、駐車場付きで広めの貸切タイプが中心です。「エリア別ガイド」の三河・知多から一覧を確認できます。',
      },
    ],
    tipsComment: '💡 愛知は名古屋・栄に施設が集中してるけど、岡崎や常滑みたいな三河エリアには車で行ける広めの貸切サウナがあるの。デート向きを探すなら三河も要チェックだよ！',
  },
};
