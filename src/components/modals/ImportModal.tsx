import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { importFromMarkdown } from '@/lib/markdown-importer'
import type { CoursePlan } from '@/types/plan'

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (plan: Partial<CoursePlan>) => void
  currentPlanName: string
}

export function ImportModal({ open, onOpenChange, onImport, currentPlanName }: ImportModalProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ planName?: string; count: number } | null>(null)

  const handleParse = () => {
    setError(null)
    setPreview(null)

    if (!text.trim()) {
      setError('Markdownテキストを貼り付けてください。')
      return
    }

    const result = importFromMarkdown(text)
    if (!result.success) {
      setError(result.error ?? 'インポートに失敗しました。')
      return
    }

    setPreview({
      planName: result.planName,
      count: result.plannedCourses?.length ?? 0,
    })
  }

  const handleImport = () => {
    const result = importFromMarkdown(text)
    if (!result.success || !result.plannedCourses) return

    onImport({
      name: result.planName ?? currentPlanName,
      plannedCourses: result.plannedCourses,
    })
    setText('')
    setPreview(null)
    setError(null)
  }

  const handleClose = () => {
    setText('')
    setPreview(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Markdownからインポート"
      size="xl"
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          このアプリでエクスポートしたMarkdown、またはSlackbot AIが出力したMarkdownテーブルを貼り付けてください。
        </p>

        <Alert variant="warning">
          インポートすると現在の計画が上書きされます。必要であれば先に保存してください。
        </Alert>

        <textarea
          value={text}
          onChange={e => {
            setText(e.target.value)
            setPreview(null)
            setError(null)
          }}
          placeholder="Markdownを貼り付けてください..."
          className="w-full h-48 rounded-lg border border-gray-200 p-3 text-xs font-mono text-gray-700 bg-white resize-none focus:outline-none focus:border-zen-500 focus:ring-1 focus:ring-zen-500"
          aria-label="インポートするMarkdown"
        />

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {preview && (
          <Alert variant="success">
            {preview.count}件の科目が見つかりました。
            {preview.planName && <span>（計画名: <strong>{preview.planName}</strong>）</span>}
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            キャンセル
          </Button>
          {preview ? (
            <Button variant="primary" onClick={handleImport}>
              インポート実行
            </Button>
          ) : (
            <Button variant="primary" onClick={handleParse} disabled={!text.trim()}>
              内容を確認
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
