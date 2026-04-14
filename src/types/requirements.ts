import type { FoundationGroup } from './course'

/** 基礎科目の各分野の充足状況 */
export interface FoundationGroupStatus {
  earned: number
  required: 2
  ok: boolean
}

/** 卒業要件チェック結果 */
export interface GraduationCheckResult {
  /** 全要件を満たしているか */
  isEligible: boolean
  /** 卒業要件に算入できる総単位数 */
  totalCountableCredits: number
  /** 必要総単位数 */
  requiredTotal: 124

  /** 導入科目 */
  introduction: {
    earned: number
    required: 14
    ok: boolean
  }

  /** 基礎科目 */
  foundation: {
    earned: number
    required: 12
    ok: boolean
    groups: Record<FoundationGroup, FoundationGroupStatus>
  }

  /** 展開科目 */
  expansion: {
    earned: number
    required: 74
    ok: boolean
    /** 基盤リテラシー科目（基礎科目の履修も合算） */
    foundationLiteracyCombined: { earned: number; required: 8; ok: boolean }
    /** 多言語情報理解科目（基礎科目の履修も合算） */
    multilingualInfoUnderstandingCombined: { earned: number; required: 8; ok: boolean }
    /** 世界理解科目（基礎科目の履修も合算） */
    worldUnderstandingCombined: { earned: number; required: 26; ok: boolean }
    /** デジタル産業の指定4科目群 */
    digitalIndustryHistory: { earned: number; required: 2; ok: boolean }
    /** 社会接続科目（上限10単位まで算入） */
    socialConnection: { earned: number; cappedAt: 10; countable: number }
  }

  /** 卒業プロジェクト科目 */
  graduationProject: {
    earned: number
    required: 4
    ok: boolean
    hasProjectPractice: boolean
  }

  /** エラーメッセージ（要件未達） */
  errors: string[]
  /** 警告メッセージ（前提科目不足等） */
  warnings: string[]
}

/** 進級要件チェック結果 */
export interface PromotionCheckResult {
  /** 3年次→4年次の進級判定 */
  toYear4: {
    totalCredits: number
    required: 90
    ok: boolean
  }
}
