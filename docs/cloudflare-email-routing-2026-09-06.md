# Cloudflare Email Routing 設定（saunako.jp）— Claude in Chrome 用 指示書

作成日: 2026-09-06
関連Issue: [#169](https://github.com/teppe049/saunako/issues/169)
前提: [#168 DNS移管](https://github.com/teppe049/saunako/issues/168) 完了済み

## 目的

`info@saunako.jp` のような独自ドメインのメールアドレスを無料で用意し、Gmailへ転送する。
マネタイズロードマップの「送客レポート営業」で施設に連絡する際、Gmailアドレスより信頼される。

## 前提の確認（2026-09-06 実測）

- **MXレコードは存在しない** → 既存のメール受信を壊す心配がない
- **SPFレコードも存在しない** → Cloudflareが追加するSPFと競合しない
- 現在のTXTは `google-site-verification` のみ（Search Console所有権。**これは消さない**）

## Cloudflareが自動追加するDNSレコード

有効化すると以下が自動で入る。手動で作る必要はない。

| 種別 | 内容 |
|---|---|
| MX | 2件（優先度10・20。ホスト名はダッシュボードに表示される） |
| TXT | SPF `v=spf1 include:_spf.mx.cloudflare.net ~all` |
| TXT | DKIM（セレクタ `cf2024-1._domainkey`） |

これらは**プロキシ設定の対象外**（MX・TXTに雲アイコンは無い）。

## 送信について（重要）

**Cloudflare Email Routingは受信・転送のみ。送信機能はない。**

`info@saunako.jp` から送るには、Gmailの「名前を追加して別アドレスで送信」を使い、
SMTPサーバーに `smtp.gmail.com`（ポート587/TLS）を指定する。2段階認証が有効なら
アプリパスワードが必要。

なお業界ブログでGoogleが2027年1月にこの機能を終了予定という情報があるが、
**Cloudflare公式・Google公式のどちらにも明記は見つかっていない**。
まず受信だけを確実にし、送信は後から試す。

## 巻き戻し

Email Routing の Settings から「Disable Email Routing」を選ぶと、
追加されたMX・SPF・DKIMのレコードはCloudflareが自動削除する。
ただしルールや宛先の設定は復旧できないため、再設定が必要。

---

## Claude in Chrome への指示文（ここから下をそのまま貼る）

```
あなたはCloudflareのダッシュボードで、ドメイン saunako.jp のEmail Routingを設定します。
独自ドメインのメールアドレスを作り、Gmailに転送できるようにするのが目的です。

ブラウザには既にCloudflareにログイン済みのはずです。
ログインや2要素認証を求められたら作業を止めて報告してください（認証情報は入力しない）。

## 絶対に守ること
- 対象ドメインは saunako.jp のみ
- 既存のDNSレコードを削除・編集しない。特に TXT の google-site-verification=... は
  Search Consoleの所有権証明なので絶対に触らない
- AレコードとCNAMEのプロキシ設定（グレークラウド）を変更しない
- 有料プランへのアップグレードやクレジットカード登録を求められたら、作業を止めて報告する
- 「株式会社SaunaTrip」アカウントには一切触らない

## 前提
- 対象アカウント: https://dash.cloudflare.com/e125443b737b2ebdfc1779a7fbd28588/home
- 対象ドメイン: saunako.jp
- 転送先にするGmail: konnichihunting@gmail.com
- このドメインには現在MXレコードもSPFレコードも無いので、競合の心配はありません

## 手順

### 1. Email Routingの画面を開く
Cloudflareダッシュボードで saunako.jp を選び、
サイドバーから「Email」または「Email Routing」を探して開く。

新しいUIでは「Compute」>「Email Service」>「Email Routing」の階層にある場合があります。
見つからない場合はサイドバーの項目名をすべて報告してください。

### 2. 転送先アドレス（Destination address）を登録
「Destination addresses」の項目で、転送先として
konnichihunting@gmail.com を追加する。

追加すると、Cloudflareがそのアドレスに確認メールを送ります。
**この確認メールのリンクをクリックしないと転送は機能しません。**

Gmailを開いて確認メールを探し、認証リンクをクリックしてください。
Cloudflareの画面に戻り、ステータスが「Verified」になったことを確認する。

もしGmailにアクセスできない場合は、その旨を報告して作業を止めてください。

### 3. カスタムアドレスを作成
「Routing rules」で、以下の2つのアドレスを作成する。
どちらも転送先は konnichihunting@gmail.com にする。

1つ目:
  Custom address: info@saunako.jp
  Action: Send to an email
  Destination: konnichihunting@gmail.com

2つ目:
  Custom address: owners@saunako.jp
  Action: Send to an email
  Destination: konnichihunting@gmail.com

(owners@ は施設オーナー向けの窓口用です)

### 4. Catch-allは有効にしない
「Catch-all address」という設定がありますが、**今回は有効にしないでください**。
有効にすると存在しないアドレス宛のスパムもすべて転送されてしまいます。

もし既定で有効になっていたら、その状態を報告してください（無効化はこちらで判断します）。

### 5. Email Routingを有効化
「Enable Email Routing」または同等のボタンを押して有効化する。

CloudflareがMXレコードとTXTレコード（SPF・DKIM）を自動追加します。
追加されるレコードの内容が画面に表示されたら、**確定する前に報告**してください。
私が確認してから進めます。

### 6. DNSレコードの確認
有効化後、DNS管理画面を開き、以下を確認する:
- MXレコードが2件追加されている（値と優先度を報告）
- SPFのTXTレコードが追加されている
- DKIMのTXTレコードが追加されている
- **google-site-verification のTXTレコードが残っている**（最重要）
- AレコードとCNAMEがグレークラウド（DNS only）のままである

DNS画面のスクリーンショットを撮ってください。

## 報告フォーマット
1. Email Routingの画面がどこにあったか
2. 転送先アドレスの検証ステータス（Verified になったか）
3. 作成したカスタムアドレス
4. Catch-allの状態（有効/無効）
5. 自動追加されたDNSレコード（MX 2件の値と優先度、SPF、DKIM）
6. google-site-verification のTXTが残っているか
7. AレコードとCNAMEのプロキシ状態
8. DNS画面のスクリーンショット
9. 想定外だったこと

## 途中で止めるべきケース
- ログイン・2要素認証を求められた
- Gmailの確認メールが見つからない、またはGmailにアクセスできない
- クレジットカード登録や有料プランへの加入を求められた
- 既存のDNSレコードが削除されそうになった
- MXレコードが既に存在していた（想定と違う）
- Catch-allが既定で有効になっていた
```

---

## 設定後にこちらで検証すること

```bash
zsh scripts/verify-email-routing.sh
```

- MXレコードが `mx.cloudflare.net` 系を指しているか
- SPFのTXTが追加されているか
- **google-site-verification のTXTが残っているか**
- A / CNAME が変わっていないか

### 実地テスト

別のメールアドレスから `info@saunako.jp` 宛にテストメールを送り、
Gmailに届くか確認する。DNS伝播のため数分〜数時間かかる場合がある。
