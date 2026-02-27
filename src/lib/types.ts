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
  { code: 'tokyo', label: '東京都' },
  { code: 'kanagawa', label: '神奈川県' },
  { code: 'saitama', label: '埼玉県' },
  { code: 'chiba', label: '千葉県' },
  { code: 'osaka', label: '大阪府' },
  { code: 'kyoto', label: '京都府' },
  { code: 'gunma', label: '群馬県' },
  { code: 'tochigi', label: '栃木県' },
  { code: 'ibaraki', label: '茨城県' },
  { code: 'aichi', label: '愛知県' },
  { code: 'fukuoka', label: '福岡県' },
];

export interface AreaGroup {
  slug: string;
  label: string;
  cities: string[];
}

export const AREA_GROUPS: Record<string, AreaGroup[]> = {
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
  aichi: [
    { slug: 'nagoya', label: '名古屋', cities: ['名古屋市'] },
    { slug: 'other', label: 'その他', cities: ['刈谷市', '岡崎市', '岩倉市', '常滑市'] },
  ],
  fukuoka: [
    { slug: 'fukuoka-city', label: '福岡市', cities: ['福岡市中央区', '福岡市南区', '福岡市博多区', '福岡市早良区'] },
    { slug: 'kitakyushu', label: '北九州', cities: ['北九州市小倉北区'] },
    { slug: 'other', label: 'その他', cities: ['久留米市', '福津市', '筑紫野市'] },
  ],
};
