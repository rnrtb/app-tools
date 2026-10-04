import { useEffect, useMemo, useRef, useState } from 'react'
import { isOutsideSafeArea } from '../../lib/image/fit'
import { usePointerTransform } from '../../hooks/usePointerTransform'
import type { PreviewBackground as PreviewBackgroundType, TransformState } from '../../types/stamp'
import { PREVIEW_BACKGROUND_OPTIONS } from '../../constants/previewBackground'
import { PreviewBackground } from '../common/PreviewBackground'

interface Props {
  title: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  canvasWidth: number
  canvasHeight: number
  safeMargin: number
  initialTransform: TransformState
  previewBackground: PreviewBackgroundType
  onPreviewBackgroundChange: (value: PreviewBackgroundType) => void
  hasTransparency: boolean
  onCancel: () => void
  onComplete: (transform: TransformState) => void
}

export function TransformEditor({
  title,
  imageUrl,
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  safeMargin,
  initialTransform,
  previewBackground,
  onPreviewBackgroundChange,
  hasTransparency,
  onCancel,
  onComplete,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const { transform, fit, center, setScale, handlers } = usePointerTransform({
    canvasWidth,
    canvasHeight,
    imageWidth,
    imageHeight,
    safeMargin,
    initial: initialTransform,
  })

  useEffect(() => {
    const img = new Image()
    img.onload = () => setImage(img)
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    const preventGesture = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    document.addEventListener('gestureend', preventGesture)
    return () => {
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
      document.removeEventListener('gestureend', preventGesture)
    }
  }, [])

  const outside = useMemo(
    () =>
      isOutsideSafeArea(imageWidth, imageHeight, transform, { width: canvasWidth, height: canvasHeight }, safeMargin),
    [imageWidth, imageHeight, transform, canvasWidth, canvasHeight, safeMargin],
  )

  const aspect = canvasWidth / canvasHeight

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost" onClick={onCancel} aria-label="閉じる">
            閉じる
          </button>
        </header>

        <div className="modal-toolbar">
          <div className="bg-switch" role="group" aria-label="プレビュー背景">
            {PREVIEW_BACKGROUND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={previewBackground === opt.value ? 'is-active' : ''}
                onClick={() => onPreviewBackgroundChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="editor-stage-wrap">
          <PreviewBackground
            variant={previewBackground}
            className="editor-stage"
            style={{ aspectRatio: `${aspect}` }}
          >
            <div
              ref={stageRef}
              className="editor-canvas"
              style={{ touchAction: 'none' }}
              {...handlers}
            >
              <svg
                className="editor-svg"
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                width="100%"
                height="100%"
                aria-hidden="true"
              >
                {image && (
                  <image
                    href={imageUrl}
                    x={transform.offsetX}
                    y={transform.offsetY}
                    width={imageWidth * transform.scale}
                    height={imageHeight * transform.scale}
                    preserveAspectRatio="none"
                  />
                )}
                <rect
                  x={safeMargin}
                  y={safeMargin}
                  width={canvasWidth - safeMargin * 2}
                  height={canvasHeight - safeMargin * 2}
                  fill="none"
                  stroke="rgba(15, 23, 42, 0.45)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </PreviewBackground>
        </div>

        {outside && (
          <p className="notice notice-warn" role="status">
            推奨の余白（約{safeMargin}px）を超えています。必要なら「全体を収める」で戻せます。
          </p>
        )}
        {!hasTransparency && (
          <p className="notice" role="status">
            透明部分がありません（JPEGなど）。そのままスタンプにできます。
          </p>
        )}

        <div className="zoom-row">
          <label htmlFor="zoom-slider">拡大</label>
          <input
            id="zoom-slider"
            type="range"
            min={0.05}
            max={4}
            step={0.01}
            value={Math.min(4, Math.max(0.05, transform.scale))}
            onChange={(e) => setScale(Number(e.target.value))}
            aria-label="拡大率"
          />
          <span>{Math.round(transform.scale * 100)}%</span>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={fit}>
            全体を収める
          </button>
          <button type="button" className="btn" onClick={center}>
            中央に戻す
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onComplete(transform)}>
            完了
          </button>
        </div>

        <p className="hint">
          タッチ：1本指で移動、2本指で拡大縮小　／　PC：ドラッグで移動、ホイールで拡大縮小
        </p>
      </div>
    </div>
  )
}
