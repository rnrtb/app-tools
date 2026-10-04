import { Link } from 'react-router-dom'

export function LineIndexPage() {
  return (
    <main className="page">
      <nav className="breadcrumb" aria-label="パンくず">
        <Link to="/">ツール一覧</Link>
      </nav>
      <header className="hero-simple">
        <h1>LINE関連ツール</h1>
        <p>LINE向けの画像・素材づくりを助けるツールです。</p>
      </header>

      <section className="card-list">
        <Link to="/line/stamp" className="tool-card">
          <h2>LINEスタンプ画像メーカー</h2>
          <p>画像を並べて、main / tab を整え、アップロード用ZIPを作成</p>
        </Link>
      </section>

      <p className="disclaimer">
        本サイトはLINEヤフー株式会社の公式サービスではありません。
      </p>
    </main>
  )
}
