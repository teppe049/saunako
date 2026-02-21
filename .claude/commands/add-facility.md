# 施設データ追加

引数として施設のWebサイトURL、または施設名を受け取り、`facilities.json` へのエントリと サウナ子コメントを自動生成する。

引数: $ARGUMENTS

## 手順

### 1. 施設情報の収集

引数がURLの場合は WebFetch でページを取得。施設名の場合は WebSearch で公式サイトを検索してから WebFetch。

以下の情報を収集する:
- 施設名
- 住所（都道府県・市区町村・番地）
- 最寄り駅と徒歩分数
- 料金プラン（プラン名・料金・時間・人数）
- 営業時間・定休日
- 設備情報（水風呂・水風呂温度・セルフロウリュ・外気浴・カップル利用・Bluetooth・Wi-Fi）
- アメニティ
- 電話番号
- 予約URL
- 公式サイトURL

### 2. 緯度経度の取得

WebSearch で「{施設名} {住所} 緯度 経度」または Google Maps の情報から lat/lng を取得する。
見つからない場合は住所から概算値を設定し、要確認フラグをつける。

### 3. ID・slug の自動採番

`data/facilities.json` を読み込み:
- `id`: 既存の最大ID + 1
- `slug`: 施設名からローマ字/英語のケバブケースで生成（例: "sauna-lab-nagoya"）

### 4. サウナ子コメントの生成

`docs/character-guide.md` のガイドラインに準拠してコメントを生成する:

- **saunakoCommentShort** (20〜40文字): 施設の最大の特徴を端的に。体言止めや「!」で歯切れよく
- **saunakoCommentLong** (80〜200文字): 水風呂温度・ロウリュ・外気浴など具体的に。友達口調で
- 敬語禁止、断定しすぎ禁止、他施設比較禁止

### 5. description の生成

施設の概要を客観的な説明文として100〜200文字で生成。
アクセス情報、主な特徴、ターゲット層などを含める。

### 6. エントリの組み立て

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

### 7. ユーザー確認

生成したエントリを表示し、AskUserQuestion で以下を確認:
- 内容に問題がないか
- 修正したい項目があるか
- 記事ドラフト（MDX）も生成するか

### 8. データ追加

承認後、`data/facilities.json` の配列末尾にエントリを追加する。

### 9. prefecture の area マッピング

既存の `facilities.json` で同じ `prefecture` の施設がどの `area` に属しているかを確認し、適切な area を設定する。
新しい prefecture の場合は適切な area 名を提案する。

### 10. QA チェック

実装完了後、QA Agent（`npm run build && npm run lint`）でビルドが通ることを確認する。

## 注意事項

- `images` は空配列 `[]` で初期化（画像は後で手動追加）
- `priceMin` / `duration` / `capacity` はプランの中で最も基本的なものの値を使う
- 情報が取得できなかった項目は `null` または空文字にし、コメントで「要確認」と明記
- `updatedAt` は実行日の日付を `YYYY-MM-DD` 形式で設定
