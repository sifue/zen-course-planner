import { useState, useRef, useMemo, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { clsx } from 'clsx'
import type { Course } from '@/types/course'
import { CourseCard } from './CourseCard'
import { CourseFilter } from './CourseFilter'
import { CourseDetail } from './CourseDetail'
import { QuickAddDialog } from './QuickAddDialog'
import type { UseFiltersReturn } from '@/hooks/useFilters'

type SortKey = 'year' | 'name' | 'credits'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'year', label: '年次' },
  { value: 'name', label: '科目名' },
  { value: 'credits', label: '単位' },
]

function sortCourses(courses: Course[], sortBy: SortKey): Course[] {
  return [...courses].sort((a, b) => {
    if (sortBy === 'year') return a.year - b.year || a.name.localeCompare(b.name, 'ja')
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ja')
    if (sortBy === 'credits') return a.credits - b.credits || a.year - b.year
    return 0
  })
}

interface CourseListProps {
  courses: Course[]
  filters: UseFiltersReturn
  placedCourseIds: Set<string>
  /** 科目ID→配置位置（年次・Q） */
  placementMap?: Map<string, { year: number; quarter: number }>
  warningCourseIds: Set<string>
  errorCourseIds: Set<string>
  maxYears: number
  onAddCourse: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  onRemoveCourse: (courseId: string) => void
}

/**
 * 科目一覧パネル（仮想スクロール対応）
 */
export function CourseList({
  courses,
  filters,
  placedCourseIds,
  placementMap,
  warningCourseIds,
  errorCourseIds,
  maxYears,
  onAddCourse,
  onRemoveCourse,
}: CourseListProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [quickAddCourse, setQuickAddCourse] = useState<Course | null>(null)
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('year')

  // フィルタリング済み・ソート済みの科目リスト（メモ化でパフォーマンス最適化）
  const filteredCourses = useMemo(
    () => sortCourses(filters.filterCourses(courses, placedCourseIds), sortBy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courses, placedCourseIds, filters.filters, sortBy]
  )

  // 仮想スクロールの設定（動的高さ計測対応）
  const listRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredCourses.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 72, // 科目カードの推定高さ（初期値）
    measureElement: el => el.getBoundingClientRect().height,
    overscan: 5,
  })

  // フィルター・ソート変更時にリストを先頭にスクロール
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.filters, sortBy])

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(prev => prev?.id === course.id ? null : course)
  }

  const handleQuickAdd = (course: Course) => {
    setQuickAddCourse(course)
    setQuickAddDialogOpen(true)
  }

  const handleAddFromDialog = (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => {
    onAddCourse(courseId, year, quarter)
    // 追加後は詳細パネルを閉じる（配置済みになったのでリストからも消える可能性あり）
    setSelectedCourse(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* フィルターパネル */}
      <CourseFilter
        filters={filters}
        totalCount={courses.length}
        filteredCount={filteredCourses.length}
      />

      {/* ソートバー */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-1.5 bg-gray-50">
        <span className="text-xs text-gray-400">並び順:</span>
        <div className="flex gap-0.5">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSortBy(value)}
              className={clsx(
                'rounded px-2 py-0.5 text-xs transition-colors',
                sortBy === value
                  ? 'bg-zen-600 text-white'
                  : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              )}
              aria-pressed={sortBy === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 科目リスト（仮想スクロール） */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label="科目一覧"
      >
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-4 text-center">
            <p className="text-sm">条件に合う科目がありません</p>
            {filters.filters.showUnplannedOnly && filters.activeFilterCount === 1 ? (
              <p className="mt-1 text-xs text-gray-300">すべての科目が配置済みです</p>
            ) : filters.filters.searchText ? (
              <p className="mt-1 text-xs text-gray-300">「{filters.filters.searchText}」に一致する科目が見つかりません</p>
            ) : null}
            {filters.activeFilterCount > 0 && (
              <button
                onClick={filters.resetFilters}
                className="mt-2 text-xs text-zen-600 hover:underline"
              >
                フィルターをリセット
              </button>
            )}
          </div>
        ) : (
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualItem => {
              const course = filteredCourses[virtualItem.index]
              return (
                <div
                  key={course.id}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  role="listitem"
                >
                  <div className="px-2 py-0.5">
                    <CourseCard
                      course={course}
                      isPlaced={placedCourseIds.has(course.id)}
                      placement={placementMap?.get(course.id)}
                      hasWarning={warningCourseIds.has(course.id)}
                      hasError={errorCourseIds.has(course.id)}
                      onClick={handleCourseClick}
                      onQuickAdd={handleQuickAdd}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 科目詳細パネル（下部に固定表示） */}
      {selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          isPlaced={placedCourseIds.has(selectedCourse.id)}
          onClose={() => setSelectedCourse(null)}
          onAdd={onAddCourse}
          onRemove={onRemoveCourse}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {/* クイック追加ダイアログ */}
      <QuickAddDialog
        course={quickAddCourse}
        open={quickAddDialogOpen}
        onOpenChange={setQuickAddDialogOpen}
        maxYears={maxYears}
        onAdd={handleAddFromDialog}
      />
    </div>
  )
}
