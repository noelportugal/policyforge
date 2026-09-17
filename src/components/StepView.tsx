import { useEffect, useRef } from 'react'
import type { StepDef } from '@/framework/types'
import { resolveStep } from '@/framework/flow'
import { stepRegistry } from '@/framework/registry'
import { useQuote } from '@/framework/QuoteProvider'
import { useTenant } from '@/framework/TenantProvider'
import { FieldHost } from './FieldHost'
import { Slot } from './Slot'

/** Renders whatever the configuration says this step is. */
export function StepView({ step }: { step: StepDef }) {
  const { answers, tenant, next, back, isFirst, appendItem, removeItem, errors, touched } = useQuote()
  const { t } = useTenant()
  const heading = useRef<HTMLHeadingElement>(null)

  // Moving between steps must move assistive technology too, or a screen reader
  // user stays parked on the button they just pressed.
  useEffect(() => {
    heading.current?.focus()
  }, [step.id])

  const Custom = step.component ? stepRegistry.get(step.component) : undefined
  const sections = Custom ? [] : resolveStep(step, answers, tenant.features)
  const visibleErrors = Object.keys(errors).filter((path) => touched[path])

  return (
    <section className="pf-step" aria-labelledby={`step-${step.id}-title`}>
      <header className="pf-step-head">
        <h1 className="pf-step-title" id={`step-${step.id}-title`} tabIndex={-1} ref={heading}>
          {t(step.title)}
        </h1>
        {step.subtitle ? <p className="pf-step-sub">{t(step.subtitle)}</p> : null}
      </header>

      <Slot name="step.top" stepId={step.id} />
      <Slot name={`step.top:${step.id}`} stepId={step.id} />

      {Custom ? (
        <Custom stepId={step.id} />
      ) : (
        <form
          className="pf-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            next()
          }}
        >
          {sections.map(({ section, fields, items, canAdd }) => (
            <fieldset className="pf-section" key={section.id}>
              {section.title ? <legend className="pf-section-title">{t(section.title)}</legend> : null}
              {section.description ? <p className="pf-section-desc">{t(section.description)}</p> : null}

              {items ? (
                <div className="pf-repeat">
                  {items.map((item) => (
                    <div className="pf-repeat-item" key={`${section.id}-${item.index}`}>
                      <div className="pf-repeat-head">
                        <h2 className="pf-repeat-title">{item.label}</h2>
                        {item.canRemove ? (
                          <button
                            type="button"
                            className="pf-link-button"
                            onClick={() => removeItem(section.repeat!.over, item.index)}
                          >
                            {section.repeat!.removeLabel}
                          </button>
                        ) : null}
                      </div>
                      <div className={`pf-grid pf-layout-${section.layout ?? 'grid-2'}`}>
                        {item.fields.map((resolved) => (
                          <FieldHost key={resolved.path} field={resolved.field} path={resolved.path} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {canAdd ? (
                    <button
                      type="button"
                      className="pf-button pf-button-ghost"
                      onClick={() => appendItem(section.repeat!.over)}
                    >
                      + {section.repeat!.addLabel}
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className={`pf-grid pf-layout-${section.layout ?? 'grid-2'}`}>
                  {fields.map((resolved) => (
                    <FieldHost key={resolved.path} field={resolved.field} path={resolved.path} />
                  ))}
                </div>
              )}
            </fieldset>
          ))}

          {visibleErrors.length > 0 ? (
            <p className="pf-form-error" role="alert">
              {visibleErrors.length === 1
                ? 'One answer needs attention before you continue.'
                : `${visibleErrors.length} answers need attention before you continue.`}
            </p>
          ) : null}

          {step.disclosure ? <p className="pf-disclosure">{t(step.disclosure)}</p> : null}

          <div className="pf-actions">
            {!isFirst ? (
              <button type="button" className="pf-button pf-button-quiet" onClick={back}>
                {step.backLabel ?? 'Back'}
              </button>
            ) : null}
            <button type="submit" className="pf-button pf-button-primary">
              {step.nextLabel ?? 'Continue'}
            </button>
          </div>
        </form>
      )}

      <Slot name="step.bottom" stepId={step.id} />
      <Slot name={`step.bottom:${step.id}`} stepId={step.id} />
    </section>
  )
}
