# Saunako - プロジェクト指示書

個室サウナ検索プラットフォーム。Next.js 16 + React 19 + TypeScript + Tailwind CSS v4。

## テックスタック

- **フレームワーク**: Next.js 16 (App Router) + React 19
- **言語**: TypeScript (strict)
- **スタイル**: Tailwind CSS v4 + CSS Variables (`globals.css`)
- **地図**: Google Maps API (`@react-google-maps/api`)
- **データ**: 静的JSON (`data/facilities.json`, 38施設)
- **デザイン**: Pencil MCP (`.pen`ファイル)
- **デプロイ**: Vercel

## チームエージェント運用

実装タスクでは以下のエージェント構成で**並列実行を最大化**すること。

### 起動条件

以下のいずれかに該当する場合、**自動的にチームエージェントとして起動**する:

- コード変更を伴う実装タスク（機能追加・バグ修正・リファクタリング等）
- データ追加・変更タスク（施設データの追加・修正等）
- UI/デザイン変更タスク

**起動時の行動:**
1. タスク内容を分析し、必要なエージェント（Design / Frontend / Data / QA / SEO）を特定
2. 依存関係のないエージェントは **Task ツールで並列起動**
3. 依存関係のあるエージェントは前段の完了後に順次起動
4. 最終的に **QA Agent で必ずビルド・lint を検証**してから完了とする

**対象外（チームエージェント不要）:**
- 質問・調査のみのタスク
- CLAUDE.md や設定ファイルのみの編集
- 単純な typo 修正（1ファイル数行レベル）

### エージェント一覧

| Role | 担当 | subagent_type | 起動タイミング |
|------|------|---------------|---------------|
| **Design** | Pencil MCP でデザイン仕様取得・検証 | general-purpose | UI変更の前後 |
| **Frontend** | Reactコンポーネント・Tailwind実装 | general-purpose | UI実装時 |
| **Data** | facilities.json管理・型整合性・検索ロジック | general-purpose | データ変更時 |
| **QA** | ビルド・lint・型チェック | Bash | 実装完了後 |
| **SEO** | metadata・sitemap・robots確認 | general-purpose | ページ追加時 |

### 運用ルール

1. **独立したタスクは必ず並列で** Task ツールを使って同時実行する
2. **Design Agent は UI 変更時に必ず起動** — Pencil MCP でデザイン準拠を確認
3. **QA Agent は実装完了後に必ず起動** — `npm run build && npm run lint` を実行
4. **コミット前チェック**: ビルド成功 + lint パスを確認してからコミット
5. **実装完了後は自動的に main に commit + push** — ユーザーから指示がなくても、実装が完了し QA パスしたら main にコミットしてプッシュする

### フローパターン

**施設データ追加:**
```
並列: Data Agent(JSON追加) + SEO Agent(sitemap確認)
  → QA Agent(ビルド確認)
```

**UI変更:**
```
Design Agent(仕様取得)
  → Frontend Agent(実装)
  → 並列: QA Agent(ビルド) + Design Agent(スクショ検証)
```

**新ページ追加:**
```
並列: Design Agent(仕様) + SEO Agent(metadata設計)
  → Frontend Agent(実装) + Data Agent(データ層)
  → QA Agent(ビルド + lint)
```

## ディレクトリ構成

```
src/
├── app/                  # App Router ページ
│   ├── page.tsx          # トップページ
│   ├── search/           # 検索結果
│   ├── area/[prefecture] # エリア別一覧
│   └── facilities/[id]   # 施設詳細
├── components/           # 共通コンポーネント
└── lib/                  # ユーティリティ・型定義
data/
└── facilities.json       # 施設マスタデータ
```

## MCP 接続

### GitHub MCP

- **リポジトリ**: `teppe049/saunako`
- **用途**: Issue管理、PR作成・レビュー、ブランチ操作、コード検索
- **ルール**:
  - GitHub 操作は **GitHub MCP を優先**（`gh` コマンドより優先）
  - `list_*` ツール → 一覧取得・ページネーション
  - `search_*` ツール → キーワード検索・複雑なフィルタ
  - Issue作成前に `search_issues` で重複チェック
  - PR作成時は `.github/PULL_REQUEST_TEMPLATE.md` を確認してテンプレート準拠
  - `owner: "teppe049"`, `repo: "saunako"` を指定

### Pencil MCP

- **用途**: `.pen` ファイルのデザイン仕様取得・編集・スクリーンショット検証
- **ルール**:
  - `.pen` ファイルは Read/Grep 禁止 → 必ず Pencil MCP ツールを使う
  - UI変更時は `get_screenshot` で視覚的に検証

## コーディング規約

- Server Component がデフォルト。`'use client'` は必要な場合のみ
- パスエイリアス `@/*` → `./src/*` を使用
- 日本語UI — コンポーネント名・変数名は英語、表示テキストは日本語

## 未整備（TODO）

- [ ] テスト環境（Vitest + React Testing Library）
- [ ] CI/CD パイプライン
- [ ] 認証機能
- [ ] ソート機能の完全実装
