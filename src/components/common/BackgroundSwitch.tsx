import { PREVIEW_BACKGROUND_OPTIONS } from '../../constants/previewBackground'
import type { PreviewBackground } from '../../types/stamp'

interface Props {
  value: PreviewBackground
  onChange: (value: PreviewBackground) => void
  ariaLabel?: string
}

export function BackgroundSwitch({
  value,
  onChange,
  ariaLabel = 'プレビュー背景',
}: Props) {
  return (
    <div className="bg-switch-block">
      <div className="bg-switch" role="group" aria-label={ariaLabel}>
        {PREVIEW_BACKGROUND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={value === opt.value ? 'is-active' : ''}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="bg-switch-hint">どの背景でも見やすいことを確認しましょう！</p>
    </div>
  )
}
