/**
 * LINE Creators Market スタンプ仕様設定。
 * UI / 画像処理コードへ数値を散在させず、ここで一元管理する。
 *
 * 参照: https://creator.line.me/guideline/sticker/
 * 命名: main.png / tab.png / 01.png, 02.png, ...
 */

export type StampTypeId = 'static'

export interface SizeSpec {
  width: number
  height: number
}

export interface MarginRule {
  /** 推奨余白（px）。編集ガイド用。出力には含めない。 */
  recommendedSafeMarginPx: number
}

export interface StampTypeSpec {
  id: StampTypeId
  label: string
  allowedCounts: readonly number[]
  /** スタンプ画像の出力キャンバス（初版は最大サイズで固定） */
  canvasSize: SizeSpec
  mainSize: SizeSpec
  tabSize: SizeSpec
  maxFileSizeBytes: number
  maxZipSizeBytes: number
  format: 'png'
  requireEvenDimensions: boolean
  colorMode: 'rgb' | 'rgba'
  minDpi: number
  transparentBackgroundRecommended: boolean
  marginRule: MarginRule
  /** ZIP内のスタンプファイル名（1始まりゼロ埋め） */
  stampFileName: (index1Based: number) => string
  mainFileName: string
  tabFileName: string
}

export const STATIC_STAMP_SPEC: StampTypeSpec = {
  id: 'static',
  label: '通常の静止画スタンプ',
  allowedCounts: [8, 16, 24, 32, 40],
  canvasSize: { width: 370, height: 320 },
  mainSize: { width: 240, height: 240 },
  tabSize: { width: 96, height: 74 },
  maxFileSizeBytes: 1 * 1024 * 1024,
  maxZipSizeBytes: 60 * 1024 * 1024,
  format: 'png',
  requireEvenDimensions: true,
  colorMode: 'rgba',
  minDpi: 72,
  transparentBackgroundRecommended: true,
  marginRule: {
    recommendedSafeMarginPx: 10,
  },
  stampFileName: (index1Based) => `${String(index1Based).padStart(2, '0')}.png`,
  mainFileName: 'main.png',
  tabFileName: 'tab.png',
}

export const STAMP_SPECS: Record<StampTypeId, StampTypeSpec> = {
  static: STATIC_STAMP_SPEC,
}

/** 初版で利用するスタンプ種別 */
export const DEFAULT_STAMP_TYPE: StampTypeId = 'static'

export function getStampSpec(type: StampTypeId = DEFAULT_STAMP_TYPE): StampTypeSpec {
  return STAMP_SPECS[type]
}
