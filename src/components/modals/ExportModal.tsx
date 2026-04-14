import { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { exportToMarkdown } from '@/lib/markdown-exporter'
import type { CoursePlan } from '@/types/plan'
import type { Course } from '@/types/course'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: CoursePlan
  courseMap: Record<string, Course>
}

export function ExportModal({ open, onOpenChange, plan, courseMap }: ExportModalProps) {
  const [copied, setCopied] = useState(false)
  const markdown = exportToMarkdown(plan, courseMap)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボードが使えない場合はフォールバック
    }
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plan.name}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Markdownでエクスポート"
      size="xl"
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          以下のMarkdownをコピーまたはダウンロードしてください。
          このデータは再インポートも可能です。
        </p>

        <textarea
          readOnly
          value={markdown}
          className="w-full h-64 rounded-lg border border-gray-200 p-3 text-xs font-mono text-gray-600 bg-gray-50 resize-none focus:outline-none"
          aria-label="エクスポートデータ"
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            ダウンロード
          </Button>
          <Button variant="primary" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'コピーしました' : 'コピー'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
