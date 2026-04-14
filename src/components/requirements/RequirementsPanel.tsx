import { Link } from 'react-router-dom'
import { GraduationCap, TrendingUp, ChevronDown } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'
import type { GraduationCheckResult, PromotionCheckResult } from '@/types/requirements'
import { FOUNDATION_GROUP_LABELS } from '@/types/course'
import { RequirementRow } from './RequirementRow'
import { Alert } from '@/components/ui/Alert'

interface RequirementsPanelProps {
  graduation: GraduationCheckResult
  promotion: PromotionCheckResult
  totalPlannedCourses: number
}

export function RequirementsPanel({
  graduation,
  promotion,
  totalPlannedCourses,
}: RequirementsPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <GraduationCap className="h-4 w-4 text-zen-600" />
          卒業要件チェック
        </h2>
        <p className="mt-0.5 text-xs text-gray-400">{totalPlannedCourses}科目配置中</p>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* 総合判定 */}
        {graduation.isEligible ? (
          <Alert variant="success" title="卒業要件を満たしています">
            おめでとうございます！全ての要件を達成しています。
          </Alert>
        ) : (
          <Alert variant="warning" title={`${graduation.errors.length}件の要件が未達`}>
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              {graduation.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {graduation.errors.length > 3 && (
                <li>他 {graduation.errors.length - 3}件...</li>
              )}
            </ul>
          </Alert>
        )}

        {/* 進級要件（3→4年次） */}
        <div className="space-y-1">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <TrendingUp className="h-3.5 w-3.5" />
            進級要件（3→4年次）
          </h3>
          <RequirementRow
            label="修得総単位数 90単位以上"
            earned={promotion.toYear4.totalCredits}
            required={promotion.toYear4.required}
            ok={promotion.toYear4.ok}
          />
        </div>

        {/* 総単位数 */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            卒業必要単位数
          </h3>
          <RequirementRow
            label="総単位数（卒業算入可）"
            earned={graduation.totalCountableCredits}
            required={graduation.requiredTotal}
            ok={graduation.totalCountableCredits >= graduation.requiredTotal}
          />
        </div>

        {/* アコーディオン（各カテゴリの詳細） */}
        <Accordion.Root type="multiple" defaultValue={['introduction', 'foundation', 'expansion', 'graduation']} className="space-y-0">
          {/* 導入科目 */}
          <AccordionSection value="introduction" label="導入科目">
            <RequirementRow
              label="導入科目合計"
              earned={graduation.introduction.earned}
              required={graduation.introduction.required}
              ok={graduation.introduction.ok}
            />
          </AccordionSection>

          {/* 基礎科目 */}
          <AccordionSection value="foundation" label="基礎科目">
            <RequirementRow
              label="基礎科目合計"
              earned={graduation.foundation.earned}
              required={graduation.foundation.required}
              ok={graduation.foundation.ok}
            >
              <div className="space-y-1.5">
                {Object.entries(graduation.foundation.groups).map(([group, status]) => (
                  <RequirementRow
                    key={group}
                    label={FOUNDATION_GROUP_LABELS[group as keyof typeof FOUNDATION_GROUP_LABELS]}
                    earned={status.earned}
                    required={status.required}
                    ok={status.ok}
                    indent
                  />
                ))}
              </div>
            </RequirementRow>
          </AccordionSection>

          {/* 展開科目 */}
          <AccordionSection value="expansion" label="展開科目">
            <RequirementRow
              label="展開科目合計"
              earned={graduation.expansion.earned}
              required={graduation.expansion.required}
              ok={graduation.expansion.ok}
            >
              <div className="space-y-1.5">
                <RequirementRow
                  label="基盤リテラシー科目（基礎合算）"
                  earned={graduation.expansion.foundationLiteracyCombined.earned}
                  required={graduation.expansion.foundationLiteracyCombined.required}
                  ok={graduation.expansion.foundationLiteracyCombined.ok}
                  indent
                />
                <RequirementRow
                  label="多言語情報理解科目（基礎合算）"
                  earned={graduation.expansion.multilingualInfoUnderstandingCombined.earned}
                  required={graduation.expansion.multilingualInfoUnderstandingCombined.required}
                  ok={graduation.expansion.multilingualInfoUnderstandingCombined.ok}
                  indent
                />
                <RequirementRow
                  label="世界理解科目（基礎合算）"
                  earned={graduation.expansion.worldUnderstandingCombined.earned}
                  required={graduation.expansion.worldUnderstandingCombined.required}
                  ok={graduation.expansion.worldUnderstandingCombined.ok}
                  indent
                />
                <RequirementRow
                  label="デジタル産業指定4科目群"
                  earned={graduation.expansion.digitalIndustryHistory.earned}
                  required={graduation.expansion.digitalIndustryHistory.required}
                  ok={graduation.expansion.digitalIndustryHistory.ok}
                  indent
                />
                <div className="ml-4 border-l border-gray-100 pl-3">
                  <p className="text-xs text-gray-500">
                    社会接続科目（上限10単位）: {graduation.expansion.socialConnection.earned}単位取得
                    → {graduation.expansion.socialConnection.countable}単位算入
                  </p>
                </div>
              </div>
            </RequirementRow>
          </AccordionSection>

          {/* 卒業プロジェクト科目 */}
          <AccordionSection value="graduation" label="卒業プロジェクト科目">
            <RequirementRow
              label="卒業プロジェクト科目合計"
              earned={graduation.graduationProject.earned}
              required={graduation.graduationProject.required}
              ok={graduation.graduationProject.ok}
            >
              <div className="ml-4 border-l border-gray-100 pl-3">
                <div className="flex items-center gap-1.5 text-xs">
                  {graduation.graduationProject.hasProjectPractice ? (
                    <span className="text-emerald-600">✓ プロジェクト実践 配置済み</span>
                  ) : (
                    <span className="text-red-500">✗ プロジェクト実践が必要</span>
                  )}
                </div>
              </div>
            </RequirementRow>
          </AccordionSection>
        </Accordion.Root>
      </div>

      {/* フッター */}
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="flex flex-col gap-1">
          <a
            href="https://sites.google.com/zen.ac.jp/zen-gakuseibinran/academics/graduation_requirements"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zen-600 hover:underline"
          >
            学生便覧：進級・卒業について ↗
          </a>
          <Link
            to="/terms"
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
          >
            利用規約
          </Link>
          <p className="text-xs text-gray-300">
            ※最終確認は公式情報でご確認ください
          </p>
        </div>
      </div>
    </div>
  )
}

interface AccordionSectionProps {
  value: string
  label: string
  children: React.ReactNode
}

function AccordionSection({ value, label, children }: AccordionSectionProps) {
  return (
    <Accordion.Item value={value} className="border-b border-gray-100 py-2">
      <Accordion.Header>
        <Accordion.Trigger className="flex w-full items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
          {label}
          <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden pt-2 space-y-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  )
}
