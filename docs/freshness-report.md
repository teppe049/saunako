# 施設情報の鮮度チェック

`node scripts/freshness-watch.mjs` の結果。差分を公式で確認し、facilities.json を直したら verifiedAt を更新してチェックを付ける。

## 2026-11-01

取得 445施設 / 料金の記載が変わった 0 / 閉店の兆候 5 / 取得失敗 27

### 閉店の兆候

- [ ] 68 Lacool（HTTP 200） https://lacool-sauna.com/
- [ ] 77 リセットラボラトリー 三軒茶屋（HTTP 200） https://resetlabo.net/salon/sangenjaya/
- [ ] 171 KURA:SAUNA UTSUNOMIYA（HTTP 404） https://resauna.jp/utsunomiya
- [ ] 338 プライベートサウナ Dann（HTTP 404） https://www.private-sauna-dann.com
- [ ] 354 シモノロ・パーマネント（谷のサウナ）（HTTP 404） https://www.shimonoro-p.jp/

<details><summary>取得失敗</summary>

- 10 3S ジブンサウナ: fetch failed
- 47 個室サウナ サバ？: HTTP 503
- 65 Re: PRIVATE SAUNA: fetch failed
- 76 PRIVATE SAUNA自問自答 祖師ヶ谷大蔵駅前店: fetch failed
- 97 Sauna Lounge Rentola: HTTP 503
- 107 ONEPERSON 横浜関内: fetch failed
- 108 ONEPERSON 登戸: fetch failed
- 109 TENNIMO.: fetch failed
- 114 OFF SAUNA: HTTP 503
- 131 sauna yuba: fetch failed
- 141 CRED SPA SAUNA: HTTP 403
- 145 Steamers Beach & Sauna: HTTP 423
- 167 ウツノミヤサウナクラブ 本店: fetch failed
- 168 ウツノミヤサウナクラブ 簗瀬店: fetch failed
- 171 KURA:SAUNA UTSUNOMIYA: HTTP 404
- 172 弓乃湯: fetch failed
- 201 プライベートサウナステイ Shinori: fetch failed
- 206 からんころん温泉 貸切サウナ: fetch failed
- 216 Private Sauna Noel: fetch failed
- 226 発酵サウナ: fetch failed
- 251 BLUE BASE SENAMI: HTTP 403
- 257 Luont SAUNA FUJI: fetch failed
- 338 プライベートサウナ Dann: HTTP 404
- 354 シモノロ・パーマネント（谷のサウナ）: HTTP 404
- 449 達磨サウナ: fetch failed
- 452 SAUNA GYM MISOGI 袋井駅前店: fetch failed
- 493 THE ZEN（GoMe）: fetch failed

</details>

