"""ZEN大学 進級・卒業判定サンプル

このコードは、添付された「進級・卒業について」本文と卒業要件表をもとに、
進級判定・卒業判定を行うための最小実装例です。

注意:
- 入学年度ごとの差分は未実装です。
- GPAの具体閾値は資料にないため、早期卒業は外部フラグを受け取ります。
- 1科目ごとの正確な分類は、最終的には公式シラバスで埋めてください。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, FrozenSet, Iterable, List, Mapping, Optional


SOCIAL_CONNECTION_CAP = 10

FOUNDATION_GROUPS = {
    "mathematics",
    "information",
    "culture_thought",
    "society_network",
    "economy_market",
    "multilingual_it_communication",
}

EXPANSION_TRACKS = {
    "foundation_literacy",
    "multilingual_information_understanding",
    "world_understanding",
    "social_connection",
}

BANDS = {
    "introduction",
    "foundation",
    "expansion",
    "graduation_project",
    "free",
}

DIGITAL_INDUSTRY_HISTORY_COURSES = {
    "IT産業史",
    "マンガ産業史",
    "アニメ産業史",
    "日本のゲーム産業史",
}


@dataclass(frozen=True)
class Course:
    course_id: str
    name: str
    credits: int
    band: str
    foundation_groups: FrozenSet[str] = field(default_factory=frozenset)
    expansion_track: Optional[str] = None
    tags: FrozenSet[str] = field(default_factory=frozenset)
    countable_to_graduation: bool = True

    def __post_init__(self) -> None:
        if self.credits <= 0:
            raise ValueError(f"credits must be positive: {self.course_id}")
        if self.band not in BANDS:
            raise ValueError(f"unknown band: {self.band} ({self.course_id})")
        unknown_foundation_groups = set(self.foundation_groups) - FOUNDATION_GROUPS
        if unknown_foundation_groups:
            raise ValueError(
                f"unknown foundation_groups {unknown_foundation_groups} ({self.course_id})"
            )
        if self.expansion_track is not None and self.expansion_track not in EXPANSION_TRACKS:
            raise ValueError(
                f"unknown expansion_track: {self.expansion_track} ({self.course_id})"
            )
        if self.band == "free" and self.countable_to_graduation:
            raise ValueError(f"free courses must not be countable: {self.course_id}")


@dataclass(frozen=True)
class StudentRecord:
    completed_course_ids: List[str]
    enrolled_years_excluding_leave: float
    admission_month: int  # 4 or 10

    def __post_init__(self) -> None:
        if self.admission_month not in (4, 10):
            raise ValueError("admission_month must be 4 or 10")
        if self.enrolled_years_excluding_leave < 0:
            raise ValueError("enrolled_years_excluding_leave must be non-negative")


@dataclass
class CreditSummary:
    raw_band: Dict[str, int]
    counted_band: Dict[str, int]
    foundation_group_credits: Dict[str, int]
    expansion_track_raw: Dict[str, int]
    expansion_track_counted: Dict[str, int]
    counted_total_credits: int
    combined_foundation_literacy: int
    combined_multilingual_information_understanding: int
    combined_world_understanding: int
    digital_industry_history_credits: int


@dataclass
class CheckResult:
    ok: bool
    errors: List[str]
    summary: Dict[str, object]


def _resolve_courses(
    completed_course_ids: Iterable[str],
    course_catalog: Mapping[str, Course],
) -> List[Course]:
    missing = [course_id for course_id in completed_course_ids if course_id not in course_catalog]
    if missing:
        raise KeyError(f"unknown course_ids: {missing}")
    return [course_catalog[course_id] for course_id in completed_course_ids]


def _sum_credits(courses: Iterable[Course]) -> int:
    return sum(course.credits for course in courses)


def summarize_credits(
    completed_course_ids: Iterable[str],
    course_catalog: Mapping[str, Course],
) -> CreditSummary:
    courses = _resolve_courses(completed_course_ids, course_catalog)

    raw_band = {band: 0 for band in BANDS}
    counted_band = {band: 0 for band in BANDS}
    foundation_group_credits = {group: 0 for group in FOUNDATION_GROUPS}
    expansion_track_raw = {track: 0 for track in EXPANSION_TRACKS}
    expansion_track_counted = {track: 0 for track in EXPANSION_TRACKS}

    expansion_non_social_counted = 0
    digital_industry_history_credits = 0

    for course in courses:
        raw_band[course.band] += course.credits

        if course.countable_to_graduation:
            if course.band != "expansion":
                counted_band[course.band] += course.credits
            elif course.expansion_track != "social_connection":
                expansion_non_social_counted += course.credits

        if course.band == "foundation":
            for group in course.foundation_groups:
                foundation_group_credits[group] += course.credits

        if course.band == "expansion" and course.expansion_track is not None:
            expansion_track_raw[course.expansion_track] += course.credits

        if course.band == "expansion" and course.expansion_track == "world_understanding":
            if (
                "digital_industry_history_eligible" in course.tags
                or course.name in DIGITAL_INDUSTRY_HISTORY_COURSES
            ):
                digital_industry_history_credits += course.credits

    social_connection_raw = expansion_track_raw["social_connection"]
    social_connection_counted = min(social_connection_raw, SOCIAL_CONNECTION_CAP)

    for track in EXPANSION_TRACKS:
        if track == "social_connection":
            expansion_track_counted[track] = social_connection_counted
        else:
            expansion_track_counted[track] = expansion_track_raw[track]

    counted_band["expansion"] = expansion_non_social_counted + social_connection_counted
    counted_band["free"] = 0

    counted_total_credits = sum(counted_band.values())

    combined_foundation_literacy = (
        foundation_group_credits["mathematics"]
        + foundation_group_credits["information"]
        + expansion_track_counted["foundation_literacy"]
    )
    combined_multilingual_information_understanding = (
        foundation_group_credits["multilingual_it_communication"]
        + expansion_track_counted["multilingual_information_understanding"]
    )
    combined_world_understanding = (
        foundation_group_credits["culture_thought"]
        + foundation_group_credits["society_network"]
        + foundation_group_credits["economy_market"]
        + expansion_track_counted["world_understanding"]
    )

    return CreditSummary(
        raw_band=raw_band,
        counted_band=counted_band,
        foundation_group_credits=foundation_group_credits,
        expansion_track_raw=expansion_track_raw,
        expansion_track_counted=expansion_track_counted,
        counted_total_credits=counted_total_credits,
        combined_foundation_literacy=combined_foundation_literacy,
        combined_multilingual_information_understanding=(
            combined_multilingual_information_understanding
        ),
        combined_world_understanding=combined_world_understanding,
        digital_industry_history_credits=digital_industry_history_credits,
    )


def check_promotion_to_year4(
    student: StudentRecord,
    course_catalog: Mapping[str, Course],
    *,
    early_graduation_candidate: bool = False,
) -> CheckResult:
    summary = summarize_credits(student.completed_course_ids, course_catalog)
    errors: List[str] = []

    if not early_graduation_candidate and student.enrolled_years_excluding_leave < 3:
        errors.append("3年以上在学していません。")
    if summary.counted_total_credits < 90:
        errors.append(
            f"3年次終了時の修得総単位数が不足しています: {summary.counted_total_credits}/90"
        )

    judgement_term = (
        "秋学期終了時（4クオーター終了時）"
        if student.admission_month == 4
        else "春学期終了時（2クオーター終了時）"
    )

    return CheckResult(
        ok=not errors,
        errors=errors,
        summary={
            "judgement_term": judgement_term,
            "counted_total_credits": summary.counted_total_credits,
            "enrolled_years_excluding_leave": student.enrolled_years_excluding_leave,
        },
    )


def check_graduation(
    student: StudentRecord,
    course_catalog: Mapping[str, Course],
    *,
    allow_early_graduation: bool = False,
) -> CheckResult:
    summary = summarize_credits(student.completed_course_ids, course_catalog)
    errors: List[str] = []

    required_years = 3 if allow_early_graduation else 4
    if student.enrolled_years_excluding_leave < required_years:
        errors.append(
            f"在学年数が不足しています: {student.enrolled_years_excluding_leave}/{required_years}"
        )

    if summary.counted_total_credits < 124:
        errors.append(f"総算入単位数が不足しています: {summary.counted_total_credits}/124")

    if summary.counted_band["introduction"] < 14:
        errors.append(
            f"導入科目が不足しています: {summary.counted_band['introduction']}/14"
        )

    if summary.counted_band["foundation"] < 12:
        errors.append(f"基礎科目が不足しています: {summary.counted_band['foundation']}/12")

    for group_name, required in [
        ("mathematics", 2),
        ("information", 2),
        ("culture_thought", 2),
        ("society_network", 2),
        ("economy_market", 2),
        ("multilingual_it_communication", 2),
    ]:
        earned = summary.foundation_group_credits[group_name]
        if earned < required:
            errors.append(f"基礎科目の {group_name} が不足しています: {earned}/{required}")

    if summary.counted_band["expansion"] < 74:
        errors.append(f"展開科目が不足しています: {summary.counted_band['expansion']}/74")

    if summary.combined_foundation_literacy < 8:
        errors.append(
            "基盤リテラシー科目（基礎科目の履修も合算）が不足しています: "
            f"{summary.combined_foundation_literacy}/8"
        )

    if summary.combined_multilingual_information_understanding < 8:
        errors.append(
            "多言語情報理解科目（基礎科目の履修も合算）が不足しています: "
            f"{summary.combined_multilingual_information_understanding}/8"
        )

    if summary.combined_world_understanding < 26:
        errors.append(
            "世界理解科目（基礎科目の履修も合算）が不足しています: "
            f"{summary.combined_world_understanding}/26"
        )

    if summary.digital_industry_history_credits < 2:
        errors.append(
            "デジタル産業の指定4科目群が不足しています: "
            f"{summary.digital_industry_history_credits}/2"
        )

    if summary.counted_band["graduation_project"] < 4:
        errors.append(
            f"卒業プロジェクト科目が不足しています: {summary.counted_band['graduation_project']}/4"
        )

    return CheckResult(
        ok=not errors,
        errors=errors,
        summary={
            "counted_total_credits": summary.counted_total_credits,
            "counted_band": summary.counted_band,
            "foundation_group_credits": summary.foundation_group_credits,
            "expansion_track_raw": summary.expansion_track_raw,
            "expansion_track_counted": summary.expansion_track_counted,
            "combined_foundation_literacy": summary.combined_foundation_literacy,
            "combined_multilingual_information_understanding": (
                summary.combined_multilingual_information_understanding
            ),
            "combined_world_understanding": summary.combined_world_understanding,
            "digital_industry_history_credits": summary.digital_industry_history_credits,
        },
    )


def check_early_graduation_precheck(
    student: StudentRecord,
    course_catalog: Mapping[str, Course],
    *,
    gpa_requirement_met: bool,
    application_screening_passed: bool,
) -> CheckResult:
    """2年次終了時点の早期卒業の事前要件チェック。

    資料には具体的GPA閾値が書かれていないため、
    GPA条件は外部で判定済みの bool を渡す想定です。
    """
    summary = summarize_credits(student.completed_course_ids, course_catalog)
    errors: List[str] = []

    if student.enrolled_years_excluding_leave < 2:
        errors.append("2年次終了時点として扱うには在学年数が不足しています。")
    if summary.counted_total_credits < 88:
        errors.append(f"2年次終了時点の単位数が不足しています: {summary.counted_total_credits}/88")
    if not gpa_requirement_met:
        errors.append("所定の累積GPA要件を満たしていません。")
    if not application_screening_passed:
        errors.append("早期卒業の申出・所定審査を通過していません。")

    return CheckResult(
        ok=not errors,
        errors=errors,
        summary={
            "counted_total_credits": summary.counted_total_credits,
            "enrolled_years_excluding_leave": student.enrolled_years_excluding_leave,
        },
    )


def build_demo_catalog() -> Dict[str, Course]:
    """動作確認用の小さなデモ科目マスタ。公式の完全版ではありません。"""
    catalog: Dict[str, Course] = {}

    # 導入科目 14単位
    intro_names = [
        "アカデミックリテラシー",
        "ITリテラシー",
        "現代社会と数学",
        "デジタルツールの使い方",
        "人工知能活用実践",
        "人文社会入門",
        "経済入門",
    ]
    for i, name in enumerate(intro_names, start=1):
        course_id = f"I-{i:03d}"
        catalog[course_id] = Course(
            course_id=course_id,
            name=name,
            credits=2,
            band="introduction",
        )

    # 基礎科目 12単位（6分類を各2単位）
    foundation_defs = [
        ("F-001", "数理基礎", frozenset({"mathematics"})),
        ("F-002", "情報基礎", frozenset({"information"})),
        ("F-003", "文化・思想入門", frozenset({"culture_thought"})),
        ("F-004", "社会・ネットワーク入門", frozenset({"society_network"})),
        ("F-005", "経済・マーケット入門", frozenset({"economy_market"})),
        (
            "F-006",
            "多言語ITコミュニケーション",
            frozenset({"multilingual_it_communication"}),
        ),
    ]
    for course_id, name, groups in foundation_defs:
        catalog[course_id] = Course(
            course_id=course_id,
            name=name,
            credits=2,
            band="foundation",
            foundation_groups=groups,
        )

    # 展開科目（基盤リテラシー 4単位）
    for i in range(1, 3):
        course_id = f"E-FL-{i:03d}"
        catalog[course_id] = Course(
            course_id=course_id,
            name=f"基盤リテラシー発展{i}",
            credits=2,
            band="expansion",
            expansion_track="foundation_literacy",
        )

    # 展開科目（多言語情報理解 6単位）
    for i in range(1, 4):
        course_id = f"E-MI-{i:03d}"
        catalog[course_id] = Course(
            course_id=course_id,
            name=f"多言語情報理解発展{i}",
            credits=2,
            band="expansion",
            expansion_track="multilingual_information_understanding",
        )

    # 展開科目（世界理解 74単位 = 37科目 * 2単位）
    world_names = ["IT産業史"] + [f"世界理解発展{i}" for i in range(1, 37)]
    for i, name in enumerate(world_names, start=1):
        course_id = f"E-WU-{i:03d}"
        tags = frozenset({"digital_industry_history_eligible"}) if name == "IT産業史" else frozenset()
        catalog[course_id] = Course(
            course_id=course_id,
            name=name,
            credits=2,
            band="expansion",
            expansion_track="world_understanding",
            tags=tags,
        )

    # 展開科目（社会接続 12単位だが、算入は10単位まで）
    for i in range(1, 7):
        course_id = f"E-SC-{i:03d}"
        catalog[course_id] = Course(
            course_id=course_id,
            name=f"社会接続{i}",
            credits=2,
            band="expansion",
            expansion_track="social_connection",
        )

    # 卒業プロジェクト科目 4単位
    catalog["G-001"] = Course(
        course_id="G-001",
        name="プロジェクト実践",
        credits=4,
        band="graduation_project",
        tags=frozenset({"required_project_practice"}),
    )

    # 自由科目（卒業算入なし）
    catalog["X-001"] = Course(
        course_id="X-001",
        name="自由科目サンプル",
        credits=2,
        band="free",
        countable_to_graduation=False,
    )

    return catalog


def demo_student_pass() -> StudentRecord:
    catalog = build_demo_catalog()
    completed_course_ids = [course_id for course_id in catalog if course_id != "X-001"]
    return StudentRecord(
        completed_course_ids=sorted(completed_course_ids),
        enrolled_years_excluding_leave=4,
        admission_month=4,
    )


def demo_student_fail() -> StudentRecord:
    return StudentRecord(
        completed_course_ids=[
            "I-001",
            "I-002",
            "F-001",
            "F-002",
            "F-006",
            "E-FL-001",
            "E-MI-001",
            "G-001",
        ],
        enrolled_years_excluding_leave=2,
        admission_month=10,
    )


if __name__ == "__main__":
    demo_catalog = build_demo_catalog()

    passing_student = demo_student_pass()
    failing_student = demo_student_fail()

    print("=== PASSING STUDENT ===")
    print(check_promotion_to_year4(passing_student, demo_catalog))
    print(check_graduation(passing_student, demo_catalog))
    print()

    print("=== FAILING STUDENT ===")
    print(check_promotion_to_year4(failing_student, demo_catalog))
    print(check_graduation(failing_student, demo_catalog))
    print(
        check_early_graduation_precheck(
            failing_student,
            demo_catalog,
            gpa_requirement_met=False,
            application_screening_passed=False,
        )
    )
