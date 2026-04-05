# 施設データ品質チェックログ

毎日10施設ずつ目検チェック。優先順位: PV上位 → hacomono系 → 予約制 → エリア別

## チェック済み施設

| 日付 | ID | 施設名 | 修正内容 |
|------|-----|--------|---------|
| 2026-04-05 | 90 | 高輪SAUNAS | area修正(六本木・麻布→品川・高輪)、businessHours修正(12:00〜20:00)、画像3枚差替 |
| 2026-04-06 | 147 | S+（エスプラス） | slotType→fixed、priceMin¥5,800/Max¥12,100、timeSlots(GRAY/SHIRO各6枠)、area→三河、水風呂✓/ロウリュ✓/カップル✓、bookingUrl追加、コメント追加 |
| 2026-04-06 | 304 | XG SAUNA by re:sauna | slotType→fixed、priceMax¥21,000、timeSlots(2F/3F各3枠)、水風呂✓/ロウリュ✓/外気浴✓/カップル✓、コメント追加 |
| 2026-04-06 | 52 | Boutique Sauna ARCH | 会員制のため据え置き（#166で対応予定） |
| 2026-04-06 | 2 | KUDOCHI sauna 銀座店 | priceMax¥38,000、slotType→fixed、capacity→6、bookingUrl追加、コメント追加 |
| 2026-04-06 | 488 | OITA SAUNA | closedAt設定（サウナが完全個室でない→掲載基準外） |

## hacomono一括スクレイピング（2026-04-06）

Playwright CLIでhacomono予約サイトから全プランの料金を自動取得。17施設のpriceMax/bookingURLを更新。

### 更新施設一覧

| ID | 施設名 | 更新内容 |
|----|--------|---------|
| 89 | 想 -SOU- | priceMax¥12,000、bookingUrl更新 |
| 91 | kasika 京都北山 | priceMin¥20,000/Max¥24,000、slotType→fixed、timeSlots4枠、capacity6、bookingUrl更新 |
| 96 | KUDOCHI 上野湯島 | priceMax¥32,000、bookingUrl更新 |
| 97 | Rentola | bookingUrl更新 |
| 99 | ジングウマエサウナ | priceMax¥21,000、coupleOk✓、bookingUrl更新 |
| 107 | ONEPERSON 横浜関内 | priceMin¥2,520(朝割)/Max¥5,200、bookingUrl更新 |
| 108 | ONEPERSON 登戸 | priceMin¥2,730(朝割)/Max¥5,900、bookingUrl更新 |
| 126 | KUDOCHI 福岡中洲 | priceMax¥12,000、bookingUrl更新 |
| 140 | SAUNA MONKEY | priceMax¥18,000 |
| 181 | KUDOCHI 京都河原町 | priceMax¥38,000、bookingUrl更新 |
| 187 | sayu kamogawa | priceMin¥22,000、slotType→fixed、timeSlots5枠、capacity4、coupleOk✓、bookingUrl更新 |
| 276 | effect ～趣～ | bookingUrl更新 |
| 313 | Prus Sauna 姫路 | bookingUrl修正(prussaunahimeji.hacomono.jp) |
| 360 | Private Sauna 浅海店 | priceMax¥5,500、slotType→fixed、timeSlots2枠、bookingUrl更新 |
| 367 | RAKU 佐賀 | priceMax¥9,800 |
| 387 | Lampo. | priceMax¥4,400、bookingUrl更新 |
| 395 | SAUNA汽汽 | priceMax¥20,000、bookingUrl更新 |
| 459 | ROUTINE | priceMax¥10,000、businessHours更新、bookingUrl更新 |

### 取得できなかった施設

| ID | 施設名 | 理由 |
|----|--------|------|
| 122 | KASAMABI SAUNA | 会員制（#166で対応） |
| 306 | HIGH BALANCE | 会員制（#166で対応） |
| 313 | Prus Sauna 姫路 | 全枠FULL |
| 459 | ROUTINE | 全枠FULL（料金は公式画像から手動取得） |
