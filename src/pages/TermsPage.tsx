import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-100">利用規約</h1>
          <p className="mt-4 text-sm text-gray-500">最終更新日: 2026年4月14日</p>

          <div className="mt-6 space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第1条（本サービスについて）</h2>
              <p>
                ZEN大学履修計画プランナー（以下「本サービス」）は、ZEN大学の学生が4年間の履修計画を立てるための
                <strong>非公式の個人制作ツール</strong>です。本サービスはZEN大学および関連機関とは
                一切関係なく、公式の情報提供ではありません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第2条（免責事項）</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  本サービスが提供する情報（科目情報・卒業要件・進級要件等）は、
                  公開されているシラバス情報をもとに作成されていますが、
                  <strong>正確性・完全性・最新性を保証するものではありません</strong>。
                </li>
                <li>
                  履修計画の最終的な確認・判断・責任はすべて利用者ご本人にあります。
                  必ずZEN大学の
                  <a href="https://syllabus.zen.ac.jp" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline mx-1">
                    公式シラバスサイト
                  </a>
                  や担当教員・学生支援窓口にご確認ください。
                </li>
                <li>
                  本サービスの利用によって生じた単位不足・卒業要件未達・進級要件未達
                  その他いかなる不利益についても、作者は一切の責任を負いません。
                </li>
                <li>
                  本サービスは予告なく変更・中断・終了される場合があります。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第3条（データの保存）</h2>
              <p>
                本サービスで作成した履修計画データは、お使いのブラウザのローカルストレージにのみ保存されます。
                外部サーバーへのデータ送信は一切行いません。ブラウザのデータ消去やプライベートブラウジング終了時に
                データが失われる可能性があります。重要なデータは定期的にMarkdownファイルとしてエクスポートしてください。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第4条（知的財産権）</h2>
              <p>
                本サービスのソースコードはMITライセンスで公開されています。
                科目情報・シラバスデータに関する権利はZEN大学に帰属します。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第5条（禁止事項）</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li>本サービスを商業目的で無断利用すること</li>
                <li>本サービスに対して過度な負荷をかける行為</li>
                <li>その他、法令または公序良俗に反する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第6条（規約の変更）</h2>
              <p>
                本規約は予告なく変更される場合があります。変更後も本サービスを利用した場合、
                変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">第7条（お問い合わせ）</h2>
              <p>
                本サービスに関するご意見・ご不満・バグ報告は以下からお願いします。
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <a
                    href="https://github.com/sifue/zen-course-planner/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zen-600 hover:underline"
                  >
                    GitHub Issues
                  </a>
                </li>
                <li>
                  <a
                    href="https://zen-student.slack.com/archives/C08GD3UR1EG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zen-600 hover:underline"
                  >
                    ZEN大学Slack #times_sifue チャンネル
                  </a>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-zen-600 hover:underline">← プランナーに戻る</Link>
            <Link to="/privacy" className="text-gray-500 hover:underline">プライバシーポリシー</Link>
            <Link to="/help" className="text-gray-500 hover:underline">使い方</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
