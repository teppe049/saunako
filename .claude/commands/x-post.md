# X投稿作成（施設DeepResearch付き）

1施設をDeepResearchし、掲載データとの差異チェック + X投稿文を生成する。

引数: $ARGUMENTS（施設ID、施設名、またはテーマ指定。省略時は投稿カレンダーから今日のテーマを自動選択）

## 手順

### 1. 施設確認

毎日1施設を紹介する。引数で施設IDまたは施設名が指定された場合はそちらを優先。

### 2. 施設選定

**重複禁止ルール**: `docs/x-post-log.md` に記録済みの施設は、全393施設を1巡するまで再投稿しない。引数で指定された場合も、投稿済みなら警告して別施設を提案する。

引数がない場合、以下の優先順位で選定:
1. まだX投稿で取り上げていない施設（`docs/x-post-log.md` を参照）
2. Search Console で imp が多い施設（注目度が高い）
3. 最近オープンした施設（`openedAt` が新しい）
4. 地域バランス（同じ都道府県が連続しないように）

### 3. DeepResearch（施設の深掘り調査）

選定した施設について、以下を **並列で** 調査する:

#### 3-a. 公式サイト調査（WebFetch）
- 公式HP をフェッチして最新情報を取得
- 料金プラン・営業時間・設備の現在の情報
- 最近のお知らせ・リニューアル情報
- 写真の雰囲気、施設のこだわりポイント

#### 3-b. Web検索（WebSearch）
- 「{施設名} 口コミ」「{施設名} レビュー」で評判を調査
- 「{施設名} サウナ」で最新の言及を確認
- PR Times で公式プレスリリースがないか確認
- 最近の料金改定やリニューアル情報

#### 3-c. 予約サイト調査（WebFetch）
- bookingUrl がある場合、予約ページの最新プラン・料金を確認
- Coubic/STORES/hacomono 等の予約プラットフォームの情報

### 4. データ差異チェック

`data/facilities.json` の該当施設データと、DeepResearch で得た情報を突き合わせる。

チェック項目:

| 項目 | チェック内容 |
|------|------------|
| **料金** | priceMin・plans が最新の料金と一致しているか |
| **営業時間** | businessHours が現在の営業時間と一致しているか |
| **定休日** | holidays が正しいか |
| **設備** | 水風呂温度・セルフロウリュ・外気浴等に変更がないか |
| **予約URL** | bookingUrl が有効か（404やリンク切れがないか） |
| **公式サイト** | website が有効か |
| **施設名** | 名称変更がないか |
| **閉店** | 閉店・休業情報がないか |
| **電話番号** | phone が正しいか |
| **画像** | `public/facilities/{id}-{0,1,2,3}.webp` が4枚揃っているか |

#### 画像が4枚未満の場合

`public/facilities/{id}-*.webp` を確認し、4枚に満たない場合は不足分を取得する。

1. DeepResearch（Step 3）で取得済みの公式サイト・予約サイトから施設写真のURLを収集
2. 下記ガイドラインに沿って画像を選定

**画像選定ガイドライン**

| 種類 | 判定 |
|------|------|
| サウナ室内部（木の壁・ストーン・照明） | ✅ 優先 |
| 水風呂（温度計・演出が見えるもの） | ✅ 優先 |
| 外観・エントランス | ✅ OK |
| 外気浴スペース・休憩室 | ✅ OK |
| 施設外の風景（ロケーションがわかるもの） | ✅ OK |
| 人物の後ろ姿 | ✅ OK |
| 人物の顔・正面が写っている | ❌ NG |
| 施設の様子が全くわからない（料理・小物のみ等） | ❌ NG |
3. ダウンロード → webp 変換: `cwebp -q 80 -resize 800 0 /tmp/input.jpg -o public/facilities/{id}-{index}.webp`
4. `data/facilities.json` の `images` 配列を更新
5. サイトにも反映されるため、QA Agent でビルド確認

画像ソースの優先順位:
1. 公式HP の `<img>` タグ / CSS `background-image`
2. PR Times プレスリリース画像
3. Coubic/STORES 予約ページの施設写真

**注意**: sauna-ikitai.com の画像は使用禁止。SPA サイトは Playwright でDOM抽出。

#### 差異が見つかった場合

差異を一覧で表示し、AskUserQuestion で修正するか確認:

```
## データ差異レポート: {施設名} (id={id})

| 項目 | 現在のデータ | 調査結果 | 要修正？ |
|------|------------|---------|:------:|
| priceMin | 5,000 | 5,500（値上げ） | ⚠️ |
| businessHours | 10:00-22:00 | 10:00-23:00（延長） | ⚠️ |
| ...
```

ユーザーが承認した修正は `data/facilities.json` に即反映する。

### 5. X投稿文の生成

DeepResearchで得た **具体的な情報** を盛り込んで投稿文を生成する。

#### ルール（docs/x-strategy.md 準拠）
- トーン: `docs/character-guide.md` に準拠（友達口調、敬語禁止）
- **文字数**: Xはウェイト制（日本語1文字=2, ASCII=1, 絵文字=2, 改行=1）で上限280。日本語メインなら実質約140文字。**必ず280ウェイト以内に収める**
- 絵文字: 1-3個
- ハッシュタグ: `#個室サウナ` + テーマに応じて1-2個
- **本文にURLを入れない**（Xアルゴリズムが外部リンク付き投稿のインプレッションを下げるため）
- URLは**リプライで分離投稿**する（Step 8 参照）
- 価格の具体的な言及は避ける（「コスパがいい」程度に）

#### 投稿文に含めるべき要素（DeepResearchから）
- その施設ならではの特徴・こだわり（公式サイトから）
- 口コミで特に評価されているポイント
- 最寄り駅からのアクセス
- カップル利用・グループ利用の可否
- 季節性のある情報（外気浴が気持ちいい時期等）

#### 生成パターン（本文 — リンクなし）

```
{施設のキャッチーな特徴 — 冒頭で興味を引く}

{DeepResearchで分かった具体的な魅力 2-3行}

📍{エリア名}
#個室サウナ #サウナ子
```

#### リプライ文（リンク付き）

本文に対するリプライとして投稿する。

```
{施設名}
saunako.jp/facilities/{id}
```

### 6. 画像アップロード

施設画像を X に添付する。施設IDが確定した時点で実施可能（投稿文と並列OK）。

#### 画像ソース
- `public/facilities/{id}-0.webp` （メイン画像）
- `public/facilities/{id}-1.webp` （サブ画像2）
- `public/facilities/{id}-2.webp` （サブ画像3）
- `public/facilities/{id}-3.webp` （サブ画像4）

#### 手順
1. 上記3枚を Read ツールで読み込み（バイナリ → base64）
2. `mcp__x-mcp__upload_media` で各画像をアップロード:
   - `media_data`: base64エンコードされた画像データ
   - `mime_type`: `"image/webp"`
   - `media_category`: `"tweet_image"`
3. 返却された `media_id` を4つ収集
4. 投稿時に `media_ids: [id1, id2, id3, id4]` として `post_tweet` に渡す

#### MCP 401エラー時のフォールバック
MCP の `post_tweet` が401になる場合は、直接 X API v1.1 で画像アップロード + v2 で投稿する:
```python
# media upload: POST https://upload.twitter.com/1.1/media/upload.json
# multipart/form-data で media_data (base64) を送信
# レスポンスの media_id_string を取得
```

#### 注意
- webp は X API でサポートされている（2024年〜）
- 1投稿に最大4枚添付可能（現状3枚で運用）
- 画像が存在しない施設はテキストのみで投稿

### 7. 下書き保存

`docs/x-drafts.md` に下書きを保存する。**投稿はしない**（ユーザーが確認・修正してから投稿指示する）。

```markdown
## {日付} — {施設名} (id={id})

### 本文（リンクなし）
```
{投稿文テキスト — URLを含まない}
```

### リプライ（リンク付き）
```
{施設名}
saunako.jp/facilities/{id}
```

### 画像
- public/facilities/{id}-0.webp
- public/facilities/{id}-1.webp
- public/facilities/{id}-2.webp
- public/facilities/{id}-3.webp

### データ差異
{差異レポート or 「なし」}
```

ファイルが存在しない場合は新規作成。既存の下書きがある場合は末尾に追記。

### 8. 投稿（ユーザー指示後）

ユーザーが「投稿して」「ポストして」と指示したら:

1. `docs/x-drafts.md` の最新下書きを読み取る
2. 画像4枚をアップロード（Step 6）
3. Playwright MCP でX投稿（`x.com/compose/post` を開く → テキスト入力 → 画像アップロード → 投稿）
4. 投稿の `tweet_id` を取得（プロフィールページで確認）
5. Playwright MCPでリプライ投稿（`tweetButtonInline` querySelector）
6. `docs/x-post-log.md` に記録を追記
7. `docs/x-drafts.md` から投稿済みの下書きを削除

#### Playwritght投稿手順（X MCP はレートリミットが多いため Playwright を標準とする）
1. `browser_navigate` → `https://x.com/compose/post`
2. `browser_type` でテキスト入力
3. `browser_evaluate` で `document.querySelector('input[data-testid="fileInput"]').click()` → `browser_file_upload` で画像4枚
4. `browser_evaluate` で `document.querySelector('[data-testid="tweetButton"]').click()`
5. プロフィールページで tweet_id 確認 → リプライは `[data-testid="tweetButtonInline"]` でクリック

#### 画像の PNG 変換（X アップロード用）
```bash
dwebp public/facilities/{id}-{0,1,2,3}.webp -o post_{id}-{0,1,2,3}.png
# アップロード後に削除: rm -f post_{id}-*.png
```

### 9. SEO記事作成（投稿完了後）

X投稿と同じ施設の SEO 記事を `content/articles/{slug}.mdx` に作成する。

#### 既存記事チェック
`content/articles/{slug}.mdx` が存在する場合はスキップ（上書きしない）。

#### 記事フォーマット
```markdown
---
title: "{施設名}を徹底紹介！{キャッチコピー}"
description: "{施設名}（{都道府県}・{市区町村}）を紹介。{特徴2-3点}。料金・アクセス・予約方法まとめ。"
category: "column"
tags: ["{都道府県}", "個室サウナ", "{施設名}", "{エリア特性タグ}"]
publishedAt: "{今日の日付}"
updatedAt: "{今日の日付}"
thumbnail: "/facilities/{id}-1.webp"  # サウナ室など施設の雰囲気がわかる写真を優先（水風呂より）
author: "サウナ子"
facilityIds: [{id}]
---

## {冒頭フック — 「〜って知ってた？」型}

{2-3行のリード文。サウナ子キャラ（友達口調・敬語禁止）で}

<FacilityCard id={id} />

---

## {施設名}のここが唯一無二

### {特徴1}
{DeepResearchで得た具体的な情報}

### {特徴2}
...

---

## 料金・予約

{プランテーブルまたは箇条書き}

---

## アクセス

{最寄り駅・住所・定休日など}

---

## こんな人におすすめ

{箇条書き3-5個}

関連記事リンク（内部リンク1本）

---

<p className="text-xs text-gray-400 mt-8">※ 画像は各施設の公式サイトより引用しています。掲載に問題がある場合はお問い合わせください。</p>
```

#### 記事作成のルール
- **thumbnail**: サウナ室・外観など施設全体が伝わる画像を優先。水風呂単体より雰囲気がわかる写真
- **文体**: `docs/character-guide.md` 準拠（友達口調・絵文字は最小限・AIっぽい言い回し禁止）
  - ❌ `その名も**「〜（よみがな）」**。`
  - ✅ `「〜」っていうんだけど、これがほんとに他にない。`
- **内部リンク**: 関連記事を1本以上リンク
- **文字数**: 800字以上
- **DeepResearch活用**: Step 3で得た情報（公式サイト・口コミ・料金）を具体的に盛り込む

#### 記事作成後
1. `npm run build` でビルド確認
2. ローカルで確認してもらうため URL を提示: `http://localhost:3001/articles/{slug}`
3. 確認OKなら投稿ログ・記事をまとめてコミット＆プッシュ

### 10. 出力

以下を表示して完了:

1. **データ差異レポート**（差異がなければ「差異なし」）
2. **本文プレビュー**（リンクなし投稿文）
3. **リプライプレビュー**（リンク付きリプライ文）
4. **画像プレビュー**（添付する画像を表示）
5. **下書き保存先**: `docs/x-drafts.md`
6. 「確認して問題なければ『投稿して』と伝えてね」

## 注意事項

- 閉店・休業が判明した場合は投稿を中止し、`closedAt` の設定を提案
- 料金の具体的な金額は投稿文に含めない（キャラクターガイドのNGルール）
- 1投稿で1施設のみ。比較投稿でも名前を出すのは1施設
- 施設への否定的な情報は投稿しない
- データ修正した場合は QA Agent（`npm run build && npm run lint`）でビルド確認
