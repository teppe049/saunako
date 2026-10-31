import { cheapestCouplePlan } from './coupleBudget';
import type { BookingMethod, Facility } from './types';

export interface FacilityFaq {
  question: string;
  answer: string;
}

const METHOD_LABELS: Record<BookingMethod, string> = {
  web: 'Web予約',
  phone: '電話',
  line: 'LINE',
  'walk-in': '予約なしの来店',
};

function stationText(f: Facility): string | null {
  if (!f.nearestStation || (f.walkMinutes ?? 0) <= 0) return null;
  return `${f.nearestStation}${f.nearestStation.includes('駅') ? '' : '駅'}から徒歩${f.walkMinutes}分`;
}

/**
 * 施設ページの「よくある質問」と FAQPage 構造化データの元。
 * 施設名で検索した人が公式サイトへ行く前に知りたいこと（2人でいくら・予約なしで入れるか等）に、
 * データで答えられるものだけ答える。値が無い項目は質問ごと出さない（「お問い合わせください」で埋めない）。
 */
export function buildFacilityFaqs(f: Facility): FacilityFaq[] {
  const faqs: FacilityFaq[] = [];
  const add = (question: string, answer: string) => faqs.push({ question, answer });

  if (f.priceMin > 0) {
    // duration が未設定の施設（宿泊プラン等）で「/null分」と出していた
    const per = f.duration > 0 ? `/${f.duration}分` : '';
    add(`${f.name}の料金はいくらですか？`, `${f.name}は${f.priceMin.toLocaleString()}円〜${per}から利用できます。`);
  }

  if (f.features.coupleOk) {
    const pair = cheapestCouplePlan(f);
    if (pair) {
      add(
        `${f.name}は2人でいくらですか？`,
        `2人で入れるいちばん安いプランは${pair.duration}分${pair.price.toLocaleString()}円（1人あたり${Math.ceil(pair.price / 2).toLocaleString()}円）です。`
      );
    }
  }

  const station = stationText(f);
  if (station) {
    add(`${f.name}の最寄り駅はどこですか？`, `${station}です。${f.accessNote ?? ''}`.trim());
  }

  add(
    `${f.name}はカップルで利用できますか？`,
    f.features.coupleOk ? 'はい、男女のカップルでも利用できます。' : 'カップル利用については施設に直接お問い合わせください。'
  );

  const booking = f.booking;
  if (booking && booking.sameDay != null) {
    add(
      `${f.name}は予約なし・当日でも入れますか？`,
      booking.sameDay
        ? '当日の予約・来店もできます。空きがない日もあるので、行く前に予約サイトで空きを確認してください。'
        : '当日の利用はできません。前日までに予約が必要です。'
    );
  }
  if (booking && booking.methods.length > 0) {
    const lead = booking.leadDays ? `${booking.leadDays}日前から予約できます。` : '';
    add(`${f.name}の予約方法は？`, `${booking.methods.map((m) => METHOD_LABELS[m]).join('・')}で予約できます。${lead}`);
  }
  if (booking?.cancelPolicy) {
    add(`${f.name}のキャンセル料はかかりますか？`, booking.cancelPolicy);
  }

  if (f.features.waterBath && f.features.waterBathTemp) {
    add(`${f.name}の水風呂は何度ですか？`, `水風呂は${f.features.waterBathTemp}℃です。`);
  }

  if (f.parking) {
    const spaces = f.parking.spaces ? `（${f.parking.spaces}台）` : '';
    add(
      `${f.name}に駐車場はありますか？`,
      (f.parking.available ? `専用の駐車場があります${spaces}。` : '専用の駐車場はありません。') + (f.parking.note ?? '')
    );
  }

  if (f.businessHours && f.businessHours !== '不明') {
    const holiday = f.holidays && f.holidays !== '不明' ? `定休日は${f.holidays}です。` : '';
    add(`${f.name}の営業時間は？`, `営業時間は${f.businessHours}です。${holiday}`);
  }

  if (f.capacity > 0) {
    add(`${f.name}の最大利用人数は？`, `最大${f.capacity}名まで利用できます。`);
  }

  return faqs;
}

/** 情報の確認日の表示。確認日が無い施設は、いつ時点の情報かを正直に出す */
export function freshnessLabel(f: Pick<Facility, 'verifiedAt' | 'updatedAt'>): { text: string; verified: boolean } {
  // 文字列から直接組み立てる（Date経由だとビルド環境のタイムゾーンで月がずれ得る）
  const ym = (d: string) => `${d.slice(0, 4)}年${Number(d.slice(5, 7))}月`;
  if (f.verifiedAt) return { text: `${ym(f.verifiedAt)}に公式情報で確認済み`, verified: true };
  return { text: `${ym(f.updatedAt)}時点の情報`, verified: false };
}
