import type { CSSProperties, ReactNode } from 'react'
import type { PreviewBackground as PreviewBackgroundType } from '../../types/stamp'
import { normalizePreviewBackground } from '../../constants/previewBackground'

const STYLES: Record<PreviewBackgroundType, CSSProperties> = {
  /** LINE default light — sticker panel */
  lineLight: { backgroundColor: '#ffffff' },
  /** LINE default dark — sticker panel */
  lineDark: { backgroundColor: '#1A1A1A' },
  gray: { backgroundColor: '#9aa0a6' },
  line: {
    backgroundColor: '#7494c0',
    backgroundImage: 'linear-gradient(180deg, #8eaccf 0%, #7494c0 40%, #6b8bb8 100%)',
  },
}

interface Props {
  variant: PreviewBackgroundType | string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function PreviewBackground({ variant, className, style, children }: Props) {
  const resolved = normalizePreviewBackground(variant)
  return (
    <div className={className} style={{ ...STYLES[resolved], ...style }}>
      {children}
    </div>
  )
}
