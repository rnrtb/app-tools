import { createFitTransform } from '../image/fit'
import { optimizeInputImage } from '../image/optimize'
import { createId } from '../utils/id'
import { getStampSpec } from '../../config/stampSpecs'
import type {
  PersistedProject,
  PersistedSpecialImage,
  PersistedStampItem,
  PreviewBackground,
  SpecialImageState,
  StampImageItem,
  StampProject,
  TransformState,
} from '../../types/stamp'

const EMPTY_TRANSFORM: TransformState = { scale: 1, offsetX: 0, offsetY: 0 }

export function createEmptySpecialImage(): SpecialImageState {
  return {
    source: 'stamp',
    stampId: null,
    workingBlob: null,
    thumbBlob: null,
    workingUrl: null,
    thumbUrl: null,
    width: 0,
    height: 0,
    transform: { ...EMPTY_TRANSFORM },
    hasTransparency: false,
    originalName: '',
  }
}

export function createEmptyProject(): StampProject {
  return {
    version: 1,
    stampType: 'static',
    stamps: [],
    main: createEmptySpecialImage(),
    tab: createEmptySpecialImage(),
    zipName: 'line-stamp',
    previewBackground: 'checker',
    updatedAt: Date.now(),
  }
}

function revokeUrl(url: string | null | undefined) {
  if (url) URL.revokeObjectURL(url)
}

export function revokeStampItem(item: StampImageItem) {
  revokeUrl(item.workingUrl)
  revokeUrl(item.thumbUrl)
}

export function revokeSpecialImage(state: SpecialImageState) {
  revokeUrl(state.workingUrl)
  revokeUrl(state.thumbUrl)
}

export function revokeProjectUrls(project: StampProject) {
  project.stamps.forEach(revokeStampItem)
  revokeSpecialImage(project.main)
  revokeSpecialImage(project.tab)
}

export async function createStampFromFile(file: File): Promise<StampImageItem> {
  const optimized = await optimizeInputImage(file)
  const spec = getStampSpec()
  const transform = createFitTransform(
    optimized.width,
    optimized.height,
    spec.canvasSize,
    spec.marginRule.recommendedSafeMarginPx,
  )

  return {
    id: createId(),
    workingBlob: optimized.workingBlob,
    thumbBlob: optimized.thumbBlob,
    workingUrl: URL.createObjectURL(optimized.workingBlob),
    thumbUrl: URL.createObjectURL(optimized.thumbBlob),
    originalName: file.name,
    sourceMime: file.type || 'application/octet-stream',
    width: optimized.width,
    height: optimized.height,
    transform,
    hasTransparency: optimized.hasTransparency,
  }
}

export async function createUploadSpecialFromFile(
  file: File,
  canvasSize: { width: number; height: number },
  safeMargin: number,
): Promise<Omit<SpecialImageState, 'source' | 'stampId'>> {
  const optimized = await optimizeInputImage(file)
  const transform = createFitTransform(
    optimized.width,
    optimized.height,
    canvasSize,
    safeMargin,
  )

  return {
    workingBlob: optimized.workingBlob,
    thumbBlob: optimized.thumbBlob,
    workingUrl: URL.createObjectURL(optimized.workingBlob),
    thumbUrl: URL.createObjectURL(optimized.thumbBlob),
    width: optimized.width,
    height: optimized.height,
    transform,
    hasTransparency: optimized.hasTransparency,
    originalName: file.name,
  }
}

export function specialFromStamp(
  stamp: StampImageItem,
  canvasSize: { width: number; height: number },
  safeMargin: number,
): SpecialImageState {
  return {
    source: 'stamp',
    stampId: stamp.id,
    workingBlob: null,
    thumbBlob: null,
    workingUrl: null,
    thumbUrl: null,
    width: stamp.width,
    height: stamp.height,
    transform: createFitTransform(stamp.width, stamp.height, canvasSize, safeMargin),
    hasTransparency: stamp.hasTransparency,
    originalName: stamp.originalName,
  }
}

export function toPersistedProject(project: StampProject): PersistedProject {
  return {
    version: 1,
    stampType: 'static',
    stamps: project.stamps.map(
      (s): PersistedStampItem => ({
        id: s.id,
        workingBlob: s.workingBlob,
        thumbBlob: s.thumbBlob,
        originalName: s.originalName,
        sourceMime: s.sourceMime,
        width: s.width,
        height: s.height,
        transform: { ...s.transform },
        hasTransparency: s.hasTransparency,
      }),
    ),
    main: toPersistedSpecial(project.main),
    tab: toPersistedSpecial(project.tab),
    zipName: project.zipName,
    previewBackground: project.previewBackground,
    updatedAt: project.updatedAt,
  }
}

function toPersistedSpecial(state: SpecialImageState): PersistedSpecialImage {
  return {
    source: state.source,
    stampId: state.stampId,
    workingBlob: state.workingBlob,
    thumbBlob: state.thumbBlob,
    width: state.width,
    height: state.height,
    transform: { ...state.transform },
    hasTransparency: state.hasTransparency,
    originalName: state.originalName,
  }
}

export function fromPersistedProject(data: PersistedProject): StampProject {
  return {
    version: 1,
    stampType: 'static',
    stamps: data.stamps.map((s) => ({
      id: s.id,
      workingBlob: s.workingBlob,
      thumbBlob: s.thumbBlob,
      workingUrl: URL.createObjectURL(s.workingBlob),
      thumbUrl: URL.createObjectURL(s.thumbBlob),
      originalName: s.originalName,
      sourceMime: s.sourceMime,
      width: s.width,
      height: s.height,
      transform: { ...s.transform },
      hasTransparency: s.hasTransparency,
    })),
    main: fromPersistedSpecial(data.main),
    tab: fromPersistedSpecial(data.tab),
    zipName: data.zipName || 'line-stamp',
    previewBackground: (data.previewBackground || 'checker') as PreviewBackground,
    updatedAt: data.updatedAt,
  }
}

function fromPersistedSpecial(state: PersistedSpecialImage): SpecialImageState {
  return {
    source: state.source,
    stampId: state.stampId,
    workingBlob: state.workingBlob,
    thumbBlob: state.thumbBlob,
    workingUrl: state.workingBlob ? URL.createObjectURL(state.workingBlob) : null,
    thumbUrl: state.thumbBlob ? URL.createObjectURL(state.thumbBlob) : null,
    width: state.width,
    height: state.height,
    transform: { ...state.transform },
    hasTransparency: state.hasTransparency,
    originalName: state.originalName,
  }
}

export function resolveSpecialSource(
  special: SpecialImageState,
  stamps: StampImageItem[],
): { blob: Blob; width: number; height: number; transform: TransformState; hasTransparency: boolean } | null {
  if (special.source === 'upload') {
    if (!special.workingBlob) return null
    return {
      blob: special.workingBlob,
      width: special.width,
      height: special.height,
      transform: special.transform,
      hasTransparency: special.hasTransparency,
    }
  }

  const stamp = stamps.find((s) => s.id === special.stampId) ?? stamps[0]
  if (!stamp) return null

  return {
    blob: stamp.workingBlob,
    width: stamp.width,
    height: stamp.height,
    transform: special.transform,
    hasTransparency: stamp.hasTransparency,
  }
}
