import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { CoursePlan } from '@/types/plan'

interface SavePlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: CoursePlan
  isSaveAs?: boolean
  onSave: (name: string) => void
}

export function SavePlanModal({ open, onOpenChange, plan, isSaveAs = false, onSave }: SavePlanModalProps) {
  const [name, setName] = useState(
    isSaveAs ? `${plan.name} のコピー` : plan.name
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isSaveAs ? '別名で保存' : '計画を保存'}
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 mb-1">
            計画名
          </label>
          <input
            id="plan-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: 情報系4年計画"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-zen-500 focus:outline-none focus:ring-1 focus:ring-zen-500"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && name.trim()) onSave(name.trim())
            }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={() => onSave(name.trim())}
            disabled={!name.trim()}
          >
            保存
          </Button>
        </div>
      </div>
    </Modal>
  )
}
