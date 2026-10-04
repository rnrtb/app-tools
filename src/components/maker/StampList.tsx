import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import type { PreviewBackground, StampImageItem } from '../../types/stamp'
import { StampCard } from './StampCard'

interface Props {
  stamps: StampImageItem[]
  previewBackground: PreviewBackground
  onEdit: (id: string) => void
  onReplace: (id: string, file: File) => void
  onDelete: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
}

export function StampList({
  stamps,
  previewBackground,
  onEdit,
  onReplace,
  onDelete,
  onReorder,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    onReorder(String(active.id), String(over.id))
  }

  if (!stamps.length) {
    return <p className="empty-hint">まだ画像がありません。上の「画像を選択」から追加してください。</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stamps.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div className="stamp-grid">
          {stamps.map((item, index) => (
            <StampCard
              key={item.id}
              item={item}
              index={index}
              previewBackground={previewBackground}
              onEdit={() => onEdit(item.id)}
              onReplace={(file) => onReplace(item.id, file)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
