/**
 * 料金データに相席（他の利用者と共用）プランが入っていないかのゲート。
 *
 * 背景: 掲載基準は「他のグループと共有がない状態で使えるサウナ」。なのに priceMin が相席の料金に
 * なっていた施設が5件あり（10/29: 蔵サウナ900円・NAYA 3,000円・タスサウナ2,200円・かめやま2,280円・
 * kaveri 3,850円）、格安記事で「全国最安」「1人90円」と紹介していた。相席の料金は note に書き、
 * plans と priceMin には貸切・個室の料金だけを入れる。
 */
import { describe, expect, it } from 'vitest';
import facilitiesJson from '../data/facilities.json';
import type { Facility } from '@/lib/types';

const facilities = facilitiesJson as Facility[];
const SHARED_RE = /相席|共用|シェア/;

describe('相席プラン', () => {
  it('plans に相席・共用のプランがない', () => {
    const hits = facilities
      .filter((f) => !f.closedAt)
      .flatMap((f) => (f.plans ?? []).filter((p) => SHARED_RE.test(p.name)).map((p) => `${f.id} ${f.name}: ${p.name}`));
    expect(hits).toEqual([]);
  });
});
