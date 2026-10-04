/**
 * 画像に半透明または完全透明ピクセルがあるかざっくり検査する。
 * JPEG等では通常 false。
 */
export function detectTransparency(image: CanvasImageSource, width: number, height: number): boolean {
  const canvas = document.createElement('canvas')
  const sampleW = Math.min(width, 64)
  const sampleH = Math.min(height, 64)
  canvas.width = sampleW
  canvas.height = sampleH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false

  ctx.clearRect(0, 0, sampleW, sampleH)
  ctx.drawImage(image, 0, 0, sampleW, sampleH)

  try {
    const { data } = ctx.getImageData(0, 0, sampleW, sampleH)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]! < 255) return true
    }
  } catch {
    return false
  }

  return false
}
