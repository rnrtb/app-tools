import { useEffect, useMemo, useRef, useState } from 'react'
import { getFitScale, isOutsideSafeArea } from '../../lib/image/fit'
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
  onCancel,
  onComplete,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  /** 「最初に戻す」＝100% として扱う基準スケール */
  const fitScale = useMemo(
    () => getFitScale(imageWidth, imageHeight, { width: canvasWidth, height: canvasHeight }, safeMargin),
    [imageWidth, imageHeight, canvasWidth, canvasHeight, safeMargin],
  )

  const { transform, fit, setScale, handlers } = usePointerTransform({
    canvasWidth,
    canvasHeight,
    imageWidth,
    imageHeight,
    safeMargin,
    initial: initialTransform,
    minScale: fitScale * 0.25,
    maxScale: fitScale * 4,
  })

  const relativeZoom = transform.scale / fitScale

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    const markReady = () => {
      if (!cancelled) setImage(img)
    }
    img.onload = markReady
    img.onerror = () => {
      if (!cancelled) setImage(null)
    }
    img.src = imageUrl
    // Cached / already-decoded blob URLs may not fire onload again.
    if (img.complete && img.naturalWidth > 0) {
      markReady()
    }
    return () => {
      cancelled = true
    }
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
  // 線幅の半分がはみ出して切れないよう、ガイドをわずかに内側へ
  const guideInset = 1

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
            style={{
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              width: `min(100%, calc(min(58vh, 520px) * ${aspect}))`,
            }}
          >
            <div
              ref={stageRef}
              className="editor-canvas"
              style={{ touchAction: 'none' }}
              {...handlers}
            >
              {/*
                Use <img> (same as list preview), not SVG <image href>.
                Restored IndexedDB blob: URLs often fail to paint inside SVG
                while still loading fine for HTML img / export.
              */}
              {image ? (
                <img
                  src={imageUrl}
                  alt=""
                  draggable={false}
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
              ) : null}
              <svg
                className="editor-svg"
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                width="100%"
                height="100%"
                aria-hidden="true"
                style={{ pointerEvents: 'none' }}
              >
                {/* 点線ガイドは画像の上にオーバーレイ */}
                <rect
                  x={safeMargin + guideInset}
                  y={safeMargin + guideInset}
                  width={canvasWidth - safeMargin * 2 - guideInset * 2}
                  height={canvasHeight - safeMargin * 2 - guideInset * 2}
                  fill="none"
                  stroke="rgba(15, 23, 42, 0.65)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </PreviewBackground>
        </div>

        <p
          className={`notice notice-warn editor-margin-notice${outside ? '' : ' is-placeholder'}`}
          role="status"
          aria-hidden={!outside}
        >
          推奨の余白（約{safeMargin}px）を超えています。必要なら「最初に戻す」で戻せます。
        </p>

        <div className="zoom-row">
          <label htmlFor="zoom-slider">拡大</label>
          <input
            id="zoom-slider"
            type="range"
            min={0.25}
            max={4}
            step={0.01}
            value={Math.min(4, Math.max(0.25, relativeZoom))}
            onChange={(e) => setScale(Number(e.target.value) * fitScale)}
            aria-label="拡大率（最初に戻すときが100%）"
          />
          <span>{Math.round(relativeZoom * 100)}%</span>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={fit}>
            最初に戻す
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
