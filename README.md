# サウナ子（saunako.jp）

個室サウナ検索サイト。https://www.saunako.jp

Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS v4。施設データは `data/facilities.json`、記事は `content/articles/*.mdx`。

## 開発

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build      # out/ に静的書き出し
```

## 配信

Cloudflare Workers で配信している（2026-11 に Vercel から移行）。

- サイトは全ページ静的書き出し（`output: 'export'`）。静的ファイルは Worker を通らずに返る
- `worker/index.ts` は静的ファイルが無いリクエストだけを受ける（`/go/{id}` の送客リダイレクトなど）
- リダイレクトは `public/_redirects`（ビルド前に `scripts/generate-edge-files.mjs` が生成）、ヘッダーは `public/_headers`
- main に push すると GitHub Actions がテスト・ビルドのあと本番へデプロイする（`.github/workflows/ci.yml`）

詳しい運用ルールは [CLAUDE.md](./CLAUDE.md)、仕組みの解説は [docs/technical-knowledge-guide.md](./docs/technical-knowledge-guide.md)。
