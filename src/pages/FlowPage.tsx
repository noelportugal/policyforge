import { Navigate, useParams } from 'react-router-dom'
import { useQuote } from '@/framework/QuoteProvider'
import { visibleSteps } from '@/framework/flow'
import { StepView } from '@/components/StepView'
import { Stepper } from '@/components/Stepper'

/** One step of the funnel, chosen by the address bar. */
export function FlowPage() {
  const { stepId = '' } = useParams()
  const { answers, tenant } = useQuote()
  const steps = visibleSteps(tenant.flow, answers, tenant.features)
  const step = steps.find((candidate) => candidate.id === stepId)

  // A stale bookmark, or a step that a changed answer has hidden, returns the
  // visitor to the start rather than to an empty screen.
  if (!step) return <Navigate to="/" replace />

  return (
    <div className="pf-container pf-flow">
      <Stepper steps={steps} currentId={step.id} />
      <div className="pf-flow-card">
        <StepView step={step} />
      </div>
    </div>
  )
}
