#!/usr/bin/env node
// 全MDX記事を集約して /public/llms-full.txt を生成
// 用途: AI検索エンジン（ChatGPT等）に記事全文をMarkdownで提供しAEO精度を上げる

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'content/articles');
const OUT_PATH = path.join(ROOT, 'public/llms-full.txt');
const SITE_URL = 'https://www.saunako.jp';

const CATEGORY_LABEL = {
  'area-guide': 'エリア別ガイド',
  'theme-guide': 'テーマ別ガイド',
  'beginner': '初心者ガイド',
  'review': '体験レビュー',
  'column': 'コラム',
};

function loadFacilities() {
  const raw = fs.readFileSync(path.join(ROOT, 'data/facilities.json'), 'utf-8');
  const list = JSON.parse(raw);
  return new Map(list.map((f) => [f.id, f]));
}

function stripMdxImports(content) {
  return content
    .split('\n')
    .filter((line) => !/^import\s.+from\s.+;?$/.test(line.trim()))
    .join('\n')
    .trim();
}

function inlineFacilityCards(content, facilities) {
  // <FacilityCard id={123} /> → Markdownリンク + 1行サマリ
  return content.replace(/<FacilityCard\s+id=\{(\d+)\}\s*\/>/g, (_, idStr) => {
    const id = Number(idStr);
    const f = facilities.get(id);
    if (!f) return '';
    const url = `${SITE_URL}/facilities/${id}`;
    const stationName = f.nearestStation
      ? f.nearestStation.endsWith('駅')
        ? f.nearestStation
        : `${f.nearestStation}駅`
      : null;
    const station = stationName
      ? `${stationName}${f.walkMinutes ? `徒歩${f.walkMinutes}分` : ''}`
      : f.address;
    const parts = [
      station,
      f.priceMin ? `${f.priceMin.toLocaleString()}円〜` : null,
      f.saunakoCommentShort,
    ].filter(Boolean);
    return `**[${f.name}](${url})** — ${parts.join(' / ')}`;
  });
}

function buildArticleSection(slug, data, body) {
  const url = `${SITE_URL}/articles/${slug}`;
  const category = CATEGORY_LABEL[data.category] || data.category || 'その他';
  const lines = [];
  lines.push(`# ${data.title}`);
  lines.push('');
  lines.push(`URL: ${url}`);
  lines.push(`Category: ${category}`);
  if (data.publishedAt) lines.push(`Published: ${data.publishedAt}`);
  if (data.updatedAt && data.updatedAt !== data.publishedAt) lines.push(`Updated: ${data.updatedAt}`);
  if (Array.isArray(data.tags) && data.tags.length) {
    lines.push(`Tags: ${data.tags.join(', ')}`);
  }
  lines.push('');
  if (data.description) {
    lines.push(`> ${data.description}`);
    lines.push('');
  }
  if (Array.isArray(data.faq) && data.faq.length) {
    lines.push('## よくある質問');
    lines.push('');
    for (const item of data.faq) {
      if (!item?.q) continue;
      lines.push(`**Q. ${item.q}**`);
      lines.push('');
      lines.push(`A. ${item.a ?? ''}`);
      lines.push('');
    }
  }
  lines.push(body.trim());
  return lines.join('\n');
}

function main() {
  const facilities = loadFacilities();
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .sort();

  const articles = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    return { slug, data, content };
  });

  const visible = articles
    .filter(({ data }) => data.published !== false)
    .sort((a, b) => {
      const ta = new Date(a.data.publishedAt || 0).getTime();
      const tb = new Date(b.data.publishedAt || 0).getTime();
      return tb - ta;
    });

  const header = [
    '# サウナ子（Saunako）— 記事全文集',
    '',
    `> 全国47都道府県・487施設以上の個室・プライベートサウナを比較・検索できるポータルサイトのコンテンツ全文版。AI検索エンジン向けに最適化（${visible.length}記事）。`,
    '',
    `Site: ${SITE_URL}`,
    `Index: ${SITE_URL}/llms.txt`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## 個室サウナの定義',
    '',
    '「他のグループと共有がない状態で使えるサウナ」を個室サウナと定義。屋内個室サウナ、グループ貸切サウナ、バレルサウナ・サウナ小屋（常設・貸切）、宿泊施設の日帰り単独予約可能なサウナを掲載対象としている。テントサウナ・キャンプ場サウナ・大型スパの共用サウナは対象外。',
    '',
    '---',
    '',
  ].join('\n');

  const sections = visible.map(({ slug, data, content }) => {
    const stripped = stripMdxImports(content);
    const inlined = inlineFacilityCards(stripped, facilities);
    return buildArticleSection(slug, data, inlined);
  });

  const output = header + sections.join('\n\n---\n\n') + '\n';
  fs.writeFileSync(OUT_PATH, output, 'utf-8');

  const sizeKb = (fs.statSync(OUT_PATH).size / 1024).toFixed(1);
  console.log(`✅ Generated ${OUT_PATH}`);
  console.log(`   Articles: ${visible.length}`);
  console.log(`   Size: ${sizeKb} KB`);
}

main();
