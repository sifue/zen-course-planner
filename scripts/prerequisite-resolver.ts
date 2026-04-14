/**
 * カリキュラムツリーMarkdownから前提科目（推奨）の関係を抽出するスクリプト
 *
 * カリキュラムツリーの接続線は「推奨履修順」であり、
 * 正式な前提科目ではないことに注意。
 */

import fs from 'fs'
import path from 'path'

interface RecommendedPreparation {
  from: string[]
  to: string[]
  confidence: 'high' | 'medium' | 'low'
}

/**
 * カリキュラムツリーMarkdownから推奨前提関係を抽出する
 */
function extractRecommendedPreparations(filePath: string): RecommendedPreparation[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const preparations: RecommendedPreparation[] = []

  // recommended_preparationセクションを抽出
  const sectionMatch = content.match(/recommended_preparation:([\s\S]*?)(?:\n##|\n```\n##|$)/)
  if (!sectionMatch) return []

  const sectionText = sectionMatch[1]

  // one_to_one / high confidence パターン: { from: ["A"], to: ["B"], confidence: "high" }
  const oneToOnePattern = /\{\s*from:\s*\["([^"]+)"\],\s*to:\s*\["([^"]+)"\],\s*confidence:\s*"(\w+)"\s*\}/g
  let match: RegExpExecArray | null
  while ((match = oneToOnePattern.exec(sectionText)) !== null) {
    preparations.push({
      from: [match[1]],
      to: [match[2]],
      confidence: match[3] as 'high' | 'medium' | 'low',
    })
  }

  // group_to_group パターン: from_courses: [...], to_courses: [...]
  const groupPattern = /from_courses:\s*\[([^\]]+)\]\s*\n\s*to_courses:\s*\[([^\]]+)\]\s*\n\s*confidence:\s*"(\w+)"/g
  while ((match = groupPattern.exec(sectionText)) !== null) {
    const fromCourses = extractCourseNames(match[1])
    const toCourses = extractCourseNames(match[2])
    const confidence = match[3] as 'high' | 'medium' | 'low'

    // グループ間の関係は broad_feeder_relation として記録
    for (const to of toCourses) {
      preparations.push({
        from: fromCourses,
        to: [to],
        confidence,
      })
    }
  }

  return preparations
}

/**
 * YAMLスタイルのリスト文字列から科目名を抽出する
 * 例: '"科目A", "科目B"' → ['科目A', '科目B']
 */
function extractCourseNames(listStr: string): string[] {
  const matches = listStr.matchAll(/"([^"]+)"/g)
  return [...matches].map(m => m[1])
}

/**
 * 全カリキュラムツリーから科目名 → 推奨前提科目リストのマップを構築する
 *
 * @returns 科目名 → 推奨前提科目名リスト のマップ
 */
export function buildPrerequisiteMap(curriculumTreeDir: string): Map<string, string[]> {
  const prereqMap = new Map<string, string[]>()

  const treeFiles = [
    'zen_curriculum_tree_information_structured.md',
    'zen_curriculum_tree_data_science_structured.md',
    'zen_curriculum_tree_economy_markets_structured.md',
  ]

  for (const filename of treeFiles) {
    const filePath = path.join(curriculumTreeDir, filename)
    if (!fs.existsSync(filePath)) {
      console.warn(`カリキュラムツリーファイルが見つかりません: ${filePath}`)
      continue
    }

    const preparations = extractRecommendedPreparations(filePath)

    for (const prep of preparations) {
      for (const toCourse of prep.to) {
        const existing = prereqMap.get(toCourse) || []
        const newPrereqs = prep.from.filter(f => !existing.includes(f))
        prereqMap.set(toCourse, [...existing, ...newPrereqs])
      }
    }
  }

  return prereqMap
}

/**
 * 前提科目マップを使って科目の推奨前提科目を解決する
 */
export function resolvePrerequisites(
  courseName: string,
  existingPrereqs: string[],
  prereqMap: Map<string, string[]>
): string[] {
  const fromTree = prereqMap.get(courseName) || []
  // 既存の前提科目と重複を除いてマージ
  const merged = [...existingPrereqs]
  for (const p of fromTree) {
    if (!merged.includes(p)) {
      merged.push(p)
    }
  }
  return merged
}
