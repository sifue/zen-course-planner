/**
 * 生成済み科目データが学生便覧の分類と一致し、
 * 卒業要件ゲージへ正しく加算されることを検証する。
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Course } from '../src/types/course'
import type { PlannedCourse } from '../src/types/plan'
import { checkGraduation } from '../src/lib/graduation-checker'
import {
  findCurriculumMapPath,
  loadCurriculumClassificationIndex,
} from './curriculum-map-classification'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')
const COURSES_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'courses.json')

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function sameStrings(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

const courses = JSON.parse(fs.readFileSync(COURSES_PATH, 'utf-8')) as Course[]
const courseMap = Object.fromEntries(courses.map(course => [course.id, course]))
const curriculumIndex = loadCurriculumClassificationIndex(findCurriculumMapPath(PROJECT_ROOT))
const usedCurriculumNumberings = new Set<string>()
const unexpectedUnmatched: Course[] = []

for (const course of courses) {
  const match = curriculumIndex.find(course)
  if (!match) {
    // 2026年4月1日版CSVに未掲載の科目。追加されたら自動的に照合対象になる。
    if (course.name !== 'ゼミ（生命と文化）') unexpectedUnmatched.push(course)
    continue
  }

  const expected = match.classification
  usedCurriculumNumberings.add(expected.numbering)
  assert(course.band === expected.band, `${course.name}: bandがCSVと一致しません`)
  assert(
    sameStrings(course.foundationGroups, expected.foundationGroups),
    `${course.name}: foundationGroupsがCSVと一致しません`
  )
  assert(
    course.expansionTrack === expected.expansionTrack,
    `${course.name}: expansionTrackがCSVと一致しません`
  )
  assert(
    course.fieldCategory === expected.fieldCategory,
    `${course.name}: fieldCategoryがCSVと一致しません`
  )
  assert(
    course.countableToGraduation === expected.countableToGraduation,
    `${course.name}: countableToGraduationがCSVと一致しません`
  )
}

assert(
  unexpectedUnmatched.length === 0,
  `科目一覧CSVに未掲載の想定外科目があります: ${unexpectedUnmatched.map(c => c.name).join('、')}`
)
assert(
  usedCurriculumNumberings.size === curriculumIndex.size,
  `科目一覧CSVの未使用行があります（使用 ${usedCurriculumNumberings.size}/${curriculumIndex.size}件）`
)

function planned(courseId: string): PlannedCourse {
  return { courseId, year: 1, quarter: 1 }
}

const dataScienceResult = checkGraduation(
  [planned('BSC-1-B1-0204-003')],
  courseMap
)
assert(
  dataScienceResult.foundation.groups.information.earned === 2,
  'データサイエンス概論が情報分野へ2単位加算されません'
)
assert(
  dataScienceResult.foundation.groups.mathematics.earned === 0,
  'データサイエンス概論が数理分野へ誤加算されています'
)

const digitalIndustryResult = checkGraduation(
  [planned('DIGI-2-C1-1030-001'), planned('DIGI-2-C1-1030-002')],
  courseMap
)
assert(
  digitalIndustryResult.expansion.worldUnderstandingCombined.earned === 4,
  'コンテンツ産業論とゲーム制作論基礎が世界理解へ4単位加算されません'
)
assert(
  digitalIndustryResult.expansion.foundationLiteracyCombined.earned === 0,
  'コンテンツ産業論とゲーム制作論基礎が基盤リテラシーへ誤加算されています'
)

console.log(`✅ 科目一覧CSVとの分類一致: ${usedCurriculumNumberings.size}科目`)
console.log('✅ データサイエンス概論: 情報分野 +2単位')
console.log('✅ コンテンツ産業論・ゲーム制作論基礎: 世界理解 +4単位')
