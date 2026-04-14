import type { Course } from '@/types/course'
import type { PlannedCourse } from '@/types/plan'
import { QuarterCell, type GhostCourse } from './QuarterCell'

interface YearColumnProps {
  year: number
  plannedCourses: PlannedCourse[]
  courseMap: Record<string, Course>
  warningCourseIds: Set<string>
  errorCourseIds: Set<string>
  draggingCourseId: string | null
  onRemoveCourse: (courseId: string) => void
  onOpenCourseDetail: (course: Course) => void
}

/**
 * 1年次分の列（4つのQuarterCellを含む）
 */
export function YearColumn({
  year,
  plannedCourses,
  courseMap,
  warningCourseIds,
  errorCourseIds,
  draggingCourseId,
  onRemoveCourse,
  onOpenCourseDetail,
}: YearColumnProps) {
  // この年次の総単位数を計算
  const uniqueIds = new Set<string>()
  let totalCredits = 0
  for (const pc of plannedCourses) {
    if (!uniqueIds.has(pc.courseId)) {
      uniqueIds.add(pc.courseId)
      const course = courseMap[pc.courseId]
      if (course?.countableToGraduation) {
        totalCredits += course.credits
      }
    }
  }

  // ゴーストカード計算（複数Q開講科目が占有するQにゴースト表示）
  const ghostsByQuarter: Record<1 | 2 | 3 | 4, GhostCourse[]> = { 1: [], 2: [], 3: [], 4: [] }
  for (const pc of plannedCourses) {
    const course = courseMap[pc.courseId]
    if (!course || course.quarters.length <= 1) continue

    const ghostQs = getGhostQuarters({ quarters: course.quarters, isRequiredProjectPractice: course.isRequiredProjectPractice, teachingMethod: course.teachingMethod }, pc.quarter)
    for (const q of ghostQs) {
      ghostsByQuarter[q as 1 | 2 | 3 | 4].push({
        course,
        placedAtQuarter: pc.quarter as 1 | 2 | 3 | 4,
      })
    }
  }

  return (
    <div className="shrink-0 flex flex-col w-48 xl:w-52 2xl:w-56">
      {/* 年次ヘッダー */}
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-gray-700">{year}年次</h3>
        {totalCredits > 0 && (
          <span className="text-xs text-gray-400">{totalCredits}単位</span>
        )}
      </div>

      {/* 4つのクォーターセル */}
      <div className="flex flex-col gap-2">
        {([1, 2, 3, 4] as const).map(quarter => (
          <div key={quarter}>
            <div className="mb-0.5 flex items-center gap-1">
              <span className="text-xs font-medium text-gray-400">{quarter}Q</span>
            </div>
            <QuarterCell
              year={year}
              quarter={quarter}
              plannedCourses={plannedCourses.filter(pc => pc.quarter === quarter)}
              ghostCourses={ghostsByQuarter[quarter]}
              courseMap={courseMap}
              warningCourseIds={warningCourseIds}
              errorCourseIds={errorCourseIds}
              draggingCourseId={draggingCourseId}
              onRemoveCourse={onRemoveCourse}
              onOpenCourseDetail={onOpenCourseDetail}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 科目を配置したQに対して、ゴーストを表示すべきQリストを返す
 *
 * ルール:
 * - プロジェクト実践（4Q通年）: 配置Q以外の全Q
 * - ゼミ（4Q通年）: 配置Q以外の全Q（通期ゼミは4単位で年間連続開講）
 * - ライブ授業・演習（前期1-2Q または 後期3-4Q）: 前後期ペアのみ
 *   → [1,2,3,4] の科目でも、配置した学期の相方Qにのみゴーストを出す
 */
function getGhostQuarters(
  course: { quarters: number[]; isRequiredProjectPractice: boolean; teachingMethod: string },
  placedAt: number
): number[] {
  if (course.isRequiredProjectPractice) {
    // 卒業プロジェクトは4Q連続占有
    return course.quarters.filter(q => q !== placedAt && q >= 1 && q <= 4)
  }

  // 通期ゼミ（全4Q開講）は全Q占有
  if (course.teachingMethod === 'zemi' && course.quarters.length === 4) {
    return course.quarters.filter(q => q !== placedAt && q >= 1 && q <= 4)
  }

  // 前後期ペアルール: Q1↔Q2、Q3↔Q4
  // ライブ授業・演習などは前期（1-2Q）か後期（3-4Q）のどちらかのみ開講
  const semesterPair: Record<number, number> = { 1: 2, 2: 1, 3: 4, 4: 3 }
  const partnerQ = semesterPair[placedAt]
  if (partnerQ !== undefined && course.quarters.includes(partnerQ)) {
    return [partnerQ]
  }
  return []
}
