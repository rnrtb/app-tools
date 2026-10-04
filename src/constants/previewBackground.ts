import type { PreviewBackground } from '../types/stamp'

export const PREVIEW_BACKGROUND_OPTIONS: { value: PreviewBackground; label: string }[] = [
  { value: 'line', label: 'トーク風' },
  { value: 'lineLight', label: 'ライト' },
  { value: 'lineDark', label: 'ダーク' },
  { value: 'gray', label: 'グレー' },
]

/** 旧保存データの透明・白・黒などを現行の選択肢へ寄せる */
export function normalizePreviewBackground(value: string | null | undefined): PreviewBackground {
  switch (value) {
    case 'gray':
    case 'line':
    case 'lineLight':
    case 'lineDark':
      return value
    case 'checker':
      return 'line'
    case 'white':
      return 'lineLight'
    case 'black':
      return 'lineDark'
    default:
      return 'line'
  }
}
