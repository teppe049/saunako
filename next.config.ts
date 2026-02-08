import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// facilities.json から slug → id のリダイレクトマッピングを生成
function buildFacilityRedirects() {
  const filePath = path.join(process.cwd(), "data", "facilities.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const facilities: { id: number; slug: string }[] = JSON.parse(raw);

  return facilities.map((f) => ({
    source: `/facilities/${encodeURIComponent(f.slug)}`,
    destination: `/facilities/${f.id}`,
    permanent: true, // 308 Permanent Redirect
  }));
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "coubic-images.s3.ap-northeast-1.amazonaws.com" },
      { hostname: "solosauna-tune.com" },
      { hostname: "sauna-muchu.jp" },
      { hostname: "i0.wp.com" },
      { hostname: "haaave.net" },
      { hostname: "teppen-saunadojo.com" },
      { hostname: "hubhub.jp" },
      { hostname: "images.microcms-assets.io" },
      { hostname: "cdn.amebaowndme.com" },
      { hostname: "rokusauna.com" },
      { hostname: "static.wixstatic.com" },
    ],
  },
  async redirects() {
    return buildFacilityRedirects();
  },
};

export default nextConfig;
