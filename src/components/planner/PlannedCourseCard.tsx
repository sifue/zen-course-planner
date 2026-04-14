import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import { X, AlertTriangle, AlertCircle } from 'lucide-react'
import type { Course } from '@/types/course'
import { BAND_COLORS } from '@/types/course'

/** 授業方法のアイコン（グリッドカードの省スペース表示用） */
const TEACHING_METHOD_ICON: Record<string, string> = {
  on_demand: '📹',
  live: '📡',
  seminar: '🏫',
  zemi: '🏫',
}

interface PlannedCourseCardProps {
  course: Course
  hasWarning?: boolean
  hasError?: boolean
  onRemove: (courseId: string) => void
  onOpenDetail: (course: Course) => void
}

/**
 * プランナーグリッド内に配置された科目カード
 */
export function PlannedCourseCard({
  course,
  hasWarning = false,
  hasError = false,
  onRemove,
  onOpenDetail,
}: PlannedCourseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `planned-${course.id}`,
    data: { type: 'planned-course', courseId: course.id },
  })

  const bandColors = BAND_COLORS[course.band]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={clsx(
        'group relative rounded-md border px-2 py-1.5 text-xs cursor-grab active:cursor-grabbing',
        'transition-all duration-100 hover:shadow-md',
        bandColors.bg,
        bandColors.border,
        isDragging && 'opacity-50 shadow-lg z-50',
        hasError && 'ring-1 ring-red-400',
        hasWarning && !hasError && 'ring-1 ring-amber-400',
      )}
      onClick={() => onOpenDetail(course)}
      aria-label={`${course.name}（${course.credits}単位）`}
      {...listeners}
      {...attributes}
    >
      {/* 科目名 */}
      <p className={clsx('font-medium leading-tight truncate pr-4', bandColors.text)}>
        {course.name}
      </p>

      {/* メタ情報 */}
      <div className="mt-0.5 flex items-center gap-1.5 text-gray-500">
        <span>{course.credits}単位</span>
        <span className="text-gray-400">{TEACHING_METHOD_ICON[course.teachingMethod]}</span>
        {hasError && <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />}
        {hasWarning && !hasError && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
      </div>

      {/* 削除ボタン */}
      <button
        className={clsx(
          'absolute right-1 top-1 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
          'text-gray-400 hover:text-red-500 hover:bg-white/80'
        )}
        onClick={e => {
          e.stopPropagation()
          onRemove(course.id)
        }}
        aria-label={`${course.name}を削除`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
