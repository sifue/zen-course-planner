/** 科目の大分類 */
export type BandCode =
  | 'introduction'        // 導入科目
  | 'foundation'          // 基礎科目
  | 'expansion'           // 展開科目
  | 'graduation_project'  // 卒業プロジェクト科目
  | 'free'                // 自由科目

/** 基礎科目の6分野 */
export type FoundationGroup =
  | 'mathematics'                       // 数理
  | 'information'                       // 情報
  | 'culture_thought'                   // 文化・思想
  | 'society_network'                   // 社会・ネットワーク
  | 'economy_market'                    // 経済・マーケット
  | 'multilingual_it_communication'     // 多言語ITコミュニケーション

/** 展開科目の系統 */
export type ExpansionTrack =
  | 'foundation_literacy'                    // 基盤リテラシー科目
  | 'multilingual_information_understanding' // 多言語情報理解科目
  | 'world_understanding'                    // 世界理解科目
  | 'social_connection'                      // 社会接続科目

/** 授業方法 */
export type TeachingMethod =
  | 'on_demand'  // オンデマンド科目
  | 'seminar'    // 演習科目
  | 'zemi'       // ゼミ
  | 'live'       // ライブ映像科目

/** 科目区分 */
export type SubjectCategory =
  | 'required'          // 必修
  | 'required_elective' // 選択必修
  | 'elective'          // 選択
  | 'free'              // 自由

/**
 * シラバスサイト「分野から探す」のカテゴリ（subject_category_id に対応）
 * B1 基礎科目・C展開科目を横断してプレフィックスで決定する
 */
export type FieldCategory =
  | 'mathematics'       // 数理 (MTH prefix)
  | 'information'       // 情報 (INF prefix)
  | 'culture_thought'   // 文化・思想 (HUM prefix)
  | 'society_network'   // 社会・ネットワーク (SOC prefix)
  | 'economy_market'    // 経済・マーケット (ECON prefix)
  | 'digital_industry'  // デジタル産業 (DIGI prefix)

/** 科目データ */
export interface Course {
  /** ナンバリング（科目コード）例: "BSC-1-B1-0204-002" */
  id: string
  /** ファイルハッシュID */
  fileId: string
  /** シラバスサイトのURL */
  syllabusUrl: string
  /** データ取得日時 */
  fetchedAt: string

  /** 科目名 */
  name: string
  /** 単位数 */
  credits: number
  /** 履修想定年次（1〜4） */
  year: 1 | 2 | 3 | 4
  /** 開講年度 */
  openYear: number
  /** 開講クォーター（例: [1, 3] = 1Qと3Qに開講） */
  quarters: number[]
  /** 授業方法 */
  teachingMethod: TeachingMethod
  /** 科目区分 */
  category: SubjectCategory
  /** 担当教員 */
  instructors: string[]
  /** タグ */
  tags: string[]

  /** サムネイル画像URL */
  thumbnailUrl?: string
  /** 動画URL */
  videoUrl?: string

  /** 大分類 */
  band: BandCode
  /** 基礎科目の分野（bandが'foundation'の場合のみ使用） */
  foundationGroups: FoundationGroup[]
  /** 展開科目の系統（bandが'expansion'の場合のみ使用） */
  expansionTrack: ExpansionTrack | null
  /** 卒業要件に算入できるか */
  countableToGraduation: boolean
  /** デジタル産業史4科目群（IT産業史等）に該当するか */
  isDigitalIndustryHistoryEligible: boolean
  /** プロジェクト実践（卒業プロジェクト必修）に該当するか */
  isRequiredProjectPractice: boolean
  /**
   * シラバスサイト「分野から探す」に対応するフィールドカテゴリ
   * 科目コードのプレフィックスで決定（MTH=数理, INF=情報, HUM=文化・思想, SOC=社会・ネットワーク, ECON=経済・マーケット, DIGI=デジタル産業）
   * BSC/LAN/CAR/OPT/PRJ等はnull
   */
  fieldCategory: FieldCategory | null

  /** 強く推奨される前提科目名リスト */
  strongPrerequisites: string[]
  /** 推奨される前提科目名リスト */
  recommendedPrerequisites: string[]
  /** 関連科目名リスト */
  relatedCourses: string[]

  /** 科目概要（最大500文字） */
  overview: string
}

/** 科目IDをキーにした科目マップ */
export type CourseMap = Record<string, Course>

/** バンドの日本語表示名 */
export const BAND_LABELS: Record<BandCode, string> = {
  introduction: '導入科目',
  foundation: '基礎科目',
  expansion: '展開科目',
  graduation_project: '卒業プロジェクト科目',
  free: '自由科目',
}

/** 展開科目系統の日本語表示名 */
export const EXPANSION_TRACK_LABELS: Record<ExpansionTrack, string> = {
  foundation_literacy: '基盤リテラシー科目',
  multilingual_information_understanding: '多言語情報理解科目',
  world_understanding: '世界理解科目',
  social_connection: '社会接続科目',
}

/** 基礎科目分野の日本語表示名 */
export const FOUNDATION_GROUP_LABELS: Record<FoundationGroup, string> = {
  mathematics: '数理',
  information: '情報',
  culture_thought: '文化・思想',
  society_network: '社会・ネットワーク',
  economy_market: '経済・マーケット',
  multilingual_it_communication: '多言語ITコミュニケーション',
}

/** バンドのカラー（Tailwindクラス） */
export const BAND_COLORS: Record<BandCode, { bg: string; text: string; border: string }> = {
  introduction: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  foundation: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  expansion: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  graduation_project: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  free: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
}
