import { useMemo } from 'react'
import { validateProjectLight } from '../../lib/validation/validate'
import type { StampProject } from '../../types/stamp'

interface Props {
  project: StampProject
}

export function ValidationPanel({ project }: Props) {
  const result = useMemo(() => validateProjectLight(project), [project])

  return (
    <div className="zip-section">
      <h3 className="zip-section-title">最終チェック</h3>

      <ul className="check-list">
        {result.items.map((item) => (
          <li key={item.id} className={`check-item level-${item.level}`}>
            <span className="check-mark" aria-hidden="true">
              {item.level === 'ok' ? '✓' : item.level === 'warn' ? '!' : '×'}
            </span>
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
      {!result.canCreateZip && (
        <p className="check-summary is-ng" role="status">
          まだZIPを作成できません。上の項目を確認してください
        </p>
      )}
    </div>
  )
}
