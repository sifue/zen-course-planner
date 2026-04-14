import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { generateSlackbotPrompt } from '@/lib/prompt-generator'
import { importFromMarkdown } from '@/lib/markdown-importer'
import type { CoursePlan, PlannedCourse } from '@/types/plan'
import type { Course } from '@/types/course'
import type { GraduationCheckResult } from '@/types/requirements'

interface PromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: CoursePlan
  courseMap: Record<string, Course>
  graduation: GraduationCheckResult
  onImport: (courses: PlannedCourse[]) => void
}

type Tab = 'prompt' | 'import'

export function PromptModal({ open, onOpenChange, plan, courseMap, graduation, onImport }: PromptModalProps) {
  const [tab, setTab] = useState<Tab>('prompt')
  const [userThoughts, setUserThoughts] = useState('')
  const [copied, setCopied] = useState(false)
  const [aiOutput, setAiOutput] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importPreviewCount, setImportPreviewCount] = useState<number | null>(null)

  const prompt = generateSlackbotPrompt(userThoughts, plan.plannedCourses, courseMap, graduation)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック
    }
  }

  const handleParseAiOutput = () => {
    setImportError(null)
    setImportPreviewCount(null)

    if (!aiOutput.trim()) {
      setImportError('AIの出力を貼り付けてください。')
      return
    }

    const result = importFromMarkdown(aiOutput)
    if (!result.success || !result.plannedCourses) {
      setImportError(result.error ?? 'インポートできる科目が見つかりませんでした。')
      return
    }

    setImportPreviewCount(result.plannedCourses.length)
  }

  const handleImportAiOutput = () => {
    const result = importFromMarkdown(aiOutput)
    if (!result.success || !result.plannedCourses) return
    onImport(result.plannedCourses)
    setAiOutput('')
    setImportPreviewCount(null)
    setImportError(null)
  }

  const handleClose = () => {
    setAiOutput('')
    setImportError(null)
    setImportPreviewCount(null)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Slackbot AIに相談"
      size="xl"
    >
      {/* タブ */}
      <div className="flex border-b border-gray-200 mb-4 -mt-1">
        <button
          onClick={() => setTab('prompt')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'prompt'
              ? 'border-zen-600 text-zen-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          プロンプト生成
        </button>
        <button
          onClick={() => setTab('import')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'import'
              ? 'border-zen-600 text-zen-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          AIの回答をインポート
        </button>
      </div>

      {tab === 'prompt' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            あなたの希望・思考を入力してプロンプトを生成し、ZEN大学のSlackbot AIに貼り付けて相談しましょう。
          </p>

          <div>
            <label htmlFor="user-thoughts" className="block text-sm font-medium text-gray-700 mb-1">
              あなたの希望・思考（任意）
            </label>
            <textarea
              id="user-thoughts"
              value={userThoughts}
              onChange={e => setUserThoughts(e.target.value)}
              placeholder="例: Webエンジニアになりたいです。プログラミング系の科目を中心に履修したい..."
              className="w-full h-20 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-zen-500 focus:ring-1 focus:ring-zen-500"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">生成されたプロンプト</p>
            <textarea
              readOnly
              value={prompt}
              className="w-full h-48 rounded-lg border border-gray-200 p-3 text-xs font-mono text-gray-600 bg-gray-50 resize-none focus:outline-none"
              aria-label="生成されたプロンプト"
            />
          </div>

          <div className="flex items-center justify-between">
            <a
              href="https://zen-student.slack.com/archives/C08GD3UR1EG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zen-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              #times_sifue チャンネルを開く
            </a>
            <Button variant="primary" onClick={handleCopyPrompt}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'コピーしました' : 'プロンプトをコピー'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'import' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Slackbot AIが返したMarkdownテーブルを貼り付けて、科目を履修計画に追加します。
            既存の科目はそのまま残り、AIが提案した科目が追加されます。
          </p>

          <textarea
            value={aiOutput}
            onChange={e => {
              setAiOutput(e.target.value)
              setImportError(null)
              setImportPreviewCount(null)
            }}
            placeholder="AIの出力を貼り付けてください..."
            className="w-full h-48 rounded-lg border border-gray-200 p-3 text-xs font-mono text-gray-700 bg-white resize-none focus:outline-none focus:border-zen-500 focus:ring-1 focus:ring-zen-500"
            aria-label="AIの出力"
          />

          {importError && <Alert variant="error">{importError}</Alert>}
          {importPreviewCount !== null && (
            <Alert variant="success">
              {importPreviewCount}件の科目が見つかりました。「インポート実行」で計画に追加されます。
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              閉じる
            </Button>
            {importPreviewCount !== null ? (
              <Button variant="primary" onClick={handleImportAiOutput}>
                インポート実行
              </Button>
            ) : (
              <Button variant="primary" onClick={handleParseAiOutput} disabled={!aiOutput.trim()}>
                内容を確認
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === 'prompt' && (
        <div className="flex justify-end mt-3">
          <Button variant="secondary" onClick={handleClose}>
            閉じる
          </Button>
        </div>
      )}
    </Modal>
  )
}
