import { useMemo } from 'react'
import { validateProjectLight } from '../../lib/validation/validate'
import type { StampProject } from '../../types/stamp'

interface Props {
  project: StampProject
}

export function ValidationPanel({ project }: Props) {
  const result = useMemo(() => validateProjectLight(project), [project])

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>最終チェック</h2>
        <p>ZIP作成前の自動確認</p>
      </div>

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
      <p className={`check-summary ${result.canCreateZip ? 'is-ok' : 'is-ng'}`} role="status">
        {result.canCreateZip
          ? 'LINE Creators Market用のZIPを作成できます'
          : 'まだZIPを作成できません。上の項目を確認してください'}
      </p>
    </section>
  )
}
