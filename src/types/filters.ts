import type { BandCode, ExpansionTrack, FoundationGroup, TeachingMethod } from './course'

/** 分類フィルターのオプション（バンド + 展開科目系統 + 基礎科目分野 + 特殊フラグを統合） */
export type CategoryFilterKey =
  | BandCode
  | ExpansionTrack
  | FoundationGroup       // 基礎科目の分野別フィルター（数理・情報・文化思想など）
  | 'digital_industry'    // デジタル産業史4科目（isDigitalIndustryHistoryEligible）

/** フィルター状態 */
export interface FilterState {
  /** 履修想定年次フィルター */
  years: Set<1 | 2 | 3 | 4>

  /** 分類フィルター（バンドまたは展開科目系統） */
  categories: Set<CategoryFilterKey>

  /** 授業方法フィルター */
  teachingMethods: Set<TeachingMethod>

  /** タグキーワードフィルター（タグ文字列のFuzzy検索） */
  tagKeywords: Set<string>

  /** テキスト検索（科目名・概要・タグ） */
  searchText: string

  /** 未配置科目のみ表示 */
  showUnplannedOnly: boolean
}

/** デフォルトのフィルター状態 */
export const DEFAULT_FILTER_STATE: FilterState = {
  years: new Set(),
  categories: new Set(),
  teachingMethods: new Set(),
  tagKeywords: new Set(),
  searchText: '',
  showUnplannedOnly: false,
}

/** カリキュラムツリーのルート選択 */
export type CurriculumTreeType =
  | 'information'      // 情報
  | 'data_science'     // データサイエンス
  | 'economy_markets'  // 経済・マーケット
