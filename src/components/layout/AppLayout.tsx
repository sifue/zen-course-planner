import { useState } from 'react'
import type { ReactNode } from 'react'
import { BookOpen, LayoutGrid, GraduationCap } from 'lucide-react'
import { clsx } from 'clsx'

interface AppLayoutProps {
  header: ReactNode
  sidebar: ReactNode
  main: ReactNode
  panel: ReactNode
}

type MobileTab = 'sidebar' | 'main' | 'panel'

const MOBILE_TABS: { id: MobileTab; label: string; icon: React.ElementType }[] = [
  { id: 'sidebar', label: '科目一覧', icon: BookOpen },
  { id: 'main',    label: 'グリッド',   icon: LayoutGrid },
  { id: 'panel',   label: '要件チェック', icon: GraduationCap },
]

/**
 * アプリのメインレイアウト
 *
 * PC（lg+）: 左サイドバー | メイン | 右パネル の3ペイン
 * タブレット（md-lg）: 左サイドバー | メイン の2ペイン
 * スマホ（< md）: 下タブバーで3エリアを切り替え
 */
export function AppLayout({ header, sidebar, main, panel }: AppLayoutProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('main')

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* ヘッダー */}
      {header}

      {/* メインコンテンツエリア */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左サイドバー（科目一覧） */}
        <aside
          className={clsx(
            'shrink-0 border-r border-gray-200 bg-white flex-col',
            'w-72 xl:w-80',
            // スマホ: アクティブタブのみ表示
            activeMobileTab === 'sidebar' ? 'flex' : 'hidden',
            // タブレット以上: 常時表示
            'md:flex',
          )}
          aria-label="科目一覧"
        >
          {sidebar}
        </aside>

        {/* メインエリア（プランナーグリッド） */}
        <main
          className={clsx(
            'flex-1 overflow-auto',
            activeMobileTab === 'main' ? 'flex flex-col' : 'hidden',
            'md:flex md:flex-col',
          )}
          aria-label="履修計画グリッド"
        >
          {main}
        </main>

        {/* 右パネル（卒業要件チェック） */}
        <aside
          className={clsx(
            'shrink-0 w-72 xl:w-80 border-l border-gray-200 bg-white flex-col',
            activeMobileTab === 'panel' ? 'flex' : 'hidden',
            // デスクトップ以上: 常時表示
            'lg:flex',
          )}
          aria-label="卒業要件チェック"
        >
          {panel}
        </aside>
      </div>

      {/* モバイル用ボトムタブナビゲーション */}
      <nav
        className="flex shrink-0 border-t border-gray-200 bg-white md:hidden"
        aria-label="モバイルナビゲーション"
      >
        {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveMobileTab(id)}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
              activeMobileTab === id
                ? 'text-zen-600 font-medium'
                : 'text-gray-400 hover:text-gray-600'
            )}
            aria-label={label}
            aria-current={activeMobileTab === id ? 'page' : undefined}
          >
            <Icon className={clsx('h-5 w-5', activeMobileTab === id && 'text-zen-600')} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
