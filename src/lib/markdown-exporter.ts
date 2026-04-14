/**
 * 履修計画をMarkdown形式でエクスポートするユーティリティ
 */

import type { CoursePlan, PlannedCourse } from '@/types/plan'
import type { Course } from '@/types/course'

const APP_NAME = 'ZEN大学履修計画プランナー by sifue'
const DATA_VERSION = '1.0'

/**
 * 履修計画をMarkdown文字列に変換する
 */
export function exportToMarkdown(
  plan: CoursePlan,
  courseMap: Record<string, Course>
): string {
  const now = new Date().toISOString()
  const lines: string[] = []

  lines.push(`# ZEN大学 履修計画: ${plan.name}`)
  lines.push('')
  lines.push('<!-- ZEN大学履修計画プランナー エクスポートデータ（このコメントを削除しないでください） -->')
  lines.push(`<!-- app: ${APP_NAME} | version: ${DATA_VERSION} | exported: ${now} -->`)
  lines.push('')

  // 年次×Qのグリッドで表示
  for (let year = 1; year <= plan.maxYears; year++) {
    lines.push(`## ${year}年次`)
    lines.push('')
    lines.push('| Q | 科目コード | 科目名 | 単位 | 授業方法 | メモ |')
    lines.push('|---|-----------|--------|------|----------|------|')

    for (let quarter = 1; quarter <= 4; quarter++) {
      const coursesInCell = plan.plannedCourses.filter(
        pc => pc.year === year && pc.quarter === quarter
      )

      if (coursesInCell.length === 0) {
        lines.push(`| ${quarter}Q | | | | | |`)
        continue
      }

      for (const pc of coursesInCell) {
        const course = courseMap[pc.courseId]
        if (!course) {
          lines.push(`| ${quarter}Q | ${pc.courseId} | (科目データなし) | - | - | ${pc.note || ''} |`)
          continue
        }
        const method = formatTeachingMethod(course.teachingMethod)
        lines.push(
          `| ${quarter}Q | ${course.id} | ${course.name} | ${course.credits}単位 | ${method} | ${pc.note || ''} |`
        )
      }
    }

    lines.push('')
  }

  // 単位集計サマリー
  const summary = buildSummary(plan.plannedCourses, courseMap)
  lines.push('## 単位集計')
  lines.push('')
  lines.push(`| 区分 | 取得単位数 |`)
  lines.push(`|------|-----------|`)
  lines.push(`| 合計（卒業算入可） | ${summary.totalCountable}単位 |`)
  lines.push(`| 導入科目 | ${summary.introduction}単位 |`)
  lines.push(`| 基礎科目 | ${summary.foundation}単位 |`)
  lines.push(`| 展開科目 | ${summary.expansion}単位 |`)
  lines.push(`| 卒業プロジェクト科目 | ${summary.graduationProject}単位 |`)
  lines.push(`| 自由科目 | ${summary.free}単位 |`)
  lines.push('')

  // インポート用の機械可読データブロック
  lines.push('<!-- IMPORT_DATA_START')
  lines.push(JSON.stringify({
    version: DATA_VERSION,
    planName: plan.name,
    exportedAt: now,
    plannedCourses: plan.plannedCourses.map(pc => ({
      courseId: pc.courseId,
      year: pc.year,
      quarter: pc.quarter,
      note: pc.note,
    })),
  }))
  lines.push('IMPORT_DATA_END -->')

  return lines.join('\n')
}

/**
 * 授業方法の英語識別子を日本語に変換する
 */
function formatTeachingMethod(method: string): string {
  const map: Record<string, string> = {
    on_demand: 'オンデマンド',
    seminar: '演習',
    zemi: 'ゼミ',
    live: 'ライブ映像',
  }
  return map[method] || method
}

/**
 * 単位集計サマリーを計算する
 */
function buildSummary(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
) {
  const seen = new Set<string>()
  const summary = {
    totalCountable: 0,
    introduction: 0,
    foundation: 0,
    expansion: 0,
    graduationProject: 0,
    free: 0,
  }

  for (const pc of plannedCourses) {
    if (seen.has(pc.courseId)) continue
    seen.add(pc.courseId)

    const course = courseMap[pc.courseId]
    if (!course) continue

    if (course.countableToGraduation) {
      summary.totalCountable += course.credits
    }
    switch (course.band) {
      case 'introduction': summary.introduction += course.credits; break
      case 'foundation': summary.foundation += course.credits; break
      case 'expansion': summary.expansion += course.credits; break
      case 'graduation_project': summary.graduationProject += course.credits; break
      case 'free': summary.free += course.credits; break
    }
  }

  return summary
}
