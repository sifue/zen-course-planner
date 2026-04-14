/**
 * ナンバリングからband/foundationGroups/expansionTrackを推論するルール
 *
 * ナンバリング形式: {PREFIX}-{YEAR}-{BAND_CODE}-{OPENING_CODE}-{SEQ}
 * 例: BSC-1-B1-0204-002, INF-2-C1-1030-003
 */

export type BandCode = 'introduction' | 'foundation' | 'expansion' | 'graduation_project' | 'free';
export type FoundationGroup =
  | 'mathematics'
  | 'information'
  | 'culture_thought'
  | 'society_network'
  | 'economy_market'
  | 'multilingual_it_communication';
export type ExpansionTrack =
  | 'foundation_literacy'
  | 'multilingual_information_understanding'
  | 'world_understanding'
  | 'social_connection';

export interface BandMapping {
  band: BandCode;
  foundationGroups: FoundationGroup[];
  expansionTrack: ExpansionTrack | null;
  countableToGraduation: boolean;
  isDigitalIndustryHistoryEligible: boolean;
  isRequiredProjectPractice: boolean;
}

/**
 * ナンバリングからBand情報を推論する
 * @param numbering - 例: "BSC-1-B1-0204-002"
 * @returns Band情報
 */
export function inferBandMapping(numbering: string): BandMapping {
  const parts = numbering.split('-');
  if (parts.length < 3) {
    // 不正なナンバリング → 自由科目として扱う
    return makeDefault('free');
  }

  const prefix = parts[0].toUpperCase();
  const bandCode = parts[2].toUpperCase();

  // バンドコードでの分類
  switch (bandCode) {
    case 'A1':
      // 導入科目（オンデマンド）
      return { ...makeDefault('introduction') };

    case 'A2':
      // 導入科目（ライブ映像）または基礎科目（多言語ITコミュニケーション）
      if (prefix === 'BSC') {
        // BSC-A2 = 多言語ITコミュニケーション（導入だが特殊）
        return {
          band: 'introduction',
          foundationGroups: [],
          expansionTrack: null,
          countableToGraduation: true,
          isDigitalIndustryHistoryEligible: false,
          isRequiredProjectPractice: false,
        };
      }
      // INT-A2 = 導入（ライブ映像）
      return { ...makeDefault('introduction') };

    case 'A3':
      // 卒業プロジェクト科目
      return {
        band: 'graduation_project',
        foundationGroups: [],
        expansionTrack: null,
        countableToGraduation: true,
        isDigitalIndustryHistoryEligible: false,
        isRequiredProjectPractice: prefix === 'PRJ',
      };

    case 'B1':
      return inferFoundationB1(prefix, numbering);

    case 'B2':
      // 基礎科目 - 多言語ITコミュニケーション（LAN prefix）
      return {
        band: 'foundation',
        foundationGroups: ['multilingual_it_communication'],
        expansionTrack: null,
        countableToGraduation: true,
        isDigitalIndustryHistoryEligible: false,
        isRequiredProjectPractice: false,
      };

    case 'C1':
    case 'C2':
    case 'C3':
    case 'C4':
      return inferExpansionTrack(prefix);

    case 'D1':
      // 自由科目
      return {
        band: 'free',
        foundationGroups: [],
        expansionTrack: null,
        countableToGraduation: false,
        isDigitalIndustryHistoryEligible: false,
        isRequiredProjectPractice: false,
      };

    default:
      return makeDefault('free');
  }
}

/**
 * B1バンドの foundation_groups を prefix から推論する
 */
function inferFoundationB1(prefix: string, numbering: string): BandMapping {
  // DIGI-B1 = デジタル産業史4科目（IT産業史, マンガ産業史, アニメ産業史, 日本のゲーム産業史）
  if (prefix === 'DIGI') {
    return {
      band: 'foundation',
      foundationGroups: ['information'], // デフォルト。manual-overridesで上書き可
      expansionTrack: null,
      countableToGraduation: true,
      isDigitalIndustryHistoryEligible: true,
      isRequiredProjectPractice: false,
    };
  }

  // LAN-B1 = 機械翻訳実践など（多言語ITコミュニケーション系）
  if (prefix === 'LAN') {
    return {
      band: 'foundation',
      foundationGroups: ['multilingual_it_communication'],
      expansionTrack: null,
      countableToGraduation: true,
      isDigitalIndustryHistoryEligible: false,
      isRequiredProjectPractice: false,
    };
  }

  // BSC-B1 = 数理・情報・文化思想・社会・経済の各基礎選択必修
  // 科目によって所属グループが異なるため、manual-overridesで上書き必須
  // デフォルトは空（manual-overridesで必ず補完）
  if (prefix === 'BSC') {
    return {
      band: 'foundation',
      foundationGroups: [],
      expansionTrack: null,
      countableToGraduation: true,
      isDigitalIndustryHistoryEligible: false,
      isRequiredProjectPractice: false,
    };
  }

  // その他のB1（不明ケース）
  console.warn(`未知のB1 prefix: ${prefix} (${numbering})`);
  return makeDefault('foundation');
}

/**
 * 展開科目（C1〜C4）のexpansionTrackをprefixから推論する
 */
function inferExpansionTrack(prefix: string): BandMapping {
  const trackMap: Record<string, ExpansionTrack> = {
    // 基盤リテラシー科目（情報・数学・デジタル系）
    INF: 'foundation_literacy',
    MTH: 'foundation_literacy',
    DIGI: 'foundation_literacy',
    BSC: 'foundation_literacy', // BSC-C* は基盤リテラシーとして扱う

    // 多言語情報理解科目（言語系）
    LAN: 'multilingual_information_understanding',

    // 世界理解科目（人文・社会・経済系）
    HUM: 'world_understanding',
    SOC: 'world_understanding',
    ECON: 'world_understanding',

    // 社会接続科目（キャリア・課外系）
    CAR: 'social_connection',
    OPT: 'social_connection',
  };

  const track = trackMap[prefix] ?? 'world_understanding';

  return {
    band: 'expansion',
    foundationGroups: [],
    expansionTrack: track,
    countableToGraduation: true,
    isDigitalIndustryHistoryEligible: false,
    isRequiredProjectPractice: false,
  };
}

function makeDefault(band: BandCode): BandMapping {
  return {
    band,
    foundationGroups: [],
    expansionTrack: null,
    countableToGraduation: band !== 'free',
    isDigitalIndustryHistoryEligible: false,
    isRequiredProjectPractice: false,
  };
}
