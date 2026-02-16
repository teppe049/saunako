# Data Fetch Skill — 施設データスクレイピング

施設の公式サイトから構造化データを取得し `data/facilities.json` を更新するためのスキル定義。
Data Agent（`subagent_type: general-purpose`）がこのスキルに従って動作する。

---

## 対象ファイル

- `data/facilities.json` — 施設マスタデータ（唯一の変更対象）

## 施設データスキーマ

```typescript
interface Plan {
  name: string;       // プラン表示名（日本語）例: "スタンダード 90分"
  price: number;      // 税込価格（円）
  duration: number;   // 利用時間（分）
  capacity: number;   // 利用人数
}

interface Facility {
  id: number;
  slug: string;
  name: string;
  prefecture: string;
  prefectureLabel: string;
  city: string;
  area: string;
  address: string;
  nearestStation: string;
  walkMinutes: number;
  priceMin: number;           // 最安プランの価格（検索・ソート用）
  plans: Plan[];              // 料金プラン配列
  duration: number;           // 基本利用時間（分）
  capacity: number;           // 基本定員
  features: {
    waterBath: boolean | null;
    waterBathTemp: string | null;
    selfLoyly: boolean | null;
    outdoorAir: boolean | null;
    coupleOk: boolean | null;
    bluetooth: boolean | null;
    wifi: boolean | null;
  };
  businessHours: string;
  holidays: string;
  website: string;
  phone: string;
  bookingUrl: string | null;
  amenities: string[];
  note: string | null;
  images: string[];
  lat: number;
  lng: number;
  description: string;
  saunakoCommentShort: string;
  saunakoCommentLong: string;
  updatedAt: string;          // YYYY-MM-DD
}
```

---

## スクレイピング手順

### Step 1: 対象施設の特定

```
facilities.json を読み込み、対象施設を抽出する
- 全施設: plans フィールドが未設定 or 空配列の施設
- 指定施設: Issue や指示で指定された施設ID
```

### Step 2: 公式サイトから料金取得

**取得優先順位:**

1. **WebFetch** で公式サイトの料金ページを取得
   - `/price`, `/plan`, `/fee`, `/usage`, `/about` などのパスを試す
   - トップページに料金が載っている場合もある
2. **WebFetch が失敗した場合** → Playwright MCP で動的ページをレンダリング
   - Wix, Bubble.io, SPA系サイトはJSレンダリングが必要
3. **公式サイトで取得できない場合** → サウナイキタイ、ニフティ温泉等のポータルサイトを検索
   - WebSearch で `"施設名" 料金` を検索

**WebFetch プロンプト例:**
```
このページの料金情報を全て抽出してください。
以下の形式で整理してください:
- プラン名（部屋タイプ、時間、人数の組み合わせ）
- 料金（税込円）
- 利用時間（分）
- 利用人数
- 平日/休日の区別がある場合はそれぞれ

料金表、価格表、プラン一覧、¥マーク、円表記を探してください。
```

### Step 3: plans 配列への変換ルール

| 料金パターン | 変換方法 |
|------------|---------|
| 時間別料金（60分/90分/120分） | 時間ごとにPlanを作成 |
| 人数別料金（1名/2名/3名） | 人数ごとにPlanを作成 |
| 部屋タイプ別（Standard/VIP） | タイプごとにPlanを作成 |
| 平日/休日で異なる | 別Planとして作成（name に明記） |
| 時間帯別（朝/昼/夜） | 別Planとして作成（name に明記） |
| 延長料金 | Planに含めない（note に記載） |
| コンボプラン（BBQ付き等） | 基本プランのみ。特殊プランは除外 |

**Plan name の命名規則:**
```
[部屋タイプ] [時間] [人数] [曜日/時間帯]

例:
- "スタンダード 90分 1名"
- "VIP 120分 3名まで"
- "個室 90分 平日"
- "朝ウナ 60分"
- "3時間プラン 休日 2名"
```

**priceMin の更新:**
```
plans 配列の中で最も安い price を priceMin に設定する
```

### Step 4: データ品質チェック

- [ ] `priceMin` が `plans` 内の最安値と一致するか
- [ ] `plans` 内の `price` が全て正の整数か（0やnullは不可）
- [ ] `plans` 内の `duration` が全て正の整数か
- [ ] `plans` 内の `capacity` が全て1以上か
- [ ] JSON 全体が valid か（`JSON.parse` で検証）
- [ ] 既存データ（name, address, images 等）が破壊されていないか

### Step 5: 保存

- `data/facilities.json` を上書き保存
- `updatedAt` を当日日付（YYYY-MM-DD）に更新
- 既存フィールドは一切変更しない（plans, priceMin, updatedAt のみ）

---

## バッチ実行パターン

85施設を一度にスクレイピングするのは重いため、バッチ分割を推奨:

```
バッチ1: ID 1-20  （Agent 1）
バッチ2: ID 21-40 （Agent 2）
バッチ3: ID 41-60 （Agent 3）
バッチ4: ID 61-85 （Agent 4）
```

**並列実行時の注意:**
- 各Agentは facilities.json 全体を読み込むが、**自分の担当IDのみ変更**する
- 全Agent完了後にマージ用Agentが統合するか、順次実行で競合回避する
- **推奨: 順次実行**（Agent 1 完了 → Agent 2 開始）で facilities.json の競合を防ぐ

---

## エラーハンドリング

| エラー | 対応 |
|--------|------|
| サイトが落ちている（DNS failure, timeout） | スキップ。plans は空配列のまま |
| 料金ページが見つからない | WebSearch でポータルサイトを検索 |
| 料金が複雑すぎて構造化できない | 主要プランのみ抽出。note に補足 |
| SSL証明書エラー | Playwright MCP で再試行 |
| 動的サイト（JS必須） | Playwright MCP の `browser_navigate` + `browser_evaluate` |
| 価格が税抜表記 | 1.1倍して税込に変換。name に「(税込)」を付記 |

---

## 実行コマンド（呼び出し側）

```typescript
// 全施設のplans取得（順次バッチ）
Task({
  description: "Fetch facility plans batch N",
  subagent_type: "general-purpose",
  prompt: `
    Skills/data-fetch/SKILL.md に従って、
    facilities.json の ID ${start}-${end} の施設から
    料金プランをスクレイピングし plans 配列に格納してください。
  `
})
```

---

## 過去の学び

| 日付 | 学び |
|------|------|
| 2026-02-08 | OGPタグだけでは画像取得率が低い。ページ内の img タグ、CSS background-image、Playwright でのJS実行が必要 |
| 2026-02-08 | next.config.ts の remotePatterns に上限50個あり。ワイルドカード `hostname: "**"` で回避 |
| 2026-02-08 | 並列Agentが同一ファイルを変更すると競合する。順次実行か、Agent完了後にマージが安全 |
| 2026-02-08 | Wix, Bubble.io, SPA系サイトは WebFetch では画像/料金が取れない。Playwright MCP 必須 |
| 2026-02-08 | 85施設plans一括取得: 4バッチ並列でデータ収集（書き込みなし）→ 完了後にマージAgentで一括書き込みが最も効率的。収集のみなら並列安全 |
| 2026-02-08 | WebFetchで料金取得できない場合の優先順: ①公式サイト別パス(/price, /plan) → ②WebSearchで「施設名 料金」→ ③サウナイキタイ/ヒミツサウナ等ポータル → ④Playwright MCP |
| 2026-02-08 | 会員制施設(ロウリューランド,HAAAVE等)やダイナミックプライシング施設(TENQOO等)は料金体系が複雑。体験/ビジター料金を基準に記載し、noteに補足するのが実用的 |
| 2026-02-08 | SSL証明書エラー(アカサカサウナ等)やreserva.be等の予約サイトは403でWebFetchブロックされる。WebSearchでの間接取得が有効 |
