# 個室サウナ スカウト（収集→追加 一気通貫）

新施設の情報収集から `facilities.json` への追加までを一括で行う。

## 手順

### Phase 1: ニュース収集

WebSearch で以下のキーワードを**並列で**検索する（現在の年を使用）:

- 「個室サウナ オープン {current_year}」
- 「プライベートサウナ 新店 {current_year}」
- 「個室サウナ 新規オープン {current_year}」
- 「site:prtimes.jp サウナ 個室 {current_year}」
- 「site:sauna-ikitai.com 個室サウナ」

「個室サウナ」に該当しない施設（公衆サウナ、スパ施設のサウナコーナー等）は除外する。
直近3ヶ月以内のニュースを優先する。

### Phase 2: 既存施設と照合

`data/facilities.json` を読み込み、既存の施設名リストと照合する。

以下の形式でテーブルにまとめる:

| 状態 | 施設名 | エリア | オープン日 | URL |
|------|--------|--------|-----------|-----|
| ⭐ NEW | （未登録施設） | ... | ... | ... |
| ✅ 登録済 | （既存施設） | ... | ... | ... |
| ❓ 要確認 | （名前が微妙に違う等） | ... | ... | ... |

### Phase 3: 追加する施設を選択

未登録施設（⭐ NEW）がある場合、AskUserQuestion でどの施設を追加するか選択してもらう。
複数選択可（multiSelect: true）。
「追加しない」の選択肢も用意する。

### Phase 4: 選択された施設を順次追加

選択された各施設について以下を実行する:

#### 4-1. 情報収集
WebFetch/WebSearch で施設の公式サイトから情報を収集:
- 施設名、住所、最寄り駅・徒歩分数、料金プラン、営業時間、定休日
- 設備（水風呂・水風呂温度・セルフロウリュ・外気浴・カップル利用・Bluetooth・Wi-Fi）
- アメニティ、電話番号、予約URL、公式サイトURL

#### 4-2. 緯度経度の取得
WebSearch で「{施設名} {住所} 緯度 経度」から lat/lng を取得。
見つからない場合は住所から概算値を設定し「要確認」と明記。

#### 4-3. ID・slug の自動採番
- `id`: 既存の最大ID + 1（複数追加時はインクリメント）
- `slug`: 施設名からローマ字/英語のケバブケースで生成

#### 4-4. サウナ子コメントの生成
`docs/character-guide.md` のガイドラインに準拠:
- **saunakoCommentShort** (20〜40文字): 施設の最大の特徴を端的に。体言止めや「!」で歯切れよく
- **saunakoCommentLong** (80〜200文字): 水風呂温度・ロウリュ・外気浴など具体的に。友達口調で
- 敬語禁止、断定しすぎ禁止、他施設比較禁止

#### 4-5. description の生成
施設の概要を客観的な説明文として100〜200文字で生成。

#### 4-6. エントリの組み立て
以下のスキーマに準拠したJSONオブジェクトを生成:

```json
{
  "id": <number>,
  "slug": "<string>",
  "name": "<string>",
  "prefecture": "<lowercase-string>",
  "prefectureLabel": "<string>",
  "city": "<string>",
  "area": "<string>",
  "address": "<string>",
  "nearestStation": "<string>",
  "walkMinutes": <number>,
  "priceMin": <number>,
  "duration": <number>,
  "capacity": <number>,
  "features": {
    "waterBath": <boolean>,
    "waterBathTemp": "<string|null>",
    "selfLoyly": <boolean>,
    "outdoorAir": <boolean>,
    "coupleOk": <boolean>,
    "bluetooth": <boolean|null>,
    "wifi": <boolean|null>
  },
  "businessHours": "<string>",
  "holidays": "<string>",
  "website": "<string>",
  "phone": "<string>",
  "bookingUrl": "<string|null>",
  "amenities": ["<string>"],
  "note": "<string|null>",
  "images": [],
  "lat": <number>,
  "lng": <number>,
  "description": "<string>",
  "saunakoCommentShort": "<string>",
  "saunakoCommentLong": "<string>",
  "updatedAt": "<YYYY-MM-DD>",
  "plans": [
    {
      "name": "<string>",
      "price": <number>,
      "duration": <number>,
      "capacity": <number>
    }
  ],
  "timeSlots": null
}
```

- `images` は Phase 7 で取得するため空配列 `[]` で初期化
- `priceMin` / `duration` / `capacity` はプランの中で最も基本的なものの値を使う
- `area` は既存施設の同一 prefecture のものを参照して設定
- `updatedAt` は実行日の日付
- 情報が取得できなかった項目は `null` または空文字にし「要確認」と明記

### Phase 5: ユーザー確認

生成した全エントリをまとめて表示し、AskUserQuestion で確認:
- 内容に問題がないか
- 修正したい項目があるか

### Phase 6: データ追加 + QA

承認後:
1. `data/facilities.json` の配列末尾にエントリを追加
2. QA Agent（`npm run build && npm run lint`）でビルドが通ることを確認
3. ビルド成功したら main にコミット & プッシュ

### Phase 7: 施設画像の取得

データ追加後、各施設の画像を3枚取得する。

#### 画像取得ルール
- **公式HPのみ使用**（sauna-ikitai.com は使用禁止）
- **人物が写っていない画像のみ**（施設内観・設備のみ）
- PR Times のプレスリリースは公式の補助ソースとして利用可
- Coubic/STORES 予約ページの施設写真も利用可

#### 変換仕様
```bash
cwebp -q 80 -resize 800 0 /tmp/input.jpg -o public/facilities/{id}-{index}.webp
```
- 形式: webp、幅800px、品質80
- ファイル名: `{id}-{0,1,2,3}.webp`（0 はサムネイル）

#### 画像取得Tips（実績ベース）

**SPA/JS レンダリングサイト対応:**
- Bubble.io, Nuxt.js, Wix, Studio Design, Framer, Laravel/Vue 等のSPA は WebFetch で画像URLが取れない
- → Playwright でDOMから直接画像URLを抽出する
- CSS `background-image` で画像を配置しているサイトも多い（特に Framer, WordPress テーマ）

**画像ソースの優先順位:**
1. 公式HP の `<img>` タグ
2. 公式HP の CSS `background-image`
3. PR Times プレスリリース画像
4. Coubic/STORES 予約ページの施設写真
5. atpress.ne.jp 等の公式プレスリリース

**よくある問題と対処:**
| 問題 | 対処 |
|------|------|
| ロゴ画像を誤取得 | ファイルサイズが小さい（<10KB）場合はロゴの可能性あり。必ず目視確認 |
| 人物が写っている | Read で webp を目視確認。手・足だけでも除外が安全 |
| SSL証明書エラー | PR Times やプレスリリースサイトから代替取得 |
| WordPress サムネイル（320x320等） | `-1024x768` 等のサフィックスを試してフルサイズ取得 |
| cwebp が CMYK JPEG を処理できない | 別の画像を選ぶか、ImageMagick で RGB 変換してから cwebp |
| 画像に透過(alpha)がある | webp 変換後に黒背景になることがある。PNG→JPG 変換してから cwebp |
| ウォーターマーク付き画像 | メーカーロゴ（「出典：○○HPより」等）がある場合は別画像を選ぶ |

**バッチ処理のコツ:**
- 10施設ずつ3並列のサブエージェントで処理（3-4施設/エージェント）
- 各エージェントに画像の目視確認まで含めて委任する
- facilities.json の更新は全画像取得後にまとめて行う
- エージェントのコンテキストサイズ制限に注意（大きい画像を多数 Read するとオーバーする）

#### 画像取得後の処理
1. `data/facilities.json` の `images` 配列にパスを追加
2. QA Agent でビルド確認
3. コミット & プッシュ
