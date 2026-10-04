import type { PreviewBackground } from '../types/stamp'

export const PREVIEW_BACKGROUND_OPTIONS: { value: PreviewBackground; label: string }[] = [
  { value: 'checker', label: '透明' },
  { value: 'white', label: '白' },
  { value: 'lineLight', label: 'ライト' },
  { value: 'lineDark', label: 'ダーク' },
  { value: 'black', label: '黒' },
  { value: 'gray', label: 'グレー' },
  { value: 'line', label: 'トーク風' },
]
