/**
 * カリキュラムツリーから卒業可能な履修計画を自動生成するアルゴリズム
 *
 * アルゴリズム概要（Greedy法 4フェーズ）:
 * 1. 必修科目の先置き（プロジェクト実践=4年次、必修は各開講Qに）
 * 2. 選択したカリキュラムルートの科目リスト生成
 * 3. 開講パターンを考慮しながらgreedyに配置（1Qあたり4〜5科目上限）
 * 4. 卒業要件の不足分を「履修想定年次が若い順」に補填
 */

import type { Course } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'
import type { CurriculumTreeType } from '@/types/filters'
import { checkGraduation } from './graduation-checker'

/** 1クォーターあたりの最大履修科目数 */
const MAX_COURSES_PER_QUARTER = 5

/** 1クォーターあたりの推奨最大単位数 */
const MAX_CREDITS_PER_QUARTER = 10

/** 情報カリキュラムツリーの優先科目名リスト（履修推奨順） */
const INFORMATION_CURRICULUM: string[] = [
  // 1年次
  'ITリテラシー', 'アカデミックリテラシー', 'デジタルツールの使い方',
  '人工知能活用実践', 'ビジュアルプログラミング', 'Pythonプログラミング',
  'Webアプリケーション開発1', 'Webアプリケーション開発2',
  'Webユーザーエクスペリエンス', 'メディアアート史',
  'IT産業史',
  // 2年次
  'Webアプリケーション開発3', 'Webアプリケーション開発4',
  'Linux概論', 'インターネット概論', 'コンピュータ概論', '情報処理概論',
  'Javaプログラミング演習', 'オブジェクト指向プログラミング',
  'コンピューターサイエンス概論',
  // 3年次
  'Webアプリケーション開発演習', 'クラウドコンピューティング技術',
  'オートマトンと形式言語理論', '画像処理論',
  // 4年次
  'プロジェクト実践',
]

/** データサイエンスカリキュラムツリーの優先科目名リスト */
const DATA_SCIENCE_CURRICULUM: string[] = [
  // 1年次
  'ITリテラシー', 'アカデミックリテラシー', '現代社会と数学',
  '人工知能活用実践', 'データサイエンス概論',
  'Pythonプログラミング', 'IT産業史',
  // 2年次
  'Pythonプログラミング応用',
  'データ分析演習', 'ビジネスデータ分析基礎',
  'マクロ経済学', 'ミクロ経済学',
  '統計学基礎',
  // 3年次
  '事例から学ぶ統計学', '機械学習概論',
  '課題解決のための計量経済分析',
  // 4年次
  'プロジェクト実践',
]

/** 経済・マーケットカリキュラムツリーの優先科目名リスト */
const ECONOMY_MARKETS_CURRICULUM: string[] = [
  // 1年次
  'ITリテラシー', 'アカデミックリテラシー', '経済入門',
  '人工知能活用実践', '企業経営', '地域アントレプレナーシップ',
  'IT産業史',
  // 2年次
  'マクロ経済学', 'ミクロ経済学', '企業経営とファイナンス',
  'デジタル・マーケティング', 'スタートアップ',
  // 3年次
  'マクロ経済分析演習', '財務分析演習', '企業価値創造とM&A',
  '事例から学ぶ統計学',
  // 4年次
  'プロジェクト実践',
]

const CURRICULUM_MAPS: Record<CurriculumTreeType, string[]> = {
  information: INFORMATION_CURRICULUM,
  data_science: DATA_SCIENCE_CURRICULUM,
  economy_markets: ECONOMY_MARKETS_CURRICULUM,
}

/** グリッドのセルの状態 */
interface CellState {
  courseCount: number
  totalCredits: number
}

/** グリッドのセルキー */
function cellKey(year: number, quarter: number): string {
  return `${year}-${quarter}`
}

/**
 * カリキュラムツリーに基づいた自動履修計画を生成する
 *
 * @param curriculumType 選択するカリキュラムツリー
 * @param courses 全科目リスト
 * @param maxYears 最大年次
 * @returns 自動生成した配置済み科目リスト
 */
export function autoSchedule(
  curriculumType: CurriculumTreeType,
  courses: Course[],
  maxYears: number = 4
): PlannedCourse[] {
  const plannedCourses: PlannedCourse[] = []
  const cellStates = new Map<string, CellState>()
  const placedCourseIds = new Set<string>()

  // 科目名→Courseのマップ
  const courseByName = new Map<string, Course>()
  for (const course of courses) {
    courseByName.set(course.name, course)
  }

  // グリッドの初期化
  for (let year = 1; year <= maxYears; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      cellStates.set(cellKey(year, quarter), { courseCount: 0, totalCredits: 0 })
    }
  }

  /**
   * 科目を指定年次・Qに配置する
   */
  function placeCourse(course: Course, year: number, quarter: number): boolean {
    const key = cellKey(year, quarter)
    const cell = cellStates.get(key)
    if (!cell) return false
    if (cell.courseCount >= MAX_COURSES_PER_QUARTER) return false
    if (cell.totalCredits + course.credits > MAX_CREDITS_PER_QUARTER) return false

    plannedCourses.push({ courseId: course.id, year, quarter: quarter as 1 | 2 | 3 | 4 })
    placedCourseIds.add(course.id)
    cell.courseCount++
    cell.totalCredits += course.credits
    return true
  }

  /**
   * 科目を開講Q制約を満たす最も早い年次・Qに配置する
   */
  function placeAtEarliest(course: Course, fromYear: number = 1): boolean {
    for (let year = fromYear; year <= maxYears; year++) {
      for (const q of course.quarters) {
        if (placeCourse(course, year, q)) return true
      }
    }
    return false
  }

  // フェーズ1: 必修科目の先置き
  const requiredCourses = courses.filter(c => c.category === 'required')
  for (const course of requiredCourses) {
    if (placedCourseIds.has(course.id)) continue

    if (course.isRequiredProjectPractice) {
      // プロジェクト実践は4年次Q1に1回配置（ゴーストカードがQ2〜Q4を視覚的に占有）
      plannedCourses.push({ courseId: course.id, year: 4, quarter: 1 })
      placedCourseIds.add(course.id)
      // 4年次の全4Qを占有済みとしてマーク（他科目が入らないようにする）
      for (const q of [1, 2, 3, 4]) {
        const key = cellKey(4, q)
        const cell = cellStates.get(key)
        if (cell) {
          cell.courseCount = MAX_COURSES_PER_QUARTER
          cell.totalCredits = MAX_CREDITS_PER_QUARTER
        }
      }
    } else {
      // 他の必修科目は履修想定年次に配置
      placeAtEarliest(course, course.year)
    }
  }

  // フェーズ2: カリキュラムツリーの優先科目を配置
  const curriculumOrder = CURRICULUM_MAPS[curriculumType]
  for (const courseName of curriculumOrder) {
    const course = courseByName.get(courseName)
    if (!course || placedCourseIds.has(course.id)) continue

    placeAtEarliest(course, course.year)
  }

  // フェーズ3: 卒業要件の不足分を補填（履修想定年次の若い順）
  const courseMap: Record<string, Course> = {}
  for (const course of courses) {
    courseMap[course.id] = course
  }

  // まず現在の充足状況をチェック
  const checkResult = checkGraduation(plannedCourses, courseMap)

  if (!checkResult.isEligible) {
    // 不足している区分の科目を優先的に追加
    const supplementCandidates = courses
      .filter(c => !placedCourseIds.has(c.id) && c.countableToGraduation)
      .sort((a, b) => a.year - b.year) // 履修想定年次の若い順

    for (const course of supplementCandidates) {
      if (placedCourseIds.has(course.id)) continue

      // 不足区分の科目を優先
      const isNeeded = isNeededForGraduation(course, checkResult)
      if (isNeeded) {
        placeAtEarliest(course, course.year)
      }
    }
  }

  // フェーズ4: まだ余裕があれば、未配置の科目を履修想定年次順に追加
  const remainingCourses = courses
    .filter(c => !placedCourseIds.has(c.id) && c.countableToGraduation)
    .sort((a, b) => a.year - b.year)

  for (const course of remainingCourses) {
    if (placedCourseIds.has(course.id)) continue
    placeAtEarliest(course, course.year)
  }

  return plannedCourses
}

/**
 * 科目が現在の不足要件を補填するために必要かを判定する
 */
function isNeededForGraduation(
  course: Course,
  checkResult: ReturnType<typeof checkGraduation>
): boolean {
  // 導入科目不足
  if (!checkResult.introduction.ok && course.band === 'introduction') return true

  // 基礎科目不足
  if (!checkResult.foundation.ok && course.band === 'foundation') {
    for (const group of course.foundationGroups) {
      if (!checkResult.foundation.groups[group].ok) return true
    }
  }

  // 展開科目不足
  if (course.band === 'expansion') {
    if (!checkResult.expansion.foundationLiteracyCombined.ok && course.expansionTrack === 'foundation_literacy') return true
    if (!checkResult.expansion.multilingualInfoUnderstandingCombined.ok && course.expansionTrack === 'multilingual_information_understanding') return true
    if (!checkResult.expansion.worldUnderstandingCombined.ok && course.expansionTrack === 'world_understanding') return true
    if (!checkResult.expansion.digitalIndustryHistory.ok && course.isDigitalIndustryHistoryEligible) return true
  }

  // 卒業プロジェクト科目不足
  if (!checkResult.graduationProject.ok && course.band === 'graduation_project') return true

  // 総単位不足
  if (checkResult.totalCountableCredits < checkResult.requiredTotal) return true

  return false
}
