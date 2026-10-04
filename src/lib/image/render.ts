import type { TransformState } from '../../types/stamp'
import { loadImageFromBlob } from './loadImage'

export interface RenderOptions {
  canvasWidth: number
  canvasHeight: number
  image: CanvasImageSource
  imageWidth: number
  imageHeight: number
  transform: TransformState
}

/**
 * 透明キャンバスへ画像を描画し、PNG Blobを返す。
 * プレビュー背景は絶対に含めない。
 */
export function renderToCanvas(options: RenderOptions): HTMLCanvasElement {
  const { canvasWidth, canvasHeight, image, imageWidth, imageHeight, transform } = options
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('画像の書き出しに失敗しました。もう一度お試しください。')
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.drawImage(
    image,
    0,
    0,
    imageWidth,
    imageHeight,
    transform.offsetX,
    transform.offsetY,
    imageWidth * transform.scale,
    imageHeight * transform.scale,
  )

  return canvas
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNGの作成に失敗しました。もう一度お試しください。'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export async function renderBlobToPng(options: {
  sourceBlob: Blob
  canvasWidth: number
  canvasHeight: number
  imageWidth: number
  imageHeight: number
  transform: TransformState
}): Promise<Blob> {
  const image = await loadImageFromBlob(options.sourceBlob)
  const canvas = renderToCanvas({
    canvasWidth: options.canvasWidth,
    canvasHeight: options.canvasHeight,
    image,
    imageWidth: options.imageWidth,
    imageHeight: options.imageHeight,
    transform: options.transform,
  })
  return canvasToPngBlob(canvas)
}

/** 一覧プレビュー用の軽量描画（既存サムネを単純表示する場合は不要） */
export function drawPreview(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions & { displayWidth: number; displayHeight: number },
): void {
  const scaleX = options.displayWidth / options.canvasWidth
  const scaleY = options.displayHeight / options.canvasHeight

  ctx.clearRect(0, 0, options.displayWidth, options.displayHeight)
  ctx.save()
  ctx.scale(scaleX, scaleY)
  ctx.drawImage(
    options.image,
    0,
    0,
    options.imageWidth,
    options.imageHeight,
    options.transform.offsetX,
    options.transform.offsetY,
    options.imageWidth * options.transform.scale,
    options.imageHeight * options.transform.scale,
  )
  ctx.restore()
}
