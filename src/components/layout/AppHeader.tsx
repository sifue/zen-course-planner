import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  Upload,
  Save,
  FolderOpen,
  HelpCircle,
  RotateCcw,
  ExternalLink,
  Bug,
  MessageSquare,
  Zap,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface AppHeaderProps {
  planName: string
  isSaved?: boolean
  onSave: () => void
  onSaveAs: () => void
  onLoad: () => void
  onExport: () => void
  onImport: () => void
  onReset: () => void
  onPrompt: () => void
  onAutoSchedule: () => void
  onRename?: (name: string) => void
}

export function AppHeader({
  planName,
  isSaved = false,
  onSave,
  onSaveAs,
  onLoad,
  onExport,
  onImport,
  onReset,
  onPrompt,
  onAutoSchedule,
  onRename,
}: AppHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEditing = () => {
    if (!onRename) return
    setEditedName(planName)
    setIsEditingName(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = () => {
    const trimmed = editedName.trim()
    if (trimmed && trimmed !== planName) {
      onRename?.(trimmed)
    }
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setIsEditingName(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* ロゴ・タイトル */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zen-600 text-white font-bold text-sm">
            Z
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 leading-tight truncate hidden sm:block">
              ZEN大学履修計画プランナー
            </h1>
            <div className="flex items-center gap-1.5">
              {isEditingName ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={handleKeyDown}
                  className="text-xs text-gray-700 border border-zen-400 rounded px-1 py-0.5 w-32 focus:outline-none focus:ring-1 focus:ring-zen-500"
                  maxLength={40}
                  aria-label="プラン名を編集"
                />
              ) : (
                <button
                  onClick={startEditing}
                  className={clsx(
                    'text-xs text-gray-500 truncate max-w-24 sm:max-w-36',
                    onRename && 'hover:text-zen-600 hover:underline cursor-pointer'
                  )}
                  title={onRename ? 'クリックしてプラン名を編集' : undefined}
                  aria-label={onRename ? `プラン名: ${planName}（クリックで編集）` : `プラン名: ${planName}`}
                >
                  {planName}
                </button>
              )}
              {!isEditingName && onRename && (
                <button
                  onClick={startEditing}
                  className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="プラン名を編集"
                >
                  <Pencil className="h-2.5 w-2.5" />
                </button>
              )}
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 text-xs text-emerald-600 transition-opacity duration-300',
                  isSaved ? 'opacity-100' : 'opacity-0'
                )}
                aria-live="polite"
                aria-label={isSaved ? '保存済み' : ''}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="hidden sm:inline">保存済み</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* 操作ボタン群 */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* 保存 */}
          <Button variant="primary" size="sm" onClick={onSave} aria-label="計画を保存">
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">保存</span>
          </Button>

          {/* 別名保存 */}
          <Button variant="secondary" size="sm" onClick={onSaveAs} aria-label="別名で保存">
            <Save className="h-3.5 w-3.5" />
            <span className="hidden md:inline">別名保存</span>
          </Button>

          {/* 読み込み */}
          <Button variant="secondary" size="sm" onClick={onLoad} aria-label="計画を読み込む">
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden md:inline">読み込み</span>
          </Button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* エクスポート */}
          <Button variant="ghost" size="sm" onClick={onExport} aria-label="Markdownでエクスポート">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">エクスポート</span>
          </Button>

          {/* インポート */}
          <Button variant="ghost" size="sm" onClick={onImport} aria-label="Markdownからインポート">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">インポート</span>
          </Button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* AIに相談 */}
          <Button variant="ghost" size="sm" onClick={onPrompt} aria-label="Slackbot AIに相談">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">AIに相談</span>
          </Button>

          {/* 自動配置 */}
          <Button variant="ghost" size="sm" onClick={onAutoSchedule} aria-label="自動配置">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">自動配置</span>
          </Button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* リセット */}
          <Button variant="ghost" size="sm" onClick={onReset} aria-label="計画をリセット">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* バグ報告 */}
          <a
            href="https://github.com/sifue/zen-course-planner/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 h-7 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="バグ報告"
          >
            <Bug className="h-3.5 w-3.5" />
          </a>

          {/* ヘルプ */}
          <Link
            to="/help"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 h-7 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="ヘルプ"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Link>

          {/* シラバスサイトリンク */}
          <a
            href="https://syllabus.zen.ac.jp"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1 rounded-lg px-2.5 h-7 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>シラバス</span>
          </a>
        </div>
      </div>
    </header>
  )
}
