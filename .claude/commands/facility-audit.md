# /facility-audit — 施設データ品質チェック

毎日10施設ずつ、データの正確性を目検チェックするためのコマンド。

## 実行手順

### 1. 進捗確認
`docs/facility-audit-log.md` を読み、チェック済み施設IDを把握する。
ファイルがなければ新規作成する。

### 2. 次の10施設を選定

優先順位:
1. **PV上位で未チェックの施設**（GA4 MCP `getPageViews` で過去30日のPVを取得し、`/facilities/{id}` のPV順にソート）
2. **hacomono系施設**（bookingUrlに `hacomono.jp` を含む、Issue #163）
3. **「予約制」施設**（businessHoursに「予約」「完全入替」を含む）
4. **残りをエリア別（北→南）**

### 3. チェックリスト出力

選定した10施設それぞれについて、以下の情報を表示:

```
## id={id} {name}（{prefectureLabel}）
サウナ子: https://www.saunako.jp/facilities/{id}
公式: {website}
予約: {bookingUrl}

### チェック項目
- [ ] **営業時間**: `{businessHours}` ← 公式と一致？個室サウナの時間？
- [ ] **料金**: ¥{priceMin}/1h ← 最安プラン合ってる？最低利用時間×単価で実額確認
- [ ] **slotType**: `{slotType}` ← 枠制(fixed)かフリー(free)か正しい？
- [ ] **timeSlots**: {timeSlotsの有無と内容} ← 枠制なら正しい時間？
- [ ] **エリア**: `{area}` ← 正しい地域分類？
- [ ] **画像**: 個室サウナの画像になっている？共用エリアじゃない？
- [ ] **設備**: 水風呂{waterBath}/ロウリュ{selfLoyly}/外気浴{outdoorAir}/カップル{coupleOk} ← 合ってる？
- [ ] **アクセス**: {nearestStation}駅 徒歩{walkMinutes}分 ← 正しい？
- [ ] **サウナ子コメント**: テンプレ感ない？行ったことあれば体験コメントに差し替え
- [ ] **閉業チェック**: まだ営業してる？
```

### 4. ユーザーの確認結果を反映

ユーザーが各項目の修正指示を出したら:
- `data/facilities.json` を更新
- 必要に応じて画像差し替え（Playwright MCPでダウンロード）
- slotType変更 → timeSlots追加
- サウナ子コメント更新

### 5. 進捗記録

チェック完了した施設を `docs/facility-audit-log.md` に記録:
```
| 日付 | ID | 施設名 | 修正内容 |
|------|-----|--------|---------|
| 2026-04-06 | 147 | サウナイーグル | businessHours修正、画像差替 |
```

## 注意事項
- 料金は公式HPの最安表記をそのまま使わず、**最低利用時間×単価で実額を確認**（feedback_price-verification.md）
- 画像差し替え時はPlaywright MCPをサブエージェントで実行
- seoTitle/seoDescriptionの変更は1デプロイ最大10施設まで（SEO運用ルール）
- 閉業確認できた施設は `closedAt` を設定（削除しない）
