# シラバス分野の分類と個別補正

## 分類方針

科目の `fieldCategory` は、ZEN大学シラバスの「分野から探す」を正とする。
MTH、INF、HUM、SOC、ECON、DIGIの各プレフィックスは自動推論し、
BSCなど科目コードだけでは分野を判定できない科目は
`scripts/manual-overrides.json` で個別に補正する。

`fieldCategory` と `foundationGroups` は用途が異なるため、同じ値になるとは限らない。

- `fieldCategory`: 公式シラバスの「分野から探す」と科目一覧の分野フィルターに使用する。
- `foundationGroups`: 基礎科目の卒業要件判定や自動履修計画に使用する。

例えば「データサイエンス概論」は、公式シラバス上の分野は「情報」だが、
卒業要件上の基礎科目グループは「数理」として扱う。

## 公式検索結果との照合

2026年8月28日に、公式シラバスの各カテゴリについて全ページを取得し、
科目コード単位で `src/data/courses.json` と照合した。

| 分野 | 公式検索結果 | 科目数 | 補正後の一致数 |
| --- | --- | ---: | ---: |
| 数理 | [検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=mathematical_sciences) | 47 | 47 |
| 情報 | [検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=applied_informatics) | 65 | 65 |
| 文化・思想 | [検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=culture_and_thoughts) | 41 | 41 |
| 社会・ネットワーク | [検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=society_and_networks) | 37 | 37 |
| 経済・マーケット | [検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=economy_and_markets) | 26 | 26 |
| デジタル産業 | [検索結果](https://syllabus.zen.ac.jp/search/result?subject_category_id=digital_industry) | 15 | 15 |

6カテゴリの公式検索結果に含まれる231科目はすべてアプリ内に存在する。
補正後は、カテゴリ不一致、アプリ側だけの余分な分類、複数カテゴリへの重複分類はいずれも0件である。

## BSC基礎科目の個別補正

| 科目コード | 科目名 | `fieldCategory` | `foundationGroups` |
| --- | --- | --- | --- |
| `BSC-1-B1-0204-004` | 数学的思考とは何か | `mathematics` | `mathematics` |
| `BSC-1-B1-0204-006` | 現代社会とサイエンス | `mathematics` | `mathematics` |
| `BSC-1-B1-1030-005` | 数学史 | `mathematics` | `mathematics` |
| `BSC-1-B1-1030-001` | 情報セキュリティ概論 | `information` | `information` |
| `BSC-1-B1-0204-002` | 情報倫理と法 | `information` | `information` |
| `BSC-1-B1-0204-003` | データサイエンス概論 | `information` | `mathematics` |
| `BSC-1-B1-1030-007` | 日本文学Ⅰ | `culture_thought` | `culture_thought` |
| `BSC-1-B1-1030-008` | 文化人類学Ⅰ | `culture_thought` | `culture_thought` |
| `BSC-1-B1-0204-009` | 心理学 | `culture_thought` | `culture_thought` |
| `BSC-1-B1-1030-010` | 社会学Ⅰ | `society_network` | `society_network` |
| `BSC-1-B1-0204-011` | 法学Ⅰ | `society_network` | `society_network` |
| `BSC-1-B1-1030-012` | 伝わる論理とコミュニケーション | `society_network` | `society_network` |
| `BSC-1-B1-0204-013` | 企業経営 | `economy_market` | `economy_market` |
| `BSC-1-B1-0204-014` | 地域アントレプレナーシップ | `economy_market` | `economy_market` |
| `BSC-1-B1-0204-015` | 地域課題の解決とイノベーション | `economy_market` | `economy_market` |

## 更新手順

公式シラバスのカテゴリが変更された場合は、次の順序で更新する。

1. 公式の6カテゴリ検索結果を科目コード単位で比較する。
2. プレフィックスから推論できない差分を `scripts/manual-overrides.json` に反映する。
3. `npm run build:data` で `src/data/courses.json` を再生成する。
4. `fieldCategory` の公式側だけ・アプリ側だけ・カテゴリ不一致が0件であることを確認する。
5. `foundationGroups` は卒業要件の根拠に基づいて別途確認し、分野分類に合わせて機械的に変更しない。
