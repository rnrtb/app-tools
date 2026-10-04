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
        <a href="/worksheet/kanji/" className="tool-card">
          <h2>漢字プリントメーカー</h2>
          <p>ラボ式の漢字練習プリントを作成・印刷</p>
        </a>
        <Link to="/line/stamp/maker" className="tool-card">
          <h2>LINEスタンプ画像メーカー</h2>
          <p>画像を整えて、Creators Market 用ZIPを作成</p>
        </Link>
      </section>
    </main>
  )
}
