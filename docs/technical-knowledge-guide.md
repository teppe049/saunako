# サウナ子 テクニカルナレッジガイド

saunako の実装・運用で知っておくと判断が早くなる技術知識をまとめたもの。
「全部理解する」のではなく、**判断が必要な場面で引ける辞書** として使う。

---

## 1. Server Component と Client Component の境界線

saunako で最も頻繁に発生する設計判断。

### 原則

```
デフォルト: Server Component（'use client' なし）
例外: ユーザー操作が必要なときだけ Client Component
```

### なぜこれが重要か

- Server Component → **JavaScript がブラウザに送られない** → ページ軽い → Core Web Vitals 良い → SEO に好影響
- Client Component → JavaScript がブラウザに送られる → インタラクティブだが重い

### saunako での判断基準

| こういうとき | Server / Client | 理由 |
|------------|:-:|------|
| 施設一覧を表示するだけ | Server | データ表示のみ、操作なし |
| 検索フィルターの切り替え | Client | ユーザーが操作する |
| 地図の表示・操作 | Client | Google Maps SDK が必要 |
| 「予約する」ボタン | Client | クリックイベント追跡が必要 |
| OGP画像の生成 | Server | サーバーで画像を生成 |
| 施設詳細ページ本体 | Server | SEO が重要、データ表示が主 |

### よくある落とし穴

```tsx
// NG: トラッキングのためだけに Client Component にしない
'use client'; // ← これのためだけに Client にすると重くなる
export default function FacilityCard({ facility }) {
  const handleClick = () => gtag('event', 'click');
  return <div onClick={handleClick}>...</div>;
}

// OK: data-track-* 属性 + AnalyticsTracker（グローバルイベントデリゲーション）
export default function FacilityCard({ facility }) {
  return <div data-track-click={`facility_${facility.id}`}>...</div>;
}
```

saunako では `AnalyticsTracker` がグローバルでイベントを拾う設計になっている。
**トラッキングのためだけにコンポーネントを Client 化しない。**

---

## 2. 静的生成（SSG）と動的レンダリング

### saunako のレンダリング戦略

```
○ Static（完全静的）     → トップ、記事、FAQ、利用規約
● SSG（ビルド時生成）    → 施設詳細393ページ、エリアページ
ƒ Dynamic（リクエスト時） → 検索ページ、/go/リダイレクト、RSS
```

### なぜ重要か

- **静的ページ**: CDN から即座に配信 → 最速。SEO 最強
- **動的ページ**: リクエストごとにサーバーで処理 → 遅い可能性あり

### 判断が必要な場面

| 場面 | 判断 |
|------|------|
| 施設データを更新した | → `npm run build` で全ページ再生成（Vercel が自動でやる） |
| 施設数が 1000 を超えたら | → ISR（増分再生成）を検討。ビルド時間が問題になるため |
| 検索結果ページ | → 動的のまま。検索条件が無限にあるので静的生成は不可能 |
| 新しい API Route を作る | → `export const dynamic = 'force-dynamic'` を明示 |

### ビルド時間の目安

現在（393施設）のビルド: 約 2-3 分。
1000施設を超えるとビルド時間が 10 分以上になる可能性あり → その時に ISR を検討。

---

## 3. facilities.json のデータ設計

saunako の心臓部。全てのページがこの JSON から生成される。

### データの流れ

```
facilities.json
  ↓ import
facilities.ts（ヘルパー関数）
  ↓ 呼び出し
各ページコンポーネント
  ↓ 表示
HTML + 構造化データ（JSON-LD）
```

### フィールドの影響範囲

| フィールド | 影響する場所 |
|-----------|------------|
| `name` | title タグ、OGP、構造化データ、検索結果の表示 |
| `seoDescription` | meta description（設定されていれば自動テンプレートより優先） |
| `priceMin` | 料金表示、構造化データの priceRange、FAQ の料金質問 |
| `bookingUrl` | /go/ リダイレクトの遷移先 |
| `website` | /go/ リダイレクトのフォールバック先 |
| `lat` / `lng` | 地図表示、現在地検索の距離計算 |
| `closedAt` | 施設の表示/非表示（閉店施設は一覧から除外、詳細は閲覧可能） |
| `images` | カード画像、詳細ページギャラリー、OGP画像 |

### データ更新時の注意

- JSON を直接編集するより **Python スクリプト** で編集する方が安全（構文エラー防止）
- `priceMin` が 0 や null だと構造化データから料金情報が消える
- `images` が空配列だとプレースホルダー表示になる
- 施設を削除する場合は物理削除ではなく `closedAt` を設定する

---

## 4. SEO の技術的な仕組み

### saunako の SEO スタック

```
1. title / description  → 検索結果のテキスト
2. 構造化データ（JSON-LD）→ リッチリザルト（FAQ、料金等）
3. sitemap.xml          → Google にページ一覧を伝える
4. robots.txt           → クロール制御
5. canonical URL        → 重複ページの正規化
6. OGP（og:image等）   → SNS でシェアされた時の表示
```

### 構造化データが生成される場所

| ページ | 構造化データの種類 | 生成場所 |
|--------|-----------------|---------|
| 施設詳細 | LocalBusiness + FAQPage | `facilities/[id]/page.tsx` |
| トップ | FAQPage | `page.tsx` |
| 記事 | BlogPosting + BreadcrumbList | `articles/[slug]/page.tsx` |
| エリア | BreadcrumbList | `area/[prefecture]/page.tsx` |

### title が SEO に与える影響

**Google がクリック率（CTR）を見ている**という前提で考える。

```
良い title: 「高輪SAUNASの料金・プラン・口コミ｜高輪ゲートウェイ駅（東京都）の個室サウナ」
            → 施設名 + 料金 + 駅名 + 地域名。検索意図にマッチ

悪い title: 「高輪SAUNAS | サウナ子」
            → 情報量が少ない。何のページか分からない
```

saunako の title テンプレート:
```
{施設名}の料金・プラン・口コミ｜{最寄り駅}（{都道府県}）の個室・プライベートサウナ | サウナ子
```

### seoDescription の優先順位

```
1. facility.seoDescription がある → そのまま使う
2. ない → 自動テンプレートで生成（料金・駅名・特徴から組み立て）
```

手動で seoDescription を書くと **テンプレートより自然な文章になり、CTR が上がる傾向がある。**
特に imp が高い施設から優先的に書く。

---

## 5. 画像の仕組み

### 命名規則

```
public/facilities/{id}-0.webp  ← サムネイル（カード・OGP に使用）
public/facilities/{id}-1.webp  ← 詳細画像 2 枚目
public/facilities/{id}-2.webp  ← 詳細画像 3 枚目
```

### 画像がない場合の挙動

- `images: []` → プレースホルダー（グレー背景）が表示される
- 0 枚目が白画像 → カード画像が見えなくなる（XPLACE 問題の例）

### 画像の仕様

- フォーマット: WebP
- サイズ: 横 800px（`cwebp -q 80 -resize 800 0` で統一）
- 容量目安: 10-30KB が理想。2-3KB は明らかに異常

### 取得元の優先順位

```
1. 公式HP の画像
2. CSS 背景画像（DevTools で確認）
3. PR Times のプレスリリース
4. 予約ページ（Coubic, hacomono 等）
× sauna-ikitai.com は使用禁止
```

---

## 6. Vercel デプロイの仕組み

### デプロイフロー

```
git push origin main
  ↓
Vercel が自動検知
  ↓
npm run build 実行
  ↓
成功 → 本番に自動デプロイ
失敗 → 前のバージョンのまま（安全）
```

### 知っておくべきこと

- **ビルドが失敗しても本番は壊れない**（前のデプロイが維持される）
- プレビューデプロイ: PR を作ると自動でプレビュー URL が生成される
- 環境変数: Vercel ダッシュボードで管理（GA_MEASUREMENT_ID 等）
- Hobby プラン: 月 100GB 帯域幅、サーバーレス関数の実行時間制限あり

### Route Handler（/go/ 等）の制約

- Hobby プランのサーバーレス関数: 実行時間 10 秒まで
- /go/ リダイレクトは数十 ms で完了するので問題なし
- 将来的に重い API を作る場合は Pro プラン（月$20）が必要になる可能性

---

## 7. 記事（MDX）の仕組み

### ファイル構成

```
content/articles/
  ├── 24h-private-sauna.mdx
  ├── couple-private-sauna.mdx
  └── ...（各記事の MDX ファイル）

src/app/articles/[slug]/page.tsx  ← 記事表示の共通テンプレート
```

### frontmatter の構造

```yaml
---
title: "記事タイトル"
description: "meta description"
category: "guide"  # guide, area-guide, feature 等
tags: ["個室サウナ", "カップル"]
facilityIds: [1, 2, 3]  # 記事内で紹介する施設の ID
publishedAt: "2026-01-15"
updatedAt: "2026-03-10"
---
```

### facilityIds の効果

- 記事下部に `FacilityCard` コンポーネントで施設カードを自動表示
- 内部リンクが増える → SEO 的にプラス
- 施設 ID を指定するだけでカード表示される（画像・料金・リンク全部自動）

---

## 8. テスト・品質管理の現状と方針

### 現状（2026年3月時点）

- テスト: なし（Vitest + React Testing Library は TODO）
- CI/CD: なし（Vercel の自動ビルドのみ）
- lint: ESLint あり（一部既存エラーは放置中）
- 型チェック: TypeScript strict モード

### 品質を担保している仕組み

```
1. TypeScript strict → 型エラーはビルド時に検出
2. npm run build → ページ生成エラーはビルド時に検出
3. Vercel → ビルド失敗は本番に反映されない
4. AI の QA Agent → 実装後に自動でビルド + lint チェック
```

### テストを書くべきタイミング

今は書かなくていい。以下の条件を満たしたら検討:

- ユーザー数が増えてバグの影響が大きくなった
- ロジックが複雑になった（料金計算、予約フロー等）
- 複数人で開発するようになった

**一人開発 + AI の段階では、TypeScript + ビルド確認で十分。**

---

## 9. パフォーマンスの考え方

### 現状のボトルネック候補

| 箇所 | リスク | 対策時期 |
|------|--------|:--------:|
| facilities.json（全施設読み込み） | 施設数が増えると import が重くなる | 1000施設超えたら |
| Google Maps | 地図の初期読み込みが重い | 検索ページの LCP に影響が出たら |
| 画像（393施設 × 3枚） | ストレージ増加 | 今は問題なし |
| OGP画像生成 | ビルド時に 393 枚生成 | ビルド時間が問題になったら |

### 今気にすべきこと

- **LCP（Largest Contentful Paint）**: 最初に見える大きな要素の表示速度。施設画像の lazy load が効いているか
- **CLS（Cumulative Layout Shift）**: レイアウトのガタつき。画像の width/height が指定されているか

### 今気にしなくていいこと

- バンドルサイズの最適化（Client Component が少ないので問題なし）
- CDN キャッシュの設定（Vercel が自動でやる）
- データベースの導入（JSON で十分な規模）

---

## 10. 「データベースを入れるべきか」問題

### 現状: JSON ファイルで十分

```
メリット:
- デプロイが簡単（ファイルを push するだけ）
- サーバー不要（コスト 0 円）
- 全文検索が速い（メモリ上にロード済み）
- バックアップ = git history

デメリット:
- 更新にビルドが必要（リアルタイム更新不可）
- 施設オーナーが自分で情報を更新できない
```

### DB を検討すべきタイミング

以下のいずれかが必要になったら:

1. **施設オーナーが自分で情報を更新する機能**（管理画面）
2. **ユーザーの口コミ・レビュー機能**
3. **リアルタイムの空き状況表示**
4. **施設数が 2000 を超えた**

それまでは JSON + git で運用する方が圧倒的にシンプル。

---

## まとめ: 判断が必要な場面チートシート

| 場面 | 判断基準 |
|------|---------|
| 新しいコンポーネントを作る | → まず Server Component。操作が必要なら Client |
| 施設データを追加する | → Python スクリプトで JSON 編集 → ビルド確認 |
| SEO を改善したい | → まず seoDescription を書く。次に構造化データ確認 |
| ページを新しく作る | → 静的で十分なら SSG。条件で変わるなら Dynamic |
| パフォーマンスが気になる | → まず Lighthouse で計測。数字が悪くなければ触らない |
| DB が必要か | → ユーザーやオーナーが書き込む機能が必要になるまで不要 |
| テストが必要か | → 一人開発 + AI なら TypeScript + ビルド確認で十分 |
