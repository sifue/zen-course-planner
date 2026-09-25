/**
 * Markdown形式の履修計画データをインポートするユーティリティ
 */

import type { Course } from '../types/course'
import type { PlannedCourse } from '../types/plan'

export interface ImportResult {
  success: boolean
  planName?: string
  plannedCourses?: PlannedCourse[]
  error?: string
}

export interface ImportOptions {
  /** 指定時は、存在しない科目IDをインポート前に拒否する */
  courseMap?: Record<string, Course>
  /** 配置可能な最大年次 */
  maxYear?: number
  /** 追加インポート時に、すでに配置済みの科目IDを拒否する */
  excludedCourseIds?: ReadonlySet<string>
}

interface RawImportData {
  planName?: unknown
  plannedCourses?: unknown
}

/**
 * Markdownテキストから履修計画データをインポートする。
 * 機械可読JSONを正規形式とし、旧形式との互換性のためMarkdownテーブルにも対応する。
 */
export function importFromMarkdown(markdown: string, options: ImportOptions = {}): ImportResult {
  const blockResult = tryParseDataBlock(markdown, options)
  if (blockResult) return blockResult

  const tableResult = tryParseMarkdownTable(markdown, options)
  if (tableResult) return tableResult

  return {
    success: false,
    error: 'インポート用データが見つかりませんでした。IMPORT_DATA_START〜IMPORT_DATA_ENDを含む回答全体、またはこのアプリでエクスポートしたMarkdownを貼り付けてください。',
  }
}

/** IMPORT_DATAコメント内のJSONを解析する */
function tryParseDataBlock(markdown: string, options: ImportOptions): ImportResult | null {
  if (!/<!--\s*IMPORT_DATA_START/i.test(markdown)) return null

  // 開始行末の任意の --> と、終了側の任意の <!-- を許容する。
  const match = markdown.match(
    /<!--\s*IMPORT_DATA_START\s*(?:-->)?\s*([\s\S]*?)\s*(?:<!--\s*)?IMPORT_DATA_END\s*-->/i
  )
  if (!match) {
    return {
      success: false,
      error: 'インポート用JSONコメントが途中で切れています。IMPORT_DATA_END -->まで含めて回答全体を貼り付けてください。',
    }
  }

  let data: RawImportData
  try {
    data = JSON.parse(match[1]) as RawImportData
  } catch (error) {
    const detail = error instanceof Error ? `（${error.message}）` : ''
    return {
      success: false,
      error: `インポート用JSONを解析できませんでした${detail}。AIの回答を編集せず、JSONコメントを含む回答全体を貼り付けてください。`,
    }
  }

  const validated = validatePlannedCourses(data.plannedCourses, options)
  if (!validated.success) return validated

  return {
    success: true,
    planName: typeof data.planName === 'string' ? data.planName : undefined,
    plannedCourses: validated.plannedCourses,
  }
}

/**
 * Markdownテーブル形式を解析する（旧AI出力との後方互換用）。
 * 新しいAI相談プロンプトでは、より安全なIMPORT_DATAコメントを出力させる。
 */
function tryParseMarkdownTable(markdown: string, options: ImportOptions): ImportResult | null {
  const rows: Array<Record<string, unknown>> = []

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim()
    if (!line.startsWith('|') || !line.endsWith('|') || line.includes('---')) continue
    if (line.includes('年次') || line.toLowerCase().includes('quarter')) continue

    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    let year: number | null = null
    let quarter: number | null = null
    let courseId: string | null = null

    for (const cell of cells) {
      if (/^[A-Z]+-\d+-[A-Z0-9]+-\d+-\d+$/.test(cell)) {
        courseId = cell
        continue
      }
      const quarterMatch = cell.match(/^([1-4])Q$/i)
      if (quarterMatch) {
        quarter = Number(quarterMatch[1])
        continue
      }
      const yearMatch = cell.match(/^(\d+)年?次?$/)
      if (yearMatch && year === null) year = Number(yearMatch[1])
    }

    if (year !== null && quarter !== null && courseId) {
      rows.push({ courseId, year, quarter })
    }
  }

  if (rows.length === 0) return null
  return validatePlannedCourses(rows, options)
}

function validatePlannedCourses(
  value: unknown,
  options: ImportOptions
): ImportResult & { plannedCourses?: PlannedCourse[] } {
  if (!Array.isArray(value)) {
    return { success: false, error: 'インポート用JSONのplannedCoursesは配列である必要があります。' }
  }
  if (value.length === 0) {
    return { success: false, error: 'インポートする科目がありません。AIに追加候補をplannedCoursesへ含めるよう依頼してください。' }
  }

  const maxYear = options.maxYear ?? 8
  const errors: string[] = []
  const plannedCourses: PlannedCourse[] = []
  const seen = new Set<string>()

  value.forEach((item, index) => {
    const label = `${index + 1}件目`
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${label}: 科目データがオブジェクトではありません`)
      return
    }

    const raw = item as Record<string, unknown>
    const courseId = raw.courseId
    const year = raw.year
    const quarter = raw.quarter
    const note = raw.note

    if (typeof courseId !== 'string' || courseId.trim() === '') {
      errors.push(`${label}: courseIdがありません`)
      return
    }
    if (options.courseMap && !options.courseMap[courseId]) {
      errors.push(`${label}: 科目ID「${courseId}」は科目データに存在しません`)
    }
    if (options.excludedCourseIds?.has(courseId)) {
      errors.push(`${label}: 科目ID「${courseId}」はすでに履修計画へ配置されています`)
    }
    if (!Number.isInteger(year) || (year as number) < 1 || (year as number) > maxYear) {
      errors.push(`${label}: yearは1〜${maxYear}の整数にしてください`)
    }
    if (!Number.isInteger(quarter) || (quarter as number) < 1 || (quarter as number) > 4) {
      errors.push(`${label}: quarterは1〜4の整数にしてください`)
    } else {
      const course = options.courseMap?.[courseId]
      if (course && !course.quarters.includes(quarter as number)) {
        const available = course.quarters.map(value => `${value}Q`).join('・') || '未設定'
        errors.push(`${label}: 「${course.name}」は${quarter}Qに開講されません（開講Q: ${available}）`)
      }
    }
    if (note !== undefined && typeof note !== 'string') {
      errors.push(`${label}: noteは文字列にしてください`)
    }
    if (seen.has(courseId)) {
      errors.push(`${label}: 科目ID「${courseId}」が重複しています`)
    }
    seen.add(courseId)

    if (
      Number.isInteger(year) && (year as number) >= 1 && (year as number) <= maxYear
      && Number.isInteger(quarter) && (quarter as number) >= 1 && (quarter as number) <= 4
    ) {
      plannedCourses.push({
        courseId,
        year: year as number,
        quarter: quarter as 1 | 2 | 3 | 4,
        note: typeof note === 'string' ? note : undefined,
      })
    }
  })

  if (errors.length > 0) {
    return {
      success: false,
      error: `インポート用データに問題があります。\n${errors.map(error => `・${error}`).join('\n')}`,
    }
  }

  return { success: true, plannedCourses }
}
