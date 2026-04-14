import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-100">プライバシーポリシー</h1>
          <p className="mt-4 text-sm text-gray-500">最終更新日: 2026年4月14日</p>

          <div className="mt-6 space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">収集する情報について</h2>
              <p>
                本サービス（ZEN大学履修計画プランナー）は、個人情報を一切収集しません。
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li>氏名・学籍番号・メールアドレス等の個人情報の入力欄はありません</li>
                <li>アカウント登録・ログインは不要です</li>
                <li>入力した履修計画データはブラウザのローカルストレージにのみ保存されます</li>
                <li>入力データが外部サーバーに送信されることはありません</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">アクセス解析について</h2>
              <p>
                本サービスはアクセス解析ツール（Google Analytics等）を使用していません。
                アクセスログの収集・分析は行っていません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Cookieについて</h2>
              <p>
                本サービスはCookieを使用しません。
                チュートリアルの完了状態や履修計画データは、ブラウザのlocalStorageに保存されます。
                これはサーバーに送信されることはなく、お使いのブラウザ内にのみ存在します。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">外部サービスへのリンクについて</h2>
              <p>
                本サービスには以下の外部サービスへのリンクが含まれます。
                各サービスのプライバシーポリシーは各サービスのものが適用されます。
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>
                  <a href="https://syllabus.zen.ac.jp" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline">
                    ZEN大学公式シラバスサイト
                  </a>
                </li>
                <li>
                  <a href="https://github.com/sifue/zen-course-planner" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline">
                    GitHub（ソースコード・バグ報告）
                  </a>
                </li>
                <li>ZEN大学Slack（相談）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">データの削除について</h2>
              <p>
                本サービスが保存するデータ（履修計画・設定）はすべてブラウザのlocalStorageに保存されています。
                ブラウザの「サイトデータを削除」またはlocalStorageをクリアすることで、
                すべてのデータを削除できます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">プライバシーポリシーの変更について</h2>
              <p>
                本プライバシーポリシーは予告なく変更される場合があります。
                重要な変更がある場合はGitHubのリリースノートにてお知らせします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">お問い合わせ</h2>
              <p>
                プライバシーに関するご質問は
                <a
                  href="https://zen-student.slack.com/archives/C08GD3UR1EG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zen-600 hover:underline mx-1"
                >
                  ZEN大学Slack #times_sifue
                </a>
                またはGitHub Issuesまでご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-zen-600 hover:underline">← プランナーに戻る</Link>
            <Link to="/terms" className="text-gray-500 hover:underline">利用規約</Link>
            <Link to="/help" className="text-gray-500 hover:underline">使い方</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
