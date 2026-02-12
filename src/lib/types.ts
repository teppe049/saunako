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
];

export interface AreaGroup {
  slug: string;
  label: string;
  cities: string[];
}

export const AREA_GROUPS: Record<string, AreaGroup[]> = {
  tokyo: [
    { slug: 'toshin', label: '都心・副都心', cities: ['千代田区', '中央区', '港区', '新宿区'] },
    { slug: 'josei', label: '城西', cities: ['世田谷区', '渋谷区', '中野区', '杉並区', '目黒区'] },
    { slug: 'joto', label: '城東', cities: ['台東区', '墨田区', '文京区', '江東区'] },
    { slug: 'johoku', label: '城北', cities: ['北区', '豊島区'] },
    { slug: 'jonan', label: '城南', cities: ['品川区'] },
  ],
  osaka: [
    { slug: 'kita', label: 'キタ', cities: ['大阪市北区', '大阪市福島区'] },
    { slug: 'minami', label: 'ミナミ', cities: ['大阪市中央区', '大阪市西区'] },
    { slug: 'other', label: 'その他', cities: ['八尾市', '枚方市', '茨木市'] },
  ],
  kanagawa: [
    { slug: 'yokohama', label: '横浜', cities: ['横浜市中区', '横浜市青葉区'] },
    { slug: 'kawasaki', label: '川崎', cities: ['川崎市川崎区'] },
    { slug: 'other', label: 'その他', cities: ['海老名市'] },
  ],
  saitama: [
    { slug: 'urawa-omiya', label: '浦和・大宮', cities: ['さいたま市浦和区', 'さいたま市大宮区', 'さいたま市中央区'] },
    { slug: 'kawaguchi-warabi', label: '川口・蕨', cities: ['川口市'] },
    { slug: 'other', label: 'その他', cities: ['日高市'] },
  ],
  chiba: [
    { slug: 'funabashi-ichikawa', label: '船橋・市川', cities: ['船橋市'] },
    { slug: 'urayasu-ichikawa', label: '浦安・市川', cities: ['浦安市'] },
    { slug: 'matsudo-kashiwa', label: '松戸・柏', cities: ['松戸市'] },
    { slug: 'other', label: 'その他', cities: ['安房郡鋸南町'] },
  ],
};
