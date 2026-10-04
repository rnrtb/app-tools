import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="page">
      <header className="hero-simple">
        <p className="brand">tools.mirai-study.com</p>
        <h1>小さなWebツール置き場</h1>
        <p>ブラウザだけで使える便利ツールを集めています。</p>
      </header>

      <section className="card-list">
        <Link to="/line" className="tool-card">
          <h2>LINE関連ツール</h2>
          <p>LINEスタンプ画像メーカーなど</p>
        </Link>
        <a href="/worksheet/kanji/" className="tool-card">
          <h2>漢字プリントメーカー</h2>
          <p>ラボ式の漢字練習プリントを作成・印刷</p>
        </a>
      </section>
    </main>
  )
}
