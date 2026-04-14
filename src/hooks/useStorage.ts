/**
 * Web Storage（localStorage）への履修計画の永続化フック
 */

import { useState, useCallback, useEffect } from 'react'
import type { CoursePlan, StoredPlans } from '@/types/plan'

const STORAGE_KEY = 'zen_course_planner_v1'
const DEFAULT_PLAN_NAME = 'マイプラン'

/**
 * localStorage から StoredPlans を読み込む
 */
function loadFromStorage(): StoredPlans {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultStorage()

    const parsed = JSON.parse(raw) as StoredPlans
    if (parsed.version !== '1.0') return createDefaultStorage()

    return parsed
  } catch {
    return createDefaultStorage()
  }
}

/**
 * StoredPlans を localStorage に保存する
 */
function saveToStorage(data: StoredPlans): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('localStorage への保存に失敗しました:', e)
  }
}

function createDefaultStorage(): StoredPlans {
  return {
    version: '1.0',
    plans: {},
    activePlanId: null,
  }
}

function generateId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface UseStorageReturn {
  /** 全プランのID一覧 */
  planIds: string[]
  /** アクティブなプランID */
  activePlanId: string | null
  /** プランを名前で保存（新規or上書き） */
  savePlan: (plan: CoursePlan, name?: string) => void
  /** 新しい名前でプランを保存（別名保存） */
  saveAsNewPlan: (plan: CoursePlan, newName: string) => string
  /** プランIDでプランを読み込む */
  loadPlan: (planId: string) => CoursePlan | null
  /** プランIDでプランを削除する */
  deletePlan: (planId: string) => void
  /** プランIDの表示名を取得する */
  getPlanName: (planId: string) => string
  /** 全プランのリスト */
  getAllPlans: () => Array<{ id: string; name: string; updatedAt: string }>
}

export function useStorage(): UseStorageReturn {
  const [storage, setStorage] = useState<StoredPlans>(loadFromStorage)

  // ストレージの変更を監視（他タブの変更を反映）
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setStorage(loadFromStorage())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const updateStorage = useCallback((updater: (prev: StoredPlans) => StoredPlans) => {
    setStorage(prev => {
      const next = updater(prev)
      saveToStorage(next)
      return next
    })
  }, [])

  const savePlan = useCallback((plan: CoursePlan, name?: string) => {
    updateStorage(prev => {
      const updatedPlan: CoursePlan = {
        ...plan,
        name: name ?? plan.name,
        updatedAt: new Date().toISOString(),
      }
      return {
        ...prev,
        plans: { ...prev.plans, [plan.id]: updatedPlan },
        activePlanId: plan.id,
      }
    })
  }, [updateStorage])

  const saveAsNewPlan = useCallback((plan: CoursePlan, newName: string): string => {
    const newId = generateId()
    const newPlan: CoursePlan = {
      ...plan,
      id: newId,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    updateStorage(prev => ({
      ...prev,
      plans: { ...prev.plans, [newId]: newPlan },
      activePlanId: newId,
    }))
    return newId
  }, [updateStorage])

  const loadPlan = useCallback((planId: string): CoursePlan | null => {
    const plan = storage.plans[planId] ?? null
    if (plan) {
      updateStorage(prev => ({ ...prev, activePlanId: planId }))
    }
    return plan
  }, [storage.plans, updateStorage])

  const deletePlan = useCallback((planId: string) => {
    updateStorage(prev => {
      const newPlans = { ...prev.plans }
      delete newPlans[planId]
      const newActivePlanId = prev.activePlanId === planId
        ? Object.keys(newPlans)[0] ?? null
        : prev.activePlanId
      return { ...prev, plans: newPlans, activePlanId: newActivePlanId }
    })
  }, [updateStorage])

  const getPlanName = useCallback((planId: string): string => {
    return storage.plans[planId]?.name ?? DEFAULT_PLAN_NAME
  }, [storage.plans])

  const getAllPlans = useCallback(() => {
    return Object.values(storage.plans)
      .map(p => ({ id: p.id, name: p.name, updatedAt: p.updatedAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [storage.plans])

  return {
    planIds: Object.keys(storage.plans),
    activePlanId: storage.activePlanId,
    savePlan,
    saveAsNewPlan,
    loadPlan,
    deletePlan,
    getPlanName,
    getAllPlans,
  }
}
