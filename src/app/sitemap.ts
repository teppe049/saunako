import { MetadataRoute } from 'next'
import facilities from '@/../data/facilities.json'

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
  ]

  // エリアページ（tokyo, osaka）
  const areaPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/area/tokyo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/area/osaka`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // 全施設ページ
  const facilityPages: MetadataRoute.Sitemap = facilities.map((facility) => ({
    url: `${baseUrl}/facilities/${facility.slug}`,
    lastModified: new Date(facility.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...areaPages, ...facilityPages]
}
