const SUPPORTED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])

const SUPPORTED_EXT = new Set(['png', 'jpg', 'jpeg', 'webp'])

const UNSUPPORTED_HINT =
  'この画像形式には現在対応していません。PNG、JPEG、WebPを使用してください。'

export function getExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function isSupportedImageFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase()
  if (SUPPORTED_MIME.has(mime)) return true
  if (!mime || mime === 'application/octet-stream') {
    return SUPPORTED_EXT.has(getExtension(file.name))
  }
  return false
}

export function assertSupportedImageFile(file: File): void {
  const ext = getExtension(file.name)
  const mime = (file.type || '').toLowerCase()

  if (ext === 'heic' || ext === 'heif' || mime.includes('heic') || mime.includes('heif')) {
    throw new Error(UNSUPPORTED_HINT)
  }

  if (!isSupportedImageFile(file)) {
    throw new Error(UNSUPPORTED_HINT)
  }
}

export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました。別のファイルを試してください。'))
    }
    img.src = url
  })
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  assertSupportedImageFile(file)
  return loadImageFromBlob(file)
}
