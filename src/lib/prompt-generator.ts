/**
 * Slackbot AIへのおすすめ科目相談プロンプト生成ユーティリティ
 */

import {
  BAND_LABELS,
  EXPANSION_TRACK_LABELS,
  FOUNDATION_GROUP_LABELS,
  type Course,
  type FieldCategory,
} from '../types/course'
import type { PlannedCourse } from '../types/plan'
import type { GraduationCheckResult } from '../types/requirements'

/**
 * SlackBot AIへの相談プロンプトを生成する
 *
 * @param userThoughts ユーザーが入力した思考・希望
 * @param plannedCourses 現在の配置済み科目
 * @param courseMap 全科目マップ
 * @param graduationCheck 卒業要件チェック結果
 * @returns AIへ送るプロンプト文字列
 */
export function generateSlackbotPrompt(
  userThoughts: string,
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>,
  graduationCheck: GraduationCheckResult,
  maxYear: number = 4
): string {
  const currentCourses = getUniquePlannedCourses(plannedCourses, courseMap)
  const deficiencies = buildDeficiencyText(graduationCheck)
  const courseCatalog = buildCourseCatalog(courseMap)

  const prompt = `
あなたはZEN大学の履修相談担当です。以下の情報だけを根拠として、履修候補の調査と提案を行ってください。
回答は、人が読む説明と、ZEN大学履修計画プランナーが読み込むJSONデータの両方を含めてください。

## 私の思考・希望
${userThoughts.trim() || '（希望は未入力です。卒業要件の不足と履修のバランスを優先してください）'}

## 現在の履修計画状況
現在、以下の科目を履修計画に入れています（${currentCourses.length}科目）:
${currentCourses.length > 0 ? currentCourses.join('\n') : '（まだ科目が入っていません）'}

## 卒業要件の不足分
${deficiencies}

## 相談・調査してほしいこと
1. 私の希望と不足要件を整理し、追加候補を優先順位付きで提案してください。
2. 候補は下記の「利用可能な科目カタログ」に存在する科目だけにしてください。科目IDと科目名を推測で作らないでください。
3. すでに履修計画へ入っている科目は、追加候補に含めないでください。
4. 配置するQはカタログの開講Qに含まれるものだけにしてください。
5. 前提科目がある場合は先に配置し、履修順序の理由を説明してください。
6. 各候補について、何を学べるか、私の希望・不足要件との関係、履修前に確認すべき点を説明してください。
7. 情報が不足して断定できない場合は、その点を明示し、インポート用データには含めないでください。

## 公式情報の調べ方
- 公式シラバスURLは「https://syllabus.zen.ac.jp/subjects/{開講年度}/{科目ID}」です。カタログの開講年度と科目IDを入れて開き、科目名、概要、開講Q、授業方法、評価方法、前提科目を確認してください。
- 分野・科目分類と卒業要件への算入は学生便覧のカリキュラム・マップを優先してください。
- 回答には、候補ごとの公式シラバスURLと、利用者が自分で再確認する手順を記載してください。

## 利用可能な科目カタログ
次の形式です:
科目ID | 科目名 | 開講年度 | 履修想定年次 | 開講Q | 単位 | 科目分類 | 学問分野 | タグ | 前提科目

${courseCatalog}

## 回答形式

### 1. 提案の考え方
希望、不足要件、前提科目、各Qの負荷をどのように考慮したか説明してください。

### 2. おすすめ科目
次のMarkdownテーブルを使用してください。

| 優先度 | 配置年次 | 配置Q | 科目ID | 科目名 | おすすめ理由 | 確認事項 | 公式シラバス |
|---|---:|---:|---|---|---|---|---|

### 3. 自分で確認する方法
公式シラバスと学生便覧で、提案内容を再確認する具体的な手順を書いてください。

### 4. インポート用データ（必須）
回答の最後に、以下のHTMLコメントを**コードフェンスで囲まず**、この構文のまま出力してください。
Markdownテーブルだけではインポートできないため、このJSONブロックを必ず出力してください。

<!-- IMPORT_DATA_START
{"version":"1.0","planName":"AIおすすめ追加案","plannedCourses":[{"courseId":"INT-1-A1-1030-003","year":1,"quarter":1,"note":"おすすめ理由を簡潔に記載"}]}
IMPORT_DATA_END -->

JSON作成時の厳守事項:
- 「plannedCourses」には今回追加提案する科目だけを入れる
- 「courseId」はカタログにある文字列を一字一句そのまま使う
- 「year」は1〜${maxYear}の整数、「quarter」は1〜4の整数にする（「1Q」のような文字列は禁止）
- 表に記載した各候補とJSONの各要素を1対1で一致させる
- 「note」にはおすすめ理由をプレーンテキストで記載する
- 同じ「courseId」を重複させない
- JSON内にコメント、末尾カンマ、Markdownを入れない
- 有効なJSONを1行で出力する
`.trim()

  return prompt
}

/**
 * 配置済み科目の重複排除した科目名リストを取得する
 */
function getUniquePlannedCourses(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
): string[] {
  const seen = new Set<string>()
  const courses: string[] = []

  for (const pc of [...plannedCourses].sort((a, b) => a.year - b.year || a.quarter - b.quarter)) {
    if (seen.has(pc.courseId)) continue
    seen.add(pc.courseId)

    const course = courseMap[pc.courseId]
    if (course) {
      courses.push(`- ${pc.year}年次 ${pc.quarter}Q: ${course.id} ${course.name}`)
    }
  }

  return courses
}

function buildCourseCatalog(courseMap: Record<string, Course>): string {
  return Object.values(courseMap)
    .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
    .map(course => {
      const quarters = course.quarters.length > 0
        ? course.quarters.map(quarter => `${quarter}Q`).join('・')
        : '要確認'
      const classification = formatClassification(course)
      const prerequisites = [...new Set([
        ...course.strongPrerequisites,
        ...course.recommendedPrerequisites,
      ])]
      const prerequisiteText = prerequisites.length > 0 ? prerequisites.join('、') : 'なし'

      return [
        course.id,
        course.name,
        course.openYear,
        `${course.year}年次`,
        quarters,
        `${course.credits}単位`,
        classification,
        formatFieldCategory(course.fieldCategory),
        course.tags.join('・') || 'なし',
        prerequisiteText,
      ].join(' | ')
    })
    .join('\n')
}

function formatClassification(course: Course): string {
  if (course.band === 'foundation' && course.foundationGroups.length > 0) {
    return `${BAND_LABELS[course.band]}/${course.foundationGroups.map(
      group => FOUNDATION_GROUP_LABELS[group]
    ).join('・')}`
  }
  if (course.band === 'expansion' && course.expansionTrack) {
    return `${BAND_LABELS[course.band]}/${EXPANSION_TRACK_LABELS[course.expansionTrack]}`
  }
  return BAND_LABELS[course.band]
}

function formatFieldCategory(fieldCategory: FieldCategory | null): string {
  if (!fieldCategory) return '対象外'
  const labels: Record<FieldCategory, string> = {
    mathematics: '数理',
    information: '情報',
    culture_thought: '文化・思想',
    society_network: '社会・ネットワーク',
    economy_market: '経済・マーケット',
    digital_industry: 'デジタル産業',
  }
  return labels[fieldCategory]
}

/**
 * 卒業要件チェック結果から不足分のテキストを生成する
 */
function buildDeficiencyText(check: GraduationCheckResult): string {
  if (check.isEligible) {
    return '現時点で卒業要件を満たしています！'
  }

  const lines: string[] = []

  if (!check.introduction.ok) {
    lines.push(`- 導入科目: あと${check.introduction.required - check.introduction.earned}単位不足`)
  }
  if (!check.foundation.ok) {
    lines.push(`- 基礎科目合計: あと${check.foundation.required - check.foundation.earned}単位不足`)
    for (const [group, status] of Object.entries(check.foundation.groups)) {
      if (!status.ok) {
        lines.push(`  - ${getGroupLabel(group)}: あと${status.required - status.earned}単位不足`)
      }
    }
  }
  if (!check.expansion.foundationLiteracyCombined.ok) {
    const lack = check.expansion.foundationLiteracyCombined.required - check.expansion.foundationLiteracyCombined.earned
    lines.push(`- 基盤リテラシー科目: あと${lack}単位不足`)
  }
  if (!check.expansion.multilingualInfoUnderstandingCombined.ok) {
    const lack = check.expansion.multilingualInfoUnderstandingCombined.required - check.expansion.multilingualInfoUnderstandingCombined.earned
    lines.push(`- 多言語情報理解科目: あと${lack}単位不足`)
  }
  if (!check.expansion.worldUnderstandingCombined.ok) {
    const lack = check.expansion.worldUnderstandingCombined.required - check.expansion.worldUnderstandingCombined.earned
    lines.push(`- 世界理解科目: あと${lack}単位不足`)
  }
  if (!check.expansion.digitalIndustryHistory.ok) {
    lines.push(`- デジタル産業指定4科目群: あと${check.expansion.digitalIndustryHistory.required - check.expansion.digitalIndustryHistory.earned}単位不足`)
  }
  if (!check.graduationProject.ok) {
    if (!check.graduationProject.hasProjectPractice) {
      lines.push('- 「プロジェクト実践」（卒業プロジェクト必修）が未配置')
    }
  }
  if (check.totalCountableCredits < check.requiredTotal) {
    lines.push(`- 総単位数: あと${check.requiredTotal - check.totalCountableCredits}単位不足`)
  }

  return lines.length > 0 ? lines.join('\n') : '要件不足の詳細を確認中...'
}

function getGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    mathematics: '数理',
    information: '情報',
    culture_thought: '文化・思想',
    society_network: '社会・ネットワーク',
    economy_market: '経済・マーケット',
    multilingual_it_communication: '多言語ITコミュニケーション',
  }
  return labels[group] || group
}
