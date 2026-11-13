import type { NextConfig } from "next";

// サイトは静的書き出しで Cloudflare Workers の静的アセットとして配信する（2026-11 に Vercel から移行）。
// 静的書き出しでは headers() / redirects() が効かないため、次のファイルで同じことをしている:
// - セキュリティヘッダー: public/_headers
// - リダイレクト（slug→ID、旧エリアslug、掲載終了施設）: scripts/generate-edge-files.mjs が public/_redirects を生成
// - 非www→www、/go/{id} の送客リダイレクト: worker/index.ts
const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  images: {
    // 画像はすでにwebp形式で保存済みのため最適化不要
    // 2026-04 に Vercel Hobby の月5,000 transformations 枠を超過して無効化。静的書き出しではそもそも使えないので、
    // 取り込み時の縮小（scripts/download-images.mjs）だけで配信する
    unoptimized: true,
  },
};

export default nextConfig;
