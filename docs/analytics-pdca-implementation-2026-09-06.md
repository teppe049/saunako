# /analytics-pdca 実装指示書（2026-09-06）

対象週: 8/30〜9/5（PV 4,421・過去最高）。GSC は 9/3 分まで確定。
この指示書は「何を・どのファイルに・どう変えるか・どう測るか」を、別セッションでそのまま着手できる粒度で書く。

## 前提の訂正（調査で判明した2点）

### 訂正A: 「池袋ページに特別なFAQ・比較表がある」は誤り

`src/app/area/[prefecture]/[area]/page.tsx` を確認した結果、東京7サブエリアはすべて同一テンプレート（ヘッダー → サウナ子コメント → 自動FAQ 3問 → フィルタ＋一覧）。池袋だけに固有コンテンツは無い。池袋 241PV の源泉は「池袋 個室サウナ」3.2位という**順位そのもの**。
→ 施策3は「池袋パターンのコピー」ではなく「**サブエリアページにコンテンツ層を新設する**」に書き換えた。

### 訂正B: aichi-guide の「アンカー断片化でクリックを食われている」は GSC の集計仕様（施策2は取り下げ）

Quick Wins に出た `#アンカー` 付き13行は、同一クエリで imp が完全一致している（「プライベートサウナ 名古屋」58/58/58/54/54）。これは Google が同じ検索結果に「ジャンプリンク」を付けた際に、**1回の表示を断片ごとに重複計上**したもの。クリックは正規URLに帰属するため断片側が 0 になるだけで、実際は:

| クエリ | clicks | imp | CTR | 順位 |
|---|---|---|---|---|
| 名古屋 個室サウナ | 8 | 53 | 15.1% | 6.2位 |
| プライベートサウナ 名古屋 | 6 | 58 | 10.3% | 5.9位 |
| 名古屋 プライベートサウナ | 4 | 53 | 7.5% | 4.9位 |

記事本体は 49clicks / CTR 7.95% で健全。**見出し変更はやらない**（変えると既存のジャンプリンクが消える副作用のほうが大きい）。

---

## 施策1: 指名検索×5位台×CTR 0% の3施設 メタ改善

### 目的

「5位以下ならメタ改善は打ち止め」（`feedback_meta-vs-ranking`）の**例外検証**。順位が 5〜6位なのにクリックがゼロ／ほぼゼロなのは順位では説明できない。3施設だけ変えて、順位を動かさずに CTR が動くかを見る。

### 対象とベースライン（GSC 8/30〜9/3）

| id | 施設 | クエリ | imp | clicks | CTR | 順位 | 現状のメタ |
|---|---|---|---|---|---|---|---|
| 144 | 88℃（ハチジュウハチド）岩倉 | サウナ 石仏 | 61 | 0 | 0% | 5.8 | seoTitle/seoDescription **両方 null**（テンプレ生成） |
| 252 | らくだとぺんぎん（甲府） | らくだとぺんぎん | 117 | 2 | 1.7% | 5.7 | 設定済み。`seoDesc` という**未使用の旧キーが残存** |
| 382 | NEST SAUNA（宮崎） | ネストサウナ / ネストサウナ 宮崎 | 73 / 52 | 0 / 0 | 0% | 5.7 / 5.8 | 設定済み（9/5 に宮崎記事で内部リンク追加済み） |

ページ別: /facilities/144 は GSC ページ表に出ていない（imp 61 は全部この1クエリ）。/facilities/252 は 224imp/4clicks/CTR1.8%。/facilities/382 は 211imp/3clicks/CTR1.4%。

### 変更方針（3施設共通）

指名検索する人は「公式サイトか予約ページ」を探している。公式・Instagram・Googleマップが上位を占める SERP で、サウナ子が選ばれる理由は**公式が答えない問い**に答えること。タイトルの後半を「口コミ・予約」から**「どの部屋を選ぶ？／料金の全プラン一覧／近隣との比較」**に振る。

- seoTitle: 60文字以内・末尾 `| サウナ子` 必須（`generateMetadata` が absolute 指定するため。Issue #167）
- seoDescription: 120文字前後。料金は `plans` の実額（`feedback_price-verification`）。営業時間・定休日を入れる（公式が検索結果で出しにくい情報）
- `data/facilities.json` を直接編集。`updatedAt` を `2026-09-06` に更新

### 具体案

**144 88℃（ハチジュウハチド）** — 「サウナ 石仏」は地名クエリ。タイトル先頭に「石仏駅」「岩倉」を出す。

```
seoTitle: "88℃（ハチジュウハチド）岩倉｜石仏駅の個室サウナ 30分1,300円〜・氷で作る水風呂 料金プラン・予約 | サウナ子"
seoDescription: "88℃は愛知県岩倉市・石仏駅エリアの完全個室プライベートサウナ。スタンダード2室＋VIP1室、60分2,600円〜（30分1,300円/人）。Harviaストーブでセルフロウリュ、水風呂は氷で自分好みの温度に調整できる。平日18時〜・土日祝10時〜24時、水曜定休。料金プラン・設備・予約はこちら。"
```

**252 らくだとぺんぎん** — 「砂漠・南極・深海、どれを選ぶ？」を前に出す。

```
seoTitle: "らくだとぺんぎん（甲府）料金・予約｜砂漠・南極・深海 3室の違いと選び方 3,500円〜 | サウナ子"
seoDescription: "らくだとぺんぎんは山梨県甲府市・甲府駅南口徒歩10分の完全予約制個室サウナ。砂漠60分3,500円〜／南極90分4,500円〜／深海90分5,500円〜と部屋ごとに料金と広さが違う。全室に製氷機付き水風呂＋セルフロウリュ、カップルOK。10時〜24時・不定休。3室の違い・料金一覧・予約はこちら。"
```

同時に `seoDesc` キー（id 25, 146, 147, 252 に残存・型定義に無い旧キー）を4件とも削除する。`tests/facilities-data.test.ts` が通ることを確認。

**382 NEST SAUNA** — 「Sauna 1/2/3 どれを選ぶ？」を前に出す。

```
seoTitle: "ネストサウナ（NEST SAUNA）宮崎 料金・予約｜3室の広さと料金の違い 2時間6,600円〜 | サウナ子"
seoDescription: "NEST SAUNA（ネストサウナ）は宮崎駅近く SLEEK URBAN HOTEL 2Fの完全個室サウナ。Sauna 2（10㎡）2時間6,600円／Sauna 1（12.9㎡）・Sauna 3（14.4㎡）2時間8,800円と部屋で広さと料金が違う。チラー付き水風呂・Bluetooth・スマートロック無人チェックイン、カップル・3〜4名OK。15時〜24時・不定休。"
```

### 手順

1. `data/facilities.json` の 144 / 252 / 382 を編集、`seoDesc` 4件削除、`updatedAt` 更新
2. `npm test` → `npm run build`（slug リダイレクトは変わらないので影響なし）
3. `npm run llms`（施設メタは llms-full に載る）
4. commit: `feat(seo): 指名検索CTR0%の3施設メタ改善（144/252/382）＋旧seoDescキー削除`
5. GSC UI から3URLの再クロールをリクエスト（MCPは読み取り専用）

### 測定（9/20 に判定）

- GSC 9/13〜9/19 で同クエリの CTR・順位を取る。**順位が ±1 以内に留まったまま CTR が 3% を超えたら「5位台×CTR0%はメタで動く」と結論**し、同型の施設（クドチ赤坂は除外：9〜10位で順位問題）に横展開
- 動かなければ `feedback_meta-vs-ranking` を「5位台でも動かない」に強化して打ち止め
- **今週は他の施設 seoTitle/seoDescription を触らない**（変数を混ぜない。バッチ上限30に対し3件）

---

## 施策2: aichi-guide 見出し最適化 → **取り下げ**

理由は冒頭「訂正B」のとおり。代わりに愛知で見るべきは:

- 「名古屋 個室サウナ」6.2位 → 3位以内に上げられるか。候補は `aichi/nagoya-sakae` サブエリアページ（SUB_AREA_META 設定済み）との**共食い確認**。GSC で `pageFilter contains /area/aichi` を取り、同クエリで両方が出ていたら、記事側に canonical 相当の内部リンク集中（サブエリアページの本文から記事へリンク）を検討
- 今週はやらない。9/13 の PDCA で共食いだけ確認する

---

## 施策3: 東京サブエリアページに「コンテンツ層」を新設

### 目的

8/29 の area 修正で東京サブエリア6ページが合計 **718PV**（池袋241・新宿神楽坂158・渋谷恵比寿121・六本木87・上野浅草71・下北沢40）に育った。だが GSC のページ別には池袋以外ほぼ出てこない＝まだ内部回遊由来。地名クエリ（「新宿 個室サウナ」「渋谷 個室サウナ」「六本木 個室サウナ」）を直接受けるには、SUB_AREA_META（8/29 設置済み）だけでは足りず**本文の情報量**が要る。

### 現状の構造（`src/app/area/[prefecture]/[area]/page.tsx`・454行）

| 区画 | 状態 |
|---|---|
| パンくず・都道府県ナビ・エリアチップ | あり |
| サウナ子コメント（`SAUNAKO_SUB_AREA_COMMENTS`） | あり・1文 |
| FAQ（`generateFaqData` 自動3問） | あり・**汎用文のみ** |
| 施設一覧（`AreaFilters`） | あり |
| 固有FAQ（都道府県ページの `extraFaqs` 相当） | **なし** |
| 料金比較表 | **なし** |
| 関連記事（`getArticlesByFacilityId`） | **なし**（都道府県ページにはある） |
| AskAI | **なし**（都道府県ページにはある） |
| 近隣サブエリアへのリンク | チップのみ |

### ⚠️ 併せて直すバグ: FAQ の「1時間あたり約X円」が実態と合っていない

`generateFaqData`（サブエリア版 182行〜／都道府県版 340行〜、同一ロジック）は `priceMin` の平均を「**1時間あたり**約X円」と表示しているが、`priceMin` は `duration` 分の室料（9/2 に一覧の「/ 1時間」表記を直した際と同じ誤り）。池袋は hotel hisoca（19,800円・宿泊）が平均を押し上げて「1時間あたり約9,200円」と表示される。
さらに `PREFECTURE_GUIDES.tokyo.extraFaqs` の「池袋・赤羽が9,225円、渋谷・恵比寿・代官山が10,587円、六本木・麻布は12,137円」もこの平均をハードコードした値。

修正:
- 文言を「**最安プランの平均は約X円（施設ごとの最短利用時間の料金）**。最安値はY円〜」に変える
- 平均の算出から `duration === 0`（宿泊・時間枠なし）を除外する
- extraFaqs のハードコード値は、下記スクリプトで再計算した値に置き換える（または「最安値」ベースの文に書き換えて数値依存をやめる）

```bash
python3 -c "
import json
from collections import defaultdict
d=json.load(open('data/facilities.json'))
g=defaultdict(list)
for f in d:
    if f['prefecture']=='tokyo' and not f.get('closedAt') and f['priceMin']>0 and f['duration']>0:
        g[f['area']].append(f['priceMin'])
for a,v in g.items(): print(a, len(v), 'avg', round(sum(v)/len(v)), 'min', min(v))
"
```

### 実装

#### 3-1. `src/lib/types.ts` に `SUB_AREA_GUIDES` を新設

`PREFECTURE_GUIDES` と同じ形で、キーは `'tokyo/shinjuku-kagurazaka'` のように `prefecture/slug`。

```ts
export interface SubAreaGuide {
  /** 検索意図に刺さる固有FAQ（自動3問の後ろに結合） */
  extraFaqs: { question: string; answer: string }[];
  /** 「このエリアで迷ったら」の1段落（サウナ子口調・character-guide 準拠） */
  pickGuide?: string;
}
export const SUB_AREA_GUIDES: Record<string, SubAreaGuide> = { ... };
```

**初回は4エリア**（測定を成立させるため）: `tokyo/shinjuku-kagurazaka` / `tokyo/shibuya-ebisu-daikanyama` / `tokyo/roppongi-azabu` / `tokyo/ikebukuro`。上野浅草・下北沢・銀座は第2バッチ（9/13 以降）。

FAQ は各エリア3〜4問。**質問文は GSC 実クエリの語順に合わせる**（9/5 の FAQ 拡充と同じ手法）。答えの数字は必ず `facilities.json` から取る。案:

- 新宿・神楽坂
  - 「新宿駅から徒歩5分以内で入れる個室サウナは？」→ TRIBAL（東口3分・4,290円/60分）、Prus 歌舞伎町タワー（4分・13,500円/90分）、XPLACE（5分）、HOTEL KABUKI（5分）
  - 「新宿で一番安い個室サウナは？」→ yksi SAUNA＆STAY 2,500円/90分（西口6分）
  - 「新宿・神楽坂でカップル利用できる個室サウナは？」→ `features.coupleOk` で抽出して列挙
  - 「神楽坂の個室サウナはソロ向け？」→ ソロサウナ tune（4,000円/60分）と Boutique Sauna ARCH（19,800円/120分）の使い分け
- 渋谷・恵比寿・代官山
  - 「渋谷でデートに使える個室サウナは？」→ coupleOk 施設（ジングウマエサウナ等）を列挙
  - 「恵比寿で一人で入れる個室サウナは？」→ ひとりサウナプラス 3,300円/60分（恵比寿5分）、サウナ禅 7,800円/60分
  - 「渋谷・代官山で外気浴付きの個室サウナは？」→ `features.outdoorAir` で抽出
- 六本木・麻布・赤坂
  - 「赤坂で24時間営業の個室サウナは？」→ KUDOCHI 赤坂店（`businessHours` を確認して列挙）
  - 「六本木・麻布で安い個室サウナは？」→ サウナ族 1,500円/55分（赤坂駅1分）、3S ジブンサウナ 3,900円/60分
  - 「麻布十番の個室サウナはどこ？」→ Ledian Spa / COCO VILLA / TENQOO / プロラボサウナ / LOCA 麻布十番
  - 「赤坂サウナ・クドチ赤坂の違いは？」→ 指名検索2,100imp/CTR0% の受け皿。両施設の料金・時間・人数を1文で並べる
- 池袋・赤羽（対照群兼・順位維持）
  - 「池袋駅徒歩圏の個室サウナは？」→ hotel hisoca（2分）、ホテル マシャ（2分・5,800円/120分）
  - 「池袋でカップル利用できる個室サウナは？」→ coupleOk 3施設
  - 「王子・赤羽方面の個室サウナは？」→ PRIVATE SAUNA maa（王子2分・3,300円/60分）、Sauna Life Design（王子5分・8,000円/120分）

#### 3-2. ページ側（`[area]/page.tsx`）に追加する区画

サウナ子コメントの直後、FAQ の前に:

1. **料金比較表**（新規 `src/components/AreaCompareTable.tsx`・Server Component）
   - 列: 施設名（リンク）／最寄駅・徒歩／最安プラン（`priceMin`円・`duration`分）／1人あたり（`priceMin / capacity`。`capacity===0` は「—」）／カップル／水風呂℃
   - 並び順は `priceMin` 昇順。`duration===0` は末尾に「宿泊プラン」表記
   - `NearbyCompareTable.tsx`（施設ページの近隣比較）と見た目を揃える。共通化できるなら props を `facilities: Facility[]` にした汎用版に寄せて `NearbyCompareTable` を薄いラッパーにする
   - 6施設超は先頭6件＋「一覧で全N施設を見る」アンカー（`#facility-list`）
2. **固有FAQ**: `generateFaqData` の末尾で `SUB_AREA_GUIDES[key]?.extraFaqs` を結合（都道府県版 380行と同じ書き方）。JSON-LD にも自動で入る
3. **関連記事**: `getArticlesByFacilityId` を施設 id ごとに集めて重複除去、最大3件を `ArticleCard` で表示（都道府県版 292行〜の実装を流用）。東京のサブエリアなら `tokyo-date-private-sauna-guide` / `24h-private-sauna` / `couple-private-sauna` が拾える
4. **AskAI**: 都道府県版 310行の呼び出しをそのまま移植（GA4 `click_ask_ai` は既に3ページで計測中。サブエリアを加えるとイベントの `page_type` 等で識別できるか `AskAI` の props を確認）
5. **近隣サブエリア**: FAQ の後に「近くのエリア」として同一都道府県の他サブエリアを施設数付きでリンク（`areaCounts` は既に取得済み）

1〜5 は**全サブエリア共通の動的区画**（データがあれば出る）。FAQ 本文だけが4エリア限定。

#### 3-3. ページ長の管理

`[area]/page.tsx` は 454行で規約上限（300行）をすでに超えている。今回の追加で膨らむので、`SUB_AREA_META` と `SAUNAKO_SUB_AREA_COMMENTS` を `src/lib/subAreaMeta.ts` に切り出す（挙動不変・先に単独 commit）。

### QA

`npm run lint` → `npm run typecheck` → `npm test` → `npm run build`。`/area/tokyo/shinjuku-kagurazaka` と `/area/tokyo/ikebukuro` を `PORT=3001` で実機確認（比較表の1人あたり・FAQ JSON-LD の件数・関連記事の重複）。`npm run llms`。

### 測定（9/20・9/27 の2回）

着手前に必ずベースラインを取る:

```
mcp__search-console__search_analytics
  siteUrl: sc-domain:saunako.jp, startDate: 2026-08-30, endDate: 2026-09-05
  dimensions: page, pageFilter: /area/tokyo/, filterOperator: contains
```

同じく `queryFilter` に「新宿」「渋谷」「六本木」「赤坂」「池袋」を `contains` で順に取り、各クエリの imp/順位を記録する。

判定:
- 各サブエリアページが GSC ページ別に **imp 50以上で出現**したら「検索の受け皿化」成功 → 残り3エリアへ展開
- 池袋（対照・すでに3位）の順位が落ちていないことを確認
- `/area/tokyo` の PV（749）が減っていたら共食い。サブエリア合計と足して増えていれば OK

### commit

`feat(seo): 東京サブエリアにFAQ・料金比較表・関連記事・AskAIを新設（施策3）` — 施策1とは**別 commit**にする。

---

## 施策4: /area/tokyo は「監視」に格下げ（実作業は付随修正のみ）

「プライベートサウナ 東京」272imp/8.2位/CTR1.47% は3週連続で同値。メタ改善では動かないことが確定しているので単独施策は打たない。施策3のサブエリア強化が内部リンク経由で効くかを見る。

今週やるのは施策3に付随する2点だけ:

1. `generateFaqData`（都道府県版）の「1時間あたり」文言修正（施策3のバグ修正と同一関数なので同時に直る）
2. `PREFECTURE_GUIDES.tokyo.extraFaqs` のハードコード平均額を再計算値に置換

判定ルール: 9/27 時点で「プライベートサウナ 東京」が 8±0.5位のままなら、/area/tokyo 単体の施策は完全に打ち止めにし、記憶（`feedback_meta-vs-ranking`）に追記する。

---

## 9/5 単日 988PV の異常値確認（9/8 以降に実施）

GSC の 9/4・9/5 分が確定してから:

```
search_analytics  dimensions: page  startDate=endDate=2026-09-05  rowLimit 30
search_analytics  dimensions: query startDate=endDate=2026-09-05  rowLimit 30
GA4 runReport     dimensions: pagePath, sessionSource  date 2026-09-05
```

一過性（特定1ページ・特定ソースに集中）か、全体底上げかを判定して MEMORY に記録。次週の比較基準（3,892 → 4,421）を「9/5 を除いた6日平均」にするか判断する。

---

## 実施順とスケジュール

| 順 | 施策 | 所要 | 実施日 | 測定日 |
|---|---|---|---|---|
| 1 | 施策1 メタ改善3施設 | 30分 | 9/6 | 9/20 |
| 2 | 施策3-3 ファイル分割（挙動不変） | 30分 | 9/6〜7 | — |
| 3 | 施策3 + 施策4付随修正 | 半日 | 9/7〜8 | 9/20・9/27 |
| 4 | 9/5 異常値確認 | 15分 | 9/8 | — |
| — | 施策2（取り下げ）→ 愛知の共食い確認のみ | 10分 | 9/13 PDCA内 | — |

## やらないこと（明記）

- クドチ赤坂(5) の対策 — 9〜10位で順位問題。放置
- aichi-guide の見出し変更 — 訂正B のとおり逆効果
- 施策1・3 以外の seoTitle/seoDescription 変更 — 変数を混ぜない
- AI Assistant 流入減（142→105）への対応 — 週次ゆらぎ。llms は 9/5 再生成済み
