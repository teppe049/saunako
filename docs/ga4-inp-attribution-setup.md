# GA4 カスタム定義登録（INP の原因特定）— Claude in Chrome 用 指示書

作成日: 2026-10-04
対象プロパティ: サウナ子（GA4 プロパティID `524886555` / 測定ID `G-EDQ38S7W3J`）
関連: [#171](https://github.com/teppe049/saunako/issues/171) / [Web Vitals カスタム指標](./ga4-web-vitals-metric-setup.md)

## なぜ必要か

Core Web Vitals のうち基準未達は **モバイルの INP だけ**（2026-09-05〜10-02: good 86.6% / needs-improvement 659件 / poor 168件。デスクトップは 98%）。悪い記録は施設詳細ページ（379件）とエリアページ（292件）に集中している。

ただし今の計測では「どの操作が遅いのか」がわからない。10/4 に `src/components/WebVitalsReporter.tsx` を `web-vitals/attribution` に切り替え、INP イベントに以下4つのパラメータを付けて送るようにした。**GA4 に登録しないとレポートで読めない**。登録は遡及しないので早いほどよい。

あわせて、9/7 の指示書で登録予定だった **カスタム指標 `metric_value` が未登録のまま**（10/4 に Data API で `averageCustomEvent:metric_value` を叩くと INVALID_ARGUMENT）なので、同時に登録する。

## 登録するもの

### カスタムディメンション（4件・スコープはすべて「イベント」）

| ディメンション名 | イベントパラメータ | 説明（説明欄にそのまま貼る） |
|---|---|---|
| inp_target | `inp_target` | INPが発生した要素のCSSセレクタ（100文字まで） |
| inp_type | `inp_type` | INPの操作種別（pointer / keyboard） |
| inp_phase | `inp_phase` | INPで最も長かった段階（input_delay / processing / presentation） |
| inp_load_state | `inp_load_state` | 操作時のページ読み込み状態（loading / dom-interactive / dom-content-loaded / complete） |

### カスタム指標（1件）

| 指標名 | イベントパラメータ | 測定単位 | 説明 |
|---|---|---|---|
| metric_value | `metric_value` | **ミリ秒** | Core Web Vitalsの実測値。LCP/INP/FCP/TTFBはミリ秒、CLSは1000倍した整数 |

上限はディメンション50件（登録済み18件程度）・指標50件。**どちらも削除できない（アーカイブのみ）**ので、パラメータ名を正確に入力する。

---

## Claude in Chrome への指示文（ここから下をそのまま貼る）

```
あなたは Google アナリティクス 4 の管理画面で、カスタムディメンション4件とカスタム指標1件を登録する作業をします。
ブラウザには既に Google アカウントでログイン済みです。
ログインを求められたら作業を止めて報告してください（認証情報は入力しない）。

## 絶対に守ること
- 既存のカスタムディメンション・カスタム指標を編集・アーカイブ・削除しない
- 登録するのは下記の5件だけ
- イベントパラメータ名は正確に（前後に空白を入れない・すべて小文字）
- 既に同名のものがあれば作成せずスキップする

## 前提
- 対象プロパティ: 「サウナ子」プロパティID 524886555

## 手順

### 1. カスタム定義の画面を開く
https://analytics.google.com/ を開き、左下の歯車「管理」をクリック。
「データの表示」列にある「カスタム定義」を開く。
プロパティ選択画面が出たら「サウナ子」（524886555）を選ぶ。

### 2. カスタムディメンションを4件作成する
「カスタム ディメンション」タブで、まず現在の一覧に inp_ で始まるものが無いか確認して報告する。
無ければ「カスタム ディメンションを作成」を押し、1件ずつ以下を入力して保存する。
範囲（スコープ）はすべて「イベント」。

  1) ディメンション名: inp_target
     説明: INPが発生した要素のCSSセレクタ（100文字まで）
     イベント パラメータ: inp_target
  2) ディメンション名: inp_type
     説明: INPの操作種別（pointer / keyboard）
     イベント パラメータ: inp_type
  3) ディメンション名: inp_phase
     説明: INPで最も長かった段階（input_delay / processing / presentation）
     イベント パラメータ: inp_phase
  4) ディメンション名: inp_load_state
     説明: 操作時のページ読み込み状態（loading / dom-interactive / dom-content-loaded / complete）
     イベント パラメータ: inp_load_state

イベントパラメータは候補リストに出てこなくても手入力で確定してください。

### 3. カスタム指標を1件作成する
画面上部のタブを「カスタム指標」に切り替える（ディメンションとはタブが違う）。
一覧に metric_value が既にあればスキップ。無ければ「カスタム指標を作成」を押して以下を入力。

  指標名        : metric_value
  説明          : Core Web Vitalsの実測値。LCP/INP/FCP/TTFBはミリ秒、CLSは1000倍した整数
  イベント パラメータ: metric_value
  測定単位      : ミリ秒

ミリ秒は測定単位プルダウンの「時間」区分の中にあります。見つからなければ選択肢をすべて報告してください。

### 4. 確認
カスタムディメンション一覧とカスタム指標一覧のスクリーンショットをそれぞれ撮ってください。

## 報告フォーマット
1. 作成したもの / 既存でスキップしたもの（5件それぞれ）
2. 選んだ測定単位（画面の表記どおり）
3. 一覧のスクリーンショット2枚
4. 上限表示（「◯/50」のような表示があれば）
5. 想定外だったこと

## 途中で止めるべきケース
- ログインを求められた
- 上限（50件）に達していた
- 測定単位に「ミリ秒」が無い
```

---

## 登録後にこちらで確認すること（1週間ほど貯めてから）

```
runReport
  dimensions: customEvent:inp_target, customEvent:inp_phase
  metrics: eventCount, averageCustomEvent:metric_value
  filter: eventName=web_vitals AND customEvent:metric_name=INP AND deviceCategory=mobile
          AND customEvent:metric_rating != good
```

遅い要素（inp_target）と段階（inp_phase）の組で件数の多いものから直す。
- `processing` が長い → そのクリックハンドラ／再レンダリングが重い
- `presentation` が長い → クリック後の描画（大きなDOM・レイアウト）が重い
- `input_delay` が長い → 読み込み中のJS（地図・広告・hydration）にメインスレッドを塞がれている。`inp_load_state` が loading / dom-interactive なら読み込み中の操作
