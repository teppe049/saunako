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
      ...buildAreaRedirects(),
    ];
  },
};

// 旧エリアslug → 新エリアslug のリダイレクト（#161 サブエリア再定義）
function buildAreaRedirects() {
  const redirects: { source: string; destination: string; permanent: true }[] = [];
  const r = (pref: string, oldSlug: string, newSlug: string | null) => {
    redirects.push({
      source: `/area/${pref}/${oldSlug}`,
      destination: newSlug ? `/area/${pref}/${newSlug}` : `/area/${pref}`,
      permanent: true,
    });
  };

  // 東京: 分割されたエリア → 県ページへ
  r('tokyo', 'shinjuku-minato', null);
  r('tokyo', 'shibuya-setagaya', null);

  // 長野: slug変更
  r('nagano', 'nagano-city', 'nagano-shinano');
  r('nagano', 'matsumoto', 'matsumoto-tateshina');
  r('nagano', 'tateshina', 'matsumoto-tateshina');
  r('nagano', 'ueda', 'ueda-bessho');
  r('nagano', 'other', null);

  // 愛知: slug変更
  r('aichi', 'nagoya', 'nagoya-sakae');
  r('aichi', 'other', null);

  // 静岡: slug変更
  r('shizuoka', 'fuji', 'fuji-gotemba');
  r('shizuoka', 'hamamatsu', 'hamamatsu-kakegawa');
  r('shizuoka', 'numazu', 'hamamatsu-kakegawa');

  // 福岡: slug変更
  r('fukuoka', 'kitakyushu', 'chikuho-kitakyushu');
  r('fukuoka', 'other', null);

  // 栃木: slug変更
  r('tochigi', 'utsunomiya', 'utsunomiya-oyama');
  r('tochigi', 'nasu', 'nasu-shiobara');
  r('tochigi', 'nikko', 'nikko-kenoh');
  r('tochigi', 'other', null);

  // 福島: slug変更
  r('fukushima', 'aizu', 'aizu-hamadori');

  // 大阪: その他のslug変更
  r('osaka', 'other', 'yao-hirakata');

  // 群馬: 統合・slug変更
  r('gunma', 'takasaki', 'takasaki-maebashi');
  r('gunma', 'maebashi', 'takasaki-maebashi');
  r('gunma', 'other', 'kanra');

  // 北海道: サブエリア廃止 → 県ページへ
  for (const s of ['sapporo', 'douo', 'donan', 'dohoku', 'dotou']) r('hokkaido', s, null);

  // 宮城: サブエリア廃止
  for (const s of ['sendai', 'other']) r('miyagi', s, null);

  // 京都: サブエリア廃止
  for (const s of ['kyoto-city', 'other']) r('kyoto', s, null);

  // 新潟: サブエリア廃止
  for (const s of ['niigata-city', 'nagaoka', 'kashiwazaki', 'murakami', 'other']) r('niigata', s, null);

  return redirects;
}

export default nextConfig;
