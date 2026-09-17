import type { StepDef } from '@/framework/types'

/** Progress across the visible steps of the funnel. */
export function Stepper({ steps, currentId }: { steps: StepDef[]; currentId: string }) {
  const index = Math.max(
    steps.findIndex((step) => step.id === currentId),
    0,
  )
  const percent = steps.length > 1 ? (index / (steps.length - 1)) * 100 : 0

  return (
    <nav className="pf-stepper" aria-label="Quote progress">
      <ol className="pf-stepper-list">
        {steps.map((step, position) => {
          const state = position < index ? 'done' : position === index ? 'current' : 'todo'
          return (
            <li key={step.id} className={`pf-stepper-item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="pf-stepper-dot" aria-hidden="true">
                {state === 'done' ? '✓' : position + 1}
              </span>
              <span className="pf-stepper-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
      <div className="pf-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-label="Quote progress">
        <div className="pf-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="pf-stepper-count">
        Step {index + 1} of {steps.length}
      </p>
    </nav>
  )
}
