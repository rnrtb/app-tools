import type { CSSProperties } from 'react'
import type { PreviewBackground as PreviewBackgroundType, TransformState } from '../../types/stamp'
import { PreviewBackground } from './PreviewBackground'

interface Props {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  canvasWidth: number
  canvasHeight: number
  transform: TransformState
  previewBackground: PreviewBackgroundType
  alt?: string
  className?: string
  style?: CSSProperties
}

export function CompositionPreview({
  imageUrl,
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  transform,
  previewBackground,
  alt = '',
  className,
  style,
}: Props) {
  return (
    <PreviewBackground
      variant={previewBackground}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        ...style,
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          position: 'absolute',
          left: `${(transform.offsetX / canvasWidth) * 100}%`,
          top: `${(transform.offsetY / canvasHeight) * 100}%`,
          width: `${((imageWidth * transform.scale) / canvasWidth) * 100}%`,
          height: `${((imageHeight * transform.scale) / canvasHeight) * 100}%`,
          objectFit: 'fill',
          pointerEvents: 'none',
        }}
      />
    </PreviewBackground>
  )
}
