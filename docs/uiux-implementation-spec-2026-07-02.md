# UIUX改善 実装指示書 — 2026-07-02

元レポート: `docs/uiux-audit-2026-07-02.md`
方針: P0〜P2のうちコードで完結するものを本日一括実装。コンテンツ書き換え等の段階実施が必要なものは対象外として末尾に明記。

## ワークストリーム構成

| WS | 内容 | 担当 | 主な対象ファイル |
|----|------|------|------------------|
| A | 地図クラスタリング・件数表示一本化・hydration修正 | メイン | FacilityMap.tsx, SearchInteractivePanel.tsx, FacilityListCard.tsx |
| B | 1人あたり料金・ソート軸・ネット予約可フラグ | メイン | facility-utils.ts, facilities.ts, FacilityListCard.tsx, SearchSortBar.tsx, SearchHeaderBar.tsx, MobileFilterSheet.tsx, search/page.tsx |
| C | 施設比較機能（/compare） | メイン | compareStore.ts(新規), CompareBar.tsx(新規), app/compare/page.tsx(新規), FacilityListCard.tsx |
| D | お気に入りリスト共有 | エージェント | app/favorites/*, FavoritesView |
| E | モバイルボトムナビ | エージェント | app/layout.tsx, BottomNav.tsx(新規) |
| F | 記事まわり（know-howタグ・記事→検索CTA） | エージェント | lib/articles.ts, app/articles/* |
| G | 文言・整合性（generateFeatureText文法修正・verifiedAt・CLAUDE.md実態合わせ） | メイン | lib/facilities.ts, lib/types.ts, facilities/[id]/page.tsx, CLAUDE.md |

---

## WS-A: 地図の修正（P0）

### A-1. マーカークラスタリング
- 外部ライブラリは追加しない（react-leaflet v5 / React 19互換リスク回避）。**グリッドベースの自前クラスタリング**を `FacilityMap.tsx` 内に実装
- ロジック: 現在のズームレベル z に対しセル幅 `360 / (256 * 2^z) * 80`（≒画面上80px）で施設をグリッド分け。同一セルに2件以上 → クラスタバブル（件数表示の円形DivIcon、primaryカラー）、1件 → 従来の価格ラベル
- ズーム z >= 11 では全件を価格ラベルで個別表示（市区レベル以上では従来挙動）
- クラスタバブルのクリック → そのクラスタ構成施設に `flyToBounds`（padding 40, maxZoom 14）
- クラスタアイコンは件数をキーにキャッシュ（既存 iconCache と同様）
- selected / hovered の施設がクラスタに含まれる場合は、その施設だけクラスタから独立させて価格ラベル表示（ハイライトが埋もれないように）

### A-2. 件数表示の一本化
- `SearchInteractivePanel.tsx` の2行（「この範囲にN件（全M件中）」と「M件の個室サウナが見つかりました」）を1行に統合:
  - 地図bounds絞り込みが効いている時: 「**N件**の個室サウナ（地図の表示範囲内・全M件中）」
  - それ以外: 「**M件**の個室サウナが見つかりました」

### A-3. hydration error #418 修正
- 原因: `FacilityListCard.tsx` がレンダー中に `new Date().getHours()` を実行。Vercelサーバー(UTC)とクライアント(JST)で「営業中」「HH:MM〜」の出力が食い違う
- 修正: `currentHour` を `useState<number | null>(null)` + `useEffect` でマウント後に設定。null の間は次の空き枠表示を出さない（SSRでは非表示で確定させる）

### 受け入れ基準
- /search 初期表示（全国）でマーカーが重ならず、クラスタバブルで表示される
- クラスタクリックでズームインし、最終的に価格ラベルになる
- コンソールにReact #418が出ない

## WS-B: 料金比較・予約フラグ（P1）

### B-1. 1人あたり料金
- `facility-utils.ts` に `getPerPersonPrice(facility): number | null` を追加: `plans` から `capacity > 0 && price > 0` のプランの `ceil(price / capacity)` の最小値。plansが無ければ null
- `FacilityListCard.tsx` の料金行の下に「1人あたり ¥X〜」を表示（値がある場合のみ、小さめのテキスト）

### B-2. ソート軸追加
- `SortKey` に `'per_person_asc'` を追加。比較値は `getPerPersonPrice(f) ?? (priceMin > 0 ? priceMin : Infinity)`（1人あたり不明施設は室料=上限値でフォールバック、料金不明は末尾）
- `SearchSortBar.tsx` に「1人あたり安い順」オプション追加、`search/page.tsx` の `validSortKeys` にも追加
- デフォルトソート: `capacity >= 2` または `coupleOk=true` の検索時は `per_person_asc`（カップル・グループ検索は1人あたりで並べる）。それ以外は従来通り（origin あり distance / なし price_asc）

### B-3. ネット予約可フラグ
- `searchFacilities` に `onlineBooking?: boolean` を追加（`bookingUrl` があるもの）
- `FacilityListCard.tsx` に「ネット予約可」バッジ（bookingUrl がある施設。Status色 available を使用）
- PCクイックチップ（SearchHeaderBar）とモバイルフィルタシート（MobileFilterSheet）に「ネット予約可」トグル追加。URLパラメータ `onlineBooking=true`

## WS-C: 比較機能（P1）

- `src/lib/compareStore.ts`（新規）: favoritesStore と同型の localStorage ストア（key: `saunako_compare`、最大4件、超過時は追加を無視してfalseを返す）
- `FacilityListCard.tsx`: 「公式サイトへ」ボタンの並びに「＋比較」トグルピル（追加済みは「✓比較中」primary色）。クリックは stopPropagation
- `src/components/CompareBar.tsx`（新規, client）: 比較対象が1件以上あるとき画面下部に固定バー表示。サムネイル+施設名（削除×付き）+「比較する(N)」ボタン → `/compare?ids=1,2,3` + 「クリア」。モバイルはボトムナビ(h-14)の上に載せる（bottom-14 + safe-area、md以上は bottom-0）
- `SearchInteractivePanel.tsx` に CompareBar をマウント。モバイルの「地図で見る」ボタンはバー表示時に重ならない位置へ
- `src/app/compare/page.tsx`（新規, Server Component）: `?ids=` で施設を最大4件受け取り比較テーブル表示
  - 行: 画像 / 施設名(リンク) / 料金 / 1人あたり / 利用時間 / 最大人数 / 水風呂(温度) / セルフロウリュ / 外気浴 / 男女OK / 最寄駅・徒歩 / 営業時間 / 定休日 / 予約(ReservationLink)
  - 1列目(項目名)は sticky、横スクロール対応。`robots: { index: false }`。URLがそのまま共有リンクになる

## WS-D: お気に入り共有（P2・エージェント）

- FavoritesView に「リストを共有」ボタン: 現在のお気に入りIDから `https://www.saunako.jp/favorites?ids=1,2,3` を生成しクリップボードへコピー（ShareButton の実装パターンを踏襲）
- `favorites/page.tsx`: `?ids=` があるときは**共有ビュー**としてそのIDの施設をサーバー側で表示（localStorageは読まない）。見出しは「共有されたお気に入りリスト」+ 自分のお気に入りに戻るリンク
- noindex は現状維持

## WS-E: モバイルボトムナビ（P2・エージェント）

- `src/components/BottomNav.tsx`（新規, client, usePathname）: ホーム(/) / さがす(/search) / お気に入り(/favorites) / 記事(/articles) の4タブ。高さ **h-14** 固定 + `pb-[env(safe-area-inset-bottom)]`、`md:hidden`、z-50、上ボーダー、アクティブタブは primary 色
- `/facilities/` 配下と `/go/` 配下では非表示（施設詳細は固定予約CTAバーと競合するため）
- `app/layout.tsx` に組み込み。コンテンツが隠れないよう、ナビ表示ページでは main に `pb-14 md:pb-0` 相当の余白（BottomNav 側で spacer を出すか、wrapper で制御）

## WS-F: 記事まわり（エージェント）

- `content/articles/` 内で category/tag に「know-how」の英語表記が露出しているカードがある → 露出箇所を特定し、表示ラベルを日本語化（frontmatter修正 or 表示側のラベルマッピング追加。ARTICLE_CATEGORIES に無いcategoryが生表示されるのが原因なら articles 一覧側にフォールバックマッピングを追加）
- 記事詳細ページの本文末尾に「この記事の条件で個室サウナを探す」CTAボックスを追加: 記事slugが `{prefecture}-` で始まる等で都道府県が特定できる場合は `/search?prefecture=X`、できない場合は `/search`。`.btn-primary` を使用

## WS-G: 文言・整合性（メイン）

- `generateFeatureText`（facilities.ts）の連結文法修正: 「カップルでの利用もOKし」→ 名詞・形容動詞で終わる要素に「だ」を付与し「〜OKだし、」「〜ぴったりだし、」になるよう各ポイント文言を修正
- `types.ts` の Facility に `verifiedAt?: string | null` を追加（任意フィールド、データ投入は別途）。施設詳細ページのアクセス情報部に値がある場合のみ「情報確認日: YYYY年M月」を表示
- CLAUDE.md のテックスタック記載を実態に修正（Google Maps → Leaflet + react-leaflet + OSM）

## QA・リリース

1. 全WS完了後: `npm run build` → `npm run lint`
2. 論理単位でコミット（git連鎖禁止ルールに従い1コマンドずつ）→ main へ push
3. デプロイ後に /search の実機確認（クラスタ表示・コンソールエラー）

## 今回対象外（理由付き）

| 項目 | 理由 |
|------|------|
| MapLibre + OpenFreeMap移行 | 地図スタック全面置換で単独の大変更。今回のクラスタ修正の効果確認後、別セッションで実施（クラスタのグリッドロジックは移行後も流用可） |
| 施設説明文・サウナ子コメントの人肌化（データ側） | SEO一括変更禁止ルール（1デプロイ10施設まで）。テンプレ由来の文法修正（WS-G）のみ今回実施し、データ書き換えは週次で段階実施 |
| Coubicリアルタイム空き状況 | 対応施設の調査・API検証が必要。静的な「ネット予約可」フラグ(WS-B)を先行 |
| AdSense slot ID（XXXXXXXXXX） | AdSense管理画面での広告ユニット発行が必要（Teppei対応） |
| Geistフォント/デザイントークン不一致 | サイト全体の見た目に影響するためデザインレビューと合わせて別途判断 |
