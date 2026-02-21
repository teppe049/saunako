import { getAllArticles } from '@/lib/articles';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = getAllArticles();

  const items = articles
    .map((article) => {
      const pubDate = new Date(article.publishedAt).toUTCString();
      const link = `https://www.saunako.jp/articles/${article.slug}`;

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <description>${escapeXml(article.description)}</description>
      <link>${link}</link>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>サウナ子 | 個室サウナの記事</title>
    <description>個室・プライベートサウナに関する最新記事・ガイド</description>
    <link>https://www.saunako.jp/articles</link>
    <language>ja</language>
    <atom:link href="https://www.saunako.jp/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
