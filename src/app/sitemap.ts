import { MetadataRoute } from 'next'
import facilities from '@/../data/facilities.json'
import { PREFECTURES, AREA_GROUPS, ARTICLE_CATEGORIES } from '@/lib/types'
import { getAllArticles, getArticlesByCategory } from '@/lib/articles'

/** YYYY-MM-DD 同士は文字列比較で新しい方が取れる */
const latestOf = (a: string, b?: string | null) => (b && b > a ? b : a)

const activeFacilities = facilities.filter((f) => !f.closedAt)

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.saunako.jp'

  // 施設データの最新更新日をサイト全体の基準にする
  const latestFacilityUpdate = facilities.reduce((latest, f) => {
    const d = new Date(f.updatedAt)
    return d > latest ? d : latest
  }, new Date('2026-01-01'))

  // トップページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestFacilityUpdate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-02-01'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-02-01'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date('2026-02-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/for-owners`,
      lastModified: new Date('2026-02-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // エリアページ（全都道府県）
  const areaPages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${baseUrl}/area/${pref.code}`,
    lastModified: latestFacilityUpdate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // サブエリアページ
  const subAreaPages: MetadataRoute.Sitemap = Object.entries(AREA_GROUPS).flatMap(
    ([prefecture, areas]) =>
      areas.map((area) => ({
        url: `${baseUrl}/area/${prefecture}/${area.slug}`,
        lastModified: latestFacilityUpdate,
        changeFrequency: 'daily' as const,
        priority: 0.85,
      }))
  )

  // 全施設ページ（閉店施設を除外）
  const facilityPages: MetadataRoute.Sitemap = activeFacilities.map((facility) => ({
    url: `${baseUrl}/facilities/${facility.id}`,
    // 公式で確認し直した日も更新とみなす（料金表示の「確認済み」が変わるため）
    lastModified: new Date(latestOf(facility.updatedAt, (facility as { verifiedAt?: string | null }).verifiedAt)),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 記事ページ
  const articles = getAllArticles()

  // 記事一覧ページ（最新記事の更新日を使用）
  const latestArticleDate = articles.length > 0
    ? new Date(articles[0].updatedAt)
    : new Date('2026-02-01')
  const articlesListPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/articles`,
      lastModified: latestArticleDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // カテゴリページ（記事が存在するカテゴリのみ）
  const categoryPages: MetadataRoute.Sitemap = ARTICLE_CATEGORIES
    .filter((cat) => getArticlesByCategory(cat.slug).length > 0)
    .map((cat) => ({
      url: `${baseUrl}/articles/category/${cat.slug}`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  // タグページ — noindex に設定済みのためサイトマップからも除外

  // 条件別ページ・クロスLP — noindex + robots.txt ブロック済みのためサイトマップからも除外

  return [...staticPages, ...areaPages, ...subAreaPages, ...facilityPages, ...articlesListPage, ...articlePages, ...categoryPages]
}
