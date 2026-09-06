#!/bin/zsh
# ネームサーバー切替後の検証スクリプト
# 使い方: zsh verify-after-switch.sh

EXPECTED_TXT="google-site-verification=UvqO2r8ln7CWEKtlBhQNcmct5XEs70Pzk4oFAPsEOX8"
EXPECTED_A="216.198.79.1"
EXPECTED_CNAME="99c955fad7308c84.vercel-dns-017.com."
PASS=0
FAIL=0

check() {
  local label="$1" actual="$2" expected="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  OK   $label"
    PASS=$((PASS+1))
  else
    echo "  FAIL $label"
    echo "       expected: $expected"
    echo "       actual  : $actual"
    FAIL=$((FAIL+1))
  fi
}

echo "=========================================="
echo " saunako.jp ネームサーバー切替後 検証"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo

echo "[1] ネームサーバーがCloudflareに切り替わったか"
NS=$(dig +short NS saunako.jp | sort | tr '\n' ' ')
echo "  現在のNS: $NS"
case "$NS" in
  *cloudflare*) echo "  OK   Cloudflareに切替済み"; PASS=$((PASS+1)) ;;
  *xdomain*)    echo "  WAIT まだXserver（伝播待ちの可能性。最大48時間）" ;;
  *)            echo "  FAIL 想定外のNS"; FAIL=$((FAIL+1)) ;;
esac
echo

echo "[2] Aレコード（apex）"
check "A saunako.jp" "$(dig +short A saunako.jp)" "$EXPECTED_A"
echo

echo "[3] CNAME www"
check "CNAME www" "$(dig +short CNAME www.saunako.jp)" "$EXPECTED_CNAME"
echo

echo "[4] TXT（Search Console所有権）"
ACTUAL_TXT=$(dig +short TXT saunako.jp | tr -d '"')
check "TXT" "$ACTUAL_TXT" "$EXPECTED_TXT"
echo

echo "[5] MXレコード（存在しないのが正常）"
MX=$(dig +short MX saunako.jp)
if [ -z "$MX" ]; then
  echo "  OK   MXなし"
  PASS=$((PASS+1))
else
  echo "  WARN MXが存在: $MX"
fi
echo

echo "[6] Cloudflareプロキシを通っていないか（DNS onlyの確認）"
echo "  Aレコードが $EXPECTED_A ならVercel直。"
echo "  104.x / 172.67.x 等ならCloudflareプロキシ経由＝設定ミス。"
A_NOW=$(dig +short A saunako.jp)
case "$A_NOW" in
  104.*|172.67.*|172.6[4-9].*|188.114.*|162.159.*)
    echo "  FAIL Cloudflareプロキシ経由になっている: $A_NOW"
    FAIL=$((FAIL+1)) ;;
  "$EXPECTED_A")
    echo "  OK   Vercel直（DNS only）"
    PASS=$((PASS+1)) ;;
  *)
    echo "  ?    判定不能: $A_NOW" ;;
esac
echo

echo "=========================================="
echo " PASS=$PASS  FAIL=$FAIL"
echo "=========================================="
echo
echo "次の手動確認:"
echo "  - ブラウザで https://www.saunako.jp を開く（curlはVercel Bot保護で403）"
echo "  - https://saunako.jp が www に301リダイレクトされる"
echo "  - Search Console (sc-domain:saunako.jp) にアクセスできる"
