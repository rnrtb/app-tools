import { detectTransparency } from './transparency'
import { loadImageFromFile } from './loadImage'

/** 出力最大の約2倍を上限にし、巨大原画を保持しない */
export const MAX_WORKING_EDGE = 1024
export const THUMB_EDGE = 160

export interface OptimizedImage {
  workingBlob: Blob
  thumbBlob: Blob
  width: number
  height: number
  hasTransparency: boolean
}

function drawToBlob(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  destW: number,
  destH: number,
  type = 'image/png',
  quality?: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = destW
  canvas.height = destH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return Promise.reject(new Error('画像の処理に失敗しました。もう一度お試しください。'))
  }
  ctx.clearRect(0, 0, destW, destH)
  ctx.drawImage(source, 0, 0, srcW, srcH, 0, 0, destW, destH)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('画像の処理に失敗しました。もう一度お試しください。'))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}

function fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const edge = Math.max(width, height)
  if (edge <= maxEdge) {
    return { width, height }
  }
  const scale = maxEdge / edge
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * 読み込み画像を作業用サイズへ一度だけ最適化する。
 * 編集のたびに再圧縮しない。
 */
export async function optimizeInputImage(file: File): Promise<OptimizedImage> {
  const image = await loadImageFromFile(file)
  const srcW = image.naturalWidth || image.width
  const srcH = image.naturalHeight || image.height

  if (!srcW || !srcH) {
    throw new Error('画像サイズを取得できませんでした。別のファイルを試してください。')
  }

  const working = fitWithin(srcW, srcH, MAX_WORKING_EDGE)
  const thumb = fitWithin(srcW, srcH, THUMB_EDGE)
  const hasTransparency = detectTransparency(image, srcW, srcH)

  const workingBlob = await drawToBlob(image, srcW, srcH, working.width, working.height, 'image/png')
  const thumbBlob = await drawToBlob(image, srcW, srcH, thumb.width, thumb.height, 'image/png')

  return {
    workingBlob,
    thumbBlob,
    width: working.width,
    height: working.height,
    hasTransparency,
  }
}
