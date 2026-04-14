/**
 * シラバスMarkdownファイルから courses.json を生成するメインスクリプト
 *
 * 使い方: npm run build:data
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'
import { extractCourse } from './extract-syllabus'
import { buildPrerequisiteMap, resolvePrerequisites } from './prerequisite-resolver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')
const SYLLABUS_DIR = path.join(PROJECT_ROOT, 'docs', 'syllabus', 'markdown')
const CURRICULUM_TREE_DIR = path.join(PROJECT_ROOT, 'docs', 'curriculum_tree')
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'courses.json')

async function main() {
  console.log('📚 シラバスデータの抽出を開始します...')
  console.log(`   シラバスディレクトリ: ${SYLLABUS_DIR}`)

  // シラバスMarkdownファイルを全取得
  const files = await glob('*.md', { cwd: SYLLABUS_DIR, absolute: true })
  console.log(`   発見したファイル数: ${files.length}`)

  // 前提科目マップを構築（カリキュラムツリーから）
  console.log('🌳 カリキュラムツリーから前提科目マップを構築中...')
  const prereqMap = buildPrerequisiteMap(CURRICULUM_TREE_DIR)
  console.log(`   推奨前提関係: ${prereqMap.size} 科目分`)

  // 各ファイルを解析
  const courses = []
  const errors: string[] = []
  const courseByName = new Map<string, string>() // 科目名 → ID（重複チェック用）
  const courseById = new Map<string, { course: ReturnType<typeof extractCourse>; openYear: number }>()

  for (const file of files.sort()) {
    try {
      const course = extractCourse(file)
      if (!course) continue

      // 同一ナンバリングの科目が複数ある場合は最新年度を優先
      const existingEntry = courseById.get(course.id)
      if (existingEntry) {
        if (course.openYear <= existingEntry.openYear) {
          continue // 古い年度はスキップ
        }
      }
      courseById.set(course.id, { course, openYear: course.openYear })
      courseByName.set(course.name, course.id)
    } catch (err) {
      const errMsg = `${path.basename(file)}: ${(err as Error).message}`
      errors.push(errMsg)
      console.error(`  ❌ エラー: ${errMsg}`)
    }
  }

  // カリキュラムツリーの前提科目マップを適用
  console.log('🔗 前提科目を解決中...')
  for (const [, entry] of courseById) {
    const { course } = entry
    if (!course) continue

    course.recommendedPrerequisites = resolvePrerequisites(
      course.name,
      course.recommendedPrerequisites,
      prereqMap
    )
  }

  // 重複排除したcourseリストを作成
  for (const { course } of courseById.values()) {
    if (course) courses.push(course)
  }

  // 科目数の内訳を表示
  const bandCounts: Record<string, number> = {}
  for (const c of courses) {
    bandCounts[c.band] = (bandCounts[c.band] || 0) + 1
  }

  console.log(`\n📊 抽出結果:`)
  console.log(`   総科目数: ${courses.length}`)
  for (const [band, count] of Object.entries(bandCounts)) {
    console.log(`   ${band}: ${count}`)
  }

  // foundationGroupsが空のfoundation科目を警告
  const missingGroups = courses.filter(c => c.band === 'foundation' && c.foundationGroups.length === 0)
  if (missingGroups.length > 0) {
    console.warn(`\n⚠️  foundationGroupsが未設定の基礎科目（manual-overrides.jsonの追加が必要）:`)
    for (const c of missingGroups) {
      console.warn(`   ${c.id}: ${c.name}`)
    }
  }

  if (errors.length > 0) {
    console.warn(`\n⚠️  ${errors.length}件のエラー:`)
    for (const err of errors) {
      console.warn(`   ${err}`)
    }
  }

  // 出力ディレクトリを作成
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // JSONに書き出し（pretty printなし、本番用）
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(courses, null, 2), 'utf-8')
  console.log(`\n✅ courses.json を出力しました: ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('致命的なエラー:', err)
  process.exit(1)
})
