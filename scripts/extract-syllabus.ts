/**
 * シラバスMarkdownファイルを解析してCourse型データを生成するスクリプト
 */

import fs from 'fs'
import path from 'path'
import { inferBandMapping } from './band-mapping-rules'

// 手動補正データ
import overridesRaw from './manual-overrides.json'
const manualOverrides = overridesRaw.overrides as Record<string, Partial<CourseRaw>>

// 型定義（Course型の基本形、scripts内で使用するもの）
export interface CourseRaw {
  id: string
  fileId: string
  syllabusUrl: string
  fetchedAt: string
  name: string
  credits: number
  year: 1 | 2 | 3 | 4
  openYear: number
  quarters: number[]
  teachingMethod: string
  category: string
  instructors: string[]
  tags: string[]
  thumbnailUrl?: string
  videoUrl?: string
  band: string
  foundationGroups: string[]
  expansionTrack: string | null
  countableToGraduation: boolean
  isDigitalIndustryHistoryEligible: boolean
  isRequiredProjectPractice: boolean
  strongPrerequisites: string[]
  recommendedPrerequisites: string[]
  relatedCourses: string[]
  overview: string
  syllabusRawUrl: string
}

/**
 * 開講クォーター文字列を数値配列に変換する
 * 例: "2Q, 4Q" → [2, 4]
 *      "3-4Q" → [3, 4]
 *      "1-2Q" → [1, 2]
 *      "通期" → [1, 2, 3, 4]
 *      "1-2Q, 3-4Q" → [1, 2, 3, 4]
 */
function parseQuarters(quarterStr: string): number[] {
  if (!quarterStr) return []
  const str = quarterStr.trim()

  // 通期・両期
  if (str.includes('通期') || (str.includes('1-2Q') && str.includes('3-4Q'))) {
    return [1, 2, 3, 4]
  }

  const quarters = new Set<number>()

  // 連続Qパターン: "1-2Q", "3-4Q"
  const rangeMatches = str.matchAll(/(\d)-(\d)Q/g)
  for (const m of rangeMatches) {
    for (let q = parseInt(m[1]); q <= parseInt(m[2]); q++) {
      quarters.add(q)
    }
  }

  // 単体Qパターン: "1Q", "2Q", "3Q", "4Q"
  const singleMatches = str.matchAll(/\b([1-4])Q\b/g)
  for (const m of singleMatches) {
    quarters.add(parseInt(m[1]))
  }

  return [...quarters].sort()
}

/**
 * 授業方法の文字列を標準化する
 */
function parseTeachingMethod(methodStr: string): string {
  if (!methodStr) return 'on_demand'
  if (methodStr.includes('演習')) return 'seminar'
  if (methodStr.includes('ゼミ')) return 'zemi'
  if (methodStr.includes('ライブ')) return 'live'
  return 'on_demand'
}

/**
 * 科目区分の文字列を標準化する
 */
function parseCategory(categoryStr: string): string {
  if (!categoryStr) return 'elective'
  if (categoryStr.includes('選択必修')) return 'required_elective'
  if (categoryStr.includes('必修')) return 'required'
  if (categoryStr.includes('自由')) return 'free'
  return 'elective'
}

/**
 * 履修想定年次の文字列を数値に変換する
 */
function parseYear(yearStr: string): 1 | 2 | 3 | 4 {
  const match = yearStr.match(/(\d+)年次/)
  const n = match ? parseInt(match[1]) : 1
  if (n === 1 || n === 2 || n === 3 || n === 4) return n
  return 1
}

/**
 * 単位数の文字列を数値に変換する
 */
function parseCredits(creditsStr: string): number {
  const match = creditsStr.match(/(\d+)単位/)
  return match ? parseInt(match[1]) : 2
}

/**
 * ファイル名から openYear と fileId を抽出する
 * ファイル名形式: syllabus-zen-ac-jp-subjects-{year}-{prefix}-...{hash}.md
 */
function parseFileName(filename: string): { openYear: number; fileId: string; prefix: string } {
  const base = path.basename(filename, '.md')
  // syllabus-zen-ac-jp-subjects-2026-inf-2-c1-...
  const match = base.match(/syllabus-zen-ac-jp-subjects-(\d+)-([a-z]+)-/)
  const openYear = match ? parseInt(match[1]) : 2026
  const prefix = match ? match[2].toUpperCase() : 'UNK'
  // ハッシュ部分（最後のハイフン区切り）
  const parts = base.split('-')
  const fileId = parts[parts.length - 1]
  return { openYear, fileId, prefix }
}

/**
 * Markdownテキストから基本情報セクションの各フィールドを抽出する
 */
function parseBasicInfo(content: string): Record<string, string> {
  const info: Record<string, string> = {}

  // 基本情報セクションを抽出
  const basicInfoMatch = content.match(/## 基本情報\n([\s\S]*?)(?:\n##|$)/)
  if (!basicInfoMatch) return info

  const basicInfoText = basicInfoMatch[1]
  // "- フィールド名: 値" パターンを解析
  const lines = basicInfoText.split('\n')
  for (const line of lines) {
    const match = line.match(/^-\s+([^:]+):\s+(.+)$/)
    if (match) {
      info[match[1].trim()] = match[2].trim()
    }
  }

  return info
}

/**
 * リストセクションから科目名を抽出する
 * 例: "## 関連科目\n- 科目名A\n- 科目名B"
 */
function parseListSection(content: string, sectionName: string): string[] {
  const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?:\\n##|$)`)
  const match = content.match(regex)
  if (!match) return []

  return match[1]
    .split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.replace(/^-\s+/, '').trim())
    .filter(line => line && !line.includes('学生便覧') && !line.includes('カリキュラム'))
}

/**
 * 概要テキストを抽出する
 */
function parseOverview(content: string): string {
  const match = content.match(/## 概要\n\n([\s\S]*?)(?:\n##|$)/)
  return match ? match[1].trim().slice(0, 500) : '' // 最大500文字
}

/**
 * 単一のシラバスMarkdownファイルを解析してCourseRawを生成する
 */
export function extractCourse(filePath: string): CourseRaw | null {
  const content = fs.readFileSync(filePath, 'utf-8')
  const filename = path.basename(filePath)

  // ファイル名情報を解析
  const { openYear, fileId } = parseFileName(filename)

  // 科目名（h1タグ）
  const nameMatch = content.match(/^# (.+)$/m)
  if (!nameMatch) {
    console.warn(`科目名が見つかりません: ${filename}`)
    return null
  }
  const name = nameMatch[1].trim()

  // メタデータ
  const urlMatch = content.match(/^- 元URL:\s+(.+)$/m)
  const fetchedAtMatch = content.match(/^- 取得日時:\s+(.+)$/m)
  const syllabusUrl = urlMatch ? urlMatch[1].trim() : ''
  const fetchedAt = fetchedAtMatch ? fetchedAtMatch[1].trim() : ''

  // 基本情報を解析
  const info = parseBasicInfo(content)

  const numbering = info['ナンバリング'] || ''
  const teachingMethodStr = info['授業方法'] || ''
  const categoryStr = info['科目区分'] || ''
  const creditsStr = info['単位数'] || '2単位'
  const quarterStr = info['開講クォーター'] || ''
  const yearStr = info['履修想定年次'] || '1年次'
  const instructorsStr = info['教員'] || ''
  const tagsStr = info['タグ'] || ''
  const thumbnailUrl = info['サムネイル'] || undefined
  const videoUrl = info['動画URL'] || undefined

  // 基本フィールドを解析
  const credits = parseCredits(creditsStr)
  const year = parseYear(yearStr)
  const quarters = parseQuarters(quarterStr)
  const teachingMethod = parseTeachingMethod(teachingMethodStr)
  const category = parseCategory(categoryStr)
  const instructors = instructorsStr ? instructorsStr.split(',').map(s => s.trim()).filter(Boolean) : []
  const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()).filter(Boolean) : []

  // 関連科目・前提科目を抽出
  const relatedCourses = parseListSection(content, '関連科目')
  const strongPrerequisites = parseListSection(content, '強く推奨される前提科目')
  const recommendedPrerequisites = parseListSection(content, '推奨される前提科目')

  // 概要テキストを抽出
  const overview = parseOverview(content)

  // バンド情報を推論
  const bandMapping = inferBandMapping(numbering)

  // 手動補正を適用
  const override = numbering ? manualOverrides[numbering] : undefined
  const finalBand = (override?.band as string) || bandMapping.band
  const finalFoundationGroups = (override?.foundationGroups as string[]) || bandMapping.foundationGroups
  const finalExpansionTrack = bandMapping.expansionTrack
  const finalCountable = bandMapping.countableToGraduation
  const finalDigitalEligible = (override?.isDigitalIndustryHistoryEligible as boolean) ?? bandMapping.isDigitalIndustryHistoryEligible
  const finalRequiredProject = (override?.isRequiredProjectPractice as boolean) ?? bandMapping.isRequiredProjectPractice

  return {
    id: numbering || `${fileId}`,
    fileId,
    syllabusUrl,
    fetchedAt,
    name,
    credits,
    year,
    openYear,
    quarters,
    teachingMethod,
    category,
    instructors,
    tags,
    thumbnailUrl,
    videoUrl,
    band: finalBand,
    foundationGroups: finalFoundationGroups,
    expansionTrack: finalExpansionTrack,
    countableToGraduation: finalCountable,
    isDigitalIndustryHistoryEligible: finalDigitalEligible,
    isRequiredProjectPractice: finalRequiredProject,
    strongPrerequisites,
    recommendedPrerequisites,
    relatedCourses,
    overview,
    syllabusRawUrl: filePath,
  }
}
