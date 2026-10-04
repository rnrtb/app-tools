import type { TransformState } from '../../types/stamp'

export interface CanvasSize {
  width: number
  height: number
}

/**
 * 安全領域内に画像全体が収まる最大倍率で中央配置する。
 */
export function createFitTransform(
  imageWidth: number,
  imageHeight: number,
  canvas: CanvasSize,
  safeMarginPx: number,
): TransformState {
  const safeW = Math.max(1, canvas.width - safeMarginPx * 2)
  const safeH = Math.max(1, canvas.height - safeMarginPx * 2)
  const scale = Math.min(safeW / imageWidth, safeH / imageHeight)
  const drawW = imageWidth * scale
  const drawH = imageHeight * scale

  return {
    scale,
    offsetX: (canvas.width - drawW) / 2,
    offsetY: (canvas.height - drawH) / 2,
  }
}

export function createCenterTransform(
  imageWidth: number,
  imageHeight: number,
  canvas: CanvasSize,
  scale: number,
): TransformState {
  const drawW = imageWidth * scale
  const drawH = imageHeight * scale
  return {
    scale,
    offsetX: (canvas.width - drawW) / 2,
    offsetY: (canvas.height - drawH) / 2,
  }
}

/** 画像が安全領域からはみ出しているか */
export function isOutsideSafeArea(
  imageWidth: number,
  imageHeight: number,
  transform: TransformState,
  canvas: CanvasSize,
  safeMarginPx: number,
): boolean {
  const left = transform.offsetX
  const top = transform.offsetY
  const right = left + imageWidth * transform.scale
  const bottom = top + imageHeight * transform.scale

  return (
    left < safeMarginPx ||
    top < safeMarginPx ||
    right > canvas.width - safeMarginPx ||
    bottom > canvas.height - safeMarginPx
  )
}
