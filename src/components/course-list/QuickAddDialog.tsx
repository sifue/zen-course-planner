import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import type { Course } from '@/types/course'

interface QuickAddDialogProps {
  course: Course | null
  open: boolean
  onOpenChange: (open: boolean) => void
  maxYears: number
  onAdd: (courseId: string, year: number, quarter: 1 | 2 | 3 | 4) => void
}

/**
 * クイック追加ダイアログ（+ ボタン押下時に年次とQを選ばせる）
 *
 * ドラッグが難しいモバイル環境での科目追加を補助する。
 */
export function QuickAddDialog({ course, open, onOpenChange, maxYears, onAdd }: QuickAddDialogProps) {
  if (!course) return null

  const quarters: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4]
  const years = Array.from({ length: Math.min(maxYears, 8) }, (_, i) => i + 1)

  const isQuarterAvailable = (q: 1 | 2 | 3 | 4): boolean => {
    if (course.quarters.length === 0) return true
    return course.quarters.includes(q)
  }

  const handleSelect = (year: number, quarter: 1 | 2 | 3 | 4) => {
    onAdd(course.id, year, quarter)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={clsx(
            'fixed left-[50%] top-[50%] z-50 w-[min(92vw,360px)] translate-x-[-50%] translate-y-[-50%]',
            'rounded-xl bg-white shadow-xl max-h-[85vh] overflow-y-auto',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          {/* ヘッダー */}
          <div className="flex items-start justify-between border-b px-4 py-3">
            <div className="min-w-0 pr-2">
              <Dialog.Title className="text-sm font-semibold text-gray-900 leading-tight">
                {course.name}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-gray-500">
                {course.credits}単位 · {course.year}年次推奨 · {formatQuarters(course.quarters)}開講
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-500"
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* 年次×Q選択グリッド */}
          <div className="p-4">
            <p className="mb-2 text-xs font-medium text-gray-500">追加する年次とクォーターを選択</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="w-14 pb-1.5 text-left text-gray-400 font-normal pl-1"></th>
                    {quarters.map(q => (
                      <th key={q} className="pb-1.5 text-center text-gray-400 font-normal">
                        {q}Q
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {years.map(year => (
                    <tr key={year}>
                      <td className="py-0.5 pr-2 pl-1">
                        <span className={clsx(
                          'text-xs font-medium',
                          year === course.year ? 'text-zen-700' : 'text-gray-400'
                        )}>
                          {year}年次
                          {year === course.year && (
                            <span className="ml-0.5 text-[9px] text-zen-500">推奨</span>
                          )}
                        </span>
                      </td>
                      {quarters.map(q => {
                        const available = isQuarterAvailable(q)
                        const isRecommended = year === course.year && q === (course.quarters[0] as 1 | 2 | 3 | 4)
                        return (
                          <td key={q} className="py-0.5 px-0.5 text-center">
                            <button
                              onClick={() => handleSelect(year, q)}
                              disabled={!available}
                              className={clsx(
                                'h-9 w-full rounded-lg border text-xs font-medium transition-colors',
                                available
                                  ? isRecommended
                                    ? 'border-zen-400 bg-zen-50 text-zen-700 hover:bg-zen-100 hover:border-zen-500'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-zen-50 hover:border-zen-400 hover:text-zen-700'
                                  : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              )}
                              aria-label={`${year}年次${q}Qに追加${!available ? '（この時期には開講なし）' : ''}`}
                              aria-disabled={!available}
                            >
                              {available ? '追加' : '—'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function formatQuarters(quarters: number[]): string {
  if (quarters.length === 0) return '通年'
  if (quarters.length === 4) return '通期'
  return quarters.map(q => `${q}Q`).join('/')
}
