import { useMemo, useRef, useState } from 'react'
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
  onUpload: (file: File) => void
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
  const title = kind === 'main' ? 'main画像' : 'tab画像'
  const inputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const resolved = useMemo(() => resolveSpecialSource(special, stamps), [special, stamps])

  const previewUrl = useMemo(() => {
    if (special.source === 'upload' && special.thumbUrl) return special.thumbUrl
    const stamp = stamps.find((s) => s.id === special.stampId) ?? stamps[0]
    return stamp?.thumbUrl ?? null
  }, [special, stamps])

  const editImageUrl = useMemo(() => {
    if (!resolved) return null
    if (special.source === 'upload' && special.workingUrl) return special.workingUrl
    const stamp = stamps.find((s) => s.id === special.stampId) ?? stamps[0]
    return stamp?.workingUrl ?? null
  }, [resolved, special, stamps])

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <p>
          {size.width}×{size.height}px
        </p>
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
            className="special-preview"
            style={{
              aspectRatio: `${size.width} / ${size.height}`,
              maxWidth: kind === 'main' ? 180 : 120,
              width: '100%',
              border: '1px solid var(--line)',
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--muted)',
              background: '#f7f9fb',
            }}
          >
            未設定
          </div>
        )}

        <div className="special-actions">
          <p className="special-source">
            {special.source === 'upload'
              ? `専用画像：${special.originalName || 'アップロード済み'}`
              : special.stampId
                ? 'スタンプから選択中'
                : '未設定'}
          </p>
          <button
            type="button"
            className="btn"
            disabled={!stamps.length}
            onClick={() => setPickerOpen((v) => !v)}
          >
            スタンプから選ぶ
          </button>
          <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
            専用画像を選ぶ
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
          <p>main / tab に使うスタンプを選んでください</p>
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
          if (file) onUpload(file)
          e.target.value = ''
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
          hasTransparency={resolved.hasTransparency}
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
