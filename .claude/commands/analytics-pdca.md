# Analytics PDCA（GA4 × Search Console）

検索流入の施策を「仮説と成功基準を書いてから出し、4 週間後に対照と比べて判定する」で回す。
施策の記録と判定のルールは `docs/seo-change-log.md`（SEO 変更台帳）が正で、このコマンドは台帳の行を進める。

## 引数

$ARGUMENTS — `weekly`（省略時）/ `monthly` / 見たいテーマ（例: "千葉"、"送客"）

| 回 | やること | 手順 |
|---|---|---|
| weekly | 期日を迎えた施策の判定と、異常の確認 | 0 → 1 → 2 → 5 |
| monthly（月初。計測中が 2 行以下になったときも） | 上に加えて、次の施策を選んで出す | 0 → 1 → 2 → 3 → 4 → 5 |

前回の判定（Act）を必ず先にやる。判定を後回しにして新しい施策を足すと、どれが効いたか分けられなくなる（/area/tokyo に 10/4・10/6・10/13・11/1 と続けて手を入れ、切り分けられなくなった）。

## 道具

`node scripts/seo-analytics.mjs <サブコマンド>`（Search Console API・GA4 Data API を直接叩く。出力は JSON）

| サブコマンド | 用途 |
|---|---|
| `check` | 疎通確認 |
| `gsc-compare` | 施策の前後比較。対象ページ・対照ページ群・判定語の順位を 1 回で出す |
| `gsc-opps` | 次の候補。指名と施設ページを除き、4〜20 位にいる表示の多いページ順 |
| `gsc-noise` | 何もしていないページの 28 日どうしのぶれ。台帳のしきい値を測り直すときだけ |
| `inspect` | URL 検査（インデックス状況・canonical）。1 日 2,000 件まで |
| `gsc` / `ga4` | 上で足りないときの生クエリ（`gsc --query-regex` / `--page-regex`、`ga4 --filter-dimension` 等。使い方はファイル先頭） |

- **判定に使う数字は `gsc-compare` の出力をそのまま使う。** その場で書いた集計で判定しない（回ごとに計算が変わり、結論がぶれる）
- 認証は GA4・GSC の MCP と同じサービスアカウント鍵（`~/.secrets/mcp-keys/ga4-mcp-key.json`）。gcloud のログインは要らない
- GSC の siteUrl は `sc-domain:saunako.jp`、GA4 プロパティは `524886555`（どちらも CLI の固定値）。GA4 のページ軸は `pagePath`（`page` はエラー）
- MCP（`mcp__search-console__*`・`mcp__google-analytics__*`）は CLI に無い見方をするときの補助。判定と基準値には使わない

## 手順

### 0. 疎通確認

```bash
node scripts/seo-analytics.mjs check
```

`ga4.status == "OK"` と、`gsc_sites.siteEntry` に `sc-domain:saunako.jp` があることを確認する。使えなければ止めて Teppei に伝える。

### 1. Act: 期日を迎えた行を判定する

台帳の「計測中」を読み、**判定日（計測予定日の 3 日後）を過ぎた行だけ**判定する。期日前の行は数字を見ても判定を書かない。

各行の「コマンド」をそのまま実行する（例）:

```bash
node scripts/seo-analytics.mjs gsc-compare --release 2026-11-12 --pages /area/okayama \
  --control-prefix /area/ --exclude /area/tokyo,/area/chiba \
  --queries "岡山 プライベートサウナ,岡山 個室サウナ"
```

- `--release` は反映前日までの 28 日と反映翌日からの 28 日を作る。変更が 2 回あった行は `--before` / `--after` を台帳どおりに渡す
- `--pages`・`--queries`・`--control-prefix`・`--exclude` は台帳の行に書いてあるとおりに渡す。**判定語を後から足したり外したりしない**
- 対照は「`--before` の最初の 7 日に既に表示のあったページ」に CLI が絞る（公開直後のページは何もしなくても伸びるため）。/area/ の対照からは /area/tokyo を必ず外す
- `net` は対象の伸び ÷ 対照の伸び。しきい値は台帳の「成功基準の置き方」（imp 1.5 / 0.5、clicks 2.0 / 0.3）
- `warnings` が出たらその数字では判定しない（未確定の日を含む・対照が小さい）
- `queries[].other_pages_after` に別のページが出ていたら、受け皿が割れている

判定は台帳の「判定の 3 値」に従って 成功・失敗・判定不能 のどれかを付け、行を「計測済み」へ移す。失敗・判定不能は理由を 1 つ選んで書く。語の扱いが決まったら「取れない語・打ち止めの語」「取りに行く語」も直す。

### 2. Check: 異常がないか

毎回見るのは次の 4 つだけ。広く眺めて所感を書くことはしない。

| 見るもの | コマンド | 異常の目安 |
|---|---|---|
| 検索の clicks・imp（日別 28 日） | `gsc --start <31 日前> --end <3 日前> --dimensions date --row-limit 60` | 直近 7 日が前の 7 日の ±30% を超える |
| 検索エンジン別セッション | `ga4 --start 28daysAgo --end yesterday --dimensions sessionSource --metrics sessions --filter-dimension sessionDefaultChannelGroup --filter-value "Organic Search"` | Google 以外の比率が急に変わる（2026-10 時点は google 約 82%・yahoo 約 12%・bing 約 5%） |
| 送客（予約ページへの遷移） | `ga4 --start 28daysAgo --end yesterday --dimensions date --metrics eventCount --filter-dimension eventName --filter-value click_reservation_link` | 直近 7 日が前の 7 日の ±30% を超える。公式サイト・電話は `click_external_link`（`customEvent:link_type`） |
| インデックス | `inspect --urls <直近 4 週間に変更したページ・台帳の計測中のページ>` | `verdict` が `PASS` でない、`canonical_mismatch` が出る |

- **GSC が 0 件・急減したら**、まず GSC の「削除」タブと `inspect` を確認する（2026-03-10〜07-02 の消滅の真因は削除ツールの「サイト全体」申請だった）。削除ツールを使うときは対象範囲（個別 URL／前方一致／サイト全体）を必ず確かめる
- 異常があれば、ページ群（`/area/`・`/articles/`・`/facilities/`）→ ページ → 語の順に絞って原因を 1 つ書く。無ければ「異常なし」の 1 行で終える
- インデックスされていないページは、Claude in Chrome で GSC の登録リクエストを出す（手順は MEMORY の reference_gsc-reindex-claude-in-chrome。Teppei に確認してから）
- GA4 の PV は内部回遊を含むので、検索流入の増減の根拠にしない。検索は GSC、送客は GA4 のイベントで見る
- Bing・Yahoo は GSC に出ない。セッション数を見るだけでよい
- **同じ指摘が 2 回続いたら Issue にする**（CLAUDE.md の優先度・カテゴリラベルを付ける）。メモに書き続けても直らない

### 3. Plan: 次の施策を 1〜2 件選ぶ（monthly）

同じページ群で計測中のページが半分を超えるなら、新しい施策を足さない（対照に使えるページが無くなる）。/area/tokyo は前の変更から 4 週間たっていなければ候補にしない（CLAUDE.md）。

**3-0. 受け持ちページの確認（施策を出す前に必須。2026-11-12〜）**

記事の新規作成・リライト、エリアページへの追記を提案する前に、狙う語を既に受けているページを確かめる。既に出ているページがあれば、新しく書かずにそのページを直す施策にする（10/29 に東京ガイド記事を「都内」向けにリライトしたが、同じ語は /area/tokyo が受けていて不発だった）。

```bash
node scripts/seo-analytics.mjs gsc --start <31 日前> --end <3 日前> --dimensions query,page --query-regex "都内|東京"
```

- `#` 付きの URL（サイトリンク表示）は CLI が本体のページに寄せる（imp は二重になるので足さず、クリックだけ寄せる）
- ページ合計の平均順位はクエリ構成が違うので、ページ同士の比較には使わない。重なりを言うときは同じ語で絞った数字を出す
- 同じ語に 2 ページが近い順位で出ていたら、どちらを受け持ちにするかを施策案に含めて Teppei に確認する
- 記事の更新そのもの（施設の追加・閉店、料金改定、鮮度更新）はこの確認を待たずに都度入れてよい（2026-11-12 Teppei）
- `/article-seo-upgrade` の Step 0 も同じ確認

**3-1. 候補を出す**

```bash
node scripts/seo-analytics.mjs gsc-opps --start <31 日前> --end <3 日前> \
  --exclude <台帳の計測中のページ> --top 10
```

施設ページ（`/facilities/*`）は候補に入れない。5 位以下の指名検索は公式サイトと予約サイトが上にいて、メタでは動かない（2026-09-16 確定）。施設ページは施策 A（データの充実）で扱う。

**3-2. 語の順位帯で打ち手を決める**（`queries[].lever` に同じものが出る）

| 順位 | 打ち手 |
|---|---|
| 1〜3 位 | title・description（CTR） |
| 4〜10 位 | title＋本文の充実 |
| 11〜20 位 | 本文の深さ・内部リンク・FAQ。title だけでは動かない |
| 21 位〜 | 専用ページ・検索意図の見直し・被リンク。または取れない語と判断する |

**3-3. 取れる語かを確かめる**

1. `flag` の付いた語（10 位以内で 0 クリック）と、台帳の「取れない語・打ち止めの語」にある語は外す。title の問題ではなく検索意図のずれであることが多い
2. 受け皿: 3-0 の確認で、その語を既に受けているページがあればそのページを直す
3. 検索結果: 台帳に無い語は、browser エージェント（直列。並列にしない）で `https://www.google.com/search?q=<語>&hl=ja&gl=jp&pws=0` を開き、上から 10 件のホスト名・パス・タイトルを取る。1 エージェントに 5〜6 語まとめる。判定は台帳の「検索結果の見方」、結果は確認日付きで台帳に足す

**3-4. 送客の多いページ群を先にする**

```bash
node scripts/seo-analytics.mjs ga4 --start 28daysAgo --end yesterday \
  --dimensions landingPage,sessionDefaultChannelGroup --metrics eventCount \
  --filter-dimension eventName --filter-value click_reservation_link --order-metric eventCount --limit 30
```

Organic で入って予約ページへ送れているページ群を優先する。clicks が増えても送客が増えないページは後に回す。

**3-5. 仮説を台帳の書式で書く**

候補ごとに 変えること・仮説・判定語・成功基準・対照・コマンド を台帳の「計測中の書式」で書き、**AskUserQuestion** で Teppei に選んでもらう。成功基準は台帳の「成功基準の置き方」に従う。見込みの CTR は `gsc-opps` の `ctr_curve`（自サイトの順位帯別 CTR）から置き、`reliable: false` の帯と業界の一般値は使わない。基準値は `gsc --page-regex` で反映前 28 日のページ軸を取る。

### 4. Do: 実装して出す（monthly）

- エリアページの title・description は `src/app/area/[prefecture]/page.tsx`（サブエリアは `SUB_AREA_META`）、記事は MDX の frontmatter、施設は `data/facilities.json` の `seoTitle` / `seoDescription`
- **1 つのページに出す変更は 1 つの仮説ぶんだけ。** 台帳の行は実装と同じコミットに入れる
- seoTitle・seoDescription の一括変更は 1 デプロイ 30 施設まで・1 週間あける（CLAUDE.md）。title に「サウナ子」を含めるなら absolute 指定
- 検証は CLAUDE.md の QA どおり `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`
- 本番反映後に `inspect` で再クロールを確認し、古いままなら GSC の登録リクエストを出す

### 5. 記録

- 台帳: 判定した行を「計測済み」へ、出した施策を「計測中」へ。サイト全体に効く変更を出したら「全体の変更」へ
- MEMORY: その回のスナップショット（GSC 7 日の clicks・imp、Organic セッション、`click_reservation_link`、判定の結果）を `project_analytics-pdca-<日付>.md` に残す。台帳に書いたことは繰り返さない。MEMORY.md の「効果測定の予定」には台帳への案内だけを置く
- 次に判定日を迎える行と日付を最後の返答に書く

## 数字を読むときの注意

- GSC の終了日は 3 日以上前にする。CLI が `warnings` / `warning` を出したらその数字で判定しない（11/12 に記録した千葉の基準値は未確定の日を含んでいて、取り直すと 9.8 位 → 9.3 位になった）
- ページの合計は page 軸で取る。query×page を足し上げると匿名化された語が抜けて小さく出る（/area/okayama の 28 日で 1,812 imp のうち、語が見えるのは 1,439）
- 前後の期間は同じ日数で、7 の倍数にする（曜日の偏りを消す）
- 順位を基準にする語は、変更前 28 日に 10 imp 以上あるものに限る
- しきい値を測り直すとき: `gsc-noise --before <28 日> --after <次の 28 日> --prefix /area/ --exclude /area/tokyo,<その期間に変更したページ> --min-imp 500`。結果は台帳の表を差し替える
