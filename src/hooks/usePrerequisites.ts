/**
 * 前提科目チェックフック
 *
 * 配置済み科目の推奨前提科目が満たされているかをチェックし、
 * 警告リストを返す。
 */

import { useMemo } from 'react'
import type { Course } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'

export interface PrerequisiteWarning {
  /** 警告対象の科目ID */
  courseId: string
  /** 警告対象の科目名 */
  courseName: string
  /** 不足している前提科目名リスト */
  missingPrerequisites: string[]
  /** 警告の重要度 */
  severity: 'error' | 'warning'
}

export interface UsePrerequisitesReturn {
  /** 前提科目警告リスト */
  warnings: PrerequisiteWarning[]
  /** 警告対象の科目IDのセット（高速なルックアップ用） */
  warningCourseIds: Set<string>
  /** エラーレベル（強く推奨が欠如）の科目IDのセット */
  errorCourseIds: Set<string>
}

export function usePrerequisites(
  plannedCourses: PlannedCourse[],
  courseMap: Record<string, Course>
): UsePrerequisitesReturn {
  const { warnings, warningCourseIds, errorCourseIds } = useMemo(() => {
    const placedCourseNames = new Set<string>()
    for (const pc of plannedCourses) {
      const course = courseMap[pc.courseId]
      if (course) placedCourseNames.add(course.name)
    }

    const warnings: PrerequisiteWarning[] = []
    const warningCourseIds = new Set<string>()
    const errorCourseIds = new Set<string>()

    for (const pc of plannedCourses) {
      const course = courseMap[pc.courseId]
      if (!course) continue

      // 強く推奨される前提科目が未配置の場合はエラー
      const missingStrong = course.strongPrerequisites.filter(
        name => !placedCourseNames.has(name)
      )

      // 推奨される前提科目が未配置の場合は警告
      const missingRecommended = course.recommendedPrerequisites.filter(
        name => !placedCourseNames.has(name)
      )

      if (missingStrong.length > 0) {
        warnings.push({
          courseId: course.id,
          courseName: course.name,
          missingPrerequisites: missingStrong,
          severity: 'error',
        })
        warningCourseIds.add(course.id)
        errorCourseIds.add(course.id)
      } else if (missingRecommended.length > 0) {
        warnings.push({
          courseId: course.id,
          courseName: course.name,
          missingPrerequisites: missingRecommended,
          severity: 'warning',
        })
        warningCourseIds.add(course.id)
      }
    }

    return { warnings, warningCourseIds, errorCourseIds }
  }, [plannedCourses, courseMap])

  return { warnings, warningCourseIds, errorCourseIds }
}
