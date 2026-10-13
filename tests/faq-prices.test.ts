/**
 * エリアページのFAQに直書きされた「施設名（X円〜/Y分」が facilities.json と一致しているかのゲート。
 *
 * 背景: FAQ本文は types.ts / subAreaMeta.ts に文字列で直書きされており、施設の料金改定や
 * 閉店をデータに反映してもFAQだけ古いまま残る（料金の誤りは9/6・9/30にも別の場所で発生）。
 * priceMin は duration 分の料金なので、金額と時間の組で照合する。
 */
import { describe, expect, it } from 'vitest';
import facilitiesJson from '../data/facilities.json';
import { PREFECTURE_GUIDES, type Facility } from '@/lib/types';
import { SUB_AREA_GUIDES } from '@/lib/subAreaMeta';

const facilities = facilitiesJson as Facility[];

// 「施設名（6,000円〜/90分」の形。施設名は直前の読点・句点・括弧・文頭で区切る
const PRICE_MENTION_RE = /([^、。（）\s][^、。（）]*?)（(?:[^）]*?・)?([\d,]+)円〜\/(\d+)分/g;

function faqAnswers(): { source: string; answer: string }[] {
  const out: { source: string; answer: string }[] = [];
  for (const [key, guide] of Object.entries(PREFECTURE_GUIDES)) {
    for (const faq of guide.extraFaqs) {
      if (typeof faq.answer === 'string') out.push({ source: `PREFECTURE_GUIDES.${key}`, answer: faq.answer });
    }
  }
  for (const [key, guide] of Object.entries(SUB_AREA_GUIDES)) {
    for (const faq of guide.extraFaqs) out.push({ source: `SUB_AREA_GUIDES.${key}`, answer: faq.answer });
  }
  return out;
}

function findFacility(rawName: string): Facility | undefined {
  const name = rawName.replace(/^(と|や|は|が|も|なら|次いで|同じ\S*?でも)\s*/, '').trim();
  return facilities.find((f) => f.name === name);
}

function matchesData(f: Facility, price: number, duration: number): boolean {
  if (f.priceMin === price && f.duration === duration) return true;
  return (f.plans ?? []).some((p) => p.price === price && p.duration === duration);
}

describe('FAQの料金表記', () => {
  const mentions = faqAnswers().flatMap(({ source, answer }) =>
    [...answer.matchAll(PRICE_MENTION_RE)].map((m) => ({
      source,
      name: m[1],
      price: Number(m[2].replace(/,/g, '')),
      duration: Number(m[3]),
    }))
  );

  it('照合対象が抽出できている（正規表現が壊れていない）', () => {
    expect(mentions.filter((m) => findFacility(m.name)).length).toBeGreaterThan(10);
  });

  it('施設名つきの料金は facilities.json の priceMin/duration かプランのどれかと一致し、閉店施設を含まない', () => {
    const errors = mentions.flatMap((m) => {
      const f = findFacility(m.name);
      if (!f) return [];
      if (f.closedAt) return [`${m.source}: ${f.name} は閉店済み（${f.closedAt}）`];
      if (!matchesData(f, m.price, m.duration)) {
        return [`${m.source}: ${f.name} ${m.price}円/${m.duration}分 がデータにない（priceMin ${f.priceMin}円/${f.duration}分）`];
      }
      return [];
    });
    expect(errors).toEqual([]);
  });
});
