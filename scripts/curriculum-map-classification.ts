/**
 * 学生便覧の科目一覧（カリキュラム・マップ）から、
 * 卒業要件判定に用いる科目分類を読み込む。
 */

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import type { CourseRaw } from './extract-syllabus'
import type {
  BandCode,
  ExpansionTrack,
  FieldCategory,
  FoundationGroup,
} from './band-mapping-rules'

interface CurriculumMapRow {
  科目名?: string
  科目区分?: string
  科目分類?: string
  学問分野?: string
  科目ナンバリング?: string
}

export interface CurriculumClassification {
  numbering: string
  name: string
  band: BandCode
  foundationGroups: FoundationGroup[]
  expansionTrack: ExpansionTrack | null
  fieldCategory: FieldCategory | null
  countableToGraduation: boolean
}

export interface CurriculumClassificationMatch {
  classification: CurriculumClassification
  matchedBy: 'numbering' | 'name'
}

const BAND_MAP: Record<string, BandCode> = {
  導入科目: 'introduction',
  基礎科目: 'foundation',
  展開科目: 'expansion',
  '展開科目（考究）': 'expansion',
  '2026カリ_展開科目\n2025カリ_自由科目': 'expansion',
  卒業プロジェクト: 'graduation_project',
  自由科目: 'free',
}

const EXPANSION_TRACK_MAP: Record<string, ExpansionTrack> = {
  基盤リテラシー: 'foundation_literacy',
  多言語情報理解: 'multilingual_information_understanding',
  世界理解: 'world_understanding',
  社会接続: 'social_connection',
}

const FOUNDATION_GROUP_MAP: Record<string, FoundationGroup> = {
  数理: 'mathematics',
  情報: 'information',
  '文化・思想': 'culture_thought',
  '社会・ネットワーク': 'society_network',
  '経済・マーケット': 'economy_market',
  多言語情報理解: 'multilingual_it_communication',
}

const FIELD_CATEGORY_MAP: Record<string, FieldCategory> = {
  数理: 'mathematics',
  情報: 'information',
  '文化・思想': 'culture_thought',
  '社会・ネットワーク': 'society_network',
  '経済・マーケット': 'economy_market',
  デジタル産業: 'digital_industry',
}

/** 表記ゆれによる照合漏れを避けるため、Unicodeと空白を正規化する。 */
function normalizeCourseName(name: string): string {
  return name.normalize('NFKC').replace(/\s+/gu, '')
}

function requireMappedValue<T>(
  map: Record<string, T>,
  sourceValue: string,
  columnName: string,
  courseName: string
): T {
  const mapped = map[sourceValue]
  if (!mapped) {
    throw new Error(`${courseName}: ${columnName}「${sourceValue}」に対応する分類がありません`)
  }
  return mapped
}

function toClassification(row: Required<CurriculumMapRow>): CurriculumClassification {
  const band = requireMappedValue(BAND_MAP, row.科目区分, '科目区分', row.科目名)
  const expansionTrack = band === 'expansion'
    ? requireMappedValue(EXPANSION_TRACK_MAP, row.科目分類, '科目分類', row.科目名)
    : null
  const foundationGroups = band === 'foundation'
    ? [requireMappedValue(FOUNDATION_GROUP_MAP, row.学問分野, '学問分野', row.科目名)]
    : []

  return {
    numbering: row.科目ナンバリング,
    name: row.科目名,
    band,
    foundationGroups,
    expansionTrack,
    fieldCategory: FIELD_CATEGORY_MAP[row.学問分野] ?? null,
    countableToGraduation: band !== 'free',
  }
}

export class CurriculumClassificationIndex {
  private readonly byNumbering = new Map<string, CurriculumClassification>()
  private readonly byNormalizedName = new Map<string, CurriculumClassification>()

  constructor(classifications: CurriculumClassification[]) {
    for (const classification of classifications) {
      if (this.byNumbering.has(classification.numbering)) {
        throw new Error(`科目ナンバリングが重複しています: ${classification.numbering}`)
      }
      this.byNumbering.set(classification.numbering, classification)

      const normalizedName = normalizeCourseName(classification.name)
      if (this.byNormalizedName.has(normalizedName)) {
        throw new Error(`科目名が重複しています: ${classification.name}`)
      }
      this.byNormalizedName.set(normalizedName, classification)
    }
  }

  get size(): number {
    return this.byNumbering.size
  }

  find(course: Pick<CourseRaw, 'id' | 'name'>): CurriculumClassificationMatch | null {
    const normalizedName = normalizeCourseName(course.name)
    const byName = this.byNormalizedName.get(normalizedName)
    if (byName) {
      return {
        classification: byName,
        matchedBy: byName.numbering === course.id ? 'numbering' : 'name',
      }
    }

    // 科目コードが別科目へ付け替えられている場合があるため、
    // 科目名が一致しない科目コードだけでは照合しない。
    return null
  }
}

export function findCurriculumMapPath(projectRoot: string): string {
  const docsDir = path.join(projectRoot, 'docs')
  const candidates = fs.readdirSync(docsDir)
    .filter(fileName => fileName.endsWith('.csv') && fileName.includes('科目一覧'))

  if (candidates.length !== 1) {
    throw new Error(`科目一覧CSVは1件必要です（検出件数: ${candidates.length}）`)
  }

  return path.join(docsDir, candidates[0])
}

export function loadCurriculumClassificationIndex(csvPath: string): CurriculumClassificationIndex {
  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parse(content, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as CurriculumMapRow[]

  const classifications = rows
    .filter((row): row is Required<CurriculumMapRow> => Boolean(
      row.科目名 && row.科目区分 && row.科目分類 && row.学問分野 && row.科目ナンバリング
    ))
    .map(toClassification)

  return new CurriculumClassificationIndex(classifications)
}

export function applyCurriculumClassification(
  course: CourseRaw,
  classification: CurriculumClassification
): void {
  course.band = classification.band
  course.foundationGroups = [...classification.foundationGroups]
  course.expansionTrack = classification.expansionTrack
  course.fieldCategory = classification.fieldCategory
  course.countableToGraduation = classification.countableToGraduation
}
