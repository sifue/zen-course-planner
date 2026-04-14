# ZEN大学 カリキュラム・ツリー構造化データ - 情報

## 0. この文書の目的
この文書は、PDF「カリキュラム・ツリー 情報」を、LLMやプログラムが扱いやすいように、**分類・推奨履修順・学習経路のまとまり**として構造化して記述したものです。

## 1. 出典
- source_pdf: `curriculumTree_appliedinformatics20251001.pdf`
- source_title: `カリキュラム・ツリー 情報`

## 2. 解釈ルール
- このPDFは**情報分野の学習経路の見取り図**として扱う。
- 図中の接続線は、この文書では `recommended_preparation` として表現する。
- **正式な前提科目の定義ではない**。前提条件はシラバスを優先する。
- この図は「1年次〜4年次」の縦軸と、**IT基礎 / コンピューターサイエンス / アプリケーション開発基礎 / アプリケーション開発応用 / プログラミング基礎 / デジタルクリエイティブ** という横断的な科目群で構成されている。
- 白線が複数の科目箱の間で合流・分岐する箇所は、**厳密な 1対1 の前提対応が切り出せない**場合がある。その場合は `broad_feeder_relation` として表現する。
- 最下部の2つの大きな箱は、**履修者像のガイド**であり、卒業要件上の独立分類ではない。

## 3. 全体構造

```yaml
curriculum_tree:
  domain: "情報"
  years: [1, 2, 3, 4]
  groups:
    - "IT基礎"
    - "プログラミング基礎"
    - "デジタルクリエイティブ"
    - "コンピューターサイエンス"
    - "アプリケーション開発基礎"
    - "アプリケーション開発応用"
  learner_guidance_boxes:
    - "情報 - 教養として情報を学びたい方向け"
    - "情報 - 情報を専門的に学びたい方向け"
```

## 4. 科目一覧

```yaml
courses:
  - group: "IT基礎"
    items:
      - {course_name: "ITリテラシー", year: 1}
      - {course_name: "情報倫理と法", year: 1}
      - {course_name: "多言語ITコミュニケーション", year: 1}
      - {course_name: "デジタルツールの使い方", year: 1}
      - {course_name: "情報セキュリティ概論", year: 1}
      - {course_name: "インターネット概論", year: 2}
      - {course_name: "コンピュータ概論", year: 2}
      - {course_name: "情報処理概論", year: 2}
      - {course_name: "プロジェクトマネジメント概論", year: 2}

  - group: "プログラミング基礎"
    items:
      - {course_name: "ビジュアルプログラミング", year: 1}
      - {course_name: "Pythonプログラミング", year: 1}

  - group: "コンピューターサイエンス"
    items:
      - {course_name: "コンピューターサイエンス概論", year: 2}
      - {course_name: "Webセキュリティ演習", year: 2}
      - {course_name: "オートマトンと形式言語理論", year: 3}
      - {course_name: "論理回路概論", year: 3}
      - {course_name: "画像処理論", year: 3}
      - {course_name: "暗号技術とその応用", year: 3}
      - {course_name: "ゼミ（情報セキュリティ）", year: 3}

  - group: "アプリケーション開発基礎"
    items:
      - {course_name: "Webアプリケーション開発1", year: 1}
      - {course_name: "Webアプリケーション開発2", year: 1}
      - {course_name: "Webアプリケーション開発3", year: 2}
      - {course_name: "Webアプリケーション開発4", year: 2}
      - {course_name: "Linux概論", year: 2}

  - group: "アプリケーション開発応用"
    items:
      - {course_name: "Javaプログラミング演習", year: 2}
      - {course_name: "JavaScriptによる自動化、効率化", year: 2}
      - {course_name: "インターネットのしくみ", year: 2}
      - {course_name: "オブジェクト指向プログラミング", year: 2}
      - {course_name: "関数型プログラミング", year: 3}
      - {course_name: "クラウドコンピューティング技術", year: 3}
      - {course_name: "並行処理プログラミング", year: 3}
      - {course_name: "ゲームプログラミング演習", year: 3}
      - {course_name: "プロジェクトマネジメント応用", year: 3}
      - {course_name: "Webアプリケーション開発演習", year: 3}
      - {course_name: "ゼミ（質的データ分析&エージェントシミュレーション）", year: 3}
      - {course_name: "ゼミ（インターネットのしくみ（応用））", year: 3}
      - {course_name: "チームプログラミング演習", year: 3}

  - group: "デジタルクリエイティブ"
    items:
      - {course_name: "Webユーザーエクスペリエンス", year: 1}
      - {course_name: "メディアアート史", year: 1}
      - {course_name: "デジタルイラスト演習基礎", year: 2}
      - {course_name: "3Dモデリング技術演習", year: 2}
      - {course_name: "ジェネラティブアート演習", year: 2}
      - {course_name: "動画クリエイター技術演習", year: 3}
      - {course_name: "Webデザイン演習", year: 3}
      - {course_name: "デジタルイラスト演習発展", year: 3}
      - {course_name: "共創場デザイン演習", year: 3}
      - {course_name: "ゼミ（メディアアート）", year: 3}
```

## 5. 図から比較的明確に読める接続関係

```yaml
recommended_preparation:
  - {from: ["ビジュアルプログラミング"], to: ["Pythonプログラミング"], confidence: "high"}

  - {from: ["ITリテラシー"], to: ["情報セキュリティ概論"], confidence: "high"}
  - {from: ["ITリテラシー"], to: ["インターネット概論"], confidence: "high"}

  - relation_type: "broad_feeder_relation"
    from_courses: ["ITリテラシー", "情報セキュリティ概論", "デジタルツールの使い方"]
    to_courses: ["コンピュータ概論", "情報処理概論", "プロジェクトマネジメント概論"]
    confidence: "medium"
    note: "図中で複数の水平線・垂直線が合流している。基礎群から2年次の概論群へ流れていることは明確だが、1対1 の切り分けはしない。"

  - {from: ["コンピュータ概論"], to: ["コンピューターサイエンス概論"], confidence: "high"}
  - {from: ["コンピューターサイエンス概論"], to: ["オートマトンと形式言語理論"], confidence: "high"}
  - {from: ["コンピューターサイエンス概論"], to: ["画像処理論"], confidence: "high"}

  - {from: ["Webアプリケーション開発1", "Webアプリケーション開発2"], to: ["Webアプリケーション開発3"], confidence: "high"}
  - relation_type: "broad_feeder_relation"
    from_courses: ["Webアプリケーション開発3", "Webアプリケーション開発4"]
    to_courses: ["Linux概論", "アプリケーション開発応用群"]
    confidence: "medium"
    note: "図では Web アプリケーション開発3/4 の下流に Linux 概論および応用群への幹線がある。"

  - relation_type: "broad_feeder_relation"
    from_courses: ["Linux概論"]
    to_courses: ["Javaプログラミング演習", "オブジェクト指向プログラミング", "アプリケーション開発応用群"]
    confidence: "medium"

  - {from: ["インターネットのしくみ"], to: ["関数型プログラミング"], confidence: "high"}
  - {from: ["関数型プログラミング"], to: ["並行処理プログラミング"], confidence: "high"}

  - relation_type: "broad_feeder_relation"
    from_courses: ["デジタルイラスト演習基礎", "3Dモデリング技術演習"]
    to_courses: ["ジェネラティブアート演習"]
    confidence: "medium"

  - relation_type: "broad_feeder_relation"
    from_courses: ["デジタルクリエイティブ群", "アプリケーション開発応用群"]
    to_courses: ["動画クリエイター技術演習", "Webデザイン演習", "デジタルイラスト演習発展", "共創場デザイン演習", "ゼミ（メディアアート）"]
    confidence: "medium"
    note: "右側のデジタルクリエイティブ列には、上流の同系統科目と中央の応用群の双方から接続線が入っている。"
```

## 6. 学習経路として読むときの主なまとまり

### 6.1 IT基礎ルート
- 1年次の導入:
  - ITリテラシー
  - 情報倫理と法
  - 多言語ITコミュニケーション
  - デジタルツールの使い方
  - 情報セキュリティ概論
- 2年次の概論群:
  - インターネット概論
  - コンピュータ概論
  - 情報処理概論
  - プロジェクトマネジメント概論

### 6.2 コンピューターサイエンス寄りルート
- 2年次:
  - コンピューターサイエンス概論
  - Webセキュリティ演習
- 3年次:
  - オートマトンと形式言語理論
  - 論理回路概論
  - 画像処理論
  - 暗号技術とその応用
  - ゼミ（情報セキュリティ）

### 6.3 Web/アプリケーション開発ルート
- 基礎:
  - Webアプリケーション開発1
  - Webアプリケーション開発2
  - Webアプリケーション開発3
  - Webアプリケーション開発4
  - Linux概論
- 応用:
  - Javaプログラミング演習
  - JavaScriptによる自動化、効率化
  - インターネットのしくみ
  - オブジェクト指向プログラミング
  - 関数型プログラミング
  - クラウドコンピューティング技術
  - 並行処理プログラミング
  - ゲームプログラミング演習
  - Webアプリケーション開発演習
  - チームプログラミング演習
  - 各種ゼミ

### 6.4 デジタルクリエイティブルート
- 基礎:
  - Webユーザーエクスペリエンス
  - メディアアート史
  - デジタルイラスト演習基礎
  - 3Dモデリング技術演習
  - ジェネラティブアート演習
- 発展:
  - 動画クリエイター技術演習
  - Webデザイン演習
  - デジタルイラスト演習発展
  - 共創場デザイン演習
  - ゼミ（メディアアート）

## 7. 履修者像ガイドの扱い
- `情報 - 教養として情報を学びたい方向け`
- `情報 - 情報を専門的に学びたい方向け`

上記2つは、**科目分類ではなく学び方のガイド**として扱う。
プログラムで扱う場合は `learner_profile_guidance` のような別属性に分離するのがよい。

## 8. 機械処理向け補足
- この図は 1対1 の prerequisite グラフとしては複雑で、白線の合流点が多い。
- そのため、厳密な前提判定には使わず、**推奨される学習経路の可視化データ**として扱うのが安全。
- 正式な前提条件、単位数、開講学期はシラバスまたは科目マスタ側で別管理することを推奨する。
