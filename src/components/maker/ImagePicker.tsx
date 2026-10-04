import { useCallback, useRef, useState, type KeyboardEvent } from 'react'

interface Props {
  onFiles: (files: FileList | File[]) => void
  title?: string
  requirement?: string
  subtitle?: string
  label?: string
  hint?: string
  multiple?: boolean
}

export function ImagePicker({
  onFiles,
  title = 'スタンプ画像をアップロードしましょう！',
  requirement = 'LINEスタンプは 8 / 16 / 24 / 32 / 40 枚まとめての登録が必要です',
  subtitle = 'PCではドラッグ＆ドロップでも追加できます',
  label = '画像を選択',
  hint = '対応形式：PNG / JPEG / WebP',
  multiple = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length) onFiles(files)
    },
    [onFiles],
  )

  const openPicker = () => inputRef.current?.click()

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  return (
    <div
      className={`dropzone ${dragging ? 'is-dragging' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={openPicker}
      onKeyDown={onKeyDown}
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
      <span className="dropzone-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
          <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="18" cy="20" r="3.5" fill="currentColor" />
          <path
            d="M8 32l10-9 7 6 5-4 10 9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {title && <p className="dropzone-title">{title}</p>}
      {requirement && <p className="dropzone-requirement">{requirement}</p>}
      {subtitle && <p className="dropzone-subtitle">{subtitle}</p>}
      <span className="dropzone-cta">{label}</span>
      {hint && <p className="dropzone-hint">{hint}</p>}
      <p className="dropzone-privacy" role="note">
        画像はこの端末内だけで処理されます
      </p>
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
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
