import { MAKER_STEPS, type MakerStepId, stepIndex } from '../../constants/makerSteps'

interface Props {
  current: MakerStepId
  /** 進める最大ステップ（これより先はロック） */
  maxReachable: MakerStepId
  onSelect: (id: MakerStepId) => void
}

export function MakerStepper({ current, maxReachable, onSelect }: Props) {
  const currentIndex = stepIndex(current)
  const maxIndex = stepIndex(maxReachable)

  return (
    <nav className="maker-stepper" aria-label="作成ステップ">
      <ol className="maker-stepper-list">
        {MAKER_STEPS.map((step, index) => {
          const reachable = index <= maxIndex
          const isCurrent = step.id === current
          const isDone = index < currentIndex && reachable

          return (
            <li
              key={step.id}
              className={[
                'maker-step',
                isCurrent ? 'is-current' : '',
                isDone ? 'is-done' : '',
                reachable ? 'is-reachable' : 'is-locked',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect(step.id)}
              >
                <span className="maker-step-num" aria-hidden="true">
                  {step.number}
                </span>
                <span className="maker-step-label">{step.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
