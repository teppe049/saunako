import { describe, expect, it } from 'vitest';
import {
  aggregate,
  band,
  buildCompare,
  buildNoise,
  normalizePaths,
  periodsFromRelease,
  quantile,
  toPath,
} from '../scripts/seo-analytics.mjs';

const row = (path: string, impressions: number, clicks = 0, position = 5) => ({ path, impressions, clicks, position });

describe('toPath', () => {
  it('saunako のパスに直し、末尾の / を落とす', () => {
    expect(toPath('https://www.saunako.jp/area/tokyo/')).toBe('/area/tokyo');
    expect(toPath('https://saunako.jp/')).toBe('/');
  });
  it('# 付き（サイトリンク）と他ホストは null', () => {
    expect(toPath('https://www.saunako.jp/articles/aichi-private-sauna-guide#sauna-m')).toBeNull();
    expect(toPath('https://stg.saunako.jp/area/tokyo')).toBeNull();
  });
  it('normalizePaths は URL もパスも受ける', () => {
    expect(normalizePaths('/area/chiba/, https://www.saunako.jp/area/okayama')).toEqual(['/area/chiba', '/area/okayama']);
  });
});

describe('periodsFromRelease', () => {
  it('反映日を除いた前後 28 日', () => {
    expect(periodsFromRelease('2026-11-12')).toEqual({
      before: ['2026-10-15', '2026-11-11'],
      after: ['2026-11-13', '2026-12-10'],
    });
  });
});

describe('aggregate / quantile / band', () => {
  it('順位は imp で重み付けする', () => {
    expect(aggregate([row('/a', 100, 5, 4), row('/b', 300, 3, 8)])).toEqual({ clicks: 8, impressions: 400, ctr_pct: 2, position: 7 });
  });
  it('分位点は線形補間', () => {
    expect(quantile([4, 1, 3, 2], 0.5)).toBe(2.5);
    expect(quantile([], 0.5)).toBeNull();
  });
  it('順位帯', () => {
    expect(band(3.4)).toBe('1-3');
    expect(band(10.4)).toBe('7-10');
    expect(band(20.6)).toBe('21+');
  });
});

describe('buildCompare', () => {
  const before: [string, string] = ['2026-10-01', '2026-10-28'];
  const after: [string, string] = ['2026-10-29', '2026-11-25'];
  const pageRows = {
    before: [row('/area/okayama', 100, 4), row('/area/hiroshima', 200, 10), row('/area/osaka', 200, 10), row('/area/new', 0)],
    after: [row('/area/okayama', 300, 8), row('/area/hiroshima', 220, 11), row('/area/osaka', 180, 9), row('/area/new', 500)],
  };

  it('net は対象の比 ÷ 対照の比。対照は before の最初の週に出ていたページだけ', () => {
    const result = buildCompare({
      before,
      after,
      pageRows,
      established: new Set(['/area/okayama', '/area/hiroshima', '/area/osaka']),
      targets: ['/area/okayama'],
      controlPrefix: '/area/',
    });
    expect(result.control.pages).toBe(2);
    expect(result.control.imp_ratio).toBe(1);
    expect(result.targets[0].imp_ratio).toBe(3);
    expect(result.targets[0].net).toEqual({ imp: 3, clicks: 2 });
    // 対照が 300 imp 以上・2 ページなので「3 ページ未満」の警告が出る
    expect(result.warnings.join()).toContain('対照が 3 ページ未満');
  });

  it('基準が 0 のページは net を null にする（0 だと激減に読める）', () => {
    const result = buildCompare({
      before,
      after,
      pageRows,
      established: new Set(['/area/hiroshima', '/area/osaka']),
      targets: ['/area/new'],
      controlPrefix: '/area/',
    });
    expect(result.targets[0].net.imp).toBeNull();
  });
});

describe('buildNoise', () => {
  it('自分を除いた同じ群の比で割る', () => {
    const result = buildNoise({
      before: ['2026-10-01', '2026-10-28'],
      after: ['2026-10-29', '2026-11-25'],
      pageRows: {
        before: [row('/area/a', 100), row('/area/b', 100), row('/area/c', 100)],
        after: [row('/area/a', 200), row('/area/b', 100), row('/area/c', 100)],
      },
      established: new Set(['/area/a', '/area/b', '/area/c']),
      prefix: '/area/',
      minImp: 100,
    });
    const a = result.pages.find((p: { page: string }) => p.page === '/area/a');
    expect(a.net).toBe(2);
    expect(result.net.n).toBe(3);
  });
});
