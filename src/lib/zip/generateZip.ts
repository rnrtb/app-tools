import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { getStampSpec } from '../../config/stampSpecs'
import type { StampProject } from '../../types/stamp'
import { resolveSpecialSource } from '../project/factory'
import { renderBlobToPng } from '../image/render'
import { toZipFileName } from '../utils/filename'

export interface ZipProgress {
  phase: string
  current: number
  total: number
}

export async function generateStampZip(
  project: StampProject,
  onProgress?: (progress: ZipProgress) => void,
): Promise<Blob> {
  const spec = getStampSpec()
  const zip = new JSZip()
  const total = project.stamps.length + 2
  let current = 0

  const report = (phase: string) => {
    onProgress?.({ phase, current, total })
  }

  report('スタンプ画像を作成しています…')

  for (let i = 0; i < project.stamps.length; i++) {
    const stamp = project.stamps[i]!
    const blob = await renderBlobToPng({
      sourceBlob: stamp.workingBlob,
      canvasWidth: spec.canvasSize.width,
      canvasHeight: spec.canvasSize.height,
      imageWidth: stamp.width,
      imageHeight: stamp.height,
      transform: stamp.transform,
    })
    zip.file(spec.stampFileName(i + 1), blob)
    current += 1
    report(`${spec.stampFileName(i + 1)} を作成しています…`)
  }

  const mainSource = resolveSpecialSource(project.main, project.stamps)
  if (!mainSource) {
    throw new Error('main画像が設定されていません。')
  }
  report('main画像を作成しています…')
  const mainBlob = await renderBlobToPng({
    sourceBlob: mainSource.blob,
    canvasWidth: spec.mainSize.width,
    canvasHeight: spec.mainSize.height,
    imageWidth: mainSource.width,
    imageHeight: mainSource.height,
    transform: mainSource.transform,
  })
  zip.file(spec.mainFileName, mainBlob)
  current += 1

  const tabSource = resolveSpecialSource(project.tab, project.stamps)
  if (!tabSource) {
    throw new Error('tab画像が設定されていません。')
  }
  report('tab画像を作成しています…')
  const tabBlob = await renderBlobToPng({
    sourceBlob: tabSource.blob,
    canvasWidth: spec.tabSize.width,
    canvasHeight: spec.tabSize.height,
    imageWidth: tabSource.width,
    imageHeight: tabSource.height,
    transform: tabSource.transform,
  })
  zip.file(spec.tabFileName, tabBlob)
  current += 1

  report('ZIPを作成しています…')
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  if (zipBlob.size > spec.maxZipSizeBytes) {
    throw new Error(
      `ZIPの容量が上限（${Math.round(spec.maxZipSizeBytes / (1024 * 1024))}MB）を超えています。画像を減らすか小さく調整してください。`,
    )
  }

  return zipBlob
}

export async function downloadStampZip(
  project: StampProject,
  onProgress?: (progress: ZipProgress) => void,
): Promise<void> {
  const blob = await generateStampZip(project, onProgress)
  saveAs(blob, toZipFileName(project.zipName))
}
