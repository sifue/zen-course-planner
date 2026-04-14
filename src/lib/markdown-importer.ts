/**
 * Markdown形式の履修計画データをインポートするユーティリティ
 */

import type { PlannedCourse } from '@/types/plan'

export interface ImportResult {
  success: boolean
  planName?: string
  plannedCourses?: PlannedCourse[]
  error?: string
}

/**
 * Markdownテキストから履修計画データをインポートする
 *
 * このエクスポーターが出力したIMPORT_DATA_BLOCKを解析する。
 * AIが生成したMarkdownの場合はテーブル形式を解析する。
 */
export function importFromMarkdown(markdown: string): ImportResult {
  // まず機械可読データブロックを探す
  const blockResult = tryParseDataBlock(markdown)
  if (blockResult.success) return blockResult

  // 次にMarkdownテーブルを解析（AIからの出力対応）
  const tableResult = tryParseMarkdownTable(markdown)
  if (tableResult.success) return tableResult

  return {
    success: false,
    error: 'インポートできるデータが見つかりませんでした。\n\nこのアプリでエクスポートしたMarkdownか、指定フォーマットのMarkdownを貼り付けてください。',
  }
}

/**
 * IMPORT_DATA_BLOCKを解析する（自アプリのエクスポート形式）
 */
function tryParseDataBlock(markdown: string): ImportResult {
  const match = markdown.match(/<!-- IMPORT_DATA_START\n([\s\S]+?)\nIMPORT_DATA_END -->/)
  if (!match) return { success: false }

  try {
    const data = JSON.parse(match[1]) as {
      version?: string
      planName?: string
      plannedCourses?: Array<{
        courseId: string
        year: number
        quarter: number
        note?: string
      }>
    }

    if (!data.plannedCourses || !Array.isArray(data.plannedCourses)) {
      return { success: false, error: 'データブロックの形式が正しくありません' }
    }

    const plannedCourses: PlannedCourse[] = data.plannedCourses.map(pc => ({
      courseId: pc.courseId,
      year: pc.year,
      quarter: pc.quarter as 1 | 2 | 3 | 4,
      note: pc.note,
    }))

    return {
      success: true,
      planName: data.planName,
      plannedCourses,
    }
  } catch {
    return { success: false, error: 'データブロックのJSON解析に失敗しました' }
  }
}

/**
 * Markdownテーブル形式を解析する（AIからの出力対応）
 *
 * 対応フォーマット:
 * | 年次 | Q | 科目ID | 科目名 | ... |
 * | 2 | 1Q | INF-2-C1-... | 科目名 | ... |
 */
function tryParseMarkdownTable(markdown: string): ImportResult {
  const lines = markdown.split('\n')
  const plannedCourses: PlannedCourse[] = []

  // テーブルの行を解析
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|') || !line.endsWith('|')) continue

    // ヘッダー行とセパレーター行はスキップ
    if (line.includes('---')) continue
    if (line.toLowerCase().includes('年次') || line.toLowerCase().includes('quarter') || line.toLowerCase().includes('q ')) continue

    const cells = line
      .split('|')
      .slice(1, -1)
      .map(c => c.trim())

    if (cells.length < 3) continue

    // 年次・Q・科目IDを抽出（カラム順序を柔軟に対応）
    let year: number | null = null
    let quarter: number | null = null
    let courseId: string | null = null
    let note: string | undefined

    for (const cell of cells) {
      // 科目IDのパターン（大文字-数字-大文字数字-数字-数字）
      if (/^[A-Z]+-\d+-[A-Z0-9]+-\d+-\d+$/.test(cell)) {
        courseId = cell
        continue
      }
      // Q表記
      const qMatch = cell.match(/^([1-4])Q$/)
      if (qMatch) {
        quarter = parseInt(qMatch[1])
        continue
      }
      // 年次表記（数字単体 or "X年次"）
      const yearMatch = cell.match(/^(\d+)年?次?$/)
      if (yearMatch) {
        const n = parseInt(yearMatch[1])
        if (n >= 1 && n <= 8) {
          year = n
          continue
        }
      }
    }

    // 年次・Q・科目IDが揃っている場合のみ追加
    if (year !== null && quarter !== null && courseId) {
      plannedCourses.push({
        courseId,
        year,
        quarter: quarter as 1 | 2 | 3 | 4,
        note,
      })
    }
  }

  if (plannedCourses.length === 0) {
    return { success: false }
  }

  return {
    success: true,
    plannedCourses,
  }
}
