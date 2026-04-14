/**
 * 卒業要件・進級要件チェッカー
 *
 * docs/requirements/zen_graduation_validator_sample.py のTypeScript移植版
 */

import type { Course, FoundationGroup } from '@/types/course'
import type {
  GraduationCheckResult,
  PromotionCheckResult,
  FoundationGroupStatus,
} from '@/types/requirements'
import type { PlannedCourse } from '@/types/plan'

const SOCIAL_CONNECTION_CAP = 10

/** 卒業要件の必要単位数 */
const REQUIRED = {
  TOTAL: 124,
  INTRODUCTION: 14,
  FOUNDATION: 12,
  FOUNDATION_GROUP_EACH: 2,
  EXPANSION: 74,
  FOUNDATION_LITERACY_COMBINED: 8,
  MULTILINGUAL_INFO_UNDERSTANDING_COMBINED: 8,
  WORLD_UNDERSTANDING_COMBINED: 26,
  DIGITAL_INDUSTRY_HISTORY: 2,
  GRADUATION_PROJECT: 4,
} as const

/** デジタル産業の指定4科目 */
const DIGITAL_INDUSTRY_HISTORY_NAMES = new Set([
  'IT産業史',
  'マンガ産業史',
  'アニメ産業史',
  '日本のゲーム産業史',
])

/**
 * 配置済み科目とCourseマップから卒業要件をチェックする
 *
 * @param plannedCourses 配置済み科目リスト
 * @param courseMap 全科目マップ（id → Course）
 * @returns 卒業要件チェック結果
 */
export function checkGraduation(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
): GraduationCheckResult {
  // 配置済みの科目データを取得（存在する科目のみ）
  const courses = plannedCourses
    .map(pc => courseMap[pc.courseId])
    .filter((c): c is Course => c !== undefined)

  // 重複除去（同じ科目が複数回配置されていても1回分のみカウント）
  const uniqueCourseIds = new Set<string>()
  const uniqueCourses: Course[] = []
  for (const course of courses) {
    if (!uniqueCourseIds.has(course.id)) {
      uniqueCourseIds.add(course.id)
      uniqueCourses.push(course)
    }
  }

  // 卒業要件に算入できる科目のみ
  const countableCourses = uniqueCourses.filter(c => c.countableToGraduation)

  // ===== 導入科目 =====
  const introductionCourses = countableCourses.filter(c => c.band === 'introduction')
  const introductionCredits = sumCredits(introductionCourses)

  // ===== 基礎科目 =====
  const foundationCourses = countableCourses.filter(c => c.band === 'foundation')
  const foundationCredits = sumCredits(foundationCourses)

  // 基礎科目の各分野別集計
  const foundationGroups: Record<FoundationGroup, FoundationGroupStatus> = {
    mathematics: makeGroupStatus(foundationCourses, 'mathematics'),
    information: makeGroupStatus(foundationCourses, 'information'),
    culture_thought: makeGroupStatus(foundationCourses, 'culture_thought'),
    society_network: makeGroupStatus(foundationCourses, 'society_network'),
    economy_market: makeGroupStatus(foundationCourses, 'economy_market'),
    multilingual_it_communication: makeGroupStatus(foundationCourses, 'multilingual_it_communication'),
  }

  // ===== 展開科目 =====
  const expansionCourses = countableCourses.filter(c => c.band === 'expansion')
  const expansionCredits = sumCredits(expansionCourses)

  // 基盤リテラシー科目（展開）+ 基礎科目の一部（B1の情報・数理系）を合算
  // 基盤リテラシー展開科目
  const foundationLiteracyExpansion = expansionCourses.filter(
    c => c.expansionTrack === 'foundation_literacy'
  )
  // 基礎科目の情報・数理分野（基礎科目の履修も合算）
  const foundationLiteracyBase = foundationCourses.filter(
    c =>
      c.foundationGroups.includes('mathematics') ||
      c.foundationGroups.includes('information')
  )
  const foundationLiteracyCombinedCredits =
    sumCredits(foundationLiteracyExpansion) + sumCredits(foundationLiteracyBase)

  // 多言語情報理解科目（展開）+ 基礎の多言語IT
  const multilingualExpansion = expansionCourses.filter(
    c => c.expansionTrack === 'multilingual_information_understanding'
  )
  const multilingualBase = foundationCourses.filter(
    c => c.foundationGroups.includes('multilingual_it_communication')
  )
  const multilingualCombinedCredits =
    sumCredits(multilingualExpansion) + sumCredits(multilingualBase)

  // 世界理解科目（展開）+ 基礎の文化思想・社会・経済
  const worldUnderstandingExpansion = expansionCourses.filter(
    c => c.expansionTrack === 'world_understanding'
  )
  const worldUnderstandingBase = foundationCourses.filter(
    c =>
      c.foundationGroups.includes('culture_thought') ||
      c.foundationGroups.includes('society_network') ||
      c.foundationGroups.includes('economy_market')
  )
  const worldUnderstandingCombinedCredits =
    sumCredits(worldUnderstandingExpansion) + sumCredits(worldUnderstandingBase)

  // デジタル産業指定4科目
  const digitalHistoryCourses = countableCourses.filter(
    c =>
      c.isDigitalIndustryHistoryEligible ||
      DIGITAL_INDUSTRY_HISTORY_NAMES.has(c.name)
  )
  const digitalHistoryCredits = sumCredits(digitalHistoryCourses)

  // 社会接続科目（上限10単位）
  const socialConnectionCourses = expansionCourses.filter(
    c => c.expansionTrack === 'social_connection'
  )
  const socialConnectionEarned = sumCredits(socialConnectionCourses)
  const socialConnectionCountable = Math.min(socialConnectionEarned, SOCIAL_CONNECTION_CAP)

  // ===== 卒業プロジェクト科目 =====
  const graduationProjectCourses = countableCourses.filter(
    c => c.band === 'graduation_project'
  )
  const graduationProjectCredits = sumCredits(graduationProjectCourses)
  const hasProjectPractice = graduationProjectCourses.some(c => c.isRequiredProjectPractice)

  // ===== 総単位数 =====
  const totalCountableCredits = sumCredits(countableCourses)

  // ===== 判定 =====
  const introOk = introductionCredits >= REQUIRED.INTRODUCTION
  const foundationOk =
    foundationCredits >= REQUIRED.FOUNDATION &&
    Object.values(foundationGroups).every(g => g.ok)
  const foundationLiteracyOk = foundationLiteracyCombinedCredits >= REQUIRED.FOUNDATION_LITERACY_COMBINED
  const multilingualOk = multilingualCombinedCredits >= REQUIRED.MULTILINGUAL_INFO_UNDERSTANDING_COMBINED
  const worldUnderstandingOk = worldUnderstandingCombinedCredits >= REQUIRED.WORLD_UNDERSTANDING_COMBINED
  const digitalHistoryOk = digitalHistoryCredits >= REQUIRED.DIGITAL_INDUSTRY_HISTORY
  const expansionOk =
    expansionCredits >= REQUIRED.EXPANSION &&
    foundationLiteracyOk &&
    multilingualOk &&
    worldUnderstandingOk &&
    digitalHistoryOk
  const graduationProjectOk =
    graduationProjectCredits >= REQUIRED.GRADUATION_PROJECT && hasProjectPractice
  const totalOk = totalCountableCredits >= REQUIRED.TOTAL

  const errors: string[] = []
  if (!introOk) {
    errors.push(`導入科目が不足しています（${introductionCredits}/${REQUIRED.INTRODUCTION}単位）`)
  }
  if (foundationCredits < REQUIRED.FOUNDATION) {
    errors.push(`基礎科目が不足しています（${foundationCredits}/${REQUIRED.FOUNDATION}単位）`)
  }
  for (const [group, status] of Object.entries(foundationGroups)) {
    if (!status.ok) {
      errors.push(`基礎科目「${getFoundationGroupLabel(group as FoundationGroup)}」が不足しています（${status.earned}/${status.required}単位）`)
    }
  }
  if (!foundationLiteracyOk) {
    errors.push(`基盤リテラシー科目が不足しています（${foundationLiteracyCombinedCredits}/${REQUIRED.FOUNDATION_LITERACY_COMBINED}単位）`)
  }
  if (!multilingualOk) {
    errors.push(`多言語情報理解科目が不足しています（${multilingualCombinedCredits}/${REQUIRED.MULTILINGUAL_INFO_UNDERSTANDING_COMBINED}単位）`)
  }
  if (!worldUnderstandingOk) {
    errors.push(`世界理解科目が不足しています（${worldUnderstandingCombinedCredits}/${REQUIRED.WORLD_UNDERSTANDING_COMBINED}単位）`)
  }
  if (!digitalHistoryOk) {
    errors.push(`デジタル産業の指定4科目群が不足しています（${digitalHistoryCredits}/${REQUIRED.DIGITAL_INDUSTRY_HISTORY}単位）`)
  }
  if (expansionCredits < REQUIRED.EXPANSION) {
    errors.push(`展開科目が不足しています（${expansionCredits}/${REQUIRED.EXPANSION}単位）`)
  }
  if (!graduationProjectOk) {
    if (!hasProjectPractice) {
      errors.push('卒業プロジェクト科目「プロジェクト実践」が必要です')
    } else {
      errors.push(`卒業プロジェクト科目が不足しています（${graduationProjectCredits}/${REQUIRED.GRADUATION_PROJECT}単位）`)
    }
  }
  if (!totalOk) {
    errors.push(`卒業要件単位数が不足しています（${totalCountableCredits}/${REQUIRED.TOTAL}単位）`)
  }

  const isEligible = errors.length === 0

  return {
    isEligible,
    totalCountableCredits,
    requiredTotal: REQUIRED.TOTAL,
    introduction: {
      earned: introductionCredits,
      required: REQUIRED.INTRODUCTION,
      ok: introOk,
    },
    foundation: {
      earned: foundationCredits,
      required: REQUIRED.FOUNDATION,
      ok: foundationOk,
      groups: foundationGroups,
    },
    expansion: {
      earned: expansionCredits,
      required: REQUIRED.EXPANSION,
      ok: expansionOk,
      foundationLiteracyCombined: {
        earned: foundationLiteracyCombinedCredits,
        required: REQUIRED.FOUNDATION_LITERACY_COMBINED,
        ok: foundationLiteracyOk,
      },
      multilingualInfoUnderstandingCombined: {
        earned: multilingualCombinedCredits,
        required: REQUIRED.MULTILINGUAL_INFO_UNDERSTANDING_COMBINED,
        ok: multilingualOk,
      },
      worldUnderstandingCombined: {
        earned: worldUnderstandingCombinedCredits,
        required: REQUIRED.WORLD_UNDERSTANDING_COMBINED,
        ok: worldUnderstandingOk,
      },
      digitalIndustryHistory: {
        earned: digitalHistoryCredits,
        required: REQUIRED.DIGITAL_INDUSTRY_HISTORY,
        ok: digitalHistoryOk,
      },
      socialConnection: {
        earned: socialConnectionEarned,
        cappedAt: SOCIAL_CONNECTION_CAP,
        countable: socialConnectionCountable,
      },
    },
    graduationProject: {
      earned: graduationProjectCredits,
      required: REQUIRED.GRADUATION_PROJECT,
      ok: graduationProjectOk,
      hasProjectPractice,
    },
    errors,
    warnings: [],
  }
}

/**
 * 3年次→4年次の進級要件をチェックする
 */
export function checkPromotion(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
): PromotionCheckResult {
  const courses = plannedCourses
    .map(pc => courseMap[pc.courseId])
    .filter((c): c is Course => c !== undefined)

  // 重複除去
  const uniqueIds = new Set<string>()
  const uniqueCourses: Course[] = []
  for (const c of courses) {
    if (!uniqueIds.has(c.id)) {
      uniqueIds.add(c.id)
      uniqueCourses.push(c)
    }
  }

  const countableCourses = uniqueCourses.filter(c => c.countableToGraduation)
  const totalCredits = sumCredits(countableCourses)

  return {
    toYear4: {
      totalCredits,
      required: 90,
      ok: totalCredits >= 90,
    },
  }
}

/**
 * 科目リストの単位数合計を計算する
 */
function sumCredits(courses: Course[]): number {
  return courses.reduce((sum, c) => sum + c.credits, 0)
}

/**
 * 特定の基礎科目分野の単位取得状況を計算する
 */
function makeGroupStatus(
  foundationCourses: Course[],
  group: FoundationGroup
): FoundationGroupStatus {
  const groupCourses = foundationCourses.filter(c => c.foundationGroups.includes(group))
  const earned = sumCredits(groupCourses)
  return {
    earned,
    required: 2,
    ok: earned >= 2,
  }
}

function getFoundationGroupLabel(group: FoundationGroup): string {
  const labels: Record<FoundationGroup, string> = {
    mathematics: '数理',
    information: '情報',
    culture_thought: '文化・思想',
    society_network: '社会・ネットワーク',
    economy_market: '経済・マーケット',
    multilingual_it_communication: '多言語ITコミュニケーション',
  }
  return labels[group]
}
