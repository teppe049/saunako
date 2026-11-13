#!/bin/zsh
# www / apex を Cloudflare Workers のカスタムドメインに切り替えたあとの検証
# 使い方: zsh scripts/verify-dns-switch.sh
#
# 2026-11 に配信を Vercel から Workers へ移した。Workers のカスタムドメインはプロキシ必須なので、
# A/AAAA は Cloudflare の IP（104.x / 172.6x.x など）を返すのが正常。旧 Vercel の値が残っていたら未切替。

EXPECTED_TXT="google-site-verification=UvqO2r8ln7CWEKtlBhQNcmct5XEs70Pzk4oFAPsEOX8"
OLD_VERCEL_A="216.198.79.1"
OLD_VERCEL_CNAME="vercel-dns"
R=8.8.8.8
PASS=0
FAIL=0

ok()   { echo "  OK   $1"; PASS=$((PASS+1)); }
ng()   { echo "  FAIL $1"; FAIL=$((FAIL+1)); }

is_cf_ip() {
  case "$1" in
    104.1[6-9].*|104.2[0-9].*|104.3[01].*|172.6[4-9].*|172.7[01].*|188.114.*|162.159.*|2606:4700:*|2a06:98c*) return 0 ;;
    *) return 1 ;;
  esac
}

echo "=========================================="
echo " saunako.jp Workers 切替後 検証  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo

echo "[1] ネームサーバー"
NS=$(dig @$R +short NS saunako.jp | sort | tr '\n' ' ')
echo "  $NS"
case "$NS" in *cloudflare*) ok "Cloudflare" ;; *) ng "Cloudflare 以外" ;; esac
echo

for HOST in saunako.jp www.saunako.jp; do
  echo "[2] $HOST の向き先"
  CNAME=$(dig @$R +short CNAME $HOST)
  A=$(dig @$R +short A $HOST | head -1)
  echo "  CNAME: ${CNAME:-なし} / A: ${A:-なし}"
  if [[ "$CNAME" == *$OLD_VERCEL_CNAME* || "$A" == "$OLD_VERCEL_A" ]]; then
    ng "まだ Vercel を向いている"
  elif is_cf_ip "$A"; then
    ok "Cloudflare プロキシ経由（Workers カスタムドメイン）"
  else
    ng "想定外の値"
  fi
  echo
done

echo "[3] TXT（Search Console 所有権）"
dig @$R +short TXT saunako.jp | tr -d '"' | grep -qx "$EXPECTED_TXT" && ok "google-site-verification あり" || ng "google-site-verification が無い"
echo

echo "[4] メール（Email Routing の MX / SPF が残っているか）"
dig @$R +short MX saunako.jp | grep -q "mx.cloudflare.net" && ok "MX あり" || ng "MX が消えている"
dig @$R +short TXT saunako.jp | grep -q "_spf.mx.cloudflare.net" && ok "SPF あり" || ng "SPF が消えている"
echo

echo "[5] HTTP"
CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.saunako.jp/)
SERVER=$(curl -sI https://www.saunako.jp/ | grep -i "^server:" | tr -d '\r')
[ "$CODE" = "200" ] && ok "https://www.saunako.jp/ が 200（$SERVER）" || ng "https://www.saunako.jp/ が $CODE（$SERVER）"
LOC=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://saunako.jp/area/tokyo)
[[ "$LOC" == 30[18]\ https://www.saunako.jp/area/tokyo ]] && ok "apex → www（$LOC）" || ng "apex → www が想定外: $LOC"
GO=$(curl -s -o /dev/null -w "%{http_code}" "https://www.saunako.jp/go/1?dest=booking")
[ "$GO" = "302" ] && ok "/go/ の送客リダイレクトが 302" || ng "/go/ が $GO"
echo

echo "=========================================="
echo " PASS=$PASS  FAIL=$FAIL"
echo "=========================================="
echo "ローカルの DNS キャッシュは古い値を返すことがあるので、判定は 8.8.8.8 に聞いた結果を使っている"
