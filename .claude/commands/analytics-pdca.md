# Analytics PDCA（GA4 × Search Console 分析）

GA4 と Google Search Console のデータを突き合わせて、改善施策の発見→計画→効果測定を行う。

## 引数

$ARGUMENTS - 分析対象期間（例: "先週", "2/1-2/28"）、フォーカスしたいKPI（例: "CTR改善", "流入増"）。省略時は直近7日。

## 手順

### 1. データ収集（GA4 + Search Console を並列取得）

以下を **並列** で取得する:

**GA4（mcp__google-analytics__runReport）:**
- 日別: PV / UU / sessions / averageSessionDuration / bounceRate（dimensions: date）
- チャネル別: PV / UU（dimensions: sessionDefaultChannelGroup）
- ページ別: PV（dimensions: pagePath）
- デバイス別: sessions（dimensions: deviceCategory）

**Search Console（mcp__search-console__search_analytics / enhanced）:**
- クエリ別: clicks / impressions / ctr / position（dimensions: query）
- ページ別: clicks / impressions / ctr / position（dimensions: page）
- Quick Wins 検出: enableQuickWins=true, minImpressions=5, positionRangeMin=3, positionRangeMax=20, maxCtr=5

**siteUrl**: `sc-domain:saunako.jp`

### 2. 現状分析（Check）

取得データから以下の観点で分析:

#### 2-1. トラフィック概況
- 週間 PV / UU / セッション数を前週・ベースラインと比較
- チャネル別比率（Organic / Direct / Social / Referral）の推移
- デバイス比率（Mobile / Desktop）

#### 2-2. SEO パフォーマンス（GA4 × Search Console 突き合わせ）

| 観点 | GA4 で見る | Search Console で見る | 突き合わせポイント |
|------|-----------|---------------------|-------------------|
| **表示→クリック** | — | imp / clicks / CTR | imp多×CTR低 = title/description 改善候補 |
| **クリック→閲覧** | PV / セッション | clicks | SC clicks > GA PV なら計測漏れ疑い |
| **閲覧→回遊** | 平均滞在 / 直帰率 | — | CTR高×直帰率高 = コンテンツ改善候補 |
| **順位 × CTR** | — | position / CTR | 5-10位×CTR 0% = title改善で即効果 |

#### 2-3. Quick Wins 特定
Search Console の Quick Wins 結果を表で出す:
- **位置 5-10位 × CTR 低**: title/description リライトで即改善
- **位置 10-20位 × imp 多**: コンテンツ拡充で1ページ目に押し上げ
- **指名検索（施設名）で順位低い**: 施設ページの情報量追加

#### 2-4. URL正規化チェック
- www と 非www が両方インデックスされていないか確認
- canonical 設定との整合性

### 3. 改善施策の立案（Plan）

分析結果をもとに、以下の優先度マトリクスで整理:

| 優先度 | 条件 | 施策例 |
|--------|------|--------|
| **P0（即実行）** | 工数小 × 効果大 | title/description リライト、canonical修正 |
| **P1（今週中）** | 工数中 × 効果大 | 記事コンテンツ拡充、構造化データ追加 |
| **P2（来週以降）** | 工数大 × 効果大 | 新規記事作成、エリアページ新設 |
| **P3（バックログ）** | 効果未知 | 実験的な施策 |

改善案をユーザーに提示し、**AskUserQuestion** で実行する施策を選択してもらう。

### 4. 施策実行（Do）

選択された施策を実行:
- title/description 修正 → 該当ファイルを直接編集
- コンテンツ追加 → 記事MDX or 施設JSON を編集
- 技術的SEO修正 → sitemap / robots / canonical 等を修正

実装後は QA Agent（`npm run build && npm run lint`）を実行。

### 5. 効果測定メモ（Act）

施策実行後に、次回計測用のメモを残す:

```
## 施策ログ（MEMORY.md に追記）
| 日付 | 施策 | 対象ページ | 変更前指標 | 期待効果 |
|------|------|-----------|-----------|---------|
```

次回このスキル実行時に、過去の施策ログを参照して効果を確認する。

## ベースライン参照

MEMORY.md に記録されている過去データを必ず比較対象とする。
新しいベースラインが取れたら MEMORY.md を更新する。

## 注意事項

- GA4 dimensions は `pagePath` を使う（`page` だと INVALID_ARGUMENT）
- GA4 プロパティ ID: `524886555`
- Search Console siteUrl: `sc-domain:saunako.jp`
- Quick Wins の閾値は状況に応じて調整してよい（立ち上げ期は minImpressions を下げる）
- 週次で回すのが理想。月1回以上は必ず実行する
