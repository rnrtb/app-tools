import { useCallback, useRef, useState } from 'react'

interface Props {
  onFiles: (files: FileList | File[]) => void
}

export function StampAddTile({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length) onFiles(files)
    },
    [onFiles],
  )

  return (
    <div
      className={`stamp-add-tile ${dragging ? 'is-dragging' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <button
        type="button"
        className="stamp-add-tile-btn"
        onClick={() => inputRef.current?.click()}
        aria-label="スタンプ画像を追加"
      >
        <span className="stamp-add-plus" aria-hidden="true">
          +
        </span>
        <span className="stamp-add-label">画像を追加</span>
        <span className="stamp-add-hint">PNG / JPEG / WebP</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
