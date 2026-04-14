import { useDroppable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import type { Course } from '@/types/course'
import { BAND_COLORS } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'
import { PlannedCourseCard } from './PlannedCourseCard'

/** 複数Q開講科目が別Qに占有しているゴーストカード情報 */
export interface GhostCourse {
  course: Course
  /** 実際に配置されているクォーター */
  placedAtQuarter: 1 | 2 | 3 | 4
}

interface QuarterCellProps {
  year: number
  quarter: 1 | 2 | 3 | 4
  plannedCourses: PlannedCourse[]
  /** このセルに表示するゴーストカードリスト */
  ghostCourses: GhostCourse[]
  courseMap: Record<string, Course>
  warningCourseIds: Set<string>
  errorCourseIds: Set<string>
  /** ドラッグ中の科目（このセルに配置可能かチェック用） */
  draggingCourseId: string | null
  onRemoveCourse: (courseId: string) => void
  onOpenCourseDetail: (course: Course) => void
}

/**
 * プランナーグリッドの1クォーターセル（ドロップゾーン）
 *
 * 開講クォーターに合わない科目をドロップしようとした場合、
 * 視覚的に受け入れ不可であることを示す。
 */
export function QuarterCell({
  year,
  quarter,
  plannedCourses,
  ghostCourses,
  courseMap,
  warningCourseIds,
  errorCourseIds,
  draggingCourseId,
  onRemoveCourse,
  onOpenCourseDetail,
}: QuarterCellProps) {
  const droppableId = `cell-${year}-${quarter}`
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { year, quarter },
  })

  // ドラッグ中の科目がこのセルに配置可能かチェック
  const isDraggingCompatible = draggingCourseId
    ? isCourseCompatibleWithCell(draggingCourseId, quarter, courseMap)
    : true

  // 合計単位数
  const totalCredits = plannedCourses.reduce((sum, pc) => {
    const course = courseMap[pc.courseId]
    return sum + (course?.credits ?? 0)
  }, 0)

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative min-h-24 flex-1 rounded-md border p-1.5 transition-colors',
        // 通常状態
        'border-gray-200 bg-gray-50/50',
        // ドロップ可能なセルがホバーされているとき
        isOver && isDraggingCompatible && 'drop-zone-active',
        // ドロップ不可のセルにドラッグしようとしているとき
        isOver && !isDraggingCompatible && 'ring-2 ring-red-400 ring-offset-1 bg-red-50',
        // ドラッグ中で互換性がない場合（薄く表示）
        draggingCourseId && !isDraggingCompatible && !isOver && 'opacity-50 bg-gray-100',
      )}
      aria-label={`${year}年次 ${quarter}Q（${totalCredits}単位）`}
      role="region"
    >
      {/* 単位数表示 */}
      {totalCredits > 0 && (
        <div className={clsx(
          'absolute right-1.5 top-1 text-xs',
          totalCredits > 10 ? 'text-amber-500 font-medium' : 'text-gray-400'
        )}>
          {totalCredits}単位{totalCredits > 10 && '⚠'}
        </div>
      )}

      {/* ドロップ不可インジケーター */}
      {draggingCourseId && !isDraggingCompatible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 font-medium">
            この時期には開講なし
          </span>
        </div>
      )}

      {/* 配置済み科目カード */}
      <div className="flex flex-col gap-1 mt-3">
        {plannedCourses.map(pc => {
          const course = courseMap[pc.courseId]
          if (!course) return null
          return (
            <PlannedCourseCard
              key={pc.courseId}
              course={course}
              hasWarning={warningCourseIds.has(course.id)}
              hasError={errorCourseIds.has(course.id)}
              onRemove={onRemoveCourse}
              onOpenDetail={onOpenCourseDetail}
            />
          )
        })}

        {/* ゴーストカード（複数Q開講科目が占有しているQに表示） */}
        {ghostCourses.map(({ course, placedAtQuarter }) => (
          <GhostCourseCard
            key={`ghost-${course.id}`}
            course={course}
            placedAtQuarter={placedAtQuarter}
          />
        ))}
      </div>

      {/* 空セルのドロップヒント */}
      {plannedCourses.length === 0 && !draggingCourseId && (
        <div className="flex h-full min-h-16 items-center justify-center">
          <p className="text-xs text-gray-300">ここにドロップ</p>
        </div>
      )}
    </div>
  )
}

/** ゴーストカード（複数Q開講科目の占有表示） */
function GhostCourseCard({ course, placedAtQuarter }: { course: Course; placedAtQuarter: 1 | 2 | 3 | 4 }) {
  const bandColors = BAND_COLORS[course.band]
  return (
    <div
      className={clsx(
        'relative rounded-md border-2 border-dashed px-2 py-1.5 text-xs opacity-50',
        bandColors.bg,
        bandColors.border,
      )}
      title={`${course.name}は${placedAtQuarter}Qに配置（${course.quarters.map(q => `${q}Q`).join('・')}開講）`}
      aria-label={`${course.name}（${placedAtQuarter}Q配置・このQも開講）`}
    >
      <p className={clsx('font-medium leading-tight truncate', bandColors.text)}>
        {course.name}
      </p>
      <p className="mt-0.5 text-gray-400">
        {placedAtQuarter}Q配置
      </p>
    </div>
  )
}

/**
 * 科目が指定のクォーターに開講されているかチェックする
 */
function isCourseCompatibleWithCell(
  courseId: string,
  quarter: number,
  courseMap: Record<string, Course>
): boolean {
  const course = courseMap[courseId]
  if (!course) return true // 不明な場合は許可
  if (course.quarters.length === 0) return true // 開講Q情報がない場合は許可
  return course.quarters.includes(quarter)
}
