# GSC 再クロール依頼（2026-10-04）— Claude in Chrome 用 指示書

GSC MCP は読み取り専用で「インデックス登録をリクエスト」を送れない。Claude in Chrome に下の指示文を貼って、8URLを送ってもらう。

## 何を・なぜ送るか

| 優先 | URL | 変更内容（10/4まで） |
|---|---|---|
| A | `https://www.saunako.jp/area/tokyo` | 「目的で探す」ブロックを追加し、東京デート記事へ内部リンク（`1b2b2ab`）。GSCクリックの約4割を占めるページ |
| A | `https://www.saunako.jp/articles/tokyo-date-private-sauna-guide` | 9/30に料金比較表・結論ブロックを追加済み。10/4に上記の内部リンクの行き先になった。現在9.82位（90imp） |
| A | `https://www.saunako.jp/facilities/498` | 新規施設 SAUNA Giraffe 中洲（福岡）を追加（`96283ca`） |
| B | `https://www.saunako.jp/area/fukuoka/fukuoka-city` | 福岡市エリアのタイトル・説明の件数を10選→11選に更新 |
| B | `https://www.saunako.jp/area/fukuoka` | 中洲店を追加（福岡の施設数が増えた） |
| B | `https://www.saunako.jp/articles/ehime-private-sauna-guide` | 浅海店・湯婀の掲載終了で全6施設→全4施設に更新 |
| C | `https://www.saunako.jp/area/ehime/matsuyama` | 掲載終了の2施設（旧URL）の転送先。件数が変わった |
| C | `https://www.saunako.jp/facilities/45` | 9/30時点で「クロール済み・インデックス未登録」だった（HUBHUB 下北沢）。料金修正後の状態を確認 |

## Claude in Chrome への指示文（ここから下をそのまま貼る）

```
あなたは Google Search Console で、下記のURLを「インデックス登録をリクエスト」する作業をします。
ブラウザには既に Google アカウントでログイン済みです。
ログインを求められたら作業を止めて報告してください（認証情報は入力しない）。

## 絶対に守ること
- 使うのは「URL 検査」と「インデックス登録をリクエスト」だけ
- 左メニューの「削除」「URLの削除」ツールは絶対に開かない・押さない（過去に「サイト全体の一時削除」でGoogleのトラフィックが消えた事故があるため）
- 設定・所有権・サイトマップ・リンク・ユーザー管理など、他の画面は触らない
- プロパティは「saunako.jp」（ドメインプロパティ、sc-domain:saunako.jp）

## 手順（URLごとに繰り返す。1URLにつき1つの新しいタブを使う）
1. 新しいタブで https://search.google.com/search-console?resource_id=sc-domain%3Asaunako.jp を開く。左メニューが動き終わるまで少し待つ
2. 画面上部の検索欄（「saunako.jp のすべてのURLを検査」）にURLを貼り付けて Enter
   - 注意: inspect?...&id=<URL> のような直リンクは404になるので使わない。必ず検索欄から入れる
3. 検査結果が出たら、見出し（「URLはGoogleに登録されています」「URLはGoogleに登録されていません」など）を控える。「最終クロール」の日時と「ユーザー指定canonical / Google が選択したcanonical」も控える
4. 「インデックス登録をリクエスト」をクリックして1回だけ押す
   - 「公開URLをテスト中」の画面が数十秒続くことがある。そのまま待つ
5. リクエストを送った後の確認ダイアログが出ている間は拡張機能のツールが失敗しやすい。**15秒待ってから**スクリーンショットを撮る
6. 結果（「インデックス登録をリクエスト済み」または「割り当てを超過」などのメッセージ）を控え、そのタブを閉じる。次のURLは新しいタブで開く

## 対象URL（上から順に。上限に達したら残りは翌日に回すので、そこで止めて報告）
1. https://www.saunako.jp/area/tokyo
2. https://www.saunako.jp/articles/tokyo-date-private-sauna-guide
3. https://www.saunako.jp/facilities/498
4. https://www.saunako.jp/area/fukuoka/fukuoka-city
5. https://www.saunako.jp/area/fukuoka
6. https://www.saunako.jp/articles/ehime-private-sauna-guide
7. https://www.saunako.jp/area/ehime/matsuyama
8. https://www.saunako.jp/facilities/45

## 途中で止めるべきケース
- ログインを求められた
- 「割り当てを超過しました」と出た（その時点のURL以降は未実施として報告）
- 検査結果が「URLがGoogleに認識されていません」で、かつ「インデックス登録をリクエスト」ボタンが出ない（理由を報告）
- 「削除」に関する画面が開いてしまった（何も押さずに閉じて報告）

## 報告フォーマット（表で）
| # | URL | 検査結果の見出し | 最終クロール | canonical（Google選択） | リクエスト結果 |
最後に、想定外だったこと・途中で失敗して再試行した箇所を書く。
```

## 結果を受け取ったら

- 「登録されていない」と出た URL があれば、`index_inspect`（GSC MCP）で後日確認する
- 特に **`/facilities/498` と `/facilities/45`** は未登録のままになりやすい。10/11の `/analytics-pdca` で状態を見る
- 効果は10/11に確認する（デート記事の順位 9.82位から上がるか、`/area/tokyo` からの遷移PV）

## 補足

Bing/Yandex には IndexNow（`node scripts/indexnow.mjs /area/tokyo ...`）で、同じURLを個別に通知できる。Google の再クロール依頼とは別の作業。
