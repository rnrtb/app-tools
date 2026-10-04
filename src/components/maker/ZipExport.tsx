import { useState } from 'react'
import { downloadStampZip } from '../../lib/zip/generateZip'
import { sanitizeZipBaseName } from '../../lib/utils/filename'
import { toUserFriendlyError } from '../../lib/utils/errors'
import { validateProjectLight } from '../../lib/validation/validate'
import type { StampProject } from '../../types/stamp'
import { useCanCreateZip } from '../../hooks/useCanCreateZip'

interface Props {
  project: StampProject
  onZipNameChange: (name: string) => void
}

export function ZipExport({ project, onZipNameChange }: Props) {
  const canCreate = useCanCreateZip(project)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    setBusy(true)
    setProgress('ZIPを作成しています…')
    try {
      const check = validateProjectLight(project)
      if (!check.canCreateZip) {
        const firstError = check.items.find((i) => i.level === 'error')
        throw new Error(firstError?.message || 'ZIPを作成できません。内容を確認してください。')
      }
      await downloadStampZip(
        {
          ...project,
          zipName: sanitizeZipBaseName(project.zipName),
        },
        ({ phase }) => setProgress(phase),
      )
      setProgress('ZIPを保存しました')
    } catch (e) {
      setError(e instanceof Error ? e.message : toUserFriendlyError(e))
      setProgress('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>ZIP生成</h2>
        <p>ブラウザ内だけで作成します。画像はサーバーへ送られません。</p>
      </div>

      <label className="field">
        <span>ZIPファイル名</span>
        <div className="zip-name-row">
          <input
            type="text"
            value={project.zipName}
            onChange={(e) => onZipNameChange(e.target.value.replace(/\.zip$/i, ''))}
            onBlur={(e) => onZipNameChange(sanitizeZipBaseName(e.target.value))}
            placeholder="line-stamp"
            aria-label="ZIPファイル名"
          />
          <span className="zip-ext">.zip</span>
        </div>
      </label>

      <button
        type="button"
        className="btn btn-primary btn-large"
        disabled={!canCreate || busy}
        onClick={() => void handleCreate()}
      >
        {busy ? '作成中…' : 'ZIPを作成'}
      </button>

      {progress && (
        <p className="notice" role="status">
          {progress}
        </p>
      )}
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <p className="hint">
        作成後は{' '}
        <a href="https://creator.line.me/signup/line_auth" target="_blank" rel="noreferrer">
          Creators Marketへ進む
        </a>
        （ログインしてZIPをアップロード）
      </p>
    </section>
  )
}
