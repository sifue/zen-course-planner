import { CheckCircle2, XCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { ProgressBar } from './ProgressBar'

interface RequirementRowProps {
  label: string
  earned: number
  required: number
  ok: boolean
  /** サブ要件（展開可能な詳細） */
  children?: React.ReactNode
  indent?: boolean
}

export function RequirementRow({
  label,
  earned,
  required,
  ok,
  children,
  indent = false,
}: RequirementRowProps) {
  return (
    <div className={clsx('space-y-1', indent && 'ml-4 border-l border-gray-100 pl-3')}>
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
        ) : (
          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
        )}
        <span className={clsx(
          'flex-1 text-xs',
          ok ? 'text-gray-600' : 'text-gray-800 font-medium'
        )}>
          {label}
        </span>
        <span className={clsx(
          'text-xs font-mono shrink-0',
          ok ? 'text-emerald-600' : earned > 0 ? 'text-amber-600' : 'text-red-500'
        )}>
          {earned}/{required}
        </span>
      </div>

      <ProgressBar earned={earned} required={required} />

      {children && (
        <div className="mt-1.5 space-y-1.5">{children}</div>
      )}
    </div>
  )
}
