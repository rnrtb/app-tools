import { Link } from 'react-router-dom'

export function StampGuidePage() {
  return (
    <main className="page guide-page">
      <nav className="breadcrumb" aria-label="パンくず">
        <Link to="/">ツール一覧</Link>
        <span aria-hidden="true">/</span>
        <Link to="/line">LINE</Link>
      </nav>

      <section className="guide-hero">
        <p className="brand">LINEスタンプ画像メーカー</p>
        <h1>LINEスタンプ画像をかんたん作成</h1>
        <p className="flow">画像を選ぶ → 大きさ・位置を調整 → ZIPを作成</p>
        <Link to="/line/stamp/maker" className="btn btn-primary btn-large">
          スタンプ画像を作る
        </Link>
        <p className="privacy-banner" role="note">
          画像はこの端末内で処理されます。画像がサーバーへアップロードされることはありません。
        </p>
      </section>

      <section className="guide-section">
        <h2>できること</h2>
        <ul className="feature-list">
          <li>複数画像をまとめて読み込み</li>
          <li>LINE用サイズへ自動調整</li>
          <li>タッチで位置・大きさ調整</li>
          <li>並べ替え</li>
          <li>main画像作成</li>
          <li>tab画像作成</li>
          <li>LINE仕様チェック</li>
          <li>ZIP一括生成</li>
        </ul>
      </section>

      <section className="guide-section">
        <h2>作ったあと</h2>
        <ol className="steps">
          <li>このツールで ZIP を作成・保存する</li>
          <li>LINE Creators Market にログインする</li>
          <li>スタンプを新規作成し、ZIP をアップロードする</li>
        </ol>
        <div className="link-row">
          <a href="https://creator.line.me/" target="_blank" rel="noreferrer">
            LINE Creators Market
          </a>
          <a href="https://creator.line.me/ja/guideline/sticker/" target="_blank" rel="noreferrer">
            制作ガイドライン
          </a>
        </div>
      </section>

      <p className="disclaimer">
        本ツールはLINEヤフー株式会社の公式サービスではありません。
        LINE Creators Market の仕様は変更される場合があります。最新の公式ガイドラインもご確認ください。
      </p>

      <div className="guide-cta">
        <Link to="/line/stamp/maker" className="btn btn-primary btn-large">
          スタンプ画像を作る
        </Link>
      </div>
    </main>
  )
}
