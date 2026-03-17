import { MetadataRoute } from 'next'
import facilities from '@/../data/facilities.json'
import { PREFECTURES, AREA_GROUPS, ARTICLE_CATEGORIES } from '@/lib/types'
import { getAllArticles, getAllTags, getArticlesByTag, getArticlesByCategory } from '@/lib/articles'
import { searchFacilities } from '@/lib/facilities'

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

  // カテゴリページ（記事が存在するカテゴリのみ）
  const categoryPages: MetadataRoute.Sitemap = ARTICLE_CATEGORIES
    .filter((cat) => getArticlesByCategory(cat.slug).length > 0)
    .map((cat) => ({
      url: `${baseUrl}/articles/category/${cat.slug}`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  // タグページ（記事3件以上のタグのみ — 薄いコンテンツページを除外）
  const tags = getAllTags()
  const tagPages: MetadataRoute.Sitemap = tags
    .filter((tag) => getArticlesByTag(tag).length >= 3)
    .map((tag) => ({
      url: `${baseUrl}/articles/tag/${encodeURIComponent(tag)}`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

  // 条件別ランディングページ
  const conditionSlugs = [
    'couple-ok', 'water-bath', 'self-loyly', 'outdoor-air', 'under-3000', 'under-5000',
    'late-night', '24h', 'group', 'solo',
  ]
  const conditionPages: MetadataRoute.Sitemap = conditionSlugs.map((condition) => ({
    url: `${baseUrl}/search/${condition}`,
    lastModified: latestFacilityUpdate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // エリア×条件クロスLP（施設3件以上のペアのみ）
  const conditionFilters: Record<string, Record<string, unknown>> = {
    'couple-ok': { coupleOk: true },
    'water-bath': { waterBath: true },
    'self-loyly': { selfLoyly: true },
    'outdoor-air': { outdoorAir: true },
    'under-3000': { priceMax: 3000 },
    'under-5000': { priceMax: 5000 },
    'late-night': { lateNight: true },
    '24h': { open24h: true },
    'group': { capacity: 4 },
    'solo': {},
  }
  const crossPages: MetadataRoute.Sitemap = []
  for (const cond of conditionSlugs) {
    for (const pref of PREFECTURES) {
      const count = searchFacilities({
        ...conditionFilters[cond],
        prefecture: pref.code,
      } as Parameters<typeof searchFacilities>[0]).length
      // 5件未満はリストとして薄いコンテンツになるためサイトマップから除外
      if (count >= 5) {
        crossPages.push({
          url: `${baseUrl}/search/${cond}/${pref.code}`,
          lastModified: latestFacilityUpdate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }
  }

  return [...staticPages, ...areaPages, ...subAreaPages, ...conditionPages, ...crossPages, ...facilityPages, ...articlesListPage, ...articlePages, ...categoryPages, ...tagPages]
}
