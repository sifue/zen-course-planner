import { clsx } from 'clsx'

interface ProgressBarProps {
  earned: number
  required: number
  className?: string
}

export function ProgressBar({ earned, required, className }: ProgressBarProps) {
  const percentage = required > 0 ? Math.min((earned / required) * 100, 100) : 0
  const isComplete = earned >= required

  return (
    <div className={clsx('h-1.5 w-full rounded-full bg-gray-200', className)}>
      <div
        className={clsx(
          'h-full rounded-full transition-all duration-300',
          isComplete ? 'bg-emerald-500' : percentage > 70 ? 'bg-amber-400' : 'bg-zen-500'
        )}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={earned}
        aria-valuemin={0}
        aria-valuemax={required}
        aria-label={`${earned}/${required}単位`}
      />
    </div>
  )
}
