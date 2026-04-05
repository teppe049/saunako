# Instagram投稿作成

カルーセル投稿 or 施設紹介投稿を生成する。

引数: $ARGUMENTS（`carousel [テーマ]` or `facility [施設ID]`。省略時はカルーセルを提案）

## 手順

### 0. 投稿タイプ判定

- `carousel` → カルーセル投稿（A）
- `facility` → 施設紹介投稿（B）
- 引数なし → テーマを提案して確認

---

## A. カルーセル投稿

### A-1. テーマ確認

引数でテーマ指定があればそれを使用。なければ以下から提案:

テーマ例:
- 「東京でデート向きの個室サウナ5選」
- 「3,000円以下で行ける個室サウナ5選」
- 「外気浴が気持ちいい個室サウナ5選」
- 「深夜でも行ける個室サウナ5選」
- 「女性1人でも行きやすい個室サウナ5選」
- 「北海道の個室サウナ5選」

`docs/ig-post-log.md` を確認し、未投稿のテーマを優先。

### A-2. 施設選定

`data/facilities.json` からテーマに合う施設を5-7件選定。

選定基準:
- テーマの条件に合致する
- 画像が3枚以上ある（`public/facilities/{id}-{0,1,2}.webp`）
- `closedAt` がない（営業中）
- 地域バランス（同じ都道府県に偏らない）

### A-3. 事実確認

選定した施設の公式サイトを WebFetch で確認:
- 営業中か（閉店・長期休業していないか）
- カップルOK等の条件が正しいか
- 料金に大幅な変更がないか

### A-4. スライド画像生成

以下のHTMLテンプレートを施設データで書き換え、Playwrightでスクショする。

1. **カバースライド**: `scripts/ig-carousel-cover.html`
   - `{{CATEGORY}}` → 英語カテゴリ（例: "PRIVATE SAUNA × DATE"）
   - `{{TITLE}}` → 日本語タイトル（例: "東京でデート向きの個室サウナ 5選"）
   - `{{CRITERIA_TAGS}}` → 選定基準タグのHTML

2. **施設スライド** × 5-7枚: `scripts/ig-carousel-slide.html`
   - `{{NUM}}` → 番号
   - `{{NAME}}` → 施設名
   - `{{ACCESS}}` → 最寄り駅アクセス
   - `{{PRICE}}` → 料金
   - `{{POINT}}` → 推しポイント1行
   - `{{IMAGE_PATH}}` → 施設画像のフルパス（`/path/to/public/facilities/{id}-0.webp`）

3. **CTAスライド**: `scripts/ig-carousel-cta.html`

#### スクショ手順

```bash
# ローカルサーバー起動（テンプレートHTMLを配信）
python3 -m http.server 8765 --directory scripts &
SERVER_PID=$!
```

Playwright MCP で:
1. `browser_navigate` → `http://localhost:8765/ig-carousel-cover.html`
2. `browser_resize` → width: 1080, height: 1350
3. `browser_take_screenshot` → `ig-{theme}-cover.png`

施設スライドごとに:
1. テンプレートHTMLを施設データで書き換えて一時ファイルに保存
2. `browser_navigate` → 一時ファイル
3. `browser_take_screenshot` → `ig-{theme}-{num}.png`

最後にCTAスライド:
1. `browser_navigate` → `http://localhost:8765/ig-carousel-cta.html`
2. `browser_take_screenshot` → `ig-{theme}-cta.png`

```bash
# サーバー停止
kill $SERVER_PID
```

### A-5. キャプション生成

`docs/character-guide.md` に準拠したサウナ子ボイスで生成。

```
{テーマを1行で}

{選んだ基準・語りかけ（2-3行）}

❶ {施設名}（{エリア}）
→ {推しポイント1行}

❷ ...

保存して次のお出かけの参考にしてね
条件で探したい人はプロフのリンクからどうぞ!
```

ルール:
- 友達口調（だよ/かも/ね/よ）
- 敬語禁止
- 価格の具体的な言及は避ける
- 500-800文字程度

### A-6. ハッシュタグ生成

10-15個。キャプション末尾に配置。

- Tier1（固定3-5）: `#個室サウナ` `#サウナ` `#サウナ好きな人と繋がりたい`
- Tier2（地域3-5）: テーマに応じた地域タグ
- Tier3（広域2-3）: `#ととのう` `#サ活` + テーマタグ

---

## B. 施設紹介投稿

### B-1. 施設選定

引数でIDが指定されていればそれを使用。なければ:
1. `docs/ig-post-log.md` で未投稿の施設
2. Search Console で imp が多い施設
3. 画像が3枚以上ある施設
4. 地域バランス

**重複禁止**: `docs/ig-post-log.md` に記録済みの施設は再投稿しない。

### B-2. 事実確認

公式サイトを WebFetch で確認（A-3と同じ）。

### B-3. 画像選定

既存3枚を使用:
- `public/facilities/{id}-0.webp`
- `public/facilities/{id}-1.webp`
- `public/facilities/{id}-2.webp`

### B-4. キャプション生成

施設の魅力を長文で紹介（500-1000文字）。

```
{施設名で1行フック}

{施設の魅力を3-5行で紹介。サウナ子の感想を交える}

📍 {住所}
🚶 {最寄り駅}から徒歩{分}分
💰 {料金}円〜

詳しくはプロフのリンクから🔗
```

ルール:
- `docs/character-guide.md` 準拠
- 友達口調、敬語禁止
- 施設への否定的なコメント禁止
- 他施設との比較禁止

### B-5. ハッシュタグ生成

10-15個。地域タグを含める。

---

## 共通: プレビュー・保存

### プレビュー表示

1. **画像プレビュー**（カルーセル: 全スライド / 施設: 3枚）
2. **キャプションプレビュー**（ハッシュタグ含む）
3. 「確認して問題なければ手動で投稿してね」

### 下書き保存

`docs/ig-drafts.md` に保存:

```markdown
## {日付} — {タイプ}: {テーマ or 施設名}

### キャプション
{キャプション全文 + ハッシュタグ}

### 画像
- {画像パス1}
- {画像パス2}
- ...
```

### ログ記録

`docs/ig-post-log.md` に追記:

```markdown
| {日付} | {タイプ} | {テーマ or 施設名} | {施設ID一覧} |
```

---

## 注意事項

- 閉店・休業が判明した場合は投稿を中止し、`closedAt` の設定を提案
- 料金の具体的な金額はキャプションに含めない（キャラクターガイドのNGルール）
- 施設への否定的な情報は投稿しない
- 画像生成に失敗した場合は手動で投稿する旨を案内
- IGは手動投稿（API不使用）— Claudeはコンテンツ生成のみ
