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

- `images` は空配列 `[]` で初期化
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
