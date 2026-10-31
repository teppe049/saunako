/**
 * 施設ページを「公式の次に詳しいページ」にするための追加データ（仕様書 施策A・C、2026-11-01）のゲート。
 *
 * - 予約の仕方・向き不向き・実訪レポは、料金表と確認日がそろった施設にだけ入れる（中途半端に増やすと効果が測れない）
 * - 実訪レポは行った施設にだけ書く。訪問日・プラン・払った額・本文が無いものは載せない
 * - FAQ はデータで答えられる質問だけを出す
 */
import { describe, expect, it } from 'vitest';
import facilitiesJson from '../data/facilities.json';
import type { Facility } from '@/lib/types';
import { buildFacilityFaqs, freshnessLabel } from '@/lib/facilityFaq';
import { extractPriceLines, htmlToText } from '../scripts/freshness-watch.mjs';

const facilities = facilitiesJson as Facility[];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const METHODS = new Set(['web', 'phone', 'line', 'walk-in']);

const base: Facility = facilities.find((f) => f.plans && f.plans.some((p) => p.capacity >= 2) && f.features.coupleOk)!;

describe('施設の追加データ（facilities.json）', () => {
  const enriched = facilities.filter((f) => f.booking || f.fitFor?.length || f.notFitFor?.length || f.visits?.length);

  it('予約・向き不向き・実訪レポを入れた施設は、料金表（plans）と確認日（verifiedAt）もそろっている', () => {
    const bad = enriched.filter((f) => !f.verifiedAt || !f.plans || f.plans.length === 0).map((f) => f.id);
    expect(bad).toEqual([]);
  });

  it('booking.methods は既知の値だけ・1つ以上', () => {
    const bad = facilities
      .filter((f) => f.booking && (f.booking.methods.length === 0 || f.booking.methods.some((m) => !METHODS.has(m))))
      .map((f) => f.id);
    expect(bad).toEqual([]);
  });

  it('実訪レポは訪問日・プラン・払った額・人数・本文がある', () => {
    const bad = facilities.flatMap((f) =>
      (f.visits ?? [])
        .filter((v) => !DATE_RE.test(v.date) || !v.plan || !(v.paid > 0) || !(v.people > 0) || v.body.trim().length < 100)
        .map(() => f.id)
    );
    expect(bad).toEqual([]);
  });
});

describe('buildFacilityFaqs', () => {
  it('男女OKで2名以上のプランがある施設は「2人でいくら」に総額と時間で答える', () => {
    const faq = buildFacilityFaqs(base).find((q) => q.question.endsWith('2人でいくらですか？'));
    expect(faq?.answer).toMatch(/^2人で入れるいちばん安いプランは\d+分[\d,]+円（1人あたり[\d,]+円）です。$/);
  });

  it('男女不可の施設には「2人でいくら」を出さない', () => {
    const f = { ...base, features: { ...base.features, coupleOk: false } };
    expect(buildFacilityFaqs(f).some((q) => q.question.includes('2人でいくら'))).toBe(false);
  });

  it('予約データが無い施設には予約・キャンセルの質問を出さない', () => {
    const f = { ...base, booking: null };
    expect(buildFacilityFaqs(f).some((q) => /予約|キャンセル/.test(q.question))).toBe(false);
  });

  it('予約データがあれば当日可否・予約方法・キャンセル規定に答える', () => {
    const f: Facility = {
      ...base,
      booking: { methods: ['web', 'phone'], leadDays: 30, sameDay: true, cancelPolicy: '前日から50%、当日は100%です。' },
    };
    const qs = buildFacilityFaqs(f);
    expect(qs.find((q) => q.question.includes('当日'))?.answer).toContain('当日の予約・来店もできます');
    expect(qs.find((q) => q.question.includes('予約方法'))?.answer).toBe('Web予約・電話で予約できます。30日前から予約できます。');
    expect(qs.find((q) => q.question.includes('キャンセル'))?.answer).toBe('前日から50%、当日は100%です。');
  });

  it('徒歩分数が無い施設は「徒歩null分」と書かず、最寄り駅の質問ごと出さない', () => {
    const f = { ...base, walkMinutes: null };
    const qs = buildFacilityFaqs(f);
    expect(qs.some((q) => q.question.includes('最寄り駅'))).toBe(false);
    expect(JSON.stringify(qs)).not.toContain('null');
  });

  it('全施設で null / undefined を含む回答を作らない', () => {
    const bad = facilities.filter((f) => /null|undefined|NaN/.test(JSON.stringify(buildFacilityFaqs(f)))).map((f) => f.id);
    expect(bad).toEqual([]);
  });
});

describe('freshnessLabel', () => {
  it('確認日があれば「確認済み」、無ければ更新月を「時点の情報」として出す', () => {
    expect(freshnessLabel({ verifiedAt: '2026-10-29', updatedAt: '2026-03-01' })).toEqual({ text: '2026年10月に公式情報で確認済み', verified: true });
    expect(freshnessLabel({ verifiedAt: null, updatedAt: '2026-03-01' })).toEqual({ text: '2026年3月時点の情報', verified: false });
  });
});

describe('freshness-watch の料金行抽出', () => {
  it('円・¥ を含む行だけを、重複なしで取り出す', () => {
    const html = '<ul><li>定員 2名 120分 8,000円</li><li>定員 2名 120分 8,000円</li><li>¥3,300 / 60分</li><li>アクセス 徒歩5分</li></ul><script>var p="9,999円"</script>';
    expect(extractPriceLines(htmlToText(html))).toEqual(['定員 2名 120分 8,000円', '¥3,300 / 60分']);
  });
});
