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
  openedAt: string | null;
  closedAt: string | null;
  plans: Plan[] | null;
  timeSlots: TimeSlotGroup[] | null;
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
    { slug: 'hamamatsu-kakegawa', label: '浜松・掛川', cities: ['浜松市中央区', '袋井市', '御前崎市', '島田市', '榛原郡川根本町', '沼津市'] },
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
    { slug: 'ise-shima', label: '伊勢志摩', cities: ['志摩市', '伊勢市', '鳥羽市'] },
    { slug: 'higashi-kishu', label: '東紀州', cities: ['北牟婁郡紀北町'] },
  ],
  aichi: [
    { slug: 'nagoya-sakae', label: '名古屋・栄', cities: ['名古屋市', '名古屋市中村区', '名古屋市中区', '名古屋市港区'] },
    { slug: 'mikawa-chita', label: '三河・知多', cities: ['刈谷市', '岡崎市', '常滑市', '蒲郡市'] },
    { slug: 'owari', label: '尾張', cities: ['岩倉市', '一宮市'] },
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
