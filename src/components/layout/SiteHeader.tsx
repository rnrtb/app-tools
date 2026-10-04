import { Link } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  privacyNote?: boolean
}

export function SiteHeader({ title, subtitle, privacyNote }: Props) {
  return (
    <header className="site-header">
      <nav className="breadcrumb" aria-label="パンくず">
        <Link to="/">ツール一覧</Link>
        <span aria-hidden="true">/</span>
        <Link to="/line">LINE</Link>
      </nav>
      <h1>{title}</h1>
      {subtitle && <p className="lede">{subtitle}</p>}
      {privacyNote && (
        <p className="privacy-badge" role="note">
          画像はこの端末内だけで処理されます
        </p>
      )}
    </header>
  )
}
