import { Search, X, Filter } from 'lucide-react'
import * as Toggle from '@radix-ui/react-toggle'
import { clsx } from 'clsx'
import type { UseFiltersReturn } from '@/hooks/useFilters'
import { Button } from '@/components/ui/Button'

interface CourseFilterProps {
  filters: UseFiltersReturn
  totalCount: number
  filteredCount: number
}

const YEAR_OPTIONS: { value: 1 | 2 | 3 | 4; label: string }[] = [
  { value: 1, label: '1年次' },
  { value: 2, label: '2年次' },
  { value: 3, label: '3年次' },
  { value: 4, label: '4年次' },
]

const CATEGORY_OPTIONS = [
  { value: 'introduction' as const, label: '導入', color: 'bg-blue-100 text-blue-800 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600' },
  { value: 'foundation' as const, label: '基礎', color: 'bg-green-100 text-green-800 data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600' },
  { value: 'foundation_literacy' as const, label: '基盤リテラシー', color: 'bg-violet-100 text-violet-800 data-[state=on]:bg-violet-600 data-[state=on]:text-white data-[state=on]:border-violet-600' },
  { value: 'multilingual_information_understanding' as const, label: '多言語情報理解', color: 'bg-cyan-100 text-cyan-800 data-[state=on]:bg-cyan-600 data-[state=on]:text-white data-[state=on]:border-cyan-600' },
  { value: 'world_understanding' as const, label: '世界理解', color: 'bg-amber-100 text-amber-800 data-[state=on]:bg-amber-600 data-[state=on]:text-white data-[state=on]:border-amber-600' },
  { value: 'social_connection' as const, label: '社会接続', color: 'bg-orange-100 text-orange-800 data-[state=on]:bg-orange-600 data-[state=on]:text-white data-[state=on]:border-orange-600' },
  { value: 'graduation_project' as const, label: '卒業プロジェクト', color: 'bg-red-100 text-red-800 data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:border-red-600' },
  { value: 'free' as const, label: '自由', color: 'bg-gray-100 text-gray-600 data-[state=on]:bg-gray-500 data-[state=on]:text-white data-[state=on]:border-gray-500' },
]

export function CourseFilter({ filters, totalCount, filteredCount }: CourseFilterProps) {
  const hasActiveFilters = filters.activeFilterCount > 0

  return (
    <div className="space-y-3 px-3 py-3 border-b border-gray-100">
      {/* テキスト検索 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="科目名・タグで検索..."
          value={filters.filters.searchText}
          onChange={e => filters.setSearchText(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-8 text-sm focus:border-zen-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zen-500"
          aria-label="科目を検索"
        />
        {filters.filters.searchText && (
          <button
            onClick={() => filters.setSearchText('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
            aria-label="検索をクリア"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 年次フィルター */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">履修想定年次</p>
        <div className="flex flex-wrap gap-1.5">
          {YEAR_OPTIONS.map(({ value, label }) => (
            <Toggle.Root
              key={value}
              pressed={filters.filters.years.has(value)}
              onPressedChange={() => filters.toggleYear(value)}
              className={clsx(
                'filter-toggle border',
                filters.filters.years.has(value)
                  ? 'bg-zen-600 text-white border-zen-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-zen-400 hover:text-zen-600'
              )}
              aria-label={`${label}でフィルター`}
            >
              {label}
            </Toggle.Root>
          ))}
        </div>
      </div>

      {/* 分類フィルター */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">分類</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map(({ value, label, color }) => (
            <Toggle.Root
              key={value}
              pressed={filters.filters.categories.has(value)}
              onPressedChange={() => filters.toggleCategory(value)}
              className={clsx('filter-toggle border', color)}
              aria-label={`${label}でフィルター`}
            >
              {label}
            </Toggle.Root>
          ))}
        </div>
      </div>

      {/* 授業方法フィルター */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">授業方法</p>
        <div className="flex flex-wrap gap-1.5">
          <Toggle.Root
            pressed={filters.filters.teachingMethods.has('on_demand')}
            onPressedChange={() => filters.toggleTeachingMethods(['on_demand'])}
            className={clsx(
              'filter-toggle border',
              filters.filters.teachingMethods.has('on_demand')
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-sky-400 hover:text-sky-600'
            )}
            aria-label="オンデマンド科目でフィルター"
          >
            📹 オンデマンド
          </Toggle.Root>
          <Toggle.Root
            pressed={filters.filters.teachingMethods.has('live')}
            onPressedChange={() => filters.toggleTeachingMethods(['live'])}
            className={clsx(
              'filter-toggle border',
              filters.filters.teachingMethods.has('live')
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-rose-400 hover:text-rose-600'
            )}
            aria-label="ライブ授業でフィルター"
          >
            📡 ライブ授業
          </Toggle.Root>
          <Toggle.Root
            pressed={filters.filters.teachingMethods.has('seminar') && filters.filters.teachingMethods.has('zemi')}
            onPressedChange={() => filters.toggleTeachingMethods(['seminar', 'zemi'])}
            className={clsx(
              'filter-toggle border',
              filters.filters.teachingMethods.has('seminar') || filters.filters.teachingMethods.has('zemi')
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-600'
            )}
            aria-label="ゼミ・演習でフィルター"
          >
            🏫 ゼミ・演習
          </Toggle.Root>
        </div>
      </div>

      {/* 未配置のみ */}
      <div className="flex items-center justify-between">
        <Toggle.Root
          pressed={filters.filters.showUnplannedOnly}
          onPressedChange={filters.toggleShowUnplannedOnly}
          className={clsx(
            'filter-toggle border text-xs',
            filters.filters.showUnplannedOnly
              ? 'bg-zen-600 text-white border-zen-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-zen-400'
          )}
          aria-label="未配置の科目のみ表示"
        >
          <Filter className="h-3 w-3" />
          未配置のみ
        </Toggle.Root>

        {/* フィルターリセットとカウント */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {filteredCount}/{totalCount}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={filters.resetFilters}
              className="h-6 px-2 text-xs"
              aria-label="フィルターをリセット"
            >
              <X className="h-3 w-3" />
              リセット
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
