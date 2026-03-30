import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/go/', '/*/opengraph-image', '/opengraph-image'],
    },
    sitemap: ['https://www.saunako.jp/sitemap.xml'],
  }
}
