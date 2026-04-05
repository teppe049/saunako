---
description: hacomono予約サイトから施設の料金・時間枠を自動取得
user-invocable: true
---

# hacomono 料金チェック

hacomono.jpを利用している施設の予約ページから、全プランの料金と時間枠を自動スクレイピングする。

## 使い方

引数なし: 全hacomono施設を一括チェック
引数あり: 指定URLのみチェック（例: `/hacomono-price-check https://sou-sauna.hacomono.jp/reserve/schedule/1/1/`）

## 手順

### 1. 対象施設の特定

引数がない場合、`data/facilities.json` から `bookingUrl` に `hacomono.jp` を含む施設を抽出。

### 2. スクレイピング実行

各施設に対して `/tmp` で以下のスクリプトを実行（playwright が `/tmp/node_modules` に必要。なければ `cd /tmp && npm install playwright`）:

```bash
cd /tmp && node /Users/teppei0409/Projects/saunako/scripts/hacomono-scraper.mjs "{bookingUrl}" "{施設名}"
```

### 仕組み（CLIのPlaywrightを使用）

1. 予約スケジュールページ（`/reserve/schedule/X/Y`）にアクセス
2. `.program-schedule-box` 要素から全プラン名を取得
3. 各プランの枠をJSの `dispatchEvent(new MouseEvent('click'))` でクリック → `/reserve/space/{spaceId}` に遷移
4. spaceIdから `/reserve/space/{spaceId}/ticket-purchase-register/?no=` にアクセス
5. ページ上の `¥X,XXX` を正規表現で抽出
6. 時間枠は親要素のテキストから `HH:MM - HH:MM` パターンを抽出

### 3. 結果の反映

取得した料金で `data/facilities.json` の `priceMin`/`priceMax` を更新。
- priceMin: 全プラン中の最安値
- priceMax: 全プラン中の最高値
- bookingUrl: schedule URLに更新

### 注意事項

- 全枠FULLの施設は料金取得不可（日を変えてリトライ可能）
- 会員制施設はチケットページに¥が表示されない場合あり
- 5施設以上は並列実行（`run_in_background`）で効率化
- KUDOCHI系は同一ドメインで店舗ごとにschedule URLが異なる
