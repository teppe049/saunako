import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/go/',
    },
    sitemap: ['https://www.saunako.jp/sitemap.xml'],
  }
}
