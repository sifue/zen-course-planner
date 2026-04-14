/** グリッド上に配置された科目 */
export interface PlannedCourse {
  /** 科目コード（Course.id） */
  courseId: string
  /** 配置年次（1〜8） */
  year: number
  /** 配置クォーター（1〜4） */
  quarter: 1 | 2 | 3 | 4
  /** ユーザーメモ */
  note?: string
}

/** 履修計画 */
export interface CoursePlan {
  /** 計画ID（UUID） */
  id: string
  /** 計画名 */
  name: string
  /** 作成日時（ISO文字列） */
  createdAt: string
  /** 最終更新日時（ISO文字列） */
  updatedAt: string
  /** 表示する最大年次（4〜8） */
  maxYears: number
  /** 配置済み科目のリスト */
  plannedCourses: PlannedCourse[]
}

/** Web Storageに保存するフォーマット */
export interface StoredPlans {
  version: '1.0'
  plans: Record<string, CoursePlan>
  activePlanId: string | null
}

/** マークダウンエクスポートのメタデータ */
export interface ExportData {
  metadata: {
    appName: string
    exportedAt: string
    planName: string
    dataVersion: string
  }
  plannedCourses: Array<{
    courseId: string
    courseName: string
    year: number
    quarter: number
    credits: number
    note?: string
  }>
}
