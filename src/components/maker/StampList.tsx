import { useState } from 'react'
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
import { StampAddTile } from './StampAddTile'
import { StampCard } from './StampCard'

interface Props {
  stamps: StampImageItem[]
  previewBackground: PreviewBackground
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
  onAddFiles: (files: FileList | File[]) => void
}

export function StampList({
  stamps,
  previewBackground,
  onEdit,
  onDelete,
  onReorder,
  onAddFiles,
}: Props) {
  const [isSorting, setIsSorting] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const finishSorting = (event: DragEndEvent) => {
    setIsSorting(false)
    const { active, over } = event
    if (!over) return
    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setIsSorting(true)}
      onDragEnd={finishSorting}
      onDragCancel={() => setIsSorting(false)}
    >
      <SortableContext items={stamps.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div className="stamp-grid">
          {stamps.map((item, index) => (
            <StampCard
              key={item.id}
              item={item}
              index={index}
              previewBackground={previewBackground}
              onEdit={() => onEdit(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
          {!isSorting && <StampAddTile onFiles={onAddFiles} />}
        </div>
      </SortableContext>
    </DndContext>
  )
}
