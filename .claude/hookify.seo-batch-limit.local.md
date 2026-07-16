---
name: block-seo-meta-change
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: facilities\.json$
  - field: new_text
    operator: regex_match
    pattern: seoTitle|seoDescription
action: warn
---

**SEO メタデータ変更は段階再開中（1回のデプロイ最大30施設）**

facilities.json の seoTitle / seoDescription は **30施設/回・次バッチまで1週間あける** ルールで変更すること。

**経緯**: 2026/3/10に128施設のseoTitleを一括変更→当初はGoogle品質フィルター発動でトラフィック消滅と誤認（真因はGSC削除ツールと後に判明、7/2解除）。2026/7/12の `/analytics-pdca` でGoogle回復を確認（GSC週145clicks・google 409PV/週）。2026/7/17、真因がメタ変更でなかった事実を踏まえ上限10→30施設・待機1〜2週→1週に緩和（詳細はCLAUDE.md「段階的なメタ変更」）。

**変更時のチェック:**
- 今回のバッチが30施設以内か数える
- 前回バッチから1週間以上空いているか確認
- 1バッチ内は同一エリア・同一クエリ群にまとめ、効果測定を成立させる
- 変更後は `/analytics-pdca` で imp/clicks を確認してから次バッチへ
