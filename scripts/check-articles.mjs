#!/usr/bin/env node
/**
 * 記事のステータス一覧を表示するスクリプト
 * Usage: node scripts/check-articles.mjs
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const dir = path.join(process.cwd(), 'content/articles');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));

console.log(`\n📝 記事一覧 (${files.length}件)\n`);
console.log('Status   | Thumbnail | Slug');
console.log('---------|-----------|-----');

for (const f of files) {
  const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
  const slug = f.replace('.mdx', '');
  const published = data.published !== false;
  const hasOwnThumb = Boolean(data.thumbnail) && data.thumbnail.startsWith('/articles/');
  const statusIcon = published ? 'PUBLIC' : 'DRAFT ';
  const thumbIcon = hasOwnThumb ? 'OK  ' : data.thumbnail ? 'FACL' : 'NONE';
  console.log(`${statusIcon}   | ${thumbIcon}      | ${slug}`);
}

console.log('\n--- Legend ---');
console.log('Status: PUBLIC = 公開, DRAFT = 非公開');
console.log('Thumbnail: OK = 専用サムネ, FACL = 施設画像流用, NONE = 未設定');
console.log('');
