import { ExternalLink, Clock, User, Tag, BookOpen, AlertTriangle, AlertCircle } from 'lucide-react'
import type { Course } from '@/types/course'
import { BAND_LABELS, BAND_COLORS } from '@/types/course'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { clsx } from 'clsx'

interface CourseDetailModalProps {
  course: Course | null
  isPlaced: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  hasWarning?: boolean
  hasError?: boolean
  onAdd: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
  onRemove: (courseId: string) => void
}

/**
 * 科目詳細モーダル（グリッドのカードクリック時に表示）
 */
export function CourseDetailModal({
  course,
  isPlaced,
  open,
  onOpenChange,
  hasWarning = false,
  hasError = false,
  onAdd,
  onRemove,
}: CourseDetailModalProps) {
  if (!course) return null

  const bandColors = BAND_COLORS[course.band]

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={course.name}
      size="md"
    >
      {/* バンドバッジ・基本情報 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', bandColors.bg, bandColors.text)}>
          <BookOpen className="mr-1 h-3 w-3" />
          {BAND_LABELS[course.band]}
        </span>
        <span className="text-sm text-gray-600">{course.credits}単位</span>
        <span className="text-sm text-gray-600">{course.year}年次</span>
        <span className="text-sm text-gray-600">{formatQuarters(course.quarters)}</span>
        {hasError && (
          <span className="inline-flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            前提科目エラー
          </span>
        )}
        {hasWarning && !hasError && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            前提科目警告
          </span>
        )}
      </div>

      {/* 授業方法・教員 */}
      <div className="mb-4 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{formatTeachingMethod(course.teachingMethod)}</span>
        </div>
        {course.instructors.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{course.instructors.join(' / ')}</span>
          </div>
        )}
      </div>

      {/* 概要 */}
      {course.overview && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">概要</p>
          <p className="text-sm text-gray-600 leading-relaxed">{course.overview}</p>
        </div>
      )}

      {/* 前提科目 */}
      {(course.strongPrerequisites.length > 0 || course.recommendedPrerequisites.length > 0) && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1.5">前提科目</p>
          {course.strongPrerequisites.length > 0 && (
            <div className="mb-1.5">
              <p className="text-xs text-gray-500 mb-1">必須</p>
              <div className="flex flex-wrap gap-1">
                {course.strongPrerequisites.map(name => (
                  <Badge key={name} variant="error">{name}</Badge>
                ))}
              </div>
            </div>
          )}
          {course.recommendedPrerequisites.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">推奨</p>
              <div className="flex flex-wrap gap-1">
                {course.recommendedPrerequisites.map(name => (
                  <Badge key={name} variant="warning">{name}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 関連科目 */}
      {course.relatedCourses.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1.5">関連科目</p>
          <div className="flex flex-wrap gap-1">
            {course.relatedCourses.slice(0, 8).map(name => (
              <Badge key={name} variant="default">{name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* タグ */}
      {course.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-start gap-1.5">
            <Tag className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {course.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        {isPlaced ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onRemove(course.id)
              onOpenChange(false)
            }}
            className="flex-1"
          >
            計画から削除
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onAdd(course.id, course.year, (course.quarters[0] as 1 | 2 | 3 | 4) ?? 1)
              onOpenChange(false)
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
          className="inline-flex items-center gap-1.5 text-sm text-zen-600 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          シラバスを見る
        </a>
      </div>
    </Modal>
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
