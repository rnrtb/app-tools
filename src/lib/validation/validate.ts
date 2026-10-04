import { getStampSpec } from '../../config/stampSpecs'
import type { CheckItem, StampProject, ValidationResult } from '../../types/stamp'
import { resolveSpecialSource } from '../project/factory'
import { renderBlobToPng } from '../image/render'

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
      message: '画像を選んでください。対応枚数は 8 / 16 / 24 / 32 / 40 枚です。',
    }
  }

  if (spec.allowedCounts.includes(count)) {
    return {
      ok: true,
      title: `${count}枚`,
      message: `${count}枚：作成できます`,
    }
  }

  const nearest = nearestAllowedCounts(count, spec.allowedCounts)
  const hint = nearest.join('枚または') + '枚'
  return {
    ok: false,
    title: `${count}枚`,
    message: `現在${count}枚です。${hint}に調整してください。`,
  }
}

/** 一覧表示用の軽いチェック（全枚レンダリングしない） */
export function validateProjectLight(project: StampProject): ValidationResult {
  const spec = getStampSpec()
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

  items.push({
    id: 'size',
    label: '画像サイズ',
    level: 'ok',
    message: `画像サイズ　${spec.canvasSize.width}×${spec.canvasSize.height}px（偶数）`,
  })

  items.push({
    id: 'format',
    label: 'PNG形式',
    level: 'ok',
    message: 'PNG形式',
  })

  const mainSource = resolveSpecialSource(project.main, project.stamps)
  items.push({
    id: 'main',
    label: 'メイン画像',
    level: mainSource ? 'ok' : 'error',
    message: mainSource
      ? `メイン画像　${spec.mainSize.width}×${spec.mainSize.height}`
      : 'メイン画像を設定してください',
  })

  const tabSource = resolveSpecialSource(project.tab, project.stamps)
  items.push({
    id: 'tab',
    label: 'トークルームタブ画像',
    level: tabSource ? 'ok' : 'error',
    message: tabSource
      ? `トークルームタブ画像　${spec.tabSize.width}×${spec.tabSize.height}`
      : 'トークルームタブ画像を設定してください',
  })

  items.push({
    id: 'capacity',
    label: 'ファイル容量',
    level: 'ok',
    message: 'ファイル容量はZIP作成時に最終確認します',
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

/** ZIP生成直前の厳密チェック（各画像を実際にレンダリング） */
export async function validateProjectStrict(project: StampProject): Promise<ValidationResult> {
  const light = validateProjectLight(project)
  if (!light.canCreateZip) return light

  const spec = getStampSpec()
  const items = light.items.filter((i) => i.id !== 'capacity' && i.id !== 'zip-ready')
  let stampSizeError = false

  for (let i = 0; i < project.stamps.length; i++) {
    const stamp = project.stamps[i]!
    try {
      const blob = await renderBlobToPng({
        sourceBlob: stamp.workingBlob,
        canvasWidth: spec.canvasSize.width,
        canvasHeight: spec.canvasSize.height,
        imageWidth: stamp.width,
        imageHeight: stamp.height,
        transform: stamp.transform,
      })
      if (blob.size > spec.maxFileSizeBytes) {
        stampSizeError = true
        items.push({
          id: `stamp-size-${stamp.id}`,
          label: 'スタンプ容量',
          level: 'error',
          message: `${String(i + 1).padStart(2, '0')}番の画像を確認してください（1MBを超えています）`,
          targetStampIndex: i + 1,
        })
      }
    } catch {
      stampSizeError = true
      items.push({
        id: `stamp-render-${stamp.id}`,
        label: 'スタンプ画像',
        level: 'error',
        message: `${String(i + 1).padStart(2, '0')}番の画像を確認してください`,
        targetStampIndex: i + 1,
      })
    }
  }

  if (!stampSizeError) {
    items.push({
      id: 'stamp-capacity',
      label: 'スタンプ容量',
      level: 'ok',
      message: 'ファイル容量（各1MB以下）',
    })
  }

  const mainSource = resolveSpecialSource(project.main, project.stamps)!
  const tabSource = resolveSpecialSource(project.tab, project.stamps)!

  try {
    const mainBlob = await renderBlobToPng({
      sourceBlob: mainSource.blob,
      canvasWidth: spec.mainSize.width,
      canvasHeight: spec.mainSize.height,
      imageWidth: mainSource.width,
      imageHeight: mainSource.height,
      transform: mainSource.transform,
    })
    if (mainBlob.size > spec.maxFileSizeBytes) {
      items.push({
        id: 'main-capacity',
        label: 'メイン画像容量',
        level: 'error',
        message: 'メイン画像の容量が1MBを超えています。小さく調整してください',
      })
    }
  } catch {
    items.push({
      id: 'main-capacity',
      label: 'メイン画像容量',
      level: 'error',
      message: 'メイン画像を確認してください',
    })
  }

  try {
    const tabBlob = await renderBlobToPng({
      sourceBlob: tabSource.blob,
      canvasWidth: spec.tabSize.width,
      canvasHeight: spec.tabSize.height,
      imageWidth: tabSource.width,
      imageHeight: tabSource.height,
      transform: tabSource.transform,
    })
    if (tabBlob.size > spec.maxFileSizeBytes) {
      items.push({
        id: 'tab-capacity',
        label: 'トークルームタブ画像容量',
        level: 'error',
        message: 'トークルームタブ画像の容量が1MBを超えています。小さく調整してください',
      })
    }
  } catch {
    items.push({
      id: 'tab-capacity',
      label: 'トークルームタブ画像容量',
      level: 'error',
      message: 'トークルームタブ画像を確認してください',
    })
  }

  const hasError = items.some((i) => i.level === 'error')
  if (!hasError) {
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
    canCreateZip: !hasError,
  }
}
