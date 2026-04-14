import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
}

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const STYLES = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

const ICON_STYLES = {
  info: 'text-blue-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const Icon = ICONS[variant]

  return (
    <div
      role="alert"
      className={clsx(
        'flex gap-3 rounded-lg border p-3 text-sm',
        STYLES[variant],
        className
      )}
      {...props}
    >
      <Icon className={clsx('mt-0.5 h-4 w-4 shrink-0', ICON_STYLES[variant])} />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-1 opacity-90' : ''}>{children}</div>
      </div>
    </div>
  )
}
