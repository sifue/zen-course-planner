# ZEN大学 カリキュラム・ツリー構造化データ - 経済・マーケット

## 0. この文書の目的
この文書は、PDF「カリキュラム・ツリー 経済・マーケット」を、LLMやプログラムが扱いやすいように、**分類・配置・接続関係**を構造化して記述したものです。

## 1. 出典
- source_pdf: `curriculumTree_economymarkets20251001.pdf`
- source_title: `カリキュラム・ツリー 経済・マーケット`

## 2. 解釈ルール
- このPDFは**履修順の推奨や科目群の連関**を図示した資料として扱う。
- 図中の接続線は、この文書では `recommended_preparation`（推奨される準備関係）として表現する。
- **厳密な履修条件・前提科目の正式定義ではない**。正式な前提条件はシラバスで確認する。
- `all_years` は「全学年」を表し、固定学年ではない。
- 図中で複数科目が1つの括り線でまとめられている場合、**個別の 1対1 対応が分離できない**ことがある。その場合は `group_to_group` または `group_to_one` として記述する。

## 3. 全体構造

```yaml
curriculum_tree:
  domain: "経済・マーケット"
  time_axis:
    - "全学年"
    - "2年次"
    - "3年次"
    - "4年次"
  areas:
    - id: "economy"
      label: "経済"
      course_count_label: "11科目"
    - id: "management"
      label: "経営"
      course_count_label: "12科目"
    - id: "regional"
      label: "地域"
      course_count_label: "4科目"
```

## 4. 科目一覧

```yaml
courses:
  - area: "経済"
    items:
      - {course_name: "経済入門", year_bucket: "全学年"}
      - {course_name: "経済言説史", year_bucket: "全学年"}
      - {course_name: "マルクス経済学", year_bucket: "全学年"}
      - {course_name: "マクロ経済学", year_bucket: "2年次"}
      - {course_name: "ミクロ経済学", year_bucket: "2年次"}
      - {course_name: "現代資本主義論", year_bucket: "2年次"}
      - {course_name: "マクロ経済分析演習", year_bucket: "3年次"}
      - {course_name: "事例から学ぶ統計学", year_bucket: "3年次"}
      - {course_name: "課題解決のための計量経済分析", year_bucket: "3年次"}
      - {course_name: "ゼミ（経済発展を考える）", year_bucket: "4年次"}
      - {course_name: "ゼミ（計量経済）", year_bucket: "4年次"}

  - area: "経営"
    items:
      - {course_name: "企業経営", year_bucket: "全学年"}
      - {course_name: "企業経営と会計", year_bucket: "全学年"}
      - {course_name: "企業経営とファイナンス", year_bucket: "2年次"}
      - {course_name: "デジタル・マーケティング", year_bucket: "2年次"}
      - {course_name: "スタートアップ", year_bucket: "2年次"}
      - {course_name: "交渉・合意形成概論", year_bucket: "2年次"}
      - {course_name: "企業価値創造とM&A", year_bucket: "3年次"}
      - {course_name: "財務分析演習", year_bucket: "3年次"}
      - {course_name: "交渉・合意形成演習", year_bucket: "3年次"}
      - {course_name: "ゼミ（幸福曲線）", year_bucket: "4年次"}
      - {course_name: "ゼミ（ビジネスモデル分析）", year_bucket: "4年次"}
      - {course_name: "スタートアップ実践", year_bucket: "4年次"}

  - area: "地域"
    items:
      - {course_name: "地域アントレプレナーシップ", year_bucket: "全学年"}
      - {course_name: "地域課題の解決とイノベーション", year_bucket: "全学年"}
      - {course_name: "農業とデジタルテクノロジー", year_bucket: "2年次"}
      - {course_name: "ゼミ（地域づくり新事業ワークショップ）", year_bucket: "3年次"}
```

## 5. 図から明確に読める接続関係

```yaml
recommended_preparation:
  - relation_type: "group_to_group"
    from_courses: ["経済入門", "経済言説史"]
    to_courses: ["マクロ経済学", "ミクロ経済学"]
    confidence: "high"
    note: "図では2科目が1つの括り線でまとめられ、その先で2科目に分岐している。個別の 1対1 対応は図からは分離しない。"

  - relation_type: "one_to_one"
    from_courses: ["マクロ経済学"]
    to_courses: ["マクロ経済分析演習"]
    confidence: "high"

  - relation_type: "one_to_one"
    from_courses: ["ミクロ経済学"]
    to_courses: ["事例から学ぶ統計学"]
    confidence: "high"

  - relation_type: "one_to_one"
    from_courses: ["マルクス経済学"]
    to_courses: ["現代資本主義論"]
    confidence: "high"

  - relation_type: "one_to_one"
    from_courses: ["現代資本主義論"]
    to_courses: ["課題解決のための計量経済分析"]
    confidence: "high"

  - relation_type: "group_to_one"
    from_courses: ["企業経営", "企業経営と会計"]
    to_courses: ["企業経営とファイナンス"]
    confidence: "high"

  - relation_type: "one_to_group"
    from_courses: ["企業経営とファイナンス"]
    to_courses: ["企業価値創造とM&A", "財務分析演習"]
    confidence: "high"

  - relation_type: "group_to_group"
    from_courses: ["企業価値創造とM&A", "財務分析演習"]
    to_courses: ["ゼミ（幸福曲線）", "ゼミ（ビジネスモデル分析）"]
    confidence: "medium"
    note: "図では2科目が1つの括り線に集約され、その先で2つのゼミにつながっている。各ゼミがどちらに個別対応するかは図だけでは確定しない。"

  - relation_type: "one_to_one"
    from_courses: ["スタートアップ"]
    to_courses: ["スタートアップ実践"]
    confidence: "high"

  - relation_type: "one_to_one"
    from_courses: ["交渉・合意形成概論"]
    to_courses: ["交渉・合意形成演習"]
    confidence: "high"

  - relation_type: "group_to_group"
    from_courses: ["地域アントレプレナーシップ", "地域課題の解決とイノベーション"]
    to_courses: ["農業とデジタルテクノロジー", "ゼミ（地域づくり新事業ワークショップ）"]
    confidence: "medium"
    note: "左側2科目が1つの括り線でまとめられ、右側の2科目方向へ展開している。個別対応は図から断定しない。"
```

## 6. 推奨履修パスとして読めるまとまり

### 6.1 経済
- 導入層:
  - 経済入門
  - 経済言説史
  - マルクス経済学
- 中間層:
  - マクロ経済学
  - ミクロ経済学
  - 現代資本主義論
- 応用層:
  - マクロ経済分析演習
  - 事例から学ぶ統計学
  - 課題解決のための計量経済分析
- 発展層:
  - ゼミ（経済発展を考える）
  - ゼミ（計量経済）

### 6.2 経営
- 導入層:
  - 企業経営
  - 企業経営と会計
- 中間層:
  - 企業経営とファイナンス
  - デジタル・マーケティング
  - スタートアップ
  - 交渉・合意形成概論
- 応用層:
  - 企業価値創造とM&A
  - 財務分析演習
  - 交渉・合意形成演習
- 発展層:
  - ゼミ（幸福曲線）
  - ゼミ（ビジネスモデル分析）
  - スタートアップ実践

### 6.3 地域
- 導入層:
  - 地域アントレプレナーシップ
  - 地域課題の解決とイノベーション
- 中間〜応用層:
  - 農業とデジタルテクノロジー
  - ゼミ（地域づくり新事業ワークショップ）

## 7. 機械処理向け補足
- この文書の `recommended_preparation` は **正式な prerequisite** ではなく、図示された履修の流れを保持するためのデータ。
- 個別の前提条件や単位数は、別途シラバスや科目マスタで持つことを推奨する。
- 経済・経営・地域の3区分は、このPDFの主分類そのものとして扱ってよい。
