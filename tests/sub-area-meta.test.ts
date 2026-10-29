/**
 * サブエリアの title / description に施設数を直書きしていないかのゲート。
 *
 * 背景: 「○選」「全○施設」「カップル利用OK○施設」を文字列で書いていたため、施設の追加・閉店で
 * 六本木17→18・ミナミ6→7・つくば3→2のずれが出ていた（10/29）。件数は {count} / {coupleCount} で書く。
 * あわせて、存在しないエリアslugのキー（旧 tochigi/utsunomiya）は誰にも使われないので検出する。
 */
import { describe, expect, it } from 'vitest';
import { SUB_AREA_META } from '@/lib/subAreaMeta';
import { getAreaBySlug } from '@/lib/facilities';

const FIXED_COUNT_RE = /\d+選|全\d+施設|OK\d+施設|\d+施設中\d+施設/;

describe('SUB_AREA_META', () => {
  it('施設数を直書きしていない', () => {
    const hits = Object.entries(SUB_AREA_META)
      .flatMap(([key, meta]) => [meta.title, meta.description].map((text) => ({ key, text })))
      .filter(({ text }) => FIXED_COUNT_RE.test(text))
      .map(({ key, text }) => `${key}: ${text.match(FIXED_COUNT_RE)?.[0]}`);
    expect(hits).toEqual([]);
  });

  it('キーが実在するエリアを指している', () => {
    const missing = Object.keys(SUB_AREA_META).filter((key) => {
      const [prefecture, slug] = key.split('/');
      return !getAreaBySlug(prefecture, slug);
    });
    expect(missing).toEqual([]);
  });
});
