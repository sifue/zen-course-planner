import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import type { Course } from '@/types/course'
import { usePlan } from '@/hooks/usePlan'
import { useFilters } from '@/hooks/useFilters'
import { useStorage } from '@/hooks/useStorage'
import { useGraduation } from '@/hooks/useGraduation'
import { usePrerequisites } from '@/hooks/usePrerequisites'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppHeader } from '@/components/layout/AppHeader'
import { CourseList } from '@/components/course-list/CourseList'
import { PlannerGrid } from '@/components/planner/PlannerGrid'
import { RequirementsPanel } from '@/components/requirements/RequirementsPanel'

// 遅延ロードするモーダル
const TutorialModal = lazy(() => import('@/components/modals/TutorialModal').then(m => ({ default: m.TutorialModal })))
const SavePlanModal = lazy(() => import('@/components/modals/SavePlanModal').then(m => ({ default: m.SavePlanModal })))
const LoadPlanModal = lazy(() => import('@/components/modals/LoadPlanModal').then(m => ({ default: m.LoadPlanModal })))
const ExportModal = lazy(() => import('@/components/modals/ExportModal').then(m => ({ default: m.ExportModal })))
const ImportModal = lazy(() => import('@/components/modals/ImportModal').then(m => ({ default: m.ImportModal })))
const PromptModal = lazy(() => import('@/components/modals/PromptModal').then(m => ({ default: m.PromptModal })))
const AutoScheduleModal = lazy(() => import('@/components/modals/AutoScheduleModal').then(m => ({ default: m.AutoScheduleModal })))
const ResetConfirmModal = lazy(() => import('@/components/modals/ResetConfirmModal').then(m => ({ default: m.ResetConfirmModal })))
const CourseDetailModal = lazy(() => import('@/components/modals/CourseDetailModal').then(m => ({ default: m.CourseDetailModal })))

// 科目データを静的インポート
import coursesData from '@/data/courses.json'

// コースデータをマップに変換（アプリ起動時に一度だけ実行）
const ALL_COURSES = coursesData as Course[]
const COURSE_MAP: Record<string, Course> = {}
for (const course of ALL_COURSES) {
  COURSE_MAP[course.id] = course
}

export default function PlannerPage() {
  // 状態管理
  const { plan, setPlan, setPlanName, addCourse, moveCourse, removeCourse, resetPlan, addYear, placedCourseIds, getPlanForSave } = usePlan()
  const filters = useFilters()
  const storage = useStorage()
  const graduation = useGraduation(plan.plannedCourses, COURSE_MAP)
  const prerequisites = usePrerequisites(plan.plannedCourses, COURSE_MAP)

  // UI状態（モバイルタブはAppLayout内部で管理）

  // モーダル表示状態
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('zen_tutorial_completed')
  })
  const [showSaveAsModal, setShowSaveAsModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  // 科目詳細モーダル
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseDetail, setShowCourseDetail] = useState(false)

  // 保存フィードバック
  const [showSavedBadge, setShowSavedBadge] = useState(false)
  const isFirstRender = useRef(true)
  // 参照経由で最新のstorage/getPlanForSaveを保持（auto-saveのeffect依存を避けるため）
  const storageRef = useRef(storage)
  storageRef.current = storage
  const getPlanForSaveRef = useRef(getPlanForSave)
  getPlanForSaveRef.current = getPlanForSave

  // 初回マウント時にアクティブプランを復元
  useEffect(() => {
    if (storage.activePlanId) {
      const loaded = storage.loadPlan(storage.activePlanId)
      if (loaded) {
        setPlan(loaded)
      }
    }
    // マウント時の1回のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 保存済みバッジを一時表示する
  const triggerSavedBadge = useCallback(() => {
    setShowSavedBadge(true)
  }, [])

  // バッジを2.5秒後に自動非表示
  useEffect(() => {
    if (!showSavedBadge) return
    const timer = setTimeout(() => setShowSavedBadge(false), 2500)
    return () => clearTimeout(timer)
  }, [showSavedBadge])

  // 計画変更時に自動保存（600msデバウンス、初回マウント除外）
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      storageRef.current.savePlan(getPlanForSaveRef.current())
      triggerSavedBadge()
    }, 600)
    return () => clearTimeout(timer)
  }, [plan.plannedCourses, plan.maxYears, triggerSavedBadge])

  // ハンドラー
  const handleSave = useCallback(() => {
    storage.savePlan(getPlanForSave())
    triggerSavedBadge()
  }, [storage, getPlanForSave, triggerSavedBadge])

  const handleSaveAs = useCallback(() => {
    setShowSaveAsModal(true)
  }, [])

  const handleLoad = useCallback(() => {
    setShowLoadModal(true)
  }, [])

  const handleExport = useCallback(() => {
    setShowExportModal(true)
  }, [])

  const handleImport = useCallback(() => {
    setShowImportModal(true)
  }, [])

  const handleReset = useCallback(() => {
    setShowResetModal(true)
  }, [])

  const handleOpenCourseDetail = useCallback((course: Course) => {
    setSelectedCourse(course)
    setShowCourseDetail(true)
  }, [])

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem('zen_tutorial_completed', '1')
    setShowTutorial(false)
  }, [])

  return (
    <>
      <AppLayout
        header={
          <AppHeader
            planName={plan.name}
            isSaved={showSavedBadge}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            onLoad={handleLoad}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            onPrompt={() => setShowPromptModal(true)}
            onAutoSchedule={() => setShowAutoScheduleModal(true)}
            onRename={setPlanName}
          />
        }
        sidebar={
          <CourseList
            courses={ALL_COURSES}
            filters={filters}
            placedCourseIds={placedCourseIds}
            warningCourseIds={prerequisites.warningCourseIds}
            errorCourseIds={prerequisites.errorCourseIds}
            maxYears={plan.maxYears}
            onAddCourse={addCourse}
            onRemoveCourse={removeCourse}
          />
        }
        main={
          <PlannerGrid
            plan={plan}
            courses={ALL_COURSES}
            courseMap={COURSE_MAP}
            warningCourseIds={prerequisites.warningCourseIds}
            errorCourseIds={prerequisites.errorCourseIds}
            onAddCourse={addCourse}
            onMoveCourse={moveCourse}
            onRemoveCourse={removeCourse}
            onAddYear={addYear}
            onOpenCourseDetail={handleOpenCourseDetail}
          />
        }
        panel={
          <RequirementsPanel
            graduation={graduation.graduation}
            promotion={graduation.promotion}
            totalPlannedCourses={plan.plannedCourses.length}
          />
        }
      />

      {/* モーダル群（遅延ロード） */}
      <Suspense fallback={null}>
        {showTutorial && (
          <TutorialModal
            open={showTutorial}
            onComplete={handleTutorialComplete}
          />
        )}

        {showSaveAsModal && (
          <SavePlanModal
            open={showSaveAsModal}
            onOpenChange={setShowSaveAsModal}
            plan={plan}
            isSaveAs
            onSave={(name) => {
              const now = new Date().toISOString()
              const newId = storage.saveAsNewPlan(getPlanForSave(), name)
              // 別名保存後は新しいプランとして作業継続
              setPlan({ ...plan, id: newId, name, createdAt: now, updatedAt: now })
              triggerSavedBadge()
              setShowSaveAsModal(false)
            }}
          />
        )}

        {showLoadModal && (
          <LoadPlanModal
            open={showLoadModal}
            onOpenChange={setShowLoadModal}
            storage={storage}
            onLoad={(planId) => {
              const loaded = storage.loadPlan(planId)
              if (loaded) {
                setPlan(loaded)
              }
              setShowLoadModal(false)
            }}
          />
        )}

        {showExportModal && (
          <ExportModal
            open={showExportModal}
            onOpenChange={setShowExportModal}
            plan={plan}
            courseMap={COURSE_MAP}
          />
        )}

        {showImportModal && (
          <ImportModal
            open={showImportModal}
            onOpenChange={setShowImportModal}
            onImport={(importedPlan) => {
              setPlan({
                ...plan,
                name: importedPlan.name ?? plan.name,
                plannedCourses: importedPlan.plannedCourses ?? [],
                updatedAt: new Date().toISOString(),
              })
              setShowImportModal(false)
            }}
            currentPlanName={plan.name}
          />
        )}

        {showPromptModal && (
          <PromptModal
            open={showPromptModal}
            onOpenChange={setShowPromptModal}
            plan={plan}
            courseMap={COURSE_MAP}
            graduation={graduation.graduation}
            onImport={(courses) => {
              for (const c of courses) {
                addCourse(c.courseId, c.year, c.quarter)
              }
              setShowPromptModal(false)
            }}
          />
        )}

        {showAutoScheduleModal && (
          <AutoScheduleModal
            open={showAutoScheduleModal}
            onOpenChange={setShowAutoScheduleModal}
            courses={ALL_COURSES}
            onApply={(plannedCourses) => {
              setPlan({ ...plan, plannedCourses })
              setShowAutoScheduleModal(false)
            }}
          />
        )}

        {showResetModal && (
          <ResetConfirmModal
            open={showResetModal}
            onOpenChange={setShowResetModal}
            onConfirm={() => {
              resetPlan()
              setShowResetModal(false)
            }}
          />
        )}

        {showCourseDetail && selectedCourse && (
          <CourseDetailModal
            course={selectedCourse}
            isPlaced={placedCourseIds.has(selectedCourse.id)}
            open={showCourseDetail}
            onOpenChange={setShowCourseDetail}
            hasWarning={prerequisites.warningCourseIds.has(selectedCourse.id)}
            hasError={prerequisites.errorCourseIds.has(selectedCourse.id)}
            onAdd={(courseId, year, quarter) => addCourse(courseId, year, quarter)}
            onRemove={(courseId) => removeCourse(courseId)}
          />
        )}
      </Suspense>
    </>
  )
}
