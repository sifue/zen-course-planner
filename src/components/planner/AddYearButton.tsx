import { Plus } from 'lucide-react'
import { clsx } from 'clsx'

interface AddYearButtonProps {
  currentMaxYears: number
  onAddYear: () => void
}

export function AddYearButton({ currentMaxYears, onAddYear }: AddYearButtonProps) {
  if (currentMaxYears >= 8) return null

  return (
    <div className="shrink-0 flex flex-col w-16 items-center justify-center">
      <button
        onClick={onAddYear}
        className={clsx(
          'flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300',
          'px-4 py-8 text-gray-400 transition-colors',
          'hover:border-zen-400 hover:text-zen-500 hover:bg-zen-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-500'
        )}
        aria-label={`${currentMaxYears + 1}年次を追加`}
      >
        <Plus className="h-5 w-5" />
        <span className="text-xs whitespace-nowrap">{currentMaxYears + 1}年次を追加</span>
      </button>
    </div>
  )
}
