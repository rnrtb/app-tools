export type PreviewBackground =
  | 'checker'
  | 'white'
  | 'black'
  | 'gray'
  | 'line'
  | 'lineLight'
  | 'lineDark'

export interface TransformState {
  scale: number
  offsetX: number
  offsetY: number
}

export interface StampImageItem {
  id: string
  /** 内部作業用画像（最適化済み） */
  workingBlob: Blob
  /** 一覧用サムネイル */
  thumbBlob: Blob
  /** Object URL（解放管理用） */
  workingUrl: string
  thumbUrl: string
  originalName: string
  sourceMime: string
  width: number
  height: number
  transform: TransformState
  hasTransparency: boolean
}

export type SpecialImageSource = 'stamp' | 'upload'

export interface SpecialImageState {
  source: SpecialImageSource
  /** source === 'stamp' のとき参照するスタンプID */
  stampId: string | null
  /** source === 'upload' のときの作業画像 */
  workingBlob: Blob | null
  thumbBlob: Blob | null
  workingUrl: string | null
  thumbUrl: string | null
  width: number
  height: number
  transform: TransformState
  hasTransparency: boolean
  originalName: string
}

export interface StampProject {
  version: 1
  stampType: 'static'
  stamps: StampImageItem[]
  main: SpecialImageState
  tab: SpecialImageState
  zipName: string
  previewBackground: PreviewBackground
  updatedAt: number
}

export interface PersistedStampItem {
  id: string
  workingBlob: Blob
  thumbBlob: Blob
  originalName: string
  sourceMime: string
  width: number
  height: number
  transform: TransformState
  hasTransparency: boolean
}

export interface PersistedSpecialImage {
  source: SpecialImageSource
  stampId: string | null
  workingBlob: Blob | null
  thumbBlob: Blob | null
  width: number
  height: number
  transform: TransformState
  hasTransparency: boolean
  originalName: string
}

export interface PersistedProject {
  version: 1
  stampType: 'static'
  stamps: PersistedStampItem[]
  main: PersistedSpecialImage
  tab: PersistedSpecialImage
  zipName: string
  previewBackground: PreviewBackground
  updatedAt: number
}

export type CheckLevel = 'ok' | 'warn' | 'error'

export interface CheckItem {
  id: string
  label: string
  level: CheckLevel
  message: string
  /** 修正対象のスタンプ番号（1始まり）など */
  targetStampIndex?: number
}

export interface ValidationResult {
  ok: boolean
  items: CheckItem[]
  canCreateZip: boolean
}
