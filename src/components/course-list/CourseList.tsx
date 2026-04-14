import { useState, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Course } from '@/types/course'
import { CourseCard } from './CourseCard'
import { CourseFilter } from './CourseFilter'
import { CourseDetail } from './CourseDetail'
import type { UseFiltersReturn } from '@/hooks/useFilters'

interface CourseListProps {
  courses: Course[]
  filters: UseFiltersReturn
  placedCourseIds: Set<string>
  warningCourseIds: Set<string>
  errorCourseIds: Set<string>
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
  warningCourseIds,
  errorCourseIds,
  onAddCourse,
  onRemoveCourse,
}: CourseListProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // フィルタリング済みの科目リスト
  const filteredCourses = filters.filterCourses(courses, placedCourseIds)

  // 仮想スクロールの設定
  const listRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredCourses.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 72, // 科目カードの推定高さ
    overscan: 5,
  })

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(prev => prev?.id === course.id ? null : course)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* フィルターパネル */}
      <CourseFilter
        filters={filters}
        totalCount={courses.length}
        filteredCount={filteredCourses.length}
      />

      {/* 科目リスト（仮想スクロール） */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label="科目一覧"
      >
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <p className="text-sm">条件に合う科目がありません</p>
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
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  role="listitem"
                >
                  <div className="px-2 py-0.5">
                    <CourseCard
                      course={course}
                      isPlaced={placedCourseIds.has(course.id)}
                      hasWarning={warningCourseIds.has(course.id)}
                      hasError={errorCourseIds.has(course.id)}
                      onClick={handleCourseClick}
                      onQuickAdd={course => onAddCourse(course.id, course.year, course.quarters[0] as 1 | 2 | 3 | 4 ?? 1)}
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
        />
      )}
    </div>
  )
}
