import { Link } from 'react-router-dom'
import { GraduationCap, LayoutGrid, Sliders, CheckSquare, Download, Zap, MessageSquare, AlertTriangle, Keyboard } from 'lucide-react'

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zen-100">
          <Icon className="h-4 w-4 text-zen-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="pl-10 space-y-2 text-sm text-gray-700">{children}</div>
    </section>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          {/* タイトル */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zen-600 text-white font-bold">
              Z
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">使い方ガイド</h1>
              <p className="text-sm text-gray-500">ZEN大学履修計画プランナー</p>
            </div>
          </div>

          <Section icon={GraduationCap} title="このアプリについて">
            <p>
              ZEN大学の4年間（最大8年）の履修計画を立てるための<strong>非公式ツール</strong>です。
              科目の絞り込み・ドラッグ＆ドロップでの配置・卒業要件チェックなどの機能を提供します。
            </p>
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs">
                このアプリは個人が作成した非公式ツールです。履修計画の最終確認は必ずZEN大学の
                <a href="https://syllabus.zen.ac.jp" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline mx-1">
                  公式シラバスサイト
                </a>
                や指導教員にご確認ください。
              </p>
            </div>
          </Section>

          <Section icon={LayoutGrid} title="基本操作">
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">1</span>
                <div>
                  <p className="font-medium">科目を探す</p>
                  <p className="text-gray-500 mt-0.5">左側の科目一覧から、年次・分類・タグなどで絞り込みながら履修したい科目を探します。科目カードをクリックすると詳細が表示されます。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">2</span>
                <div>
                  <p className="font-medium">グリッドに配置する</p>
                  <p className="text-gray-500 mt-0.5">科目カードをドラッグして、中央のグリッドの年次・クォーターにドロップします。スマートフォンでは科目カードを長押しするとドラッグが開始されます。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">3</span>
                <div>
                  <p className="font-medium">要件を確認する</p>
                  <p className="text-gray-500 mt-0.5">右側パネルでリアルタイムに卒業要件・進級要件の充足状況を確認できます。不足している要件は赤で表示されます。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zen-100 text-zen-700 text-xs font-bold">4</span>
                <div>
                  <p className="font-medium">計画を保存する</p>
                  <p className="text-gray-500 mt-0.5">ヘッダーの「保存」ボタンで計画をブラウザに保存します。「別名保存」で複数の計画を管理できます。「読み込み」で保存済みの計画を切り替えられます。</p>
                </div>
              </li>
            </ol>
          </Section>

          <Section icon={Sliders} title="絞り込み機能">
            <p>科目一覧の上部にある絞り込みボタンを使うと、条件に合う科目だけを表示できます。</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside">
              <li><strong>年次フィルター</strong> — 「1年次」〜「4年次」で履修想定年次を絞り込む</li>
              <li><strong>分類フィルター</strong> — 科目の区分（導入/基礎/展開/卒プロ/自由など）で絞り込む</li>
              <li><strong>タグフィルター</strong> — 「数理」「情報」「文化・思想」などのタグで絞り込む</li>
              <li><strong>未配置のみ</strong> — まだ計画に入れていない科目だけを表示する</li>
              <li><strong>テキスト検索</strong> — 科目名・概要・タグを横断検索する</li>
            </ul>
            <p className="mt-2 text-gray-500">ボタンをもう一度クリックするとフィルターが解除されます。</p>
          </Section>

          <Section icon={AlertTriangle} title="前提科目チェック">
            <p>
              科目カードにオレンジ（⚠）または赤（❌）のアイコンが表示されているときは、
              推奨前提科目または必須前提科目が計画に含まれていない可能性があります。
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside">
              <li><strong>オレンジ警告</strong> — 推奨前提科目が未配置（受講は可能だが事前学習を推奨）</li>
              <li><strong>赤エラー</strong> — 必須前提科目が未配置（受講資格に注意）</li>
            </ul>
            <p className="mt-2 text-gray-500">前提科目データはカリキュラムツリーから推論しているため、正確でない場合があります。公式シラバスをご確認ください。</p>
          </Section>

          <Section icon={Zap} title="自動配置機能">
            <p>
              ヘッダーの「自動配置」ボタンから、カリキュラムツリーに基づいた履修計画を自動生成できます。
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside">
              <li><strong>情報ルート</strong> — Web開発・プログラミングを中心に学ぶ</li>
              <li><strong>データサイエンスルート</strong> — 統計・機械学習・データ分析を中心に学ぶ</li>
              <li><strong>経済・マーケットルート</strong> — 経済学・マーケティング・起業を中心に学ぶ</li>
            </ul>
            <p className="mt-2 text-gray-500">自動配置は目安です。卒業要件をすべて満たすとは限りません。必ず要件パネルで確認してください。</p>
          </Section>

          <Section icon={MessageSquare} title="AIへの相談機能">
            <p>
              ヘッダーの「AIに相談」ボタンから、ZEN大学のSlackbot AIに履修相談するためのプロンプトを生成できます。
            </p>
            <ol className="mt-2 space-y-1.5 list-decimal list-inside">
              <li>あなたの希望や思考を入力する</li>
              <li>生成されたプロンプトをコピーして Slack の Slackbot AIに貼り付ける</li>
              <li>AIが返したMarkdownテーブルを「AIの回答をインポート」タブで取り込む</li>
            </ol>
          </Section>

          <Section icon={Download} title="エクスポート・インポート">
            <p>
              ヘッダーの「エクスポート」ボタンでMarkdown形式のデータを出力・保存できます。
              「インポート」ボタンでそのデータを読み込むことで、別の端末でも計画を続けられます。
            </p>
          </Section>

          <Section icon={Keyboard} title="キーボードショートカット">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-1.5 pr-6 text-left font-medium text-gray-600 w-40">ショートカット</th>
                  <th className="py-1.5 text-left font-medium text-gray-600">動作</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 pr-6">
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Ctrl+S</kbd>
                    <span className="mx-1 text-gray-400">/</span>
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">⌘+S</kbd>
                  </td>
                  <td className="py-1.5 text-gray-600">履修計画を即時保存</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 pr-6">
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Enter</kbd>
                    <span className="mx-1 text-gray-400">/</span>
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Space</kbd>
                  </td>
                  <td className="py-1.5 text-gray-600">科目カードの選択（キーボードフォーカス時）</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-6">
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Esc</kbd>
                  </td>
                  <td className="py-1.5 text-gray-600">ダイアログ・モーダルを閉じる</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section icon={CheckSquare} title="卒業要件について">
            <p>右側パネルに表示される卒業要件は以下の通りです（2026年4月時点）:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
              <li>総単位数: 124単位以上</li>
              <li>導入科目: 14単位以上</li>
              <li>基礎科目: 12単位以上（各分野2単位以上）</li>
              <li>展開科目: 74単位以上（各区分に最低単位数あり）</li>
              <li>卒業プロジェクト科目: 4単位以上（「プロジェクト実践」必修）</li>
              <li>3→4年次進級: 90単位以上</li>
            </ul>
            <p className="mt-2 text-gray-500">詳細は
              <a href="https://sites.google.com/zen.ac.jp/zen-gakuseibinran/academics/graduation_requirements" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline mx-1">
                学生便覧「進級・卒業について」
              </a>
              または
              <a href="https://syllabus.zen.ac.jp" target="_blank" rel="noopener noreferrer" className="text-zen-600 hover:underline mx-1">
                公式シラバスサイト
              </a>
              をご確認ください。
            </p>
          </Section>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-zen-600 hover:underline">← プランナーに戻る</Link>
            <Link to="/terms" className="text-gray-500 hover:underline">利用規約</Link>
            <Link to="/privacy" className="text-gray-500 hover:underline">プライバシーポリシー</Link>
            <Link to="/data-source" className="text-gray-500 hover:underline">データの取得元</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
