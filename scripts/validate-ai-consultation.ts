/**
 * AI相談プロンプトとインポート形式の結合検証
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { checkGraduation } from '../src/lib/graduation-checker'
import { importFromMarkdown } from '../src/lib/markdown-importer'
import { generateSlackbotPrompt } from '../src/lib/prompt-generator'
import type { Course } from '../src/types/course'
import type { PlannedCourse } from '../src/types/plan'

const courses = JSON.parse(readFileSync('src/data/courses.json', 'utf8')) as Course[]
const courseMap = Object.fromEntries(courses.map(course => [course.id, course]))
const candidates = courses.filter(course => course.quarters.length > 0).slice(0, 2)
assert.equal(candidates.length, 2, '検証に必要な科目データが不足しています')

const currentPlan: PlannedCourse[] = [{
  courseId: candidates[0].id,
  year: 1,
  quarter: candidates[0].quarters[0] as 1 | 2 | 3 | 4,
}]
const prompt = generateSlackbotPrompt(
  '情報分野を中心に学びたい',
  currentPlan,
  courseMap,
  checkGraduation(currentPlan, courseMap),
  6
)

assert.match(prompt, /IMPORT_DATA_START/, 'プロンプトに機械可読データの指示がありません')
assert.match(prompt, /コードフェンスで囲まず/, 'HTMLコメントを保つ指示がありません')
assert.match(prompt, /公式シラバスURL/, '公式情報の確認手順がありません')
assert.match(prompt, new RegExp(candidates[0].id), '現在の履修科目またはカタログが含まれていません')
assert.match(prompt, /「year」は1〜6/, '計画の最大年次がJSON制約へ反映されていません')
assert.ok(prompt.length < 40_000, `プロンプトが長すぎます（${prompt.length}文字）`)

const importPayload = {
  version: '1.0',
  planName: 'AIおすすめ追加案',
  plannedCourses: [{
    courseId: candidates[1].id,
    year: 2,
    quarter: candidates[1].quarters[0],
    note: '希望に合うため',
  }],
}
const aiAnswer = `提案理由です。\n\n| 配置年次 | 配置Q | 科目ID |\n|---|---|---|\n\n<!-- IMPORT_DATA_START\n${JSON.stringify(importPayload)}\nIMPORT_DATA_END -->`
const parsed = importFromMarkdown(aiAnswer, { courseMap, maxYear: 6 })
assert.equal(parsed.success, true, parsed.error)
assert.deepEqual(parsed.plannedCourses, importPayload.plannedCourses)

const unknownCourse = importFromMarkdown(
  '<!-- IMPORT_DATA_START\n{"plannedCourses":[{"courseId":"UNKNOWN-1-A1-0000-000","year":1,"quarter":1}]}\nIMPORT_DATA_END -->',
  { courseMap }
)
assert.equal(unknownCourse.success, false, '未知の科目IDが受理されました')
assert.match(unknownCourse.error ?? '', /存在しません/)

const duplicateExisting = importFromMarkdown(aiAnswer, {
  courseMap,
  maxYear: 6,
  excludedCourseIds: new Set([candidates[1].id]),
})
assert.equal(duplicateExisting.success, false, '配置済み科目が追加候補として受理されました')
assert.match(duplicateExisting.error ?? '', /すでに履修計画へ配置/)

const malformedJson = importFromMarkdown(
  '<!-- IMPORT_DATA_START\n{"plannedCourses":[]} trailing\nIMPORT_DATA_END -->',
  { courseMap }
)
assert.equal(malformedJson.success, false, '不正なJSONが受理されました')
assert.match(malformedJson.error ?? '', /JSONを解析できません/)

console.log(`AI相談・インポート検証: OK（科目 ${courses.length}件）`)
