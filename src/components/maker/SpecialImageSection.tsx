import { useEffect, useMemo, useRef, useState } from 'react'
import { getStampSpec } from '../../config/stampSpecs'
import { resolveSpecialSource } from '../../lib/project/factory'
import type {
  PreviewBackground as PreviewBackgroundType,
  SpecialImageState,
  StampImageItem,
  TransformState,
} from '../../types/stamp'
import { CompositionPreview } from '../common/CompositionPreview'
import { TransformEditor } from './TransformEditor'

interface Props {
  kind: 'main' | 'tab'
  special: SpecialImageState
  stamps: StampImageItem[]
  previewBackground: PreviewBackgroundType
  onPreviewBackgroundChange: (value: PreviewBackgroundType) => void
  onSelectStamp: (stampId: string) => void
  onUpload: (file: File) => Promise<boolean>
  onTransformComplete: (transform: TransformState) => void
}

export function SpecialImageSection({
  kind,
  special,
  stamps,
  previewBackground,
  onPreviewBackgroundChange,
  onSelectStamp,
  onUpload,
  onTransformComplete,
}: Props) {
  const spec = getStampSpec()
  const size = kind === 'main' ? spec.mainSize : spec.tabSize
  const safeMargin = kind === 'main' ? 8 : 4
  const title = kind === 'main' ? 'メイン画像' : 'トークルームタブ画像'
  const inputRef = useRef<HTMLInputElement>(null)
  const openEditorAfterUpload = useRef(false)
  const [editing, setEditing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const resolved = useMemo(() => resolveSpecialSource(special, stamps), [special, stamps])

  const previewUrl = useMemo(() => {
    if (special.source === 'upload' && special.thumbUrl) return special.thumbUrl
    if (!special.stampId) return null
    return stamps.find((s) => s.id === special.stampId)?.thumbUrl ?? null
  }, [special, stamps])

  const editImageUrl = useMemo(() => {
    if (!resolved) return null
    if (special.source === 'upload' && special.workingUrl) return special.workingUrl
    if (!special.stampId) return null
    return stamps.find((s) => s.id === special.stampId)?.workingUrl ?? null
  }, [resolved, special, stamps])

  // アップロード完了後、state 反映を待って調整画面を開く
  useEffect(() => {
    if (!openEditorAfterUpload.current) return
    if (special.source !== 'upload' || !special.workingUrl || !resolved) return
    openEditorAfterUpload.current = false
    setEditing(true)
  }, [special, resolved])

  return (
    <section className="panel special-panel">
      <div className="panel-head">
        <h2>{title}</h2>
      </div>

      <div className="special-layout">
        {previewUrl && resolved ? (
          <CompositionPreview
            className="special-preview"
            imageUrl={previewUrl}
            imageWidth={resolved.width}
            imageHeight={resolved.height}
            canvasWidth={size.width}
            canvasHeight={size.height}
            transform={resolved.transform}
            previewBackground={previewBackground}
            alt={`${title}プレビュー`}
            style={{ maxWidth: kind === 'main' ? 180 : 120, width: '100%' }}
          />
        ) : (
          <div
            className="special-preview special-preview-empty"
            style={{
              aspectRatio: `${size.width} / ${size.height}`,
              maxWidth: kind === 'main' ? 180 : 120,
              width: '100%',
            }}
            aria-hidden="true"
          />
        )}

        <div className="special-actions">
          {(special.source === 'upload' || special.stampId) && (
            <p className="special-source">
              {special.source === 'upload'
                ? `アップロード：${special.originalName || '済み'}`
                : 'スタンプから選択中'}
            </p>
          )}
          <button
            type="button"
            className="btn"
            disabled={!stamps.length}
            onClick={() => setPickerOpen((v) => !v)}
          >
            スタンプから選ぶ
          </button>
          <button
            type="button"
            className="btn"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? '読み込み中…' : 'アップロード'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!resolved || !editImageUrl}
            onClick={() => setEditing(true)}
          >
            位置・大きさを調整
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div className="stamp-picker">
          <p>{title}に使うスタンプ画像を選んでください</p>
          <div className="stamp-picker-grid">
            {stamps.map((stamp, index) => (
              <button
                key={stamp.id}
                type="button"
                className={special.stampId === stamp.id ? 'is-active' : ''}
                onClick={() => {
                  onSelectStamp(stamp.id)
                  setPickerOpen(false)
                }}
              >
                <img src={stamp.thumbUrl} alt="" />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          openEditorAfterUpload.current = true
          setUploading(true)
          void onUpload(file).then((ok) => {
            setUploading(false)
            if (!ok) openEditorAfterUpload.current = false
          })
        }}
      />

      {editing && resolved && editImageUrl && (
        <TransformEditor
          title={`${title}を編集`}
          imageUrl={editImageUrl}
          imageWidth={resolved.width}
          imageHeight={resolved.height}
          canvasWidth={size.width}
          canvasHeight={size.height}
          safeMargin={safeMargin}
          initialTransform={resolved.transform}
          previewBackground={previewBackground}
          onPreviewBackgroundChange={onPreviewBackgroundChange}
          onCancel={() => setEditing(false)}
          onComplete={(transform) => {
            onTransformComplete(transform)
            setEditing(false)
          }}
        />
      )}
    </section>
  )
}
