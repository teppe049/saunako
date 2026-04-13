# Saunako - プロジェクト指示書

個室サウナ検索プラットフォーム。Next.js 16 + React 19 + TypeScript + Tailwind CSS v4。
デプロイ先: Vercel / ドメイン: www.saunako.jp

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
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint チェック（Next.js core-web-vitals + TypeScript） |

### 運用スクリプト (`scripts/`)

| Script | Description |
|--------|-------------|
| `node scripts/indexnow.mjs` | IndexNow API でURL送信 |
| `node scripts/generate-x-posts.js` | X(Twitter)投稿文の自動生成 |
| `node scripts/download-images.mjs` | 施設画像ダウンロード |
| `node scripts/check-articles.mjs` | 記事データの整合性チェック |
| `node scripts/capture-x-header.mjs` | Xヘッダー画像キャプチャ |
| `node scripts/preview-images.mjs` | X投稿プレビュー（week/日付/施設ID指定可） |
| `node scripts/check-x-weight.js` | X投稿ウェイトチェック（hook用） |

## 環境変数

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 計測ID
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - Google AdSense クライアントID
- Google Maps API キーは別途必要（`@react-google-maps/api` で使用）

## テックスタック

- **Next.js 16** (App Router, React Compiler有効)
- **React 19** (Server Components優先)
- **TypeScript** (strict)
- **Tailwind CSS v4** + CSS Variables (`globals.css`)
- **ESLint** (Next.js core-web-vitals + TypeScript rules)
- **Google Maps** (`@react-google-maps/api`)
- **データ**: 静的JSON (`data/facilities.json`, 486施設・47都道府県)
- **デザイン**: Pencil MCP (`.pen`ファイル)

## ディレクトリ構成

```
src/
├── app/                      # App Router ページ
│   ├── page.tsx              # トップページ
│   ├── search/               # 検索結果
│   ├── area/[prefecture]/    # エリア別一覧（47都道府県）
│   ├── facilities/[id]/      # 施設詳細
│   ├── articles/             # 記事一覧・詳細（MDXベース）
│   │   ├── [slug]/           # 個別記事
│   │   ├── category/         # カテゴリ別
│   │   └── tag/              # タグ別
│   ├── favorites/            # お気に入り
│   ├── ranking/              # ランキング（未実装予定）
│   ├── for-owners/           # 施設オーナー向けページ
│   ├── go/[facilityId]/      # 施設への外部リンクリダイレクト
│   ├── faq/                  # FAQ
│   ├── privacy/              # プライバシーポリシー
│   ├── terms/                # 利用規約
│   ├── feed.xml/             # RSSフィード
│   ├── sitemap.ts            # 動的サイトマップ生成
│   └── robots.ts             # robots.txt生成
├── components/               # 共通UIコンポーネント
├── lib/                      # ユーティリティ・型定義・ストア
│   ├── analytics.ts          # GA4トラッキング
│   ├── adsense.ts            # AdSense設定
│   ├── articles.ts           # MDX記事のローダー
│   ├── facilities.ts         # 施設データのローダー・検索ロジック
│   ├── favoritesStore.ts     # お気に入りストア（localStorage）
│   ├── distance.ts           # 距離計算
│   └── types.ts              # 共通型定義
data/
└── facilities.json           # 施設マスタデータ（487施設）
content/
└── articles/                 # MDX記事コンテンツ（*.mdx）
docs/                         # ドキュメント
├── character-guide.md        # サウナ子キャラクターガイド
├── analytics-skills-guide.md # アナリティクス運用ガイド
├── monetization-roadmap.md   # マネタイズロードマップ
└── x-strategy.md             # X(Twitter)運用戦略
scripts/                      # 運用スクリプト
Skills/                       # Claude Code カスタムスキル
└── data-fetch/               # データ取得スキル
```

## Gotchas / 非自明な仕様

- **slug→idリダイレクト**: `next.config.ts` が `facilities.json` を読み込み、slug→数値IDの308リダイレクトを自動生成。施設追加時はビルドでリダイレクトが自動更新される
- **React Compiler有効**: `next.config.ts` で `reactCompiler: true`。手動の `useMemo`/`useCallback` は基本不要
- **画像は未最適化**: `images.unoptimized: true` 設定（Vercelの画像最適化を使わない）
- **非wwwリダイレクト**: `saunako.jp` → `www.saunako.jp` への301リダイレクトが `next.config.ts` に設定済み
- **analyticsトラッキング**: `data-track-*` 属性 + `AnalyticsTracker`（グローバルイベントデリゲーション）を使う。トラッキングのためだけにコンポーネントをクライアント化しない

## SEO運用ルール

### 一括変更の禁止（3/27策定）
3/10に128施設のseoTitleを一括変更した結果、Googleの品質フィルターが発動し検索トラフィックが完全消滅した（3/11以降 imp=0）。

- **seoTitle / seoDescription の変更は1回のデプロイにつき最大10施設**
- 変更後は **1〜2週間あけてから** 次のバッチを実施
- `/analytics-pdca` で Google SC の imp/clicks を確認してから次に進む
- 記事タイトル（MDX frontmatter の title）も同様に段階的に変更

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

### GitHub MCP
- **リポジトリ**: `owner: "teppe049"`, `repo: "saunako"`
- GitHub 操作は **GitHub MCP を優先**（`gh` コマンドより優先）
- Issue作成前に `search_issues` で重複チェック
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
| **QA** | `npm run build && npm run lint` | 実装完了後（必須） |
| **SEO** | metadata・sitemap・robots確認 | ページ追加時 |

**ルール:**
- 独立したタスクは Task ツールで並列実行
- QA Agent は実装完了後に必ず起動
- 実装完了 + QA パス後は自動的に main に commit + push
- 対応Issueは commit & push 後に GitHub MCP でクローズ（`state: closed`, `state_reason: completed`）

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

- [ ] テスト環境（Vitest + React Testing Library）
- [ ] CI/CD パイプライン
- [ ] 認証機能
