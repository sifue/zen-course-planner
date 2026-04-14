# ZEN大学 カリキュラム・ツリー構造化データ - データサイエンス

## 0. この文書の目的
この文書は、PDF「カリキュラム・ツリー データサイエンス」を、LLMやプログラムが扱いやすいように、**分類・年次/クオーター配置・接続関係・演習科目フラグ**を構造化して記述したものです。

## 1. 出典
- source_pdf: `curriculumTree_datascience20251002.pdf`
- source_title: `カリキュラム・ツリー データサイエンス`

## 2. 解釈ルール
- このPDFは**履修順の推奨や科目群の連関**を図示した資料として扱う。
- 図中の接続線は、この文書では `recommended_preparation` として表現する。
- **正式な前提科目の定義ではない**。シラバスの記載が優先される。
- `year` と `quarter` は、図中の配置をもとに記述する。
- 背の高い長方形は、図の見た目上、複数クオーターにまたがって表示されている。必要に応じて `quarter_span` を記述する。
- 図中の太い枠線は凡例より **演習科目** を意味するため、`is_practicum: true` を付与する。

## 3. 全体構造

```yaml
curriculum_tree:
  domain: "データサイエンス"
  axes:
    years: [1, 2, 3, 4]
    quarters: ["1Q", "2Q", "3Q", "4Q"]
  systems:
    - id: "information_system"
      label: "情報系"
    - id: "mathematics_system"
      label: "数学系"
  legend:
    thick_border: "演習科目"
```

## 4. 科目一覧

```yaml
courses:
  - system: "情報系"
    items:
      - {course_name: "人工知能活用実践", year: 1, quarter_span: ["1Q", "2Q"], is_practicum: false}
      - {course_name: "データサイエンス概論", year: 1, quarter: "2Q", is_practicum: false}
      - {course_name: "ITリテラシー", year: 1, quarter: "1Q", is_practicum: false}
      - {course_name: "デジタルツールの使い方", year: 1, quarter: "2Q", is_practicum: false}
      - {course_name: "Pythonプログラミング", year: 1, quarter: "2Q", is_practicum: false}
      - {course_name: "AI社会の歩き方", year: 1, quarter_span: ["1Q", "2Q"], is_practicum: false}
      - {course_name: "多言語ITコミュニケーション", year: 1, quarter_span: ["3Q", "4Q"], is_practicum: false}
      - {course_name: "統計学入門", year: 1, quarter: "3Q", is_practicum: false}
      - {course_name: "情報収集と伝達技術", year: 1, quarter_span: ["3Q", "4Q"], is_practicum: true}
      - {course_name: "機械学習概論", year: 2, quarter: "1Q", is_practicum: false}
      - {course_name: "R言語プログラミング", year: 2, quarter: "1Q", is_practicum: false}
      - {course_name: "ディープラーニング1", year: 2, quarter: "3Q", is_practicum: false}
      - {course_name: "AIアルゴリズム実践", year: 2, quarter_span: ["3Q", "4Q"], is_practicum: true}
      - {course_name: "ビッグデータ分析概論", year: 2, quarter: "3Q", is_practicum: false}
      - {course_name: "計算機実験で学ぶ確率とモンテカルロ法", year: 2, quarter: "3Q", is_practicum: false}
      - {course_name: "ディープラーニング2", year: 3, quarter: "1Q", is_practicum: false}
      - {course_name: "データサイエンス実践I（アンケート）", year: 3, quarter: "1Q", is_practicum: false}
      - {course_name: "ビッグデータ分析実践", year: 3, quarter: "1Q", is_practicum: false}
      - {course_name: "統計学展望", year: 3, quarter_span: ["1Q", "2Q"], is_practicum: true}
      - {course_name: "データベース運用実践", year: 3, quarter: "2Q", is_practicum: false}
      - {course_name: "ディープラーニング3", year: 3, quarter: "3Q", is_practicum: false}
      - {course_name: "データサイエンス実践II（モデリング）", year: 3, quarter: "3Q", is_practicum: false}
      - {course_name: "マーケティング×データサイエンス", year: 3, quarter_span: ["3Q", "4Q"], is_practicum: true}
      - {course_name: "統計数理の方法", year: 3, quarter_span: ["3Q", "4Q"], is_practicum: true}
      - {course_name: "データサイエンス実践III（時系列）", year: 4, quarter: "1Q", is_practicum: false}
      - {course_name: "自然言語処理の方法", year: 4, quarter_span: ["1Q", "2Q"], is_practicum: true}
      - {course_name: "ゼミ（AIデータサイエンス価値創造ゼミ I）", year: 4, quarter_span: ["1Q", "4Q"], is_practicum: true}
      - {course_name: "ゼミ（AIデータサイエンス価値創造ゼミ II）", year: 4, quarter_span: ["1Q", "4Q"], is_practicum: true}

  - system: "数学系"
    items:
      - {course_name: "現代社会と数学", year: 1, quarter: "1Q", is_practicum: false}
      - {course_name: "解析学1", year: 1, quarter: "2Q", is_practicum: false}
      - {course_name: "線形代数1", year: 1, quarter: "3Q", is_practicum: false}
      - {course_name: "解析学2", year: 1, quarter: "4Q", is_practicum: false}
      - {course_name: "線形代数2", year: 2, quarter: "1Q", is_practicum: false}
      - {course_name: "数理統計", year: 3, quarter: "2Q", is_practicum: false}
```

## 5. 図から明確に読める接続関係

```yaml
recommended_preparation:
  - {from: ["ITリテラシー"], to: ["デジタルツールの使い方"], confidence: "high"}
  - {from: ["AI社会の歩き方"], to: ["情報収集と伝達技術"], confidence: "high"}

  - {from: ["データサイエンス概論"], to: ["統計学入門"], confidence: "high"}
  - {from: ["統計学入門"], to: ["機械学習概論"], confidence: "high"}
  - {from: ["機械学習概論"], to: ["AIアルゴリズム実践"], confidence: "high"}

  - {from: ["ディープラーニング1"], to: ["ディープラーニング2"], confidence: "high"}
  - {from: ["ディープラーニング2"], to: ["ディープラーニング3"], confidence: "high"}

  - {from: ["ビッグデータ分析概論"], to: ["ビッグデータ分析実践"], confidence: "high"}
  - {from: ["ビッグデータ分析実践"], to: ["データベース運用実践"], confidence: "high"}

  - {from: ["計算機実験で学ぶ確率とモンテカルロ法"], to: ["統計学展望"], confidence: "high"}
  - {from: ["統計学展望"], to: ["統計数理の方法"], confidence: "high"}

  - {from: ["現代社会と数学"], to: ["解析学1"], confidence: "high"}
  - {from: ["解析学1"], to: ["線形代数1"], confidence: "high"}
  - {from: ["線形代数1"], to: ["解析学2"], confidence: "high"}
  - {from: ["解析学2"], to: ["線形代数2"], confidence: "high"}
  - {from: ["線形代数2"], to: ["数理統計"], confidence: "high"}
```

## 6. 図上で時系列に並ぶが、接続線は明示されていない科目群

```yaml
ordered_but_not_explicitly_connected:
  - series_name: "データサイエンス実践"
    items:
      - "データサイエンス実践I（アンケート）"
      - "データサイエンス実践II（モデリング）"
      - "データサイエンス実践III（時系列）"
    note: "名称と配置から連続的に見えるが、図中では各科目の間に明示的な接続線は描かれていない。"

  - series_name: "ゼミ"
    items:
      - "ゼミ（AIデータサイエンス価値創造ゼミ I）"
      - "ゼミ（AIデータサイエンス価値創造ゼミ II）"
    note: "4年次の最終段に長い縦長の箱として配置されているが、どの科目から必ず接続されるかは図だけでは固定しない。"

  - series_name: "プログラミング補助群"
    items:
      - "Pythonプログラミング"
      - "R言語プログラミング"
    note: "配置上は情報系の基礎技能群に含まれるが、図中の接続線は明示的ではない。"

  - series_name: "応用実践群"
    items:
      - "マーケティング×データサイエンス"
      - "自然言語処理の方法"
    note: "下流の応用・演習科目として配置されるが、直前の特定単一科目との接続線は図だけでは明確でない。"
```

## 7. LLM/プログラム向けの要点
- このツリーは、**情報系** と **数学系** の2系統で構成される。
- 情報系には、基礎導入、機械学習、ディープラーニング、ビッグデータ、統計応用、ゼミが含まれる。
- 数学系には、現代社会と数学から始まる数理の縦系列があり、最終的に数理統計へ接続する。
- 太枠の科目は `is_practicum: true` として扱う。
- `quarter` / `quarter_span` は**図上の配置情報**であり、正式な開講学期の定義とは切り分けて運用するのが安全。
