import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import { getStampSpec } from '../../config/stampSpecs'
import type { PreviewBackground as PreviewBackgroundType, StampImageItem } from '../../types/stamp'
import { CompositionPreview } from '../common/CompositionPreview'

interface Props {
  item: StampImageItem
  index: number
  previewBackground: PreviewBackgroundType
  onEdit: () => void
  onReplace: (file: File) => void
  onDelete: () => void
}

export function StampCard({ item, index, previewBackground, onEdit, onReplace, onDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const spec = getStampSpec()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 2 : 0,
  }

  const number = String(index + 1).padStart(2, '0')

  return (
    <article ref={setNodeRef} style={style} className="stamp-card">
      <div className="stamp-card-top">
        <span className="stamp-number">{number}</span>
        <button
          type="button"
          className="drag-handle"
          aria-label={`${number}番を並べ替え`}
          {...attributes}
          {...listeners}
        >
          ≡ 並べ替え
        </button>
      </div>

      <button type="button" className="stamp-preview-btn" onClick={onEdit} aria-label={`${number}番を編集`}>
        <CompositionPreview
          className="stamp-preview"
          imageUrl={item.thumbUrl}
          imageWidth={item.width}
          imageHeight={item.height}
          canvasWidth={spec.canvasSize.width}
          canvasHeight={spec.canvasSize.height}
          transform={item.transform}
          previewBackground={previewBackground}
        />
      </button>

      <div className="stamp-card-actions">
        <button type="button" className="btn btn-small" onClick={onEdit}>
          編集
        </button>
        <button type="button" className="btn btn-small" onClick={() => inputRef.current?.click()}>
          差し替え
        </button>
        <button type="button" className="btn btn-small btn-danger" onClick={onDelete}>
          削除
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onReplace(file)
          e.target.value = ''
        }}
      />
    </article>
  )
}
