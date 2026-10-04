import { useCallback, useRef, useState } from 'react'

interface Props {
  onFiles: (files: FileList | File[]) => void
  label?: string
  multiple?: boolean
}

export function ImagePicker({ onFiles, label = '画像を選択', multiple = true }: Props) {
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
      className={`dropzone ${dragging ? 'is-dragging' : ''}`}
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
        className="btn btn-primary btn-large"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
      <p className="dropzone-hint">PNG / JPEG / WebP 対応。PCではここにドロップもできます。</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
        multiple={multiple}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
