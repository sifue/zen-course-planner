import { Link } from 'react-router-dom'
import { ExternalLink, Database, Calendar, AlertTriangle } from 'lucide-react'

export default function DataSourcePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-100">データの取得元</h1>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              以下のデータは取得時点のものです。シラバスや要件は変更される場合があります。
              必ず公式サイトで最新情報をご確認ください。
            </p>
          </div>

          <div className="mt-6 space-y-6 text-sm text-gray-700">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-zen-600" />
                <h2 className="text-base font-bold text-gray-900">科目データ（シラバス）</h2>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600 w-32">取得元</td>
                    <td className="py-2">
                      <a
                        href="https://syllabus.zen.ac.jp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zen-600 hover:underline"
                      >
                        ZEN大学 公式シラバスサイト
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600">取得日時</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>2026年4月14日</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600">科目数</td>
                    <td className="py-2">285科目（重複科目は最新年度のデータを使用）</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600">取得方法</td>
                    <td className="py-2">公開シラバスページよりMarkdown形式でスクレイピング・自動解析</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-600">注意事項</td>
                    <td className="py-2 text-gray-500">
                      科目の開講状況・クォーター・単位数・前提科目は変更される場合があります。
                      前提科目情報はカリキュラムツリーから推論しており、正確でない場合があります。
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-zen-600" />
                <h2 className="text-base font-bold text-gray-900">卒業要件・進級要件</h2>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600 w-32">取得元</td>
                    <td className="py-2">
                      <a
                        href="https://sites.google.com/zen.ac.jp/zen-gakuseibinran/academics/graduation_requirements"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zen-600 hover:underline"
                      >
                        ZEN大学 学生便覧「進級・卒業について」
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600">参照日時</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>2026年4月14日</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-600">主要要件</td>
                    <td className="py-2">
                      <ul className="space-y-0.5 text-gray-600">
                        <li>総単位数: 124単位以上</li>
                        <li>導入科目: 14単位以上</li>
                        <li>基礎科目: 12単位以上（各分野2単位以上）</li>
                        <li>展開科目: 74単位以上</li>
                        <li>卒業プロジェクト科目: 4単位以上</li>
                        <li>3→4年次進級: 90単位以上</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-zen-600" />
                <h2 className="text-base font-bold text-gray-900">カリキュラムツリー</h2>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600 w-32">内容</td>
                    <td className="py-2">
                      情報・データサイエンス・経済マーケットの3ルートの推奨履修順序
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-600">用途</td>
                    <td className="py-2">
                      前提科目の推論・自動配置アルゴリズムの優先順序決定に使用
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2">ソースコード</h2>
              <p className="text-gray-600">
                本アプリのソースコードはMITライセンスでGitHubに公開しています。
                データ取得・処理スクリプトも含まれています。
              </p>
              <a
                href="https://github.com/sifue/zen-course-planner"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-zen-600 hover:underline font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                github.com/sifue/zen-course-planner
              </a>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-zen-600 hover:underline">← プランナーに戻る</Link>
            <Link to="/terms" className="text-gray-500 hover:underline">利用規約</Link>
            <Link to="/privacy" className="text-gray-500 hover:underline">プライバシーポリシー</Link>
            <Link to="/help" className="text-gray-500 hover:underline">使い方</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
