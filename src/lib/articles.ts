import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { ArticleMeta, ARTICLE_CATEGORIES } from './types';
import { mdxComponents } from '@/components/MDXComponents';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

function getArticleFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith('.mdx'));
}

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
  return articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getArticleBySlug(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const meta = parseArticleMeta(slug, content, data);

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
  return getArticleFiles().map((file) => file.replace(/\.mdx$/, ''));
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

export function getRawContent(slug: string): string | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);
  return content;
}
