# ZEN大学 進級・卒業要件 構造化仕様（2026-04-14確認版）

## 0. この文書の目的

この文書は、ZEN大学の **進級要件** と **卒業要件** を、LLMやプログラムで扱いやすいように構造化した仕様書です。

この版では、次の3つを突き合わせて整理しています。

1. 「進級・卒業について」の本文
2. 卒業要件の表PDF
3. カリキュラムツリーPDF

**判定ロジックの根拠として最優先するのは 1 と 2** です。  
**3 は、科目分類や学びの流れを補助的に理解する資料** として使います。

なお注意すべき事項として

- オンデマンド科目は1クォーター分で基本的には2単位、ただし一部の科目は1単位であることがある(pixiv連携科目など)
- ライブ授業科目は2短期であるが、前期(1-2Q)と後期(3-4Q)のどちらかであり、多言語ITコミュニケーションと人工知能活用実践の2科目を除き、前期か後期かの開講である
- 演習科目/ゼミは、前期(1-2Q)と後期(3-4Q)のいずれかもしくは通期で、2クォーター連続/4クォーター連続で開講されることが多い
- 卒業プロジェクト科目は、プロジェクト実践が必修で、1年間4クォーター連続で開講される

以上を前提として、卒業要件や進級要件を満たす必要がある。

---

## 1. 出典の優先順位

```yaml
source_priority:
  - rank: 1
    source: 学生便覧「進級・卒業について」の本文
    role: 進級要件・卒業要件・判定時期・在学年数条件の正式根拠
  - rank: 2
    source: 卒業要件の表PDF
    role: 卒業所要単位数と分類条件の正式根拠
  - rank: 3
    source: カリキュラムツリーPDF
    role: 各科目がどの分類に属するか、学習順序や対応関係を補助的に把握する資料
  - rank: 4
    source: 公開シラバス
    role: 各科目の単位数・開講形態・前提科目・後継科目などの科目単位メタデータ
```

### 運用ルール

- 要件の数値や判定条件が衝突した場合は、**学生便覧本文と卒業要件表を優先**する。
- カリキュラムツリーは、**分類の読み解き補助**には使うが、単独では卒業判定の唯一根拠にしない。
- 科目ごとの詳細は **公開シラバス** で補完する。

---

## 2. 用語定義

```yaml
terms:
  enrolled_years:
    name: 在学年数
    definition: 休学期間を除いた在学期間
  countable_credits:
    name: 卒業要件に算入できる単位
    definition: 卒業要件の単位として認められる単位のみ
  free_courses:
    name: 自由科目
    definition: 卒業要件の科目ではない
```

### 注意

- **進級・卒業要件は入学年度のものが適用**される。
- 単位数として数えるのは、**卒業要件の単位として認められるもののみ**である。
- **自由科目は卒業要件に含まれない**。
- **社会接続科目は、卒業要件へ算入できるのが最大10単位まで**である。

---

## 3. 進級要件

### 3.1 年次進行の基本ルール

```yaml
promotion_rules:
  year1_to_year2:
    min_enrolled_years: 1
    min_countable_credits: null
  year2_to_year3:
    min_enrolled_years: 2
    min_countable_credits: null
  year3_to_year4:
    min_enrolled_years: 3
    min_countable_credits: 90
    note: 早期卒業者を除く
```

### 解釈

- **1年次→2年次** は、1年以上在学していればよい。単位修得要件はない。
- **2年次→3年次** は、2年以上在学していればよい。単位修得要件はない。
- **3年次→4年次** は、次の両方が必要。
  - 3年次終了時に **修得総単位数90単位以上**
  - **3年以上在学**していること

### 3.2 進級判定時期

```yaml
promotion_judgement_timing:
  april_admission:
    judgement_at: 秋学期終了時
    quarter: 4
  october_admission:
    judgement_at: 春学期終了時
    quarter: 2
  leave_of_absence_note:
    judgement_at: 復学後に在学要件を満たす最初の学期末
```

### 3.3 進級認定と未達時の扱い

```yaml
promotion_result:
  satisfied: 教授会の審議を経て進級認定
  unsatisfied: 留年（原級に留める）
```

---

## 4. 卒業要件

### 4.1 最上位条件

```yaml
graduation_rules:
  min_enrolled_years: 4
  min_total_countable_credits: 124
  additional_required_categories:
    - 導入科目
    - 基礎科目
    - 展開科目
    - 卒業プロジェクト科目
```

### 4.2 卒業所要単位数の正式構造

```yaml
graduation_category_requirements:
  introduction_courses:
    name: 導入科目
    min_credits: 14

  foundation_courses:
    name: 基礎科目
    min_credits: 12
    subrequirements:
      - key: mathematics
        name: 数理
        min_credits: 2
      - key: information
        name: 情報
        min_credits: 2
      - key: culture_thought
        name: 文化・思想
        min_credits: 2
      - key: society_network
        name: 社会・ネットワーク
        min_credits: 2
      - key: economy_market
        name: 経済・マーケット
        min_credits: 2
      - key: multilingual_it_communication
        name: 多言語ITコミュニケーション
        min_credits: 2

  expansion_courses:
    name: 展開科目
    min_credits: 74
    subrequirements:
      - key: foundation_literacy_combined
        name: 基盤リテラシー科目（基礎科目の履修も合算）
        min_credits: 8
      - key: multilingual_information_understanding_combined
        name: 多言語情報理解科目（基礎科目の履修も合算）
        min_credits: 8
      - key: world_understanding_combined
        name: 世界理解科目（基礎科目の履修も合算）
        min_credits: 26
      - key: digital_industry_history
        name: デジタル産業の指定4科目群
        min_credits: 2
        eligible_courses:
          - IT産業史
          - マンガ産業史
          - アニメ産業史
          - 日本のゲーム産業史
      - key: social_connection_cap
        name: 社会接続科目の算入上限
        max_countable_credits: 10

  graduation_project_courses:
    name: 卒業プロジェクト科目
    min_credits: 4
    required_course:
      - プロジェクト実践
```

---

## 5. 判定ロジックとしての正規化

卒業判定では、単純に「列ごとの単位数」を見るだけでは不十分です。  
正式な判定では、**科目をまず大分類（導入 / 基礎 / 展開 / 卒プロ / 自由）に置き、そのうえで一部の集計は横断的に合算**する必要があります。

### 5.1 科目の正規化属性

各科目には、少なくとも次の属性を持たせると扱いやすいです。

```yaml
course_schema:
  course_id: string
  course_name: string
  credits: integer
  band:
    allowed:
      - introduction
      - foundation
      - expansion
      - graduation_project
      - free
  foundation_groups:
    type: array
    allowed_values:
      - mathematics
      - information
      - culture_thought
      - society_network
      - economy_market
      - multilingual_it_communication
  expansion_track:
    allowed:
      - foundation_literacy
      - multilingual_information_understanding
      - world_understanding
      - social_connection
      - null
  tags:
    type: array
    examples:
      - digital_industry_history_eligible
      - required_project_practice
  countable_to_graduation: boolean
```

### 5.2 合算の定義

```yaml
combined_credit_definitions:
  foundation_literacy_combined:
    formula:
      - 基礎科目のうち foundation_groups に mathematics または information を持つ科目の単位合計
      - 展開科目のうち expansion_track = foundation_literacy の単位合計

  multilingual_information_understanding_combined:
    formula:
      - 基礎科目のうち foundation_groups に multilingual_it_communication を持つ科目の単位合計
      - 展開科目のうち expansion_track = multilingual_information_understanding の単位合計

  world_understanding_combined:
    formula:
      - 基礎科目のうち foundation_groups に culture_thought / society_network / economy_market を持つ科目の単位合計
      - 展開科目のうち expansion_track = world_understanding の単位合計
```

### 5.3 社会接続科目の扱い

```yaml
social_connection_rule:
  raw_earned_credits: 履修した単位数そのもの
  countable_credits: min(raw_earned_credits, 10)
  applies_to:
    - 卒業要件の総単位数 124
    - 展開科目 74単位の算入
```

### 5.4 自由科目の扱い

```yaml
free_course_rule:
  raw_earned_credits: 履修した単位数そのもの
  countable_credits: 0
  applies_to:
    - 進級要件の単位集計
    - 卒業要件の単位集計
```

---

## 6. 数式としての卒業判定

### 6.1 基本式

```text
counted_total_credits >= 124
```

```text
introduction_credits >= 14
foundation_credits >= 12
expansion_credits_counted >= 74
graduation_project_credits >= 4
```

### 6.2 基礎科目の下位条件

```text
foundation[mathematics] >= 2
foundation[information] >= 2
foundation[culture_thought] >= 2
foundation[society_network] >= 2
foundation[economy_market] >= 2
foundation[multilingual_it_communication] >= 2
```

### 6.3 展開科目の横断条件

```text
foundation_literacy_combined >= 8
multilingual_information_understanding_combined >= 8
world_understanding_combined >= 26
digital_industry_history_credits >= 2
counted_social_connection_credits <= 10
```

---

## 7. ここで重要な読み替え

### 7.1 前版からの重要な修正点

以前のドラフトでは、カリキュラムツリーの列をそのまま卒業判定カテゴリとみなす方向に寄っていました。  
しかし、正式な卒業判定の骨格は次の **4大分類** です。

```yaml
official_graduation_bands:
  - 導入科目
  - 基礎科目
  - 展開科目
  - 卒業プロジェクト科目
```

そのうえで、

- 基盤リテラシー
- 多言語情報理解
- 世界理解
- 社会接続

は、**展開科目内の区分**として扱われます。

### 7.2 最低単位の見方

公式な大分類の最低単位は次です。

```yaml
official_band_minimums:
  introduction: 14
  foundation: 12
  expansion: 74
  graduation_project: 4
  subtotal: 104
```

したがって、**124単位卒業**に対して、最低配分 104 単位だけでは足りません。  
**さらに20単位以上** を、卒業要件に算入できる科目で積み増す必要があります。

この「追加20単位」は、

- 導入科目をさらに履修する
- 基礎科目をさらに履修する
- 展開科目をさらに履修する
- 卒業プロジェクト科目に追加科目があるなら履修する

といった形で満たすことになります。通常は展開科目で積み増す設計と考えるのが自然です。

---

## 8. 進級・卒業の周辺ルール

```yaml
judgement_timing:
  graduation:
    - 春学期終了時（2クオーター終了時）
    - 秋学期終了時（4クオーター終了時）

recognition:
  promotion: 教授会の審議を経て認定
  graduation: 教授会の審議を経て認定し、学士の学位を授与

postponement:
  graduation_postponed_if:
    - 卒業判定時に卒業要件を満たしていない
    - 休学等により在学年数が修業年限4年に達していない

midyear_graduation:
  condition: 前年度卒業延期後、その後の年度途中で卒業要件を満たした場合に認められる
```

---

## 9. 早期卒業（2028年度以降）

```yaml
early_graduation:
  available_from: 2028年度以降
  min_enrolled_years: 3
  preliminary_requirements_at_end_of_year2:
    - 88単位以上を優秀な成績で取得
    - 所定の累積GPAを満たす
    - 本学への申出と所定審査
  note: GPAの具体的基準値は、この資料では未提示
```

### 実装上の注意

- **GPAの閾値そのものは、今回の添付資料では明示されていない**。
- そのため、プログラムでは
  - `gpa_requirement_met: bool`
  - `application_screening_passed: bool`
  のように、外部判定結果を受け取る形にしておくのが安全です。

---

## 10. LLM / プログラム向けの実装方針

### 10.1 最低限必要な入力

```yaml
student_input_schema:
  admission_year: integer
  admission_month:
    allowed: [4, 10]
  enrolled_years_excluding_leave: number
  completed_course_ids:
    type: array[string]
  course_catalog_version: string
```

### 10.2 1科目ごとに必要な情報

```yaml
required_course_master_fields:
  - course_id
  - course_name
  - credits
  - band
  - foundation_groups
  - expansion_track
  - tags
  - countable_to_graduation
  - applicable_cohorts
```

### 10.3 今回の仕様で未確定のもの

```yaml
out_of_scope_or_unknown:
  - 入学年度ごとの差分を含む完全な科目マスタ
  - 単位互換制度の具体ルール
  - GPAの具体閾値
  - 個別科目の前提科目・後継科目の完全一覧
```

これらは **シラバスや別規程** で補完する。

---

## 11. 実装上の推奨結論

### 結論

ZEN大学の進級・卒業判定をプログラム化する場合、**科目を1つの単純カテゴリにだけ入れるのではなく、次の2軸で管理する**のが最も安全です。

1. **大分類**: 導入 / 基礎 / 展開 / 卒プロ / 自由
2. **横断ラベル**: 数理・情報・文化思想・社会ネットワーク・経済マーケット・多言語ITコミュニケーション・基盤リテラシー・多言語情報理解・世界理解・社会接続・デジタル産業指定科目

この形にすると、

- 基礎科目の12単位判定
- 展開科目の74単位判定
- 基礎+展開の横断合算判定
- 社会接続10単位上限
- 自由科目除外

を、矛盾なく同時に実装できます。

