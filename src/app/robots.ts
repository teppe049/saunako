import { MetadataRoute } from 'next'

// AIアシスタント経由の流入がOrganicの約9%を占めるため、AI検索・学習クローラーを明示的に全面許可する。
// 名前付きで列挙しておくことで、将来ワイルドカードのデフォルト挙動が変わっても露出が担保される。
const AI_CRAWLERS = [
  'GPTBot',          // OpenAI（学習）
  'OAI-SearchBot',   // OpenAI（ChatGPT検索）
  'ChatGPT-User',    // ChatGPTのユーザー起点フェッチ
  'ClaudeBot',       // Anthropic（学習）
  'Claude-Web',      // Anthropic（Claude検索）
  'anthropic-ai',    // Anthropic（旧UA）
  'PerplexityBot',   // Perplexity
  'Perplexity-User', // Perplexityのユーザー起点フェッチ
  'Google-Extended', // Google Gemini/Vertex（学習）
  'Applebot-Extended', // Apple Intelligence（学習）
  'CCBot',           // Common Crawl
  'Bytespider',      // ByteDance
  'Amazonbot',       // Amazon
]

// 全クローラー共通の非公開・重複回避パス。
const DISALLOW = ['/go/', '/search', '/*/opengraph-image']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: ['https://www.saunako.jp/sitemap.xml'],
  }
}
