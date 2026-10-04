interface Props {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  stampCount?: number
  countMessage?: string
  nextHint?: string
  nextHintTone?: 'normal' | 'warn' | 'ok'
  backLabel?: string
}

export function MakerStepNav({
  onBack,
  onNext,
  nextLabel = '次へ',
  nextDisabled = false,
  stampCount,
  countMessage,
  nextHint,
  nextHintTone = 'normal',
  backLabel = '戻る',
}: Props) {
  const showCount = typeof stampCount === 'number' && stampCount > 0
  const showHintCard = !showCount && Boolean(nextHint) && nextHintTone !== 'normal'
  const showPlainHint = !showCount && Boolean(nextHint) && nextHintTone === 'normal'
  const stackCentered = showCount || showHintCard || !onBack
  const toneClass =
    nextHintTone === 'warn' ? 'is-warn' : nextHintTone === 'ok' ? 'is-ok' : ''

  return (
    <div className="maker-step-nav">
      {showCount && (
        <div className={`maker-count-status ${toneClass}`} role="status">
          <div className="maker-count-status-main">
            <span className="maker-count-label">現在のスタンプ</span>
            <span className="maker-count-value">
              <span className="maker-count-num">{stampCount}</span>
              <span className="maker-count-unit">個</span>
            </span>
          </div>
          {countMessage && <p className="maker-count-message">{countMessage}</p>}
        </div>
      )}

      {showHintCard && (
        <div className={`maker-count-status ${toneClass}`} role="status">
          <p className="maker-count-message">{nextHint}</p>
        </div>
      )}

      {showPlainHint && (
        <p className="maker-step-hint" role="status">
          {nextHint}
        </p>
      )}

      <div className={`maker-step-nav-actions ${stackCentered ? 'is-centered' : ''}`}>
        {onBack && (
          <button type="button" className="btn" onClick={onBack}>
            {backLabel}
          </button>
        )}
        {onNext && (
          <button
            type="button"
            className="btn btn-primary btn-large"
            disabled={nextDisabled}
            onClick={onNext}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
