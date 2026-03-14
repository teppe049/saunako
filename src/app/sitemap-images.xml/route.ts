import facilities from '@/../data/facilities.json'

const activeFacilities = facilities.filter((f) => !f.closedAt)

export function GET() {
  const baseUrl = 'https://www.saunako.jp'

  const urlEntries = activeFacilities
    .filter((f) => f.images.length > 0)
    .map((f) => {
      const imageEntries = f.images
        .map(
          (img) => `      <image:image>
        <image:loc>${img.startsWith('http') ? img : `${baseUrl}${img}`}</image:loc>
        <image:title>${escapeXml(f.name)} 個室サウナ</image:title>
      </image:image>`
        )
        .join('\n')

      return `  <url>
    <loc>${baseUrl}/facilities/${f.id}</loc>
${imageEntries}
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
