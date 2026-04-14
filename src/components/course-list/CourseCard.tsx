import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import { GripVertical, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import type { Course } from '@/types/course'
import { Badge } from '@/components/ui/Badge'

interface CourseCardProps {
  course: Course
  isPlaced: boolean
  /** 配置済みの場合の年次・Q情報 */
  placement?: { year: number; quarter: number }
  hasWarning?: boolean
  hasError?: boolean
  onClick: (course: Course) => void
  /** モバイル用: クリックで配置ダイアログを開く */
  onQuickAdd?: (course: Course) => void
}

/**
 * 科目一覧に表示するドラッグ可能な科目カード
 */
export function CourseCard({
  course,
  isPlaced,
  placement,
  hasWarning = false,
  hasError = false,
  onClick,
  onQuickAdd,
}: CourseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `course-${course.id}`,
    data: { type: 'course', courseId: course.id },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'course-card group relative flex gap-2 p-2.5 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg z-50',
        isPlaced && 'opacity-60',
        hasError && 'ring-1 ring-red-300',
        hasWarning && !hasError && 'ring-1 ring-amber-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-500 focus-visible:ring-offset-1'
      )}
      role="button"
      tabIndex={0}
      onClick={() => onClick(course)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(course) } }}
      aria-label={`${course.name}（${course.credits}単位）`}
    >
      {/* ドラッグハンドル */}
      <div
        {...listeners}
        {...attributes}
        className="shrink-0 flex items-start pt-0.5 text-gray-300 hover:text-gray-500 touch-none"
        aria-label="ドラッグして配置"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* 科目名 */}
        <div className="flex items-start justify-between gap-1">
          <p className={clsx(
            'text-sm font-medium leading-tight',
            isPlaced ? 'text-gray-400 line-through' : 'text-gray-800'
          )}>
            {course.name}
          </p>
          {/* 配置済みアイコン */}
          {isPlaced && (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-zen-500 mt-0.5" />
          )}
          {/* 前提科目警告アイコン */}
          {hasError && (
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
          )}
          {hasWarning && !hasError && (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
          )}
        </div>

        {/* メタ情報 */}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {/* バンドバッジ */}
          <Badge variant={course.band as Parameters<typeof Badge>[0]['variant']}>
            {getBandShortLabel(course)}
          </Badge>

          {/* 単位数・年次・Q */}
          <span className="text-xs text-gray-400">
            {course.credits}単位
          </span>
          <span className="text-xs text-gray-400">
            {course.year}年次
          </span>
          <span className="text-xs text-gray-400">
            {formatQuarters(course.quarters)}
          </span>

          {/* 配置済み年次・Q表示 */}
          {isPlaced && placement && (
            <span className="text-xs text-zen-600 font-medium">
              → {placement.year}年{placement.quarter}Q
            </span>
          )}
        </div>
      </div>

      {/* クイック追加ボタン（モバイル: 常時表示、デスクトップ: ホバー時表示） */}
      {onQuickAdd && !isPlaced && (
        <button
          className="absolute right-2 bottom-2 flex items-center justify-center rounded-full bg-zen-600 text-white p-1 shadow-sm hover:bg-zen-700 transition-all duration-150 sm:opacity-0 sm:group-hover:opacity-100"
          onClick={e => {
            e.stopPropagation()
            onQuickAdd(course)
          }}
          aria-label={`${course.name}を計画に追加`}
        >
          <span className="block h-4 w-4 text-center text-xs leading-4 font-bold">+</span>
        </button>
      )}
    </div>
  )
}

function getBandShortLabel(course: Course): string {
  if (course.band === 'expansion' && course.expansionTrack) {
    const shortLabels: Record<string, string> = {
      foundation_literacy: '基盤',
      multilingual_information_understanding: '多言語',
      world_understanding: '世界',
      social_connection: '社会接続',
    }
    return shortLabels[course.expansionTrack] || '展開'
  }
  const labels: Record<string, string> = {
    introduction: '導入',
    foundation: '基礎',
    expansion: '展開',
    graduation_project: '卒プロ',
    free: '自由',
  }
  return labels[course.band] || course.band
}

function formatQuarters(quarters: number[]): string {
  if (quarters.length === 0) return ''
  if (quarters.length === 4) return '通期'
  return quarters.map(q => `${q}Q`).join('/')
}
