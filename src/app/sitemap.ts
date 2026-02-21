import { MetadataRoute } from 'next'
import facilities from '@/../data/facilities.json'
import { PREFECTURES, AREA_GROUPS, ARTICLE_CATEGORIES } from '@/lib/types'
import { getAllArticles } from '@/lib/articles'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://saunako.jp'

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
      url: `${baseUrl}/search`,
      lastModified: latestFacilityUpdate,
      changeFrequency: 'daily',
      priority: 0.9,
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

  // 全施設ページ
  const facilityPages: MetadataRoute.Sitemap = facilities.map((facility) => ({
    url: `${baseUrl}/facilities/${facility.id}`,
    lastModified: new Date(facility.updatedAt),
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

  // カテゴリページ
  const categoryPages: MetadataRoute.Sitemap = ARTICLE_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/articles/category/${cat.slug}`,
    lastModified: latestArticleDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...areaPages, ...subAreaPages, ...facilityPages, ...articlesListPage, ...articlePages, ...categoryPages]
}
