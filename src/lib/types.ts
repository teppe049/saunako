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
  nearestStation: string;
  walkMinutes: number;
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
  { code: 'fukuoka', label: '福岡県' },
];

export interface RegionGroup {
  label: string;
  prefectures: Prefecture[];
}

export const REGION_GROUPS: RegionGroup[] = [
  {
    label: '北海道',
    prefectures: [
      { code: 'hokkaido', label: '北海道' },
    ],
  },
  {
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
    label: '東海',
    prefectures: [
      { code: 'shizuoka', label: '静岡県' },
      { code: 'gifu', label: '岐阜県' },
      { code: 'mie', label: '三重県' },
      { code: 'aichi', label: '愛知県' },
    ],
  },
  {
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
    label: '九州',
    prefectures: [
      { code: 'fukuoka', label: '福岡県' },
    ],
  },
];

export interface AreaGroup {
  slug: string;
  label: string;
  cities: string[];
}

export const AREA_GROUPS: Record<string, AreaGroup[]> = {
  hokkaido: [
    { slug: 'sapporo', label: '札幌', cities: ['札幌市中央区', '札幌市東区', '札幌市白石区'] },
    { slug: 'douo', label: '道央', cities: ['千歳市', '室蘭市'] },
    { slug: 'donan', label: '道南', cities: ['函館市'] },
    { slug: 'dohoku', label: '道北', cities: ['旭川市', '上川郡当麻町'] },
    { slug: 'dotou', label: '道東', cities: ['帯広市', '北見市'] },
  ],
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
  miyagi: [
    { slug: 'sendai', label: '仙台', cities: ['仙台市青葉区'] },
    { slug: 'other', label: 'その他', cities: ['宮城郡利府町', '柴田郡柴田町', '岩沼市', '牡鹿郡女川町', '大崎市', '気仙沼市'] },
  ],
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
    { slug: 'koriyama', label: '郡山', cities: ['郡山市'] },
    { slug: 'iwaki', label: 'いわき', cities: ['いわき市'] },
    { slug: 'aizu', label: '会津', cities: ['耶麻郡猪苗代町'] },
    { slug: 'shirakawa', label: '白河', cities: ['白河市'] },
  ],
  tokyo: [
    { slug: 'shinjuku-minato', label: '新宿・港・銀座', cities: ['千代田区', '中央区', '港区', '新宿区'] },
    { slug: 'shibuya-setagaya', label: '渋谷・世田谷', cities: ['世田谷区', '渋谷区', '中野区', '杉並区', '目黒区'] },
    { slug: 'ueno-asakusa', label: '上野・浅草', cities: ['台東区', '墨田区', '文京区', '江東区'] },
    { slug: 'ikebukuro', label: '池袋・赤羽', cities: ['北区', '豊島区'] },
    { slug: 'shinagawa', label: '品川', cities: ['品川区'] },
  ],
  osaka: [
    { slug: 'kita', label: 'キタ', cities: ['大阪市北区', '大阪市福島区'] },
    { slug: 'minami', label: 'ミナミ', cities: ['大阪市中央区', '大阪市西区'] },
    { slug: 'other', label: 'その他', cities: ['八尾市', '枚方市', '茨木市'] },
  ],
  kyoto: [
    { slug: 'kyoto-city', label: '京都市内', cities: ['京都市左京区', '京都市北区', '京都市中京区', '京都市下京区', '京都市東山区'] },
  ],
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
    { slug: 'takasaki', label: '高崎', cities: ['高崎市'] },
    { slug: 'maebashi', label: '前橋', cities: ['前橋市'] },
    { slug: 'ota-kiryu', label: '太田・桐生', cities: ['太田市', '桐生市'] },
    { slug: 'minakami-numata', label: 'みなかみ・沼田', cities: ['利根郡みなかみ町', '沼田市'] },
    { slug: 'other', label: 'その他', cities: ['甘楽郡甘楽町'] },
  ],
  tochigi: [
    { slug: 'utsunomiya', label: '宇都宮', cities: ['宇都宮市'] },
    { slug: 'nasu', label: '那須・塩原', cities: ['那須郡那須町', '那須塩原市', '塩谷郡塩谷町'] },
    { slug: 'nikko', label: '日光', cities: ['日光市'] },
    { slug: 'other', label: 'その他', cities: ['小山市', '芳賀郡茂木町'] },
  ],
  ibaraki: [
    { slug: 'mito', label: '水戸・笠間', cities: ['水戸市', '笠間市'] },
    { slug: 'tsukuba', label: 'つくば', cities: ['つくば市'] },
    { slug: 'other', label: 'その他', cities: ['古河市', '久慈郡大子町', '高萩市', '鹿嶋市'] },
  ],
  niigata: [
    { slug: 'niigata-city', label: '新潟市', cities: ['新潟市中央区'] },
    { slug: 'nagaoka', label: '長岡', cities: ['長岡市'] },
    { slug: 'kashiwazaki', label: '柏崎', cities: ['柏崎市'] },
    { slug: 'murakami', label: '村上', cities: ['村上市'] },
    { slug: 'other', label: 'その他', cities: ['五泉市', '新発田市'] },
  ],
  yamanashi: [
    { slug: 'kofu', label: '甲府', cities: ['甲府市'] },
    { slug: 'fujigoko', label: '富士五湖', cities: ['南都留郡富士河口湖町', '南都留郡山中湖村', '富士吉田市'] },
    { slug: 'hokuto', label: '北杜', cities: ['北杜市'] },
    { slug: 'isawa', label: '石和', cities: ['笛吹市'] },
  ],
  nagano: [
    { slug: 'nagano-city', label: '長野市', cities: ['長野市'] },
    { slug: 'matsumoto', label: '松本', cities: ['松本市'] },
    { slug: 'tateshina', label: '蓼科', cities: ['茅野市'] },
    { slug: 'ueda', label: '上田', cities: ['上田市'] },
    { slug: 'hakuba', label: '白馬', cities: ['大町市'] },
    { slug: 'other', label: 'その他', cities: ['須坂市', '飯田市'] },
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
    { slug: 'shizuoka-city', label: '静岡市', cities: ['静岡市駿河区', '静岡市葵区', '静岡市清水区'] },
    { slug: 'fuji', label: '富士', cities: ['富士市'] },
    { slug: 'hamamatsu', label: '浜松', cities: ['浜松市中央区'] },
    { slug: 'numazu', label: '沼津', cities: ['沼津市'] },
  ],
  gifu: [
    { slug: 'gifu-city', label: '岐阜市', cities: ['岐阜市'] },
    { slug: 'yoro', label: '養老', cities: ['養老郡養老町'] },
    { slug: 'other', label: 'その他', cities: ['山県市'] },
  ],
  mie: [
    { slug: 'komono', label: '菰野', cities: ['三重郡菰野町'] },
  ],
  aichi: [
    { slug: 'nagoya', label: '名古屋', cities: ['名古屋市'] },
    { slug: 'other', label: 'その他', cities: ['刈谷市', '岡崎市', '岩倉市', '常滑市'] },
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
  fukuoka: [
    { slug: 'fukuoka-city', label: '福岡市', cities: ['福岡市中央区', '福岡市南区', '福岡市博多区', '福岡市早良区'] },
    { slug: 'kitakyushu', label: '北九州', cities: ['北九州市小倉北区'] },
    { slug: 'other', label: 'その他', cities: ['久留米市', '福津市', '筑紫野市'] },
  ],
};
