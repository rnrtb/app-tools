import { getStampSpec } from '../../config/stampSpecs'
import type { CheckItem, StampProject, ValidationResult } from '../../types/stamp'
import { resolveSpecialSource } from '../project/factory'

function nearestAllowedCounts(count: number, allowed: readonly number[]): number[] {
  const sorted = [...allowed].sort((a, b) => a - b)
  const lower = [...sorted].reverse().find((n) => n <= count)
  const upper = sorted.find((n) => n >= count)
  const result: number[] = []
  if (lower !== undefined) result.push(lower)
  if (upper !== undefined && upper !== lower) result.push(upper)
  return result.length ? result : [...sorted]
}

export function getCountStatus(count: number): {
  ok: boolean
  title: string
  message: string
} {
  const spec = getStampSpec()
  if (count === 0) {
    return {
      ok: false,
      title: '0枚',
      message: 'まだ画像がありません',
    }
  }

  if (spec.allowedCounts.includes(count)) {
    return {
      ok: true,
      title: `${count}枚`,
      message: '枚数がそろいました',
    }
  }

  const nearest = nearestAllowedCounts(count, spec.allowedCounts)
  const hint = nearest.join('枚または') + '枚'
  return {
    ok: false,
    title: `${count}枚`,
    message: `${hint}に調整してください`,
  }
}

/**
 * 最終チェック。
 * 静止画初版ではサイズ・PNG・容量はツール側で満たすため、ユーザー向けには出さない。
 * （アニメーション対応時に容量などは再検討）
 */
export function validateProjectLight(project: StampProject): ValidationResult {
  const items: CheckItem[] = []
  const countStatus = getCountStatus(project.stamps.length)

  items.push({
    id: 'count',
    label: 'スタンプ枚数',
    level: countStatus.ok ? 'ok' : 'error',
    message: countStatus.ok
      ? `スタンプ画像　${project.stamps.length}枚`
      : countStatus.message,
  })

  const mainSource = resolveSpecialSource(project.main, project.stamps)
  items.push({
    id: 'main',
    label: 'メイン画像',
    level: mainSource ? 'ok' : 'error',
    message: mainSource ? 'メイン画像' : 'メイン画像を設定してください',
  })

  const tabSource = resolveSpecialSource(project.tab, project.stamps)
  items.push({
    id: 'tab',
    label: 'トークルームタブ画像',
    level: tabSource ? 'ok' : 'error',
    message: tabSource ? 'トークルームタブ画像' : 'トークルームタブ画像を設定してください',
  })

  const hasError = items.some((i) => i.level === 'error')
  const canCreateZip = !hasError && countStatus.ok && Boolean(mainSource) && Boolean(tabSource)

  if (canCreateZip) {
    items.push({
      id: 'zip-ready',
      label: 'ZIP',
      level: 'ok',
      message: 'LINE Creators Market用のZIPを作成できます',
    })
  }

  return {
    ok: !hasError,
    items,
    canCreateZip,
  }
}
