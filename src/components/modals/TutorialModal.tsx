import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, LayoutGrid, CheckSquare } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

interface TutorialModalProps {
  open: boolean
  onComplete: () => void
}

const STEPS = [
  {
    icon: GraduationCap,
    title: 'ZEN大学履修計画プランナーへようこそ',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          このアプリはZEN大学の4年間の履修計画を立てるための<strong>非公式</strong>ツールです。
          科目の絞り込み・ドラッグ＆ドロップでの配置・卒業要件チェックなどの機能を提供します。
        </p>
        <Alert variant="warning" title="ご注意ください">
          このアプリは個人が作成した非公式ツールです。履修計画の最終確認は必ずZEN大学の
          <a href="https://syllabus.zen.ac.jp" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline mx-1">
            公式シラバスサイト
          </a>
          や指導教員にご確認ください。
        </Alert>
      </div>
    ),
  },
  {
    icon: LayoutGrid,
    title: '使い方',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">1</div>
          <p><strong>科目一覧</strong>（左側）から履修したい科目を探して、<strong>グリッド</strong>（中央）の年次・クォーターにドラッグ＆ドロップします。</p>
        </div>
        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">2</div>
          <p>年次・分類・タグでワンクリック絞り込みができます。</p>
        </div>
        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">3</div>
          <p><strong>右側のパネル</strong>でリアルタイムに卒業要件の充足状況を確認できます。</p>
        </div>
        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">4</div>
          <p>計画はブラウザに自動保存されます。Markdownとしてエクスポートも可能です。</p>
        </div>
      </div>
    ),
  },
  {
    icon: CheckSquare,
    title: '利用規約への同意',
    content: (
      <div className="space-y-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto">
          <p className="font-medium text-gray-800">利用規約 概要</p>
          <p>・このアプリはZEN大学の非公式ツールです。</p>
          <p>・履修計画の最終的な確認・判断・責任は利用者ご本人にあります。</p>
          <p>・アプリの利用による不利益（単位不足・卒業要件未達等）について、作者は一切の責任を負いません。</p>
          <p>・データはブラウザのローカルストレージにのみ保存され、外部サーバーには送信されません。</p>
          <p>・シラバスデータは2026年4月14日時点のものです。内容が変更されている場合があります。</p>
          <p className="font-medium text-gray-800 pt-2">プライバシーポリシー概要</p>
          <p>・個人情報の収集は行いません。</p>
          <p>・アクセス解析ツールは使用していません。</p>
          <p className="pt-1">
            詳細は
            <Link to="/terms" target="_blank" className="text-zen-600 hover:underline mx-1">利用規約</Link>
            および
            <Link to="/privacy" target="_blank" className="text-zen-600 hover:underline mx-1">プライバシーポリシー</Link>
            をご確認ください。
          </p>
        </div>
      </div>
    ),
  },
]

export function TutorialModal({ open, onComplete }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  const [agreed, setAgreed] = useState(false)

  const isLast = step === STEPS.length - 1
  const currentStep = STEPS[step]
  const Icon = currentStep.icon

  return (
    <Modal
      open={open}
      onOpenChange={() => {}}
      title=""
      size="lg"
    >
      <div className="space-y-4">
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-zen-600' : i < step ? 'w-2 bg-zen-300' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>

        {/* アイコンとタイトル */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zen-100">
            <Icon className="h-6 w-6 text-zen-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{currentStep.title}</h2>
        </div>

        {/* コンテンツ */}
        <div>{currentStep.content}</div>

        {/* 同意チェック（最終ステップ） */}
        {isLast && (
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-zen-600 focus:ring-zen-500"
            />
            <span className="text-sm text-gray-700">
              利用規約・プライバシーポリシーに同意し、このアプリを自己責任で利用することに同意します。
            </span>
          </label>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            戻る
          </Button>

          {isLast ? (
            <Button
              variant="primary"
              onClick={onComplete}
              disabled={!agreed}
            >
              始める
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
            >
              次へ
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
