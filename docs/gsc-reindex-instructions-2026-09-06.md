# GSC 再クロール依頼手順（2026-09-06）

GSC MCP のサービスアカウントは**読み取り専用**（`submit_sitemap` は 403）のため、再クロールは Teppei が GSC UI から手動で行う必要がある。

IndexNow（Bing / Yandex）は送信済み: 10URL・status 200。**以下はGoogle向けの作業**。

## 手順

1. [Google Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Asaunako.jp) を開く
2. 上部の検索バー（「URL を検査」）に下記URLを1件ずつ貼り付け
3. 検査結果が出たら「**インデックス登録をリクエスト**」をクリック
4. 次のURLへ（1日あたりの上限があるため、超えたら翌日に continue）

> ⚠️ **削除ツールには絶対に触らない**。3/10の「サイト全体一時削除」でGoogleトラフィックが消滅した事故がある（7/2にキャンセルして復活）。使うのは「URL検査」のみ。

## 優先度A: 施策1のメタ改善3施設（効果測定の対象・最優先）

9/20 の判定に間に合わせるため、**これは今日中に出す**。

```
https://www.saunako.jp/facilities/144
https://www.saunako.jp/facilities/252
https://www.saunako.jp/facilities/382
```

| URL | 施設 | 対象クエリ | 現状 |
|---|---|---|---|
| /facilities/144 | 88℃（岩倉） | サウナ 石仏 | 61imp / CTR 0% / 5.8位 |
| /facilities/252 | らくだとぺんぎん | らくだとぺんぎん | 117imp / CTR 1.7% / 5.7位 |
| /facilities/382 | NEST SAUNA | ネストサウナ | 73imp / CTR 0% / 5.7位 |

## 優先度B: 施策3のサブエリア4ページ

固有FAQ・料金比較表を新設したページ。GSCページ別に出現させたい。

```
https://www.saunako.jp/area/tokyo/shinjuku-kagurazaka
https://www.saunako.jp/area/tokyo/shibuya-ebisu-daikanyama
https://www.saunako.jp/area/tokyo/roppongi-azabu
https://www.saunako.jp/area/tokyo/ikebukuro
```

## 優先度C: 新規施設2件（未インデックス）

```
https://www.saunako.jp/facilities/496
https://www.saunako.jp/facilities/497
```

496 堀江サウナシバコヤ（大阪・南堀江）/ 497 サウナ神界（三重・津市）。
**497は `area/mie/tsu` を新設したため、`https://www.saunako.jp/area/mie/tsu` も併せてリクエストすると良い。**

## 優先度D: 余裕があれば

```
https://www.saunako.jp/area/tokyo
```

FAQの料金相場の記述を修正済み（池袋の誤った9,225円を5,700円に）。ただし高頻度でクロールされているページなので、自然な再クロールに任せてもよい。

## 完了後

MEMORY.md の効果測定テーブルに沿って、**9/20 に施策1、9/20・9/27 に施策3** を判定する。
判定基準は `docs/analytics-pdca-implementation-2026-09-06.md` を参照。
