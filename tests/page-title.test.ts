/**
 * ページタイトルの二重化テスト
 *
 * 背景: layout.tsx が title.template = '%s | サウナ子' を持つため、
 * 各ページの title に「サウナ子」を含めると「| サウナ子 | サウナ子」に二重化する（Issue #167）。
 * 2026-09-07 に /about で実際に発生していたのを発見した。
 *
 * ビルド成果物（.next/server/app/*.html）の <title> を検査する。
 * ビルド前は成果物が無いためスキップする（CIでは build 後に test が走る想定ではないが、
 * ローカルで `npm run build && npm test` すれば検出できる）。
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const APP_DIR = path.join(process.cwd(), '.next', 'server', 'app');

/** .next/server/app 配下の .html を再帰的に集める */
function collectHtml(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectHtml(full));
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const htmlFiles = collectHtml(APP_DIR);

describe('ページタイトル', () => {
  it.skipIf(htmlFiles.length === 0)(
    'title に「サウナ子」が2回以上出るページが無い',
    () => {
      const offenders: { page: string; title: string }[] = [];

      for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf-8');
        const m = html.match(/<title>([\s\S]*?)<\/title>/);
        if (!m) continue;

        const title = m[1];
        const count = (title.match(/サウナ子/g) || []).length;
        if (count >= 2) {
          offenders.push({
            page: path.relative(APP_DIR, file),
            title,
          });
        }
      }

      expect(
        offenders,
        `title が二重化しているページ:\n${offenders
          .map((o) => `  ${o.page}\n    ${o.title}`)
          .join('\n')}\n` +
          'metadata の title を { absolute: "..." } にして layout の template を回避すること。'
      ).toEqual([]);
    }
  );

  it.skipIf(htmlFiles.length === 0)('title が空のページが無い', () => {
    const empty: string[] = [];

    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf-8');
      const m = html.match(/<title>([\s\S]*?)<\/title>/);
      if (!m || m[1].trim() === '') {
        empty.push(path.relative(APP_DIR, file));
      }
    }

    expect(empty, `title が空のページ:\n${empty.join('\n')}`).toEqual([]);
  });
});
