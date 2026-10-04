import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getStampSpec } from '../../config/stampSpecs'
import type { PreviewBackground as PreviewBackgroundType, StampImageItem } from '../../types/stamp'
import { CompositionPreview } from '../common/CompositionPreview'

interface Props {
  item: StampImageItem
  index: number
  previewBackground: PreviewBackgroundType
  onEdit: () => void
  onDelete: () => void
}

const CONFIRM_MS = 3000

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7h10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function StampCard({ item, index, previewBackground, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const spec = getStampSpec()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  useEffect(() => {
    if (!confirmDelete) return
    const timer = window.setTimeout(() => setConfirmDelete(false), CONFIRM_MS)
    return () => window.clearTimeout(timer)
  }, [confirmDelete])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 2 : 0,
  }

  const number = String(index + 1).padStart(2, '0')

  const handleTrashClick = () => {
    // ゴミ箱は確認表示の開始のみ。確定削除はオーバーレイの「削除する」だけ
    if (confirmDelete) return
    setConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    setConfirmDelete(false)
    onDelete()
  }

  const stopDragFromControl = (event: ReactPointerEvent) => {
    event.stopPropagation()
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`stamp-card${isDragging ? ' is-dragging' : ''}${confirmDelete ? ' is-confirm-delete' : ''}`}
      aria-label={`${number}番。ドラッグで並べ替え、タップで編集`}
      {...attributes}
      {...listeners}
    >
      <div className="stamp-card-top">
        <span className="stamp-number-slot">
          <span className="stamp-number">{number}</span>
        </span>
        <span className="stamp-grip" aria-hidden="true">
          ≡
        </span>
        <button
          type="button"
          className={`btn btn-small btn-icon stamp-delete${confirmDelete ? ' is-confirm' : ''}`}
          onClick={handleTrashClick}
          onPointerDown={stopDragFromControl}
          aria-label={`${number}番を削除`}
          title="削除"
          disabled={confirmDelete}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="stamp-preview-wrap">
        <button
          type="button"
          className="stamp-preview-btn"
          onClick={() => {
            if (confirmDelete) return
            onEdit()
          }}
          aria-label={`${number}番を編集`}
        >
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
        {confirmDelete && (
          <div className="stamp-delete-overlay" role="dialog" aria-label="削除しますか？">
            <p>削除しますか？</p>
            <button
              type="button"
              className="btn btn-small stamp-delete-confirm-btn"
              onClick={handleConfirmDelete}
              onPointerDown={stopDragFromControl}
            >
              削除する
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
