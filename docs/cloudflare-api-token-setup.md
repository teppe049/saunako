# Cloudflare APIトークンの発行（saunako.jp 個人アカウント用）

作成日: 2026-09-06
関連: [#169 Email Routing](https://github.com/teppe049/saunako/issues/169)

## なぜ新しいトークンが要るか

環境変数 `CLOUDFLARE_API_TOKEN` には**株式会社SaunaTripのトークン**が入っている。
このアカウントには本番の Workers 4本・R2・D1 が稼働しており、saunako の作業で
流用すると誤操作のリスクがある。実際、既存トークンでは個人アカウントのゾーンは
見えないことを確認済み（意図した分離が効いている）。

そのため saunako 専用のトークンを別に発行し、`.env.cloudflare` に置く。
このファイルは `.gitignore` の `.env*` に含まれるためコミットされない。

## 発行手順

1. Cloudflareダッシュボードで**個人アカウント**にいることを確認する
   https://dash.cloudflare.com/e125443b737b2ebdfc1779a7fbd28588/home

   このIDのアカウント名は **「My Account」** で、これが個人アカウント。
   「株式会社SaunaTrip」は `f70279d9b2f5e26db42573da83ef10a1` の方（別物）。
   アカウント切り替え画面では名前で見分ける。

2. 右上のプロフィールアイコン → 「My Profile」→ 「API Tokens」
   （または https://dash.cloudflare.com/profile/api-tokens ）

3. 「Create Token」→ 一番下の「Create Custom Token」→ 「Get started」

4. 以下を設定する

**Token name**: `saunako-email-routing`

**Permissions**（4行追加する）

| スコープ | 項目 | 権限 |
|---|---|---|
| Account | Email Routing Addresses | Edit |
| Zone | Email Routing Rules | Edit |
| Zone | Zone | Read |
| Zone | DNS | Edit |

**`Zone : DNS : Edit` は必須**（2026-09-06に実測で判明）。
Email Routing の設定取得（`GET /zones/{id}/email/routing`）と有効化が
MX・SPFレコードを書き込むため、これが無いと `403 / 10000: Authentication error`
になる。3つだけでは足りない。

**Account Resources**: Include → 個人アカウントのみ選ぶ
（「株式会社SaunaTrip」は絶対に含めない）

**Zone Resources**: Include → Specific zone → `saunako.jp`

**Client IP Address Filtering**: 空欄でよい

**TTL**: 期限を切りたければ設定する。未設定でも可

5. 「Continue to summary」→ 内容を確認 → 「Create Token」

6. **表示されたトークンをコピーする**（この画面を離れると二度と表示されない）

## トークンの置き場所

プロジェクト直下に `.env.cloudflare` を作り、次の1行を書く。

```
SAUNAKO_CF_API_TOKEN=<コピーしたトークン>
```

`.gitignore` の `.env*` に含まれるためコミットされない。確認するなら:

```bash
git check-ignore -v .env.cloudflare
```

## 動作確認

```bash
node scripts/cloudflare-email-setup.mjs status
```

正しく設定できていれば、ゾーンIDとアカウント名、Email Routingの状態が表示される。
**アカウント名が「株式会社SaunaTrip」と出たらトークンの発行先を間違えている。**

## 権限が足りなかった場合

`9109` や `10000` 系のエラーが出たら権限不足。トークン編集画面で不足分を追加する。
特に Email Routing の有効化（`enable`）は DNS レコードを自動追加するため、
環境によっては `Zone : DNS : Edit` が要る可能性がある。その時は追加する。

## 使えるコマンド

```bash
node scripts/cloudflare-email-setup.mjs status      # 現状確認（無害）
node scripts/cloudflare-email-setup.mjs add-dest    # 転送先Gmailを登録
node scripts/cloudflare-email-setup.mjs enable      # Email Routingを有効化
node scripts/cloudflare-email-setup.mjs add-rules   # info@ / owners@ を作成
```

削除系の操作は意図的に実装していない。取り消したい場合はダッシュボードから行う。
