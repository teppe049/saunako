import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// facilities.json を読み込む
function loadFacilities(): { id: number; slug: string; images: string[] }[] {
  const filePath = path.join(process.cwd(), "data", "facilities.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// facilities.json から slug → id のリダイレクトマッピングを生成
function buildFacilityRedirects() {
  return loadFacilities().map((f) => ({
    source: `/facilities/${encodeURIComponent(f.slug)}`,
    destination: `/facilities/${f.id}`,
    permanent: true, // 308 Permanent Redirect
  }));
}


const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Vercel Hobby: 月5,000 transformations 無料枠
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  async redirects() {
    return [
      // 非www → www リダイレクト（canonical統一）
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'saunako.jp' }],
        destination: 'https://www.saunako.jp/:path*',
        permanent: true,
      },
      ...buildFacilityRedirects(),
    ];
  },
};

export default nextConfig;
