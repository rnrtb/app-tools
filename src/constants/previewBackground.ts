import type { PreviewBackground } from '../types/stamp'

export const PREVIEW_BACKGROUND_OPTIONS: { value: PreviewBackground; label: string }[] = [
  { value: 'checker', label: '透明' },
  { value: 'lineLight', label: 'ライト' },
  { value: 'lineDark', label: 'ダーク' },
  { value: 'gray', label: 'グレー' },
  { value: 'line', label: 'トーク風' },
]

/** 旧保存データの白・黒などを現行の選択肢へ寄せる */
export function normalizePreviewBackground(value: string | null | undefined): PreviewBackground {
  switch (value) {
    case 'checker':
    case 'gray':
    case 'line':
    case 'lineLight':
    case 'lineDark':
      return value
    case 'white':
      return 'lineLight'
    case 'black':
      return 'lineDark'
    default:
      return 'checker'
  }
}
