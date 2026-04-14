import { FolderOpen, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { UseStorageReturn } from '@/hooks/useStorage'

interface LoadPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storage: UseStorageReturn
  onLoad: (planId: string) => void
}

export function LoadPlanModal({ open, onOpenChange, storage, onLoad }: LoadPlanModalProps) {
  const plans = storage.getAllPlans()

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="履修計画を読み込む"
      size="md"
    >
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <FolderOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">保存された計画がありません</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {plans.map(plan => (
              <li key={plan.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{plan.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(plan.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onLoad(plan.id)}
                  >
                    読み込む
                  </Button>
                  <button
                    onClick={() => storage.deletePlan(plan.id)}
                    className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`${plan.name}を削除`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </div>
      </div>
    </Modal>
  )
}
