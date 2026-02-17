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


const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return buildFacilityRedirects();
  },
};

export default nextConfig;
