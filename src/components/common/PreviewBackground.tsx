import type { CSSProperties, ReactNode } from 'react'
import type { PreviewBackground as PreviewBackgroundType } from '../../types/stamp'

const STYLES: Record<PreviewBackgroundType, CSSProperties> = {
  checker: {
    backgroundColor: '#fff',
    backgroundImage:
      'linear-gradient(45deg, #d0d0d0 25%, transparent 25%), linear-gradient(-45deg, #d0d0d0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0d0d0 75%), linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  },
  white: { backgroundColor: '#ffffff' },
  black: { backgroundColor: '#111111' },
  gray: { backgroundColor: '#9aa0a6' },
  line: {
    backgroundColor: '#7494c0',
    backgroundImage: 'linear-gradient(180deg, #8eaccf 0%, #7494c0 40%, #6b8bb8 100%)',
  },
}

interface Props {
  variant: PreviewBackgroundType
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function PreviewBackground({ variant, className, style, children }: Props) {
  return (
    <div className={className} style={{ ...STYLES[variant], ...style }}>
      {children}
    </div>
  )
}

