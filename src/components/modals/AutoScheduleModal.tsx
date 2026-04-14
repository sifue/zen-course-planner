import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { autoSchedule } from '@/lib/auto-scheduler'
import type { Course } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'
import type { CurriculumTreeType } from '@/types/filters'

interface AutoScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  onApply: (plannedCourses: PlannedCourse[]) => void
}

const CURRICULUM_OPTIONS: { value: CurriculumTreeType; label: string; description: string }[] = [
  {
    value: 'information',
    label: '情報',
    description: 'Web開発・プログラミング・コンピュータサイエンスを中心に学ぶルートです。',
  },
  {
    value: 'data_science',
    label: 'データサイエンス',
    description: '統計・機械学習・データ分析を中心に学ぶルートです。',
  },
  {
    value: 'economy_markets',
    label: '経済・マーケット',
    description: '経済学・マーケティング・起業を中心に学ぶルートです。',
  },
]

export function AutoScheduleModal({ open, onOpenChange, courses, onApply }: AutoScheduleModalProps) {
  const [selectedTree, setSelectedTree] = useState<CurriculumTreeType>('information')
  const [preview, setPreview] = useState<PlannedCourse[] | null>(null)

  const handlePreview = () => {
    const result = autoSchedule(selectedTree, courses, 4)
    setPreview(result)
  }

  const handleApply = () => {
    if (!preview) return
    onApply(preview)
    setPreview(null)
    onOpenChange(false)
  }

  const handleClose = () => {
    setPreview(null)
    onOpenChange(false)
  }

  const previewStats = preview
    ? (() => {
        const courseMap: Record<string, Course> = {}
        for (const c of courses) courseMap[c.id] = c
        const totalCredits = preview.reduce((sum, pc) => sum + (courseMap[pc.courseId]?.credits ?? 0), 0)
        // 年次別科目数・単位数
        const byYear: Record<number, { count: number; credits: number }> = {}
        for (const pc of preview) {
          const cr = courseMap[pc.courseId]?.credits ?? 0
          if (!byYear[pc.year]) byYear[pc.year] = { count: 0, credits: 0 }
          byYear[pc.year].count++
          byYear[pc.year].credits += cr
        }
        return { totalCredits, byYear }
      })()
    : null

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="カリキュラムツリーから自動配置"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          カリキュラムツリーのルートを選択すると、前提科目・開講Qの制約を考慮しながら、
          卒業可能な履修計画を自動生成します。
        </p>

        <Alert variant="warning">
          自動配置すると現在の計画がすべて上書きされます。必要であれば先に保存してください。
        </Alert>

        {/* ルート選択 */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">カリキュラムルート</p>
          <div className="grid gap-2">
            {CURRICULUM_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedTree === opt.value
                    ? 'border-zen-500 bg-zen-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="curriculum-tree"
                  value={opt.value}
                  checked={selectedTree === opt.value}
                  onChange={() => {
                    setSelectedTree(opt.value)
                    setPreview(null)
                  }}
                  className="mt-0.5 h-4 w-4 text-zen-600 focus:ring-zen-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* プレビュー結果 */}
        {preview && previewStats && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
            <p className="text-sm font-medium text-blue-800">
              プレビュー: <strong>{preview.length}科目</strong>（合計約 <strong>{previewStats.totalCredits}単位</strong>）
            </p>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {Object.entries(previewStats.byYear).map(([year, { count, credits }]) => (
                <div key={year} className="rounded bg-white border border-blue-100 px-2 py-1.5 text-center">
                  <p className="font-semibold text-blue-700">{year}年次</p>
                  <p className="text-gray-600">{count}科目</p>
                  <p className="text-gray-400">{credits}単位</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600">
              適用すると現在の計画が上書きされます。
            </p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            キャンセル
          </Button>
          {preview ? (
            <Button variant="primary" onClick={handleApply}>
              <Zap className="h-4 w-4" />
              この計画を適用
            </Button>
          ) : (
            <Button variant="primary" onClick={handlePreview}>
              <Zap className="h-4 w-4" />
              自動配置を実行
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
