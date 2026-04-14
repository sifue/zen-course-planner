/**
 * 履修計画の状態管理フック
 *
 * 科目の追加・削除・移動、計画のリセットなどの操作を提供する
 */

import { useState, useCallback, useMemo } from 'react'
import type { CoursePlan, PlannedCourse } from '@/types/plan'

const DEFAULT_MAX_YEARS = 4

function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function createNewPlan(name: string = 'マイプラン'): CoursePlan {
  const now = new Date().toISOString()
  return {
    id: generatePlanId(),
    name,
    createdAt: now,
    updatedAt: now,
    maxYears: DEFAULT_MAX_YEARS,
    plannedCourses: [],
  }
}

export interface UsePlanReturn {
  plan: CoursePlan
  /** 計画全体を置き換える（ロード・インポート時） */
  setPlan: (plan: CoursePlan) => void
  /** 計画名を変更する */
  setPlanName: (name: string) => void
  /** 科目をグリッドに追加する（すでに配置済みの場合は移動） */
  addCourse: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  /** グリッド内で科目を移動する */
  moveCourse: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  /** 科目をグリッドから削除する */
  removeCourse: (courseId: string) => void
  /** 計画をリセット（空にする） */
  resetPlan: () => void
  /** 年次を追加する（最大8年次まで） */
  addYear: () => void
  /** 指定した科目の配置位置を返す（未配置の場合はnull） */
  getPlacement: (courseId: string) => { year: number; quarter: number } | null
  /** 配置済み科目IDの集合 */
  placedCourseIds: Set<string>
  /** 指定年次・Qの配置科目リスト */
  getCoursesInCell: (year: number, quarter: number) => PlannedCourse[]
  /** 計画をupdatedAtを更新して返す（保存用） */
  getPlanForSave: () => CoursePlan
}

export function usePlan(initialPlan?: CoursePlan): UsePlanReturn {
  const [plan, setPlanState] = useState<CoursePlan>(initialPlan ?? createNewPlan())

  const updatePlan = useCallback((updater: (prev: CoursePlan) => Partial<CoursePlan>) => {
    setPlanState(prev => ({
      ...prev,
      ...updater(prev),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setPlan = useCallback((newPlan: CoursePlan) => {
    setPlanState(newPlan)
  }, [])

  const setPlanName = useCallback((name: string) => {
    updatePlan(() => ({ name }))
  }, [updatePlan])

  const addCourse = useCallback((courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => {
    updatePlan(prev => ({
      plannedCourses: [
        // 既存の配置を除去（同じ科目の重複を避ける）
        ...prev.plannedCourses.filter(pc => pc.courseId !== courseId),
        { courseId, year, quarter },
      ],
    }))
  }, [updatePlan])

  const moveCourse = useCallback((courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => {
    updatePlan(prev => ({
      plannedCourses: prev.plannedCourses.map(pc =>
        pc.courseId === courseId ? { ...pc, year, quarter } : pc
      ),
    }))
  }, [updatePlan])

  const removeCourse = useCallback((courseId: string) => {
    updatePlan(prev => ({
      plannedCourses: prev.plannedCourses.filter(pc => pc.courseId !== courseId),
    }))
  }, [updatePlan])

  const resetPlan = useCallback(() => {
    updatePlan(() => ({ plannedCourses: [] }))
  }, [updatePlan])

  const addYear = useCallback(() => {
    updatePlan(prev => ({
      maxYears: Math.min(prev.maxYears + 1, 8),
    }))
  }, [updatePlan])

  const placedCourseIds = useMemo(
    () => new Set(plan.plannedCourses.map(pc => pc.courseId)),
    [plan.plannedCourses]
  )

  const getPlacement = useCallback((courseId: string) => {
    const placement = plan.plannedCourses.find(pc => pc.courseId === courseId)
    return placement ? { year: placement.year, quarter: placement.quarter } : null
  }, [plan.plannedCourses])

  const getCoursesInCell = useCallback((year: number, quarter: number): PlannedCourse[] => {
    return plan.plannedCourses.filter(pc => pc.year === year && pc.quarter === quarter)
  }, [plan.plannedCourses])

  const getPlanForSave = useCallback((): CoursePlan => ({
    ...plan,
    updatedAt: new Date().toISOString(),
  }), [plan])

  return {
    plan,
    setPlan,
    setPlanName,
    addCourse,
    moveCourse,
    removeCourse,
    resetPlan,
    addYear,
    getPlacement,
    placedCourseIds,
    getCoursesInCell,
    getPlanForSave,
  }
}
