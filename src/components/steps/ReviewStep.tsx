import { useQuote } from '@/framework/QuoteProvider'
import { useTenant } from '@/framework/TenantProvider'
import { getPath } from '@/framework/paths'
import { resolveStep, visibleSteps } from '@/framework/flow'

/**
 * A read-back of every answer, grouped by the step it was given on, with a link
 * back to that step. Built from the same configuration that rendered the form,
 * so a new question appears here without anyone remembering to add it.
 */
export function ReviewStep() {
  const { answers, tenant, next, back } = useQuote()
  const { t } = useTenant()

  const steps = visibleSteps(tenant.flow, answers, tenant.features).filter(
    (step) => (step.sections?.length ?? 0) > 0,
  )

  return (
    <div className="pf-review">
      {steps.map((step) => {
        const sections = resolveStep(step, answers, tenant.features)
        const rows = sections.flatMap(({ section, fields, items }) =>
          items
            ? items.flatMap((item) =>
                item.fields.map((resolved) => ({
                  key: resolved.path,
                  label: `${item.label} · ${resolved.field.label}`,
                  value: display(getPath(answers, resolved.path), resolved.field.options),
                })),
              )
            : fields.map((resolved) => ({
                key: `${section.id}-${resolved.path}`,
                label: resolved.field.label,
                value: display(getPath(answers, resolved.path), resolved.field.options),
              })),
        )
        if (rows.length === 0) return null

        return (
          <section className="pf-review-block" key={step.id}>
            <h2 className="pf-review-title">{step.label}</h2>
            <dl className="pf-review-list">
              {rows.map((row) => (
                <div key={row.key}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}

      <div className="pf-actions">
        <button type="button" className="pf-button pf-button-quiet" onClick={back}>
          Back
        </button>
        <button type="button" className="pf-button pf-button-primary" onClick={() => next()}>
          {t('review.submit')}
        </button>
      </div>
    </div>
  )
}

function display(value: unknown, options: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  if (Array.isArray(options)) {
    const match = (options as { value: string; label: string }[]).find((option) => option.value === String(value))
    if (match) return match.label
  }
  return String(value)
}
