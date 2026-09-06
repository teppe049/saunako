# GA4 カスタムディメンション登録 — Claude in Chrome 用 指示書

作成日: 2026-09-06
対象プロパティ: サウナ子（GA4 プロパティID `524886555` / 測定ID `G-EDQ38S7W3J`）

## なぜ必要か

サイトは `ui_click` などのイベントに `action` / `facility` / `count` 等のパラメータを付けて送っているが、
**GA4 側でカスタムディメンションとして登録しないと、レポートにも Data API にも出てこない**
（2026-09-06 に `customEvent:action` で API を叩いたら `INVALID_ARGUMENT`＝未登録を確認）。
登録した時点から集計が始まり、**遡及しない**。/pick 機能（候補シェア）の効果測定は `action` の分解が前提なので、デプロイ直後に登録する。

## 登録するもの（16件・すべて「イベント」スコープ）

上限は 50 件/プロパティ。名前は後から変更できるがディメンション自体は削除不可（アーカイブのみ）なので、**イベントパラメータ名は下表どおり正確に**入力する。

| # | ディメンション名 | イベントパラメータ | 説明（説明欄にそのまま貼る） | 主なイベント |
|---|---|---|---|---|
| 1 | action | `action` | UI操作の種別（pick_share / pick_toggle / favorite_toggle など） | ui_click |
| 2 | facility | `facility` | data-track-facility 由来の施設ID（お気に入り・候補トグル・/pick の各ボタン） | ui_click |
| 3 | facility_id | `facility_id` | 施設ID | view_facility, click_reservation_link, click_facility_card, click_external_link, click_ask_ai, ui_click |
| 4 | facility_name | `facility_name` | 施設名 | view_facility, click_reservation_link, click_facility_card, ui_click |
| 5 | area | `area` | 都道府県ラベル | view_facility |
| 6 | destination_type | `destination_type` | 予約リンクの遷移先種別（booking / website） | click_reservation_link |
| 7 | link_type | `link_type` | 外部リンク種別（website / phone など） | click_external_link |
| 8 | service | `service` | AIに聞くボタンのサービス名（chatgpt / claude / gemini / perplexity） | click_ask_ai, ui_click |
| 9 | page_type | `page_type` | AIに聞くボタンを押したページ種別（faq / facility / area） | click_ask_ai, ui_click |
| 10 | list_position | `list_position` | 一覧内の表示順位 | click_facility_card |
| 11 | index | `index` | グリッドカードの表示順位 | ui_click |
| 12 | count | `count` | 候補件数（pick_send_open / pick_share / pick_copy） | ui_click |
| 13 | filter | `filter` | 検索フィルタチップのキー | ui_click |
| 14 | purpose | `purpose` | トップ「目的から探す」のキー | ui_click |
| 15 | filter_type | `filter_type` | 検索フィルタの種類 | filter_change |
| 16 | filter_value | `filter_value` | 検索フィルタの値 | filter_change |

`search_term` は GA4 標準ディメンションとして既に見えるので登録しない。`destination_url` は URL が高カーディナリティで「(other)」に丸められるため登録しない。

---

## Claude in Chrome への指示文（ここから下をそのまま貼る）

```
あなたは Google アナリティクス 4 の管理画面で、カスタムディメンションを登録する作業をします。
ブラウザには既に Google アカウントでログイン済みです。ログインを求められたら作業を止めて報告してください（認証情報は入力しない）。

## 前提
- 対象プロパティ: 「サウナ子」プロパティID 524886555
- 作業はすべて「イベント」スコープのカスタムディメンション作成です。ユーザースコープ・アイテムスコープは作らない
- 何かを削除・アーカイブ・編集する操作は一切しない。作成のみ
- 同じイベントパラメータ名のディメンションが既に存在する場合は作成せずスキップし、「既存」として報告する

## 手順
1. https://analytics.google.com/analytics/web/#/a0p524886555/admin/customdefinitions/create を開く
   - 開けない場合は https://analytics.google.com/ を開き、左下の歯車「管理」→「データの表示」列の「カスタム定義」→「カスタムディメンション」タブ→右上「カスタム ディメンションを作成」の順に進む
   - プロパティ選択画面が出たら「サウナ子」（524886555）を選ぶ
2. 作成前に「カスタムディメンション」タブの一覧を確認し、既に登録済みのイベントパラメータ名を控える
3. 下の一覧を上から順に、1件ずつ作成する。フォームの入力は次のとおり:
   - ディメンション名: 表の「ディメンション名」
   - 範囲: 「イベント」
   - 説明: 表の「説明」
   - イベント パラメータ: 表の「イベントパラメータ」を正確に入力（候補リストに出てこなくても手入力で確定する）
   - 「保存」を押す。保存後に一覧へ戻ることを確認してから次へ進む
4. 16件すべて終わったら、一覧画面のスクリーンショットを撮り、以下の形式で報告する:
   - 作成した: ディメンション名の一覧
   - 既存でスキップした: ディメンション名の一覧
   - 失敗した: ディメンション名とエラーメッセージ
   - 一覧に表示されている件数（「◯/50」の表示）

## 登録一覧（ディメンション名 | イベントパラメータ | 説明）
1. action | action | UI操作の種別（pick_share / pick_toggle / favorite_toggle など）
2. facility | facility | data-track-facility 由来の施設ID（お気に入り・候補トグル・/pick の各ボタン）
3. facility_id | facility_id | 施設ID
4. facility_name | facility_name | 施設名
5. area | area | 都道府県ラベル
6. destination_type | destination_type | 予約リンクの遷移先種別（booking / website）
7. link_type | link_type | 外部リンク種別（website / phone など）
8. service | service | AIに聞くボタンのサービス名（chatgpt / claude / gemini / perplexity）
9. page_type | page_type | AIに聞くボタンを押したページ種別（faq / facility / area）
10. list_position | list_position | 一覧内の表示順位
11. index | index | グリッドカードの表示順位
12. count | count | 候補件数（pick_send_open / pick_share / pick_copy）
13. filter | filter | 検索フィルタチップのキー
14. purpose | purpose | トップ「目的から探す」のキー
15. filter_type | filter_type | 検索フィルタの種類
16. filter_value | filter_value | 検索フィルタの値

## 注意
- 保存時に「このイベント パラメータは過去 48 時間に収集されていません」のような警告が出ても、そのまま保存してよい（まだデプロイ直後で流れていないだけ）
- 「上限に達しました」と出たら、それ以降は作成せず報告する
- 途中でページ構成が説明と違っていたら、無理に推測して操作せず、現在の画面のスクリーンショットを撮って報告する
```

---

## 登録後の確認（Claude Code 側でやる）

登録から 24〜48 時間後に、GA4 MCP で次を実行して `INVALID_ARGUMENT` にならず行が返れば完了:

```
runReport
  dimensions: [{ name: "customEvent:action" }]
  metrics:    [{ name: "eventCount" }, { name: "totalUsers" }]
  dimensionFilter: eventName = ui_click
```

`/analytics-pdca` の効果測定（`/pick` 機能は 9/13 以降）でこのクエリを使う。判定ラインは `docs/`（`project_pick-share-feature-2026-09-06` メモリ）を参照。

## 今後パラメータを増やすとき

1. コード側で `data-track-xxx` 属性 or `sendGAEvent` のパラメータを追加する
2. この文書の表に1行足す
3. 上の指示文の「登録一覧」にも同じ行を足して Claude in Chrome に実行させる
4. 登録翌日以降に上記 runReport で疎通確認

パラメータ名の規則: `data-track-foo-bar` は AnalyticsTracker が `foo_bar` に変換して送る（ハイフン→アンダースコア）。登録するのは変換後の名前。
