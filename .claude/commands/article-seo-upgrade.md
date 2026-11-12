# /article-seo-upgrade — エリアガイド記事のSEO強化

競合上位サイト（kimoty/sauna-tabi/holidaysaunablog/onsen.nifty/timeout/trapol等）を参考に、
個室サウナの都道府県ガイド記事を `content/articles/tokyo-private-sauna-guide.mdx` 基準で
SEO強化する。

## いつ使うか

- 既存の薄い都道府県ガイド記事（〜150行）をtokyo基準にリライトしたい
- 未作成の都道府県ガイド記事を新規作成したい
- 既存記事にFAQ構造化データ・画像alt・内部リンクを後付けしたい

## 前提（既に仕組み化済み、2026-04-16）

以下は `src/app/articles/[slug]/page.tsx` と `src/lib/types.ts` で実装済み。
frontmatterに正しく書けば自動で構造化データが出る。

- **FAQPage JSON-LD**: frontmatter `faq:` 配列から自動生成
- **ItemList JSON-LD**: frontmatter `facilityIds:` から自動生成
- **BlogPosting + BreadcrumbList**: 既存実装

## 作業手順

### Step 0: 受け持ちページの確認（必須・書く前に）

狙うクエリを既に受けているページがあるなら、記事を書かずにそのページを直す。
2026-10-29 に東京ガイド記事を「都内」クエリ向けへリライトしたが、同じクエリ群は /area/tokyo が
6,219imp・8.9位で受けており、記事は 9imp・26位に終わった（10/13〜11/9）。

1. 狙うクエリの語（県名・主要都市名など）で、Search Console をページ別に引く
   - `mcp__search-console__search_analytics`: `siteUrl=sc-domain:saunako.jp`、直近28日、
     `dimensions=page`、`queryFilter={県名}|{主要都市}`、`filterOperator=includingRegex`
   - URL の `#` 以降は落として同じページとして読む（Google のサイトリンク表示。別ページではないので imp を足し合わせない）
2. 結果で受け持ちを決める
   - **エリアページ（`/area/{pref}` やサブエリア）が受けている** → 記事をそのクエリに寄せない。足りない要素は
     エリアページ側（`PREFECTURE_GUIDES`・`SUB_AREA_META`・施設データ）に足す。記事は別の検索意図
     （カップル・安い・観光との組み合わせなど、エリアページが受けていないクエリ）を受け持たせる
   - **記事が受けている** → その記事を直す（このスキルの対象）
   - **どちらも出ていない** → 新規作成・リライトしてよい
3. 同じクエリに2ページが近い順位で出ているとき（例: 2026-10 の愛知。記事 8.1位・/area/aichi 9.2位）は、
   どちらを受け持ちにするかを Teppei に確認してから進める

この確認が決めるのは「どのクエリを狙って書くか」だけ。記事の更新そのもの（施設の追加・閉店、料金改定、
情報の鮮度更新）は待たずに都度入れてよい（2026-11-12 Teppei）。

### Step 1: 対象記事と施設データの確認

```bash
# 都道府県の施設数とアクティブな施設を確認
node -e "
const f = require('./data/facilities.json');
const pref = 'hiroshima'; // 対象を指定
const list = f.filter(x => x.prefecture === pref && !x.closedAt);
console.log(pref, list.length, '施設');
list.forEach(x => console.log(JSON.stringify({
  id: x.id, name: x.name, area: x.subArea || x.area,
  station: x.nearestStation, walk: x.walkMinutes,
  price: x.priceMin, dur: x.duration,
  features: x.features, waterTemp: x.waterTemp
})));
"
```

### Step 2: 競合調査（必須）

「個室サウナ {県名}」でGoogle検索上位5サイトを調査。特に以下を抽出：

- 施設を何件、どう分類しているか（エリア別/料金別/用途別）
- その県特有の軸（観光資源、水質、歴史、気候等）
- 上位サイトに共通する見出し構成・キーワード

researcherサブエージェントに委譲して600〜800語で報告させる。

### Step 3: 記事生成

tokyo-private-sauna-guide.mdxの構造に揃えて以下のセクションを含める：

1. **frontmatter**
   ```yaml
   ---
   title: "{県}の個室サウナおすすめ{実数}選【2026年最新】{主要エリア}別に料金徹底比較"
   description: 150-160字、施設数・価格帯・主要エリア名・特色を含める
   category: "area-guide"
   tags: ["{県}", "{主要都市}", "個室サウナ", "エリアガイド"]
   publishedAt: "YYYY-MM-DD"
   updatedAt: "YYYY-MM-DD"
   thumbnail: "/facilities/{代表id}-0.webp"
   author: "サウナ子"
   facilityIds: [id1, id2, ...]  # 全施設を列挙 → 自動でItemList JSON-LD生成
   faq:                           # 4〜5問 → 自動でFAQPage JSON-LD生成
     - q: "質問"
       a: "回答1〜2文で簡潔に"
   ---
   ```

2. **イントロ**: 県の特色（観光/温泉/地下水etc）とサウナ事情
3. **【料金比較表】全施設一覧**（markdown table）: エリア / 料金 / 時間 / 水風呂 / ロウリュ / 外気浴
4. **エリア別セクション**: 市町村単位で細分化。各施設に
   ```mdx
   ![施設名 {特徴/サウナ室等}](/facilities/{id}-0.webp)
   <FacilityCard id={X} />
   > サウナ子の解説（料金・水温・立地・観光文脈を具体的に）
   ```
5. **選び方**: 予算別テーブル + シーン別リスト
6. **観光との組み合わせ**: E-E-A-T最重要。県固有の観光地から施設へ動線を作る
7. **FAQ セクション**（本文用、H2「よくある質問」）: frontmatter `faq:` と同じ内容でOK
8. **まとめテーブル**: エリア / 施設数 / 価格帯 / 特徴
9. **関連記事リンクブロック**: 近隣県3〜4 + 目的別（カップル/安い/24h/ソロ）+ エリア一覧

### Step 4: SEO施策の網羅チェック

以下すべてが実装されているか確認：

- [ ] タイトルに実数「{N}選」と「2026年最新」
- [ ] description 150-160字
- [ ] frontmatter `faq:` 4〜5問
- [ ] frontmatter `facilityIds:` 全施設列挙
- [ ] 料金比較表（markdown table）
- [ ] エリアを市町村単位で細分化
- [ ] 画像alt詳細化: `![施設名 サウナ室](/facilities/X-0.webp)`
- [ ] 本文中の内部リンク3〜5本（関連県・目的別記事へ）
- [ ] FAQ H2セクション
- [ ] 観光文脈（E-E-A-T）
- [ ] まとめテーブル
- [ ] updatedAt を今日の日付に

## ライティングルール

- **サウナ子キャラ**: 一人称「サウナ子」、「〜だよ」口調、絵文字なし
- **E-E-A-T重視**: 「AIが書いただけ」にしない。観光地×施設の具体文脈、料金・水温等の裏取り済み数値
- **タイトル「○選」は実施設数と一致**（過去に318選→17施設の事故あり）

## 制約（必ず守る）

- **seoTitle/Desc・記事 title の変更は CLAUDE.md「SEO運用ルール」の上限と待機期間に従う**
  （件数と間隔はそちらが正。ここには数字を書かない）
- 一度に処理する記事は**最大5〜6本**。それ以上は次の枠に回す。

## 期待できる効果

- FAQPage構造化データ → Googleでアコーディオン型リッチリザルト表示の可能性
- ItemList構造化データ → 「○選」ランキング記事の構造化認識
- 画像alt詳細化 → 画像SEO + アクセシビリティ向上
- 内部リンク増 → サイト内回遊とページ権威性分配

## 実装例（2026-04-16コミット 08540e9 参照）

広島・福井リライト + 熊本・島根・大分新規作成の5記事で同パターンを適用。
tokyo-guide含め6記事で仕組みを検証済み。
