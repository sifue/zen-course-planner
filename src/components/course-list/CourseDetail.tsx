import { ExternalLink, X, Clock, User, Tag } from 'lucide-react'
import type { Course } from '@/types/course'
import { BAND_LABELS, BAND_COLORS } from '@/types/course'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface CourseDetailProps {
  course: Course | null
  isPlaced: boolean
  onClose: () => void
  onAdd: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  onRemove: (courseId: string) => void
  /** + ボタン押下時と同様のクイック追加ダイアログを開くコールバック */
  onQuickAdd?: (course: Course) => void
}

/**
 * 科目詳細パネル（クリック時に表示）
 */
export function CourseDetail({ course, isPlaced, onClose, onAdd, onRemove, onQuickAdd }: CourseDetailProps) {
  if (!course) return null

  const bandColors = BAND_COLORS[course.band]

  return (
    <div className="border-t border-gray-200 bg-white flex flex-col h-64 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {course.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', bandColors.bg, bandColors.text)}>
              {BAND_LABELS[course.band]}
            </span>
            <span className="text-xs text-gray-500">{course.credits}単位</span>
            <span className="text-xs text-gray-500">{course.year}年次</span>
            <span className="text-xs text-gray-500">{formatQuarters(course.quarters)}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="詳細を閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* 概要 */}
        {course.overview && (
          <p className="text-xs text-gray-600 leading-relaxed">{course.overview}</p>
        )}

        {/* 教員 */}
        {course.instructors.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="h-3 w-3 shrink-0" />
            <span>{course.instructors.join(' / ')}</span>
          </div>
        )}

        {/* 授業方法 */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{formatTeachingMethod(course.teachingMethod)}</span>
        </div>

        {/* 前提科目 */}
        {course.recommendedPrerequisites.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">推奨前提科目</p>
            <div className="flex flex-wrap gap-1">
              {course.recommendedPrerequisites.slice(0, 5).map(name => (
                <Badge key={name} variant="warning">{name}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* タグ */}
        {course.tags.length > 0 && (
          <div className="flex items-start gap-1">
            <Tag className="h-3 w-3 shrink-0 mt-0.5 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 6).map(tag => (
                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="px-3 pb-2 pt-1 flex items-center gap-2 border-t border-gray-100">
        {isPlaced ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(course.id)}
            className="flex-1"
          >
            計画から削除
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (onQuickAdd) {
                onQuickAdd(course)
              } else {
                onAdd(course.id, course.year, (course.quarters[0] as 1 | 2 | 3 | 4) ?? 1)
              }
            }}
            className="flex-1"
          >
            計画に追加
          </Button>
        )}
        <a
          href={course.syllabusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zen-600 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          シラバス
        </a>
      </div>
    </div>
  )
}

function formatQuarters(quarters: number[]): string {
  if (quarters.length === 0) return ''
  if (quarters.length === 4) return '通期'
  return quarters.map(q => `${q}Q`).join('/')
}

function formatTeachingMethod(method: string): string {
  const map: Record<string, string> = {
    on_demand: 'オンデマンド科目',
    seminar: '演習科目',
    zemi: 'ゼミ',
    live: 'ライブ映像科目',
  }
  return map[method] || method
}
