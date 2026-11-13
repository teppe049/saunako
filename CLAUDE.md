# Saunako - プロジェクト指示書

個室サウナ検索プラットフォーム。Next.js 16 + React 19 + TypeScript + Tailwind CSS v4。
デプロイ先: Cloudflare Workers（Next.js の静的書き出し + 小さな Worker。2026-11 に Vercel から移行）/ ドメイン: www.saunako.jp

## 「個室サウナ」の定義と掲載基準

**「他のグループと共有がない状態で使えるサウナ」= 個室サウナ**

### 掲載対象
- 屋内個室サウナ / グループ貸切サウナ → **掲載**
- バレルサウナ・サウナ小屋（常設・貸切）→ **掲載**（タグで区別）
- 宿泊施設のサウナ（日帰りプランあり）→ **掲載**（サウナ単体で予約・利用できる場合のみ）
- 宿泊施設のサウナ（宿泊者専用）→ **掲載しない**
- テントサウナ・キャンプ場 → **掲載しない**
- 大型スパ・スーパー銭湯の共用サウナ → **掲載しない**

## コマンド

| Command | Description |
|---------|-------------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 静的書き出し（`out/`）。`prebuild` で `_redirects` と `/go` の転送先を生成 |
| `env -u CLOUDFLARE_API_TOKEN npm run deploy` | 手動デプロイ。普段は main への push で GitHub Actions（`ci.yml` の deploy ジョブ）が自動でデプロイする（secrets.CLOUDFLARE_API_TOKEN が未登録の間は省略される。発行手順は `docs/cloudflare-api-token-setup.md`）。`env -u` は必須（環境変数のトークンは会社アカウント用。saunako は個人ログインの My Account で、`wrangler.jsonc` の account_id で固定） |
| `npm run start` / `preview` | `wrangler dev` でローカル配信。**macOS では静的ファイル数が多すぎて落ちる**（spawn EBADF）。確認は workers.dev へのデプロイで行う |
| `npm run lint` | ESLint チェック（Next.js core-web-vitals + TypeScript） |
| `npm run typecheck` | `tsc --noEmit` で型チェック |
| `npm test` | Vitest（`src/**/*.test.ts` + `tests/**/*.test.ts`）。`tests/facilities-data.test.ts` が facilities.json の整合性ゲート |

### 運用スクリプト (`scripts/`)

| Script | Description |
|--------|-------------|
| `node scripts/indexnow.mjs` | IndexNow API でURL送信 |
| `node scripts/generate-x-posts.js` | X(Twitter)投稿文の自動生成 |
| `node scripts/download-images.mjs` | 施設画像ダウンロード（幅1600pxに自動リサイズ） |
| `node scripts/resize-oversized-images.mjs` | 既存画像のうち幅1600px超をリサイズ（冪等・`--dry-run`可） |
| `node scripts/check-articles.mjs` | 記事データの整合性チェック |
| `node scripts/capture-x-header.mjs` | Xヘッダー画像キャプチャ |
| `node scripts/preview-images.mjs` | X投稿プレビュー（week/日付/施設ID指定可） |
| `node scripts/check-x-weight.js` | X投稿ウェイトチェック（hook用） |
| `node scripts/owner-report.mjs` | 施設オーナー向け送客レポート（GA4の閲覧・予約/公式/電話クリックを月別集計）。`--month YYYY-MM` / `--top N` / `--id 施設ID`で1施設の送付用。2026-09以降のみ（facility_idの登録が9/2） |
| `node scripts/sync-suggest-data.mjs` | 検索サジェスト（`src/lib/suggest-data.json`）の施設名とエリア別件数を facilities.json から作り直す。施設の追加・閉店・エリア変更のあとに実行（`tests/closed-facilities.test.ts` がずれを検出）。駅名リストは手で正規化したものなので触らない |
| `node scripts/freshness-watch.mjs` | 公式サイトの料金記載の変化と閉店の兆候を検出（週1回）。基準は `data/freshness/snapshot.json`、結果は `docs/freshness-report.md` に追記。差分を公式で確認して facilities.json と `verifiedAt` を直す。`--dry-run` / `--id` / `--limit` 指定時は書き込まない |
| `node scripts/generate-edge-files.mjs` | `public/_redirects`（slug→ID・旧エリアslug・掲載終了施設の恒久リダイレクト）と `worker/generated/go-targets.json`（`/go/{id}` の転送先）を facilities.json から生成。prebuild で自動実行・gitignore 済み。**掲載終了施設のリダイレクトを足すときはここに書く** |
| `node scripts/coubic-discover.mjs` | STORES予約（旧Coubic）の予約ページ/コースIDを採取して `data/coubic.json` を再生成（空き状況表示用。施設追加・予約URL変更時に実行） |

## 環境変数

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 計測ID
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - Google AdSense クライアントID
- 地図はLeaflet + OpenStreetMapのためAPIキー不要

## テックスタック

- **Next.js 16** (App Router, React Compiler有効)
- **React 19** (Server Components優先)
- **TypeScript** (strict)
- **Tailwind CSS v4** + CSS Variables (`globals.css`)
- **ESLint** (Next.js core-web-vitals + TypeScript rules)
- **Leaflet + react-leaflet + OSMタイル** (`tile.openstreetmap.jp`、APIキー不要。Google Mapsは未使用)
- **データ**: 静的JSON (`data/facilities.json`, 47都道府県・約490施設。実数は `getAllFacilities().length` で参照し、文書やUIに固定値を書かない)
- **デザイン**: Pencil MCP (`.pen`ファイル)

## ディレクトリ構成

```
src/
├── app/                      # App Router ページ
│   ├── page.tsx              # トップページ
│   ├── search/               # 検索結果（ページは1枚。絞り込みはブラウザの SearchView）
│   │   └── [condition]/      # 条件別（カップル・水風呂など）× 都道府県の静的ページ
│   ├── area/[prefecture]/    # エリア別一覧（47都道府県）
│   ├── facilities/[id]/      # 施設詳細
│   ├── articles/             # 記事一覧・詳細（MDXベース）
│   │   ├── [slug]/           # 個別記事
│   │   ├── category/         # カテゴリ別
│   │   └── tag/              # タグ別
│   ├── favorites/            # お気に入り（?ids= の共有リストもブラウザで描画）
│   ├── pick/                 # 行きたい候補の共有（/pick?ids=1-2。旧 /pick/1-2 は Worker が転送）
│   ├── about/                # サイトについて
│   ├── for-owners/           # 施設オーナー向けページ
│   ├── faq/                  # FAQ
│   ├── privacy/              # プライバシーポリシー
│   ├── terms/                # 利用規約
│   ├── feed.xml/             # RSSフィード
│   ├── facilities-data.json/ # 営業中の全施設 JSON（ブラウザ描画の画面が読む。ビルド時生成）
│   ├── sitemap.ts            # サイトマップ生成（ビルド時）
│   ├── sitemap-images.xml/   # 画像サイトマップ
│   └── robots.ts             # robots.txt生成
├── components/               # 共通UIコンポーネント
├── lib/                      # ユーティリティ・型定義・ストア
│   ├── analytics.ts          # GA4トラッキング
│   ├── adsense.ts            # AdSense設定
│   ├── articles.ts           # MDX記事のローダー
│   ├── facilities.ts         # 施設データのローダー（facilities.json を import。サーバー側＝ビルド時専用）
│   ├── facilitySearch.ts     # 絞り込み・並べ替えの純関数（ブラウザからも使う）
│   ├── facilitiesClient.ts   # ブラウザ用の施設データ取得（/facilities-data.json）
│   ├── favoritesStore.ts     # お気に入りストア（localStorage）
│   ├── distance.ts           # 距離計算
│   └── types.ts              # 共通型定義
data/
└── facilities.json           # 施設マスタデータ（約490施設・閉店分は closedAt で除外）
content/
└── articles/                 # MDX記事コンテンツ（*.mdx）
docs/                         # ドキュメント
├── character-guide.md        # サウナ子キャラクターガイド
├── analytics-skills-guide.md # アナリティクス運用ガイド
├── monetization-roadmap.md   # マネタイズロードマップ
└── x-strategy.md             # X(Twitter)運用戦略
scripts/                      # 運用スクリプト
worker/
└── index.ts                  # Cloudflare Worker（/go/{id}・旧 /pick/{ids}・非www転送。静的ファイルが無いリクエストだけ受ける）
public/
├── _headers                  # Cloudflare の静的配信用ヘッダー（セキュリティヘッダー・OG 画像の Content-Type）
└── _redirects                # 生成物（gitignore）。scripts/generate-edge-files.mjs が作る
wrangler.jsonc                # Workers の設定（account_id は個人の My Account に固定）
Skills/                       # Claude Code カスタムスキル
└── data-fetch/               # データ取得スキル
```

## Gotchas / 非自明な仕様

- **slug→idリダイレクト**: `scripts/generate-edge-files.mjs` が `facilities.json` から slug→数値IDの308を `public/_redirects` に生成。施設追加時はビルドで自動更新される（上限2,000件。超えるとビルドが止まる）
- **React Compiler有効**: `next.config.ts` で `reactCompiler: true`。手動の `useMemo`/`useCallback` は基本不要
- **画像は未最適化**: `images.unoptimized: true` 設定（画像最適化サービスを使わない）。2026-04にVercel Hobbyの月5,000変換枠を超過して画像が消えたため。**ランタイム縮小が効かないので、配信する解像度は取り込み時に決まる**（`MAX_WIDTH = 1600`）。手動で画像を追加したら `node scripts/resize-oversized-images.mjs` を流す
- **非wwwリダイレクト**: `saunako.jp` → `www.saunako.jp` は Cloudflare ゾーンのリダイレクトルールで行う（静的ファイルは Worker を通らないので Worker だけでは全部を転送できない）。`worker/index.ts` にも同じ転送がある
- **DNSも配信もCloudflare**（DNSは2026-09-06移管、配信は2026-11-13にVercelから Workers へ）: Cloudflare は個人のログイン（会社メールとは別。アカウント「My Account」、ID `e125443b…`）。会社メールのログインからは saunako.jp が見えない。NSは `lola` / `tadeo`.ns.cloudflare.com。`www` と apex は Worker の**カスタムドメイン**で、レコードはプロキシ有効（オレンジ雲）が正しい。apex→www はゾーンのリダイレクトルール「apex to www」。MX（Email Routing）とTXTは触らない。検証は `zsh scripts/verify-dns-switch.sh`
- **Cloudflare の AI クローラー設定は「全面許可」に合わせてある**: プロキシを通すと Cloudflare のボット設定が効く。2026-11-13 に AI Crawl Control の Training を Allow、Bot Preference Sync（robots.txt への自動追記）をオフにした。robots.ts の方針（AI 検索・学習クローラーを全面許可）と食い違わないよう、ここを戻さない
- **サイトは静的書き出し（`output: 'export'`）でサーバー処理が無い**: Workers 無料プランの CPU 10ms に収めるため（2026-11 に Next.js をそのまま Workers で動かしたら、作り置きのページでも1〜5割が CPU 超過で 503 になった）。そのため次は使えない — `searchParams` を読むページ、`generateStaticParams` に無いパラメータ、Server Actions、`cookies()`/`headers()`、動的な Route Handler、ISR、`next.config.ts` の `redirects()`/`headers()`。Route Handler・`opengraph-image`・`sitemap`/`robots` には `export const dynamic = 'force-static'` が要る
- **URL のパラメータで中身が変わる画面はブラウザで描画する**: `/search`・`/favorites?ids=`・`/pick?ids=` は静的なページ1枚で、施設データは `/facilities-data.json`（ビルド時生成）を `src/lib/facilitiesClient.ts` で取得して描画する。絞り込み・並べ替えは `src/lib/facilitySearch.ts`（facilities.json を import しない純関数。ブラウザから `src/lib/facilities.ts` を import すると JSON がまるごと JS に入る）
- **Worker（`worker/index.ts`）は静的ファイルが無いリクエストだけ受ける**: `/go/{id}`（送客の302）、旧形式 `/pick/{ids}` → `/pick?ids=`、非www転送。重い処理を足さない（無料プランの CPU 10ms）
- **ヘッダーは `public/_headers`**: セキュリティヘッダーと `/_next/static/` の永続キャッシュ。`next.config.ts` の `headers()` は静的書き出しでは効かない
- **DNSのTXTを消さない**: Search Consoleが `sc-domain:saunako.jp` で登録されており、`google-site-verification` のTXTで所有権を証明している。消すとSEO計測が止まる
- **閉店施設は記事に残る**: `getFacilityById` は閉店施設も返すので、記事の `<FacilityCard>` は閉店後も表示される。closedAt を入れたら記事からも外す（`tests/closed-facilities.test.ts` が検出）。エリアページの `SUB_AREA_META` の件数は `{count}` / `{coupleCount}` で書き、直書きしない（`tests/sub-area-meta.test.ts`）
- **analyticsトラッキング**: `data-track-*` 属性 + `AnalyticsTracker`（グローバルイベントデリゲーション）を使う。トラッキングのためだけにコンポーネントをクライアント化しない

## SEO運用ルール

### 段階的なメタ変更（3/27策定 → 7/17緩和）

**背景**: 3/10に128施設のseoTitleを一括変更した直後にGoogleトラフィックが消滅したため、当初は「一括変更が品質フィルターを発動させた」と考え上限10施設・1〜2週間ルールを敷いた。しかし後日、**真因はTeppei自身のGSC削除ツール操作（3/10「サイト全体一時削除」申請）**と判明し、7/2にキャンセルして完全復活した（`project_google-traffic-drop`）。seoTitle一括変更＝Google消滅の因果は**否定済み**。

これを踏まえ、上限を緩和する（7/17改定）。ただし大量メタ変更の再クロール負荷・効果測定困難のリスクはゼロではないため、無制限にはしない。

- **seoTitle / seoDescription の変更は1回のデプロイにつき最大30施設**（旧: 10施設）
- 変更後は **1週間あけてから** 次のバッチを実施（旧: 1〜2週間）
- `/analytics-pdca` で Google SC の imp/clicks を確認してから次に進む
- 記事タイトル（MDX frontmatter の title）も同様に段階的に変更
- **効果測定を成立させるため、1バッチ内では変更対象を絞り込む**（例: 同一エリア・同一クエリ群にまとめる）。変数が混ざると何が効いたか分からなくなる
- **GSC削除ツールを使うときは対象範囲（個別URL/前方一致/サイト全体）を必ず確認**（消滅事件の真の再発防止策）

### ページ単位の運用（2026-11-12追加）

- **書く前に受け持ちページを確認する**: 記事の新規・リライトやエリアページへの追記の前に、狙うクエリを Search Console でページ別に引き、既に受けているページがあればそのページを直す（手順は `/article-seo-upgrade` の Step 0 と `/analytics-pdca` の 3-0）。10/29 に東京ガイド記事を「都内」クエリ向けへリライトしたが、同じクエリは /area/tokyo が受けており不発だった
- **/area/tokyo は1回変えたら4週間は他の変更を入れない**: 一般クエリを受ける主力ページで、10/4・10/6・10/13・11/1 と続けて手を入れた結果、どの変更が効いたのか切り分けられなくなったため。待つ間は他のページを動かす。全ページ共通のテンプレート変更も /area/tokyo に入るので、入れるなら同じ日にまとめる
- **記事（MDX）の本文更新は待機なしで都度入れてよい**（施設の追加・閉店、料金改定、鮮度更新）。title の変更は上の段階的な変更に従う

### E-E-A-T を意識したコンテンツ作成
Googleは E-E-A-T（Experience, Expertise, Authoritativeness, Trustworthiness）を重視。特に「Experience（実体験）」が鍵。

- **施設説明・記事は「AIが書いただけ」にしない** — Teppeiの実体験や具体的なエピソードを含める
- 記事に「サウナ子が実際に取材しました」等の一次情報感を出す
- 施設データは公式サイトや実地確認で裏取りし、情報の正確性を担保
- サウナ子のキャラクターを活かした独自の切り口・感想を付加（テンプレ感を避ける）

## X投稿フォーマット（4/11〜改訂）

**本文の情報ギャップルール:**
- **料金（具体額）を本文に書かない**
- **具体的なエリア名（銀座・広島・三軒茶屋等）を本文に書かない** → 「都内」「中国地方」「関西」等でぼかす
- 末尾の「で、肝心の料金とエリアなんだけど——」がリプへの引きになるため、本文で出すと矛盾する

**本文構成:**
```
{フック（知ってた？/ターゲット型等）— エリアはぼかす}

{施設の特徴・設備の紹介 — 料金は書かない}

で、肝心の料金とエリアなんだけど——
```

**リプライ構成:**
```
{施設名}
💰 {料金}
📍 {具体エリア・最寄り駅} 徒歩○分

↓ 近くの他の個室サウナも比較できるよ
https://www.saunako.jp/facilities/{id}?utm_source=x&utm_medium=social
```

**投稿比率ルール（4/11〜）:**
- 「知ってた？×地方×素材ユニーク性」を週5本以上（最優先）
- 関東・都内ネタは週1〜2本まで
- ターゲット型は週1本まで

## MCP 接続

### GitHub（gh CLI）
- **リポジトリ**: `teppe049/saunako`（**公開リポジトリ**。営業メールの下書きなど社外に出せない文書はコミットしない）
- GitHub 操作は `gh` CLI に統一（GitHub MCPは未設定）
- Issue作成前に `gh issue list --search` で重複チェック
- PR作成時は `.github/PULL_REQUEST_TEMPLATE.md` を確認

### Issue 作成ルール

**優先度ラベル（必須・1つ）:**

| ラベル | 基準 |
|--------|------|
| `P0` | 今すぐ対応。売上・UXに直結する問題 |
| `P1` | 今月中に着手。SEO回復・主要機能 |
| `P2` | 四半期内。改善・中期施策 |
| `P3` | いつか。将来構想・Nice to have |

**カテゴリラベル（1〜2個）:**
`enhancement` `SEO` `performance` `content` `data` `ux` `monetization` `branding` `growth`

**禁止:**
- `phase-*` ラベルは使わない（タイトルに "Phase N:" と書く）
- `monetize` は使わない（`monetization` に統一）
- 優先度ラベルなしのIssueを作らない

### Pencil MCP
- `.pen` ファイルは Read/Grep 禁止 → 必ず Pencil MCP ツールを使う
- UI変更時は `get_screenshot` で視覚的に検証

## チームエージェント運用

コード変更を伴う実装タスクでは、以下のエージェントを**並列実行を最大化**して起動する。

| Role | 担当 | 起動タイミング |
|------|------|---------------|
| **Design** | Pencil MCP でデザイン仕様取得・検証 | UI変更の前後 |
| **Frontend** | Reactコンポーネント・Tailwind実装 | UI実装時 |
| **Data** | facilities.json管理・型整合性・検索ロジック | データ変更時 |
| **QA** | `npm run lint` → `npm run typecheck` → `npm test` → `npm run build` | 実装完了後（必須） |
| **SEO** | metadata・sitemap・robots確認 | ページ追加時 |

**ルール:**
- 独立したタスクは Task ツールで並列実行
- QA Agent は実装完了後に必ず起動
- 実装完了 + QA パス後は自動的に main に commit + push
- 対応Issueは commit & push 後に `gh issue close {番号} --reason completed` でクローズ

**対象外**: 質問・調査のみ、設定ファイル編集のみ、単純typo修正

## コーディング規約

- **Server Component がデフォルト**。`'use client'` は対話性が必要な場合のみ。ページレベル (`app/*/page.tsx`) には絶対に付けない
- パスエイリアス `@/*` → `./src/*`
- 日本語UI — コンポーネント名・変数名は英語、表示テキストは日本語
- Tailwind の arbitrary values (`[]` 構文) は極力避ける
- 数値データは `number` 型。表示フォーマットはプレゼンテーション層で
- 定数のマジックナンバーにはビジネス理由をコメントで記載
- 200行超のコンポーネントは分割を検討、300行超は必ず分割

## キャラクター設定

サウナ子のキャラクターガイドラインは `docs/character-guide.md` を参照。
コメント・UIテキスト生成時は必ず準拠すること。

## パフォーマンス方針

- 画像は `next/image` + `loading="lazy"`
- 地図: マーカーアイコンはキャッシュ、バウンドイベントはデバウンス、クラスタリング有効

## 未整備（TODO）

- [x] テスト環境（Vitest。2026-09-02導入。コンポーネントテストが必要になったら jsdom + React Testing Library を追加）
- [x] CI（`.github/workflows/ci.yml`: main push / PR で lint → typecheck → test → build。2026-09-02導入）
- [ ] 認証機能

## ドキュメントとコードの食い違い

- ドキュメントと既存のコードが食い違うときはコードの書き方に従い、見つけた食い違いを最後の返答ですべて挙げること

## UI実装

- 不要なセカンダリラベルや説明を避ける。レイアウトに説明させる。
