/**
 * 卒業・進級要件のリアクティブチェックフック
 */

import { useMemo } from 'react'
import type { Course } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'
import type { GraduationCheckResult, PromotionCheckResult } from '@/types/requirements'
import { checkGraduation, checkPromotion } from '@/lib/graduation-checker'

export interface UseGraduationReturn {
  /** 卒業要件チェック結果 */
  graduation: GraduationCheckResult
  /** 進級要件チェック結果 */
  promotion: PromotionCheckResult
}

export function useGraduation(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
): UseGraduationReturn {
  const graduation = useMemo(
    () => checkGraduation(plannedCourses, courseMap),
    [plannedCourses, courseMap]
  )

  const promotion = useMemo(
    () => checkPromotion(plannedCourses, courseMap),
    [plannedCourses, courseMap]
  )

  return { graduation, promotion }
}
