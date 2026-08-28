# シラバス分野の個別補正

## 方針

科目の `fieldCategory` は、ZEN大学シラバスの「分野から探す」を正とする。
科目コードのプレフィックスから分類を推論できない科目は、
`scripts/manual-overrides.json` で個別に補正する。

基礎科目については、卒業要件の集計に用いる `foundationGroups` も、
公式シラバスの分野と整合するように補正する。

## 現代社会とサイエンス

- 科目コード: `BSC-1-B1-0204-006`
- 科目名: 現代社会とサイエンス
- 正しい分野: 数理（`mathematics`）
- 確認日: 2026年8月28日
- 根拠: [ZEN大学シラバス「数理」の検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=mathematical_sciences)
- 科目ページ: [現代社会とサイエンス](https://syllabus.zen.ac.jp/subjects/2026/BSC-1-B1-0204-006)

この科目はBSCプレフィックスのため自動推論では分野を決定できない。
そのため、`foundationGroups` と `fieldCategory` の両方を `mathematics` に補正する。
