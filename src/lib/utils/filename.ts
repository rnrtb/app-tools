function stripInvalidFileNameChars(value: string): string {
  let out = ''
  for (const ch of value) {
    const code = ch.charCodeAt(0)
    if (code < 32) continue
    if ('<>:"/\\|?*'.includes(ch)) continue
    out += ch
  }
  return out
}

/**
 * ZIPファイル名用にサニタイズする。拡張子は付けない入力を想定。
 */
export function sanitizeZipBaseName(input: string): string {
  const trimmed = input.trim().replace(/\.zip$/i, '')
  const cleaned = stripInvalidFileNameChars(trimmed)
    .replace(/\s+/g, '-')
    .replace(/\.+/g, '.')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

  return cleaned || 'line-stamp'
}

export function toZipFileName(input: string): string {
  return `${sanitizeZipBaseName(input)}.zip`
}
