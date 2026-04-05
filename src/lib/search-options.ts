import { PREFECTURES, AREA_GROUPS } from '@/lib/types';
import locationMap from '@/lib/location-map.json';

export const PRICE_MIN = 0;
export const PRICE_MAX = 30000;
export const PRICE_STEP = 1000;

export type AreaOption = {
  label: string;
  subtitle: string;
  reading: string;
  cities: string;
  weight: number;
  prefecture: string;
  area?: string;
};

export type LocationOption = {
  label: string;
  lat: number;
  lng: number;
};

export type SearchOption =
  | { type: 'area'; data: AreaOption }
  | { type: 'location'; data: LocationOption };

// 施設数ベースの都道府県重み（多い順）
const PREF_WEIGHTS: Record<string, number> = {
  tokyo: 50, osaka: 25, kanagawa: 20, saitama: 18, chiba: 16,
  aichi: 16, fukuoka: 15, hokkaido: 14, kyoto: 14, hyogo: 13,
  shizuoka: 12, nagano: 12, gunma: 11, tochigi: 11, ibaraki: 10,
  miyagi: 10, yamanashi: 10, niigata: 9, hiroshima: 8, okinawa: 8,
  fukushima: 8, yamagata: 8, nagasaki: 7, kagoshima: 7, kumamoto: 7,
  oita: 7, shiga: 6, toyama: 6, ishikawa: 6, mie: 5,
  wakayama: 5, okayama: 5, shimane: 5, tottori: 5,
};

// 都道府県・エリア名 → ひらがな読み
const READINGS: Record<string, string> = {
  '北海道': 'ほっかいどう', '青森県': 'あおもりけん', '岩手県': 'いわてけん',
  '宮城県': 'みやぎけん', '秋田県': 'あきたけん', '山形県': 'やまがたけん',
  '福島県': 'ふくしまけん', '茨城県': 'いばらきけん', '栃木県': 'とちぎけん',
  '群馬県': 'ぐんまけん', '埼玉県': 'さいたまけん', '千葉県': 'ちばけん',
  '東京都': 'とうきょうと', '神奈川県': 'かながわけん', '新潟県': 'にいがたけん',
  '山梨県': 'やまなしけん', '長野県': 'ながのけん', '富山県': 'とやまけん',
  '石川県': 'いしかわけん', '福井県': 'ふくいけん', '静岡県': 'しずおかけん',
  '岐阜県': 'ぎふけん', '三重県': 'みえけん', '愛知県': 'あいちけん',
  '滋賀県': 'しがけん', '京都府': 'きょうとふ', '大阪府': 'おおさかふ',
  '兵庫県': 'ひょうごけん', '奈良県': 'ならけん', '和歌山県': 'わかやまけん',
  '鳥取県': 'とっとりけん', '島根県': 'しまねけん', '岡山県': 'おかやまけん',
  '広島県': 'ひろしまけん', '山口県': 'やまぐちけん', '徳島県': 'とくしまけん',
  '香川県': 'かがわけん', '愛媛県': 'えひめけん', '高知県': 'こうちけん',
  '福岡県': 'ふくおかけん', '佐賀県': 'さがけん', '長崎県': 'ながさきけん',
  '熊本県': 'くまもとけん', '大分県': 'おおいたけん', '宮崎県': 'みやざきけん',
  '鹿児島県': 'かごしまけん', '沖縄県': 'おきなわけん',
  // 北海道: 県単位（サブエリアなし）
  '青森市': 'あおもりし', '八戸': 'はちのへ', '津軽': 'つがる', '十和田': 'とわだ',
  '盛岡': 'もりおか', '横手': 'よこて',
  // 仙台: 宮城県は県単位
  '山形市': 'やまがたし', '天童': 'てんどう', '米沢': 'よねざわ', '蔵王': 'ざおう', '庄内': 'しょうない',
  '福島市': 'ふくしまし', '郡山': 'こおりやま', 'いわき': 'いわき', '会津・浜通り': 'あいづはまどおり', '白河': 'しらかわ',
  '六本木・麻布': 'ろっぽんぎあざぶ', '新宿・神楽坂': 'しんじゅくかぐらざか', '銀座・築地': 'ぎんざつきじ',
  '渋谷・恵比寿・代官山': 'しぶやえびすだいかんやま', '下北沢・世田谷': 'しもきたざわせたがや',
  '上野・浅草': 'うえのあさくさ', '池袋・赤羽': 'いけぶくろあかばね', '品川': 'しながわ', '多摩': 'たま',
  '横浜': 'よこはま', '川崎': 'かわさき', '湘南・鎌倉': 'しょうなんかまくら',
  '厚木・県央': 'あつぎけんおう', '小田原・西湘': 'おだわらせいしょう',
  '浦和・大宮': 'うらわおおみや', '川口・蕨': 'かわぐちわらび', '秩父': 'ちちぶ',
  '船橋・市川': 'ふなばしいちかわ', '浦安・市川': 'うらやすいちかわ',
  '松戸・柏': 'まつどかしわ', '館山・南房総': 'たてやまみなみぼうそう',
  '太田・桐生': 'おおたきりゅう', '高崎・前橋': 'たかさきまえばし',
  'みなかみ・沼田': 'みなかみぬまた', '甘楽': 'かんら',
  '那須・塩原': 'なすしおばら', '宇都宮・小山': 'うつのみやおやま', '日光・県央': 'にっこうけんおう',
  '水戸・笠間': 'みとかさま', 'つくば': 'つくば',
  // 新潟: 県単位（サブエリアなし）
  '甲府': 'こうふ', '富士五湖': 'ふじごこ', '北杜': 'ほくと', '石和': 'いさわ',
  '上田・別所温泉': 'うえだべっしょおんせん', '長野市・信濃町': 'ながのししなのまち',
  '軽井沢・南信': 'かるいざわなんしん', '松本・蓼科': 'まつもとたてしな', '白馬': 'はくば',
  '富山市': 'とやまし', '立山': 'たてやま', '高岡': 'たかおか',
  '金沢': 'かなざわ', '小松': 'こまつ',
  '福井市': 'ふくいし', '越前': 'えちぜん',
  '浜松・掛川': 'はままつかけがわ', '静岡市': 'しずおかし', '富士・御殿場': 'ふじごてんば', '伊豆': 'いず',
  '岐阜市': 'ぎふし', '養老': 'ようろう',
  '菰野': 'こもの',
  '名古屋・栄': 'なごやさかえ', '三河・知多': 'みかわちた', '尾張': 'おわり',
  '大津': 'おおつ', '長浜': 'ながはま',
  // 京都: 県単位（サブエリアなし）
  'ミナミ（心斎橋・難波）': 'みなみしんさいばしなんば', 'キタ（梅田・北新地）': 'きたうめだきたしんち', '八尾・枚方': 'やおひらかた',
  '神戸': 'こうべ', '阪神': 'はんしん', '三田': 'さんだ', '加古川': 'かこがわ',
  '姫路': 'ひめじ', '但馬・丹波': 'たじまたんば',
  '奈良市': 'ならし',
  '和歌山市': 'わかやまし', '有田': 'ありだ', '南紀': 'なんき',
  '鳥取市': 'とっとりし', '大山': 'だいせん', '岩美': 'いわみ',
  '松江': 'まつえ', '出雲': 'いずも', '石見': 'いわみ',
  '岡山市': 'おかやまし', '倉敷': 'くらしき',
  '広島市': 'ひろしまし', '呉': 'くれ',
  '山口市': 'やまぐちし',
  '西讃': 'せいさん', '小豆島': 'しょうどしま',
  '松山': 'まつやま',
  '高知市': 'こうちし', '仁淀川': 'によどがわ',
  '福岡市（天神・中洲）': 'ふくおかしてんじんなかす', '筑豊・北九州': 'ちくほうきたきゅうしゅう', '久留米': 'くるめ',
  '佐賀市': 'さがし',
  '長崎市': 'ながさきし', '島原': 'しまばら', '佐世保': 'させぼ',
  '熊本市': 'くまもとし',
  '大分市': 'おおいたし', '湯布院': 'ゆふいん',
  '宮崎市': 'みやざきし',
  '鹿児島市': 'かごしまし', '大隅': 'おおすみ', '霧島': 'きりしま',
  '那覇': 'なは', 'やんばる': 'やんばる',
};

export const AREA_OPTIONS: AreaOption[] = (() => {
  const options: AreaOption[] = [];
  for (const pref of PREFECTURES) {
    const prefWeight = PREF_WEIGHTS[pref.code] ?? 3;
    const allCities = (AREA_GROUPS[pref.code] ?? [])
      .flatMap((a) => a.cities)
      .join(' ');
    options.push({
      label: pref.label,
      subtitle: '',
      reading: READINGS[pref.label] ?? '',
      cities: allCities,
      weight: prefWeight,
      prefecture: pref.code,
    });
    const areas = AREA_GROUPS[pref.code];
    if (areas) {
      for (const area of areas) {
        options.push({
          label: area.label,
          subtitle: pref.label,
          reading: READINGS[area.label] ?? '',
          cities: area.cities.join(' '),
          weight: prefWeight + (area.cities.length > 2 ? 2 : 0),
          prefecture: pref.code,
          area: area.slug,
        });
      }
    }
  }
  return options;
})();

export const LOCATION_OPTIONS: LocationOption[] = Object.entries(
  locationMap as Record<string, { lat: number; lng: number }>
).map(([name, coords]) => ({
  label: name,
  lat: coords.lat,
  lng: coords.lng,
}));

export function formatPrice(v: number) {
  if (v >= PRICE_MAX) return '¥30,000';
  if (v === 0) return '¥0';
  return `¥${v.toLocaleString()}`;
}
