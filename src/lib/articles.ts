import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { ArticleMeta, ARTICLE_CATEGORIES, FaqEntry } from './types';
import { mdxComponents } from '@/components/MDXComponents';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

function getArticleFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith('.mdx'));
}

const isDev = process.env.NODE_ENV === 'development';

function parseArticleMeta(slug: string, content: string, data: Record<string, unknown>): ArticleMeta {
  const { minutes } = readingTime(content);
  return {
    slug,
    title: (data.title as string) || '',
    description: (data.description as string) || '',
    category: (data.category as string) || 'column',
    tags: (data.tags as string[]) || [],
    publishedAt: (data.publishedAt as string) || '',
    updatedAt: (data.updatedAt as string) || (data.publishedAt as string) || '',
    thumbnail: (data.thumbnail as string) || '/saunako-avatar.webp',
    author: (data.author as string) || 'サウナ子',
    facilityIds: (data.facilityIds as number[]) || [],
    readingTime: Math.ceil(minutes),
    published: data.published !== false,
    faq: (data.faq as FaqEntry[]) || undefined,
  };
}

export function getAllArticles(): ArticleMeta[] {
  const files = getArticleFiles();
  const articles = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    return parseArticleMeta(slug, content, data);
  });
  const sorted = articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  if (isDev) return sorted;
  return sorted.filter((a) => a.published);
}

export async function getArticleBySlug(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const meta = parseArticleMeta(slug, content, data);

  if (!isDev && !meta.published) return null;

  const { content: compiledContent } = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return { meta, content: compiledContent };
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getArticlesByFacilityId(facilityId: number): ArticleMeta[] {
  return getAllArticles().filter((a) => a.facilityIds.includes(facilityId));
}

export function getAllSlugs(): string[] {
  if (isDev) {
    return getArticleFiles().map((file) => file.replace(/\.mdx$/, ''));
  }
  return getAllArticles().map((a) => a.slug);
}

export function getAllTags(): string[] {
  const articles = getAllArticles();
  const tagSet = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getArticlesByTag(tag: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.tags.includes(tag));
}

export function getAllCategories() {
  return ARTICLE_CATEGORIES;
}

export function extractHeadings(raw: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  while ((match = headingRegex.exec(raw)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-');
    headings.push({ id, text, level: match[1].length });
  }
  return headings;
}

export function getRelatedArticles(
  currentSlug: string,
  currentMeta: { category: string; facilityIds: number[]; tags?: string[] },
  limit = 6
): ArticleMeta[] {
  const all = getAllArticles().filter((a) => a.slug !== currentSlug);
  const currentFacilityIds = new Set(currentMeta.facilityIds);
  const currentTags = new Set(currentMeta.tags || []);

  const scored = all.map((article) => {
    const sharedFacilities = article.facilityIds.filter((id) => currentFacilityIds.has(id)).length;
    const sharedTags = article.tags.filter((t) => currentTags.has(t)).length;
    const sameCategory = article.category === currentMeta.category;
    // Priority: shared facilities (x100) > shared tags (x20) > same category (x10)
    const score = sharedFacilities * 100 + sharedTags * 20 + (sameCategory ? 10 : 0);
    return { article, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.article);
}

export function getRawContent(slug: string): string | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);
  return content;
}

export function extractPlainText(rawMdx: string): string {
  return rawMdx
    .replace(/<[^>]+>/g, '')               // HTMLタグ除去
    .replace(/<FacilityCard[^/]*\/>/g, '')  // MDXコンポーネント除去
    .replace(/!\[.*?\]\(.*?\)/g, '')        // 画像除去
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')  // リンクをテキストのみに
    .replace(/^#{1,6}\s+/gm, '')            // heading記号除去
    .replace(/[*_~`>|]/g, '')               // マークダウン装飾除去
    .replace(/^-{3,}$/gm, '')              // 水平線除去
    .replace(/\n{2,}/g, '\n')              // 連続改行を1つに
    .trim();
}
