import { MetadataRoute } from 'next'
import facilities from '@/../data/facilities.json'
import { PREFECTURES, AREA_GROUPS } from '@/lib/types'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://saunako.jp'

  // トップページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
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
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/for-owners`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // エリアページ（全都道府県）
  const areaPages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${baseUrl}/area/${pref.code}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // サブエリアページ
  const subAreaPages: MetadataRoute.Sitemap = Object.entries(AREA_GROUPS).flatMap(
    ([prefecture, areas]) =>
      areas.map((area) => ({
        url: `${baseUrl}/area/${prefecture}/${area.slug}`,
        lastModified: new Date(),
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

  return [...staticPages, ...areaPages, ...subAreaPages, ...facilityPages]
}
