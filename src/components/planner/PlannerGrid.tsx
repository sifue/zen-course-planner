import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { Course } from '@/types/course'
import type { CoursePlan } from '@/types/plan'
import { YearColumn } from './YearColumn'
import { AddYearButton } from './AddYearButton'
import { PlannedCourseCard } from './PlannedCourseCard'

interface PlannerGridProps {
  plan: CoursePlan
  courses: Course[]
  courseMap: Record<string, Course>
  warningCourseIds: Set<string>
  errorCourseIds: Set<string>
  onAddCourse: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  onMoveCourse: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  onRemoveCourse: (courseId: string) => void
  onAddYear: () => void
  onOpenCourseDetail: (course: Course) => void
}

/**
 * 全年次のプランナーグリッド（DndContextラップ）
 *
 * - 科目一覧からのドラッグ: type='course', courseId
 * - グリッド内の移動: type='planned-course', courseId
 * - ドロップ先: QuarterCell（type='cell-{year}-{quarter}'）
 */
export function PlannerGrid({
  plan,
  courseMap,
  warningCourseIds,
  errorCourseIds,
  onAddCourse,
  onMoveCourse,
  onRemoveCourse,
  onAddYear,
  onOpenCourseDetail,
}: PlannerGridProps) {
  const [draggingCourseId, setDraggingCourseId] = useState<string | null>(null)

  // センサー設定
  // PC: マウス（クリックとドラッグを区別するため5px以上の移動で開始）
  // スマホ: タッチ（250ms長押しで開始）
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  })
  const sensors = useSensors(mouseSensor, touchSensor)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current as { type: string; courseId: string }
    if (data?.courseId) {
      setDraggingCourseId(data.courseId)
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDraggingCourseId(null)

    if (!over) return

    const activeData = active.data.current as { type: string; courseId: string }
    const overData = over.data.current as { year: number; quarter: 1 | 2 | 3 | 4 } | undefined

    if (!activeData?.courseId || !overData?.year || !overData?.quarter) return

    const { courseId } = activeData
    const { year, quarter } = overData

    // 開講クォーター互換性チェック
    const course = courseMap[courseId]
    if (course && course.quarters.length > 0 && !course.quarters.includes(quarter)) {
      // ドロップ先のQに開講がない → キャンセル
      return
    }

    if (activeData.type === 'course') {
      // 科目一覧からのドロップ
      onAddCourse(courseId, year, quarter)
    } else if (activeData.type === 'planned-course') {
      // グリッド内での移動
      onMoveCourse(courseId, year, quarter)
    }
  }, [courseMap, onAddCourse, onMoveCourse])

  const draggingCourse = draggingCourseId ? courseMap[draggingCourseId] : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto overflow-y-auto">
        <div className="flex gap-4 p-4 min-w-max" role="grid" aria-label="履修計画グリッド">
          {/* 各年次の列 */}
          {Array.from({ length: plan.maxYears }, (_, i) => i + 1).map(year => (
            <YearColumn
              key={year}
              year={year}
              plannedCourses={plan.plannedCourses.filter(pc => pc.year === year)}
              courseMap={courseMap}
              warningCourseIds={warningCourseIds}
              errorCourseIds={errorCourseIds}
              draggingCourseId={draggingCourseId}
              onRemoveCourse={onRemoveCourse}
              onOpenCourseDetail={onOpenCourseDetail}
            />
          ))}

          {/* 年次追加ボタン */}
          <AddYearButton currentMaxYears={plan.maxYears} onAddYear={onAddYear} />
        </div>
      </div>

      {/* ドラッグオーバーレイ（ドラッグ中に追従するカード） */}
      <DragOverlay>
        {draggingCourse && (
          <div className="rotate-2 opacity-90 w-48">
            <PlannedCourseCard
              course={draggingCourse}
              onRemove={() => {}}
              onOpenDetail={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
