# SNSバナー画像生成

各SNSプラットフォーム用のバナー/ヘッダー画像をコードベースで生成する。

## 引数

$ARGUMENTS にプラットフォーム名や要望を受け取る（例: "X ヘッダー", "note ヘッダー", "Instagram ハイライトカバー"）

## プラットフォーム別サイズ

| プラットフォーム | 種別 | サイズ (px) |
|----------------|------|------------|
| **X (Twitter)** | ヘッダー | 1500 x 500 |
| **note** | ヘッダー | 1280 x 670 |
| **Instagram** | プロフィールヘッダー | 1080 x 1080 (正方形) |
| **Instagram** | ストーリー/リール | 1080 x 1920 |
| **Instagram** | 投稿 | 1080 x 1350 (4:5推奨) |

## ブランドガイドライン

### カラー
- **ベース**: ダークブルーグラデーション (`#121a2e` → `#1f3a65`)
- **アクセント**: オレンジ (`#E87957` / `#D4634A`)
- **テキスト**: 白 (`#ffffff`)
- **サブテキスト**: `rgba(232, 121, 87, 0.65)`

### フォント
- `"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif`

### キャラクター素材
- `public/saunako/smile.webp` — 笑顔（汎用）
- `public/saunako/guide.webp` — 案内ポーズ（おすすめ・紹介向き）
- `public/saunako/totonou.webp` — 整い（リラックス・癒し系）
- `public/saunako/surprise.webp` — 驚き
- `public/saunako/thinking.webp` — 考え中

### キャッチコピー
- メイン: 「あなたの「整い」を、私が見つける」
- サイト: `saunako.jp`

## 生成手順

### Step 1: HTML テンプレート作成

`scripts/` 配下にHTML ファイルを作成する。

```
scripts/{platform}-banner.html
```

デザインルール:
- OG画像 (`src/app/opengraph-image.tsx`) と同じデザインシステムを踏襲
- 装飾: 半透明のオレンジ円 + 蒸気パーティクル（`rgba(255,255,255,0.035)` の小円）
- アクセントバー: 下部にオレンジグラデーション（端はフェードアウト）
- テキストは最小限に（競合調査の結果、SNSヘッダーはシンプルが主流）

### Step 2: キャラクター背景透過

元画像が白背景の場合、ImageMagick で透過処理する:

```bash
magick {input}.webp -alpha set -bordercolor white -border 1 -fuzz 12% -fill none -floodfill +0+0 white -shave 1x1 scripts/{output}-transparent.png
```

- `fuzz` は 8〜12% が適正。15%以上はキャラの白い部分（顔・目）まで消える
- flood fill はエッジからのみ（全ピクセント置換ではない）

### Step 3: Playwright でキャプチャ

```bash
npx playwright screenshot --viewport-size="{width},{height}" file:///{absolute_path}/scripts/{file}.html {output}.png
```

### Step 4: 目視確認 + 微調整

生成画像を Read ツールで確認し、以下をチェック:
- キャラの透過が自然か
- テキストの可読性
- プラットフォーム固有の重なりゾーン（Xなら左下のアイコン等）を避けているか

### プラットフォーム別注意点

**X (Twitter):**
- 左下にプロフィールアイコン（円形）が重なる → テキスト・重要要素は `left: 280px` 以上に配置
- テキストは上寄り（`top: 42%` 程度）にして下部を空ける

**note:**
- 左下にプロフィールアイコンが重なる（Xと同様）
- ヘッダー比率が 1280x670 でXより縦長

**Instagram:**
- ヘッダー画像の概念なし（プロフィール写真のみ）
- ハイライトカバーやフィード投稿画像として活用

## 既存の生成物

| ファイル | 用途 | サイズ |
|---------|------|--------|
| `x-header.png` | X ヘッダー | 1500x500 |
| `scripts/x-header.html` | X ヘッダー HTML テンプレート | - |
| `scripts/guide-transparent.png` | 背景透過済みキャラ（guide） | - |
