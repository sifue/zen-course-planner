/**
 * 科目一覧の絞り込み状態管理フック
 */

import { useState, useCallback, useMemo } from 'react'
import type { Course, TeachingMethod } from '@/types/course'
import type { FilterState, CategoryFilterKey } from '@/types/filters'
import { DEFAULT_FILTER_STATE } from '@/types/filters'

export interface UseFiltersReturn {
  filters: FilterState
  /** 年次フィルターをトグルする */
  toggleYear: (year: 1 | 2 | 3 | 4) => void
  /** 分類フィルターをトグルする */
  toggleCategory: (category: CategoryFilterKey) => void
  /** 授業方法フィルターをトグルする（複数指定でまとめてトグル） */
  toggleTeachingMethods: (methods: TeachingMethod[]) => void
  /** タグキーワードをトグルする */
  toggleTagKeyword: (keyword: string) => void
  /** テキスト検索を設定する */
  setSearchText: (text: string) => void
  /** 未配置のみ表示をトグルする */
  toggleShowUnplannedOnly: () => void
  /** 全フィルターをリセットする */
  resetFilters: () => void
  /** フィルター済み科目リストを返す */
  filterCourses: (courses: Course[], placedCourseIds: Set<string>) => Course[]
  /** アクティブなフィルター数 */
  activeFilterCount: number
}

export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
    years: new Set(),
    categories: new Set(),
    teachingMethods: new Set(),
    tagKeywords: new Set(),
  })

  const toggleYear = useCallback((year: 1 | 2 | 3 | 4) => {
    setFilters(prev => {
      const next = new Set(prev.years)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return { ...prev, years: next }
    })
  }, [])

  const toggleCategory = useCallback((category: CategoryFilterKey) => {
    setFilters(prev => {
      const next = new Set(prev.categories)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return { ...prev, categories: next }
    })
  }, [])

  const toggleTeachingMethods = useCallback((methods: TeachingMethod[]) => {
    setFilters(prev => {
      const next = new Set(prev.teachingMethods)
      const allPresent = methods.every(m => next.has(m))
      if (allPresent) {
        methods.forEach(m => next.delete(m))
      } else {
        methods.forEach(m => next.add(m))
      }
      return { ...prev, teachingMethods: next }
    })
  }, [])

  const toggleTagKeyword = useCallback((keyword: string) => {
    setFilters(prev => {
      const next = new Set(prev.tagKeywords)
      if (next.has(keyword)) next.delete(keyword)
      else next.add(keyword)
      return { ...prev, tagKeywords: next }
    })
  }, [])

  const setSearchText = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, searchText: text }))
  }, [])

  const toggleShowUnplannedOnly = useCallback(() => {
    setFilters(prev => ({ ...prev, showUnplannedOnly: !prev.showUnplannedOnly }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTER_STATE,
      years: new Set(),
      categories: new Set(),
      teachingMethods: new Set(),
      tagKeywords: new Set(),
    })
  }, [])

  const filterCourses = useCallback((courses: Course[], placedCourseIds: Set<string>): Course[] => {
    return courses.filter(course => {
      // 未配置のみ表示フィルター
      if (filters.showUnplannedOnly && placedCourseIds.has(course.id)) return false

      // 年次フィルター
      if (filters.years.size > 0 && !filters.years.has(course.year)) return false

      // 分類フィルター
      if (filters.categories.size > 0) {
        let matches = false
        for (const category of filters.categories) {
          // バンドコードで絞り込み
          if (category === course.band) { matches = true; break }
          // 展開科目系統で絞り込み
          if (course.band === 'expansion' && course.expansionTrack === category) { matches = true; break }
          // 多言語情報理解: 展開科目系統 + 基礎科目の多言語ITコミュニケーショングループを統合
          if (
            category === 'multilingual_information_understanding' &&
            course.band === 'foundation' &&
            course.foundationGroups.includes('multilingual_it_communication')
          ) {
            matches = true; break
          }
          // デジタル産業: isDigitalIndustryHistoryEligible フラグで絞り込み
          if (category === 'digital_industry' && course.isDigitalIndustryHistoryEligible) { matches = true; break }
        }
        if (!matches) return false
      }

      // 授業方法フィルター
      if (filters.teachingMethods.size > 0) {
        if (!filters.teachingMethods.has(course.teachingMethod)) return false
      }

      // テキスト検索（科目名・タグ・教員）
      if (filters.searchText) {
        const query = filters.searchText.toLowerCase()
        const searchTarget = [
          course.name,
          ...course.tags,
          ...course.instructors,
          course.overview,
        ].join(' ').toLowerCase()
        if (!searchTarget.includes(query)) return false
      }

      return true
    })
  }, [filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.years.size > 0) count++
    if (filters.categories.size > 0) count++
    if (filters.teachingMethods.size > 0) count++
    if (filters.tagKeywords.size > 0) count++
    if (filters.searchText) count++
    if (filters.showUnplannedOnly) count++
    return count
  }, [filters])

  return {
    filters,
    toggleYear,
    toggleCategory,
    toggleTeachingMethods,
    toggleTagKeyword,
    setSearchText,
    toggleShowUnplannedOnly,
    resetFilters,
    filterCourses,
    activeFilterCount,
  }
}
