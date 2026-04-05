#!/bin/bash
# X 自動投稿スクリプト
# cron から claude -p で x-drafts.md の当日分を投稿する
#
# Usage: ./scripts/x-auto-post.sh [午前|午後]
# cron例: 0 9 * * * /Users/teppei0409/Projects/saunako/scripts/x-auto-post.sh 午前

set -euo pipefail

SLOT="${1:-午前}"
TODAY=$(date +%Y-%m-%d)
PROJECT_DIR="/Users/teppei0409/Projects/saunako"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/x-auto-post-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"

cd "$PROJECT_DIR"

echo "[$TODAY $SLOT] X自動投稿開始" | tee "$LOG_FILE"

/Users/teppei0409/.local/bin/claude -p "
docs/x-drafts.md を読んで、${TODAY} ${SLOT} の下書きを投稿して。

手順:
1. docs/x-drafts.md を読む
2. 「${TODAY} ${SLOT}」に該当するセクションを見つける
3. 見つからない場合は「該当する下書きがありません」と報告して終了
4. 画像がwebpの場合、dwebp で png に変換（プロジェクトルートに出力）
5. post_tweet で本文 + 画像4枚を投稿（file_path は絶対パスで指定、media_type は image/png）
6. 投稿成功したら 120秒待つ（レートリミット対策）
7. リプライセクションがあれば reply_to_tweet_id にさっきのtweet IDを指定してリプライ投稿
8. 投稿済みの下書きセクションの見出しに「✅投稿済み」を追記
9. 変換した png ファイルを削除
10. 結果を報告（投稿URL、リプライURL）
" 2>&1 | tee -a "$LOG_FILE"

echo "[$TODAY $SLOT] 完了" | tee -a "$LOG_FILE"
