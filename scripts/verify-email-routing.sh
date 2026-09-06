#!/bin/zsh
# Cloudflare Email Routing 設定後の検証
# 使い方: zsh scripts/verify-email-routing.sh

EXPECTED_TXT="google-site-verification=UvqO2r8ln7CWEKtlBhQNcmct5XEs70Pzk4oFAPsEOX8"
EXPECTED_A="216.198.79.1"
EXPECTED_CNAME="99c955fad7308c84.vercel-dns-017.com."
R=8.8.8.8
PASS=0
FAIL=0

echo "=========================================="
echo " Email Routing 検証  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo

echo "[1] MXレコード（Cloudflareを指しているか）"
MX=$(dig @$R saunako.jp MX +short)
if [ -z "$MX" ]; then
  echo "  WAIT MXなし（未設定、またはDNS伝播待ち）"
else
  echo "$MX" | sed 's/^/  /'
  if echo "$MX" | grep -q "cloudflare"; then
    echo "  OK   Cloudflareを指している"
    PASS=$((PASS+1))
  else
    echo "  WARN Cloudflare以外のMX"
  fi
fi
echo

echo "[2] SPFレコード"
SPF=$(dig @$R saunako.jp TXT +short | grep "v=spf1")
if [ -z "$SPF" ]; then
  echo "  WAIT SPFなし（未設定、またはDNS伝播待ち）"
else
  echo "  $SPF"
  if echo "$SPF" | grep -q "_spf.mx.cloudflare.net"; then
    echo "  OK   CloudflareのSPF"
    PASS=$((PASS+1))
  else
    echo "  WARN 想定外のSPF"
  fi
fi
echo

echo "[3] DKIMレコード"
DKIM=$(dig @$R cf2024-1._domainkey.saunako.jp TXT +short)
if [ -z "$DKIM" ]; then
  echo "  WAIT DKIMなし（未設定、またはDNS伝播待ち）"
else
  echo "  あり（先頭50文字）: $(echo $DKIM | cut -c1-50)..."
  echo "  OK"
  PASS=$((PASS+1))
fi
echo

echo "[4] 🔴 Search Console所有権のTXTが残っているか"
ACTUAL_TXT=$(dig @$R saunako.jp TXT +short | tr -d '"' | grep "google-site-verification")
if [ "$ACTUAL_TXT" = "$EXPECTED_TXT" ]; then
  echo "  OK   維持されている"
  PASS=$((PASS+1))
else
  echo "  FAIL 失われた、または変化した"
  echo "       expected: $EXPECTED_TXT"
  echo "       actual  : $ACTUAL_TXT"
  FAIL=$((FAIL+1))
fi
echo

echo "[5] サイト配信に影響が出ていないか"
A_NOW=$(dig @$R saunako.jp A +short)
CNAME_NOW=$(dig @$R www.saunako.jp CNAME +short)
if [ "$A_NOW" = "$EXPECTED_A" ]; then
  echo "  OK   A: $A_NOW"
  PASS=$((PASS+1))
else
  echo "  FAIL A: $A_NOW (expected $EXPECTED_A)"
  FAIL=$((FAIL+1))
fi
if [ "$CNAME_NOW" = "$EXPECTED_CNAME" ]; then
  echo "  OK   CNAME www: $CNAME_NOW"
  PASS=$((PASS+1))
else
  echo "  FAIL CNAME www: $CNAME_NOW"
  FAIL=$((FAIL+1))
fi
echo

echo "=========================================="
echo " PASS=$PASS  FAIL=$FAIL"
echo "=========================================="
echo
echo "実地テスト: 別のメールから info@saunako.jp 宛に送り、Gmailに届くか確認する"
