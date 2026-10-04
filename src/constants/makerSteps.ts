export type MakerStepId = 'stamps' | 'cover' | 'zip' | 'copy'

export interface MakerStep {
  id: MakerStepId
  number: number
  label: string
  shortLabel: string
}

/** maker の作業ステップ。copy は今後のタイトル・説明文プロンプト用 */
export const MAKER_STEPS: readonly MakerStep[] = [
  { id: 'stamps', number: 1, label: 'スタンプ画像', shortLabel: 'スタンプ' },
  { id: 'cover', number: 2, label: 'メイン・タブ画像', shortLabel: 'メイン/タブ' },
  { id: 'zip', number: 3, label: 'ZIP作成', shortLabel: 'ZIP' },
  { id: 'copy', number: 4, label: 'タイトル・説明文', shortLabel: '説明文' },
] as const

export function stepIndex(id: MakerStepId): number {
  return MAKER_STEPS.findIndex((s) => s.id === id)
}
