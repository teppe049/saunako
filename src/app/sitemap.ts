import { MetadataRoute } from 'next'
import facilities from '@/../data/facilities.json'
import { PREFECTURES, AREA_GROUPS, ARTICLE_CATEGORIES, PREFECTURE_GUIDES } from '@/lib/types'
import { getAllArticles, getArticlesByCategory } from '@/lib/articles'

/** YYYY-MM-DD 同士は文字列比較で新しい方が取れる */
const latestOf = (a: string, b?: string | null) => (b && b > a ? b : a)

const activeFacilities = facilities.filter((f) => !f.closedAt)

// 該当する施設が1件も無いページの lastmod。ビルド日にすると中身が変わらないのに日付だけ動くため固定する
const BASELINE_DATE = '2026-01-01'

// エリア一覧のテンプレート（施設カードの表示項目など、全エリアの本文に出る部分）を最後に変えた日。
// 施設の更新日だけでは、テンプレートの変更で全エリアの本文が変わった日が lastmod に出ない。変えたらここを書き換える
// 2026-11-12: 施設カードに市区町村を常に表示
const AREA_TEMPLATE_UPDATED_AT = '2026-11-12'

type FacilityRecord = (typeof facilities)[number]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.saunako.jp'
  const today = new Date().toISOString().slice(0, 10)

  // 閉店は一覧から施設が消える変化なので closedAt も数える（先の日付の閉店予定はまだ一覧に出ているので除く）
  const changedAt = (f: FacilityRecord) =>
    latestOf(f.updatedAt, f.closedAt && f.closedAt <= today ? f.closedAt : null)

  // 一覧ページの lastmod は、そこに載る施設が最後に変わった日にする。
  // サイト全体の最新日を全エリアに付けると、1施設の更新で全エリアの日付が毎日動き、lastmod が中身の変化を表さなくなる
  const latestChange = (list: FacilityRecord[], extra?: string) =>
    new Date(list.reduce((latest, f) => latestOf(latest, changedAt(f)), latestOf(BASELINE_DATE, extra)))

  // トップページは全国の件数・新着を出すので、サイト全体の最新日を使う
  const latestFacilityUpdate = latestChange(facilities)

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

  // エリアページ（全都道府県）。県別ガイド（PREFECTURE_GUIDES）を書き換えた日も本文の変化として数える
  const areaPages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${baseUrl}/area/${pref.code}`,
    lastModified: latestChange(
      facilities.filter((f) => f.prefecture === pref.code),
      latestOf(AREA_TEMPLATE_UPDATED_AT, PREFECTURE_GUIDES[pref.code]?.updatedAt)
    ),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // サブエリアページ。施設の振り分けは getFacilitiesByArea と同じ（prefecture と area ラベルの一致）
  const subAreaPages: MetadataRoute.Sitemap = Object.entries(AREA_GROUPS).flatMap(
    ([prefecture, areas]) =>
      areas.map((area) => ({
        url: `${baseUrl}/area/${prefecture}/${area.slug}`,
        lastModified: latestChange(
          facilities.filter((f) => f.prefecture === prefecture && f.area === area.label),
          AREA_TEMPLATE_UPDATED_AT
        ),
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
