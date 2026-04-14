import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ResetConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ResetConfirmModal({ open, onOpenChange, onConfirm }: ResetConfirmModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="計画をリセット"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-medium">この操作は元に戻せません</p>
            <p className="mt-1">
              現在の履修計画がすべてクリアされます。
              必要であれば先に保存してください。
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            リセットする
          </Button>
        </div>
      </div>
    </Modal>
  )
}
