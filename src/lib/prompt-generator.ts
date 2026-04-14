/**
 * Slackbot AIへのおすすめ科目相談プロンプト生成ユーティリティ
 */

import type { Course } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'
import type { GraduationCheckResult } from '@/types/requirements'

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
  graduationCheck: GraduationCheckResult
): string {
  const currentCourseNames = getUniqueCourseNames(plannedCourses, courseMap)
  const deficiencies = buildDeficiencyText(graduationCheck)

  const prompt = `
ZEN大学の履修計画についてアドバイスをお願いします。

## 私の思考・希望
${userThoughts}

## 現在の履修計画状況
現在、以下の科目を履修計画に入れています（${currentCourseNames.length}科目）:
${currentCourseNames.length > 0 ? currentCourseNames.map(n => `- ${n}`).join('\n') : '（まだ科目が入っていません）'}

## 卒業要件の不足分
${deficiencies}

## お願いしたいこと
上記の状況を踏まえて、追加で履修すべき科目をおすすめしてください。
あなたはZEN大学の全科目情報を把握しているので、私の希望と不足要件に合った科目を提案してください。

## 回答フォーマット
以下のMarkdownテーブル形式で回答してください（このアプリにインポートできます）:

| 年次 | Q | 科目ID | 科目名 | 理由 |
|------|---|--------|--------|------|
| 1 | 1Q | INT-1-A1-1030-003 | ITリテラシー | 情報系の基礎として... |

- 年次は半角数字（1〜4）
- QはXQ形式（1Q, 2Q, 3Q, 4Q）
- 科目IDは正確なナンバリングコードを使用
- 理由は簡潔に記載
`.trim()

  return prompt
}

/**
 * 配置済み科目の重複排除した科目名リストを取得する
 */
function getUniqueCourseNames(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
): string[] {
  const seen = new Set<string>()
  const names: string[] = []

  for (const pc of plannedCourses) {
    if (seen.has(pc.courseId)) continue
    seen.add(pc.courseId)

    const course = courseMap[pc.courseId]
    if (course) {
      names.push(course.name)
    }
  }

  return names
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
