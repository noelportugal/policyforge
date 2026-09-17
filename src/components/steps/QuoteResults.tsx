import { useEffect, useState } from 'react'
import { useQuote } from '@/framework/QuoteProvider'
import { useTenant } from '@/framework/TenantProvider'
import { getPath } from '@/framework/paths'
import { Slot } from '../Slot'

/** The priced quote. Registered as a step component, chosen by configuration. */
export function QuoteResults() {
  const { requestRate, rateStatus, rateError, result, answers, tenant, back, reset } = useQuote()
  const { t } = useTenant()
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (rateStatus === 'idle') requestRate()
  }, [rateStatus, requestRate])

  const money = new Intl.NumberFormat(tenant.locale.locale, {
    style: 'currency',
    currency: tenant.locale.currency,
    maximumFractionDigits: 0,
  })
  const money2 = new Intl.NumberFormat(tenant.locale.locale, {
    style: 'currency',
    currency: tenant.locale.currency,
    minimumFractionDigits: 2,
  })

  if (rateStatus === 'rating' || rateStatus === 'idle') {
    return (
      <div className="pf-rating" role="status" aria-live="polite">
        <div className="pf-spinner" aria-hidden="true" />
        <p className="pf-rating-text">{t('quote.rating')}</p>
      </div>
    )
  }

  if (rateStatus === 'failed' || !result) {
    return (
      <div className="pf-callout pf-callout-error" role="alert">
        <h2>We could not price this quote</h2>
        <p>{rateError ?? 'The rating service did not respond.'}</p>
        <button type="button" className="pf-button pf-button-primary" onClick={requestRate}>
          Try again
        </button>
      </div>
    )
  }

  const chosen = selected ?? result.tiers.find((tier) => tier.recommended)?.id ?? result.tiers[0]?.id ?? ''
  const active = result.tiers.find((tier) => tier.id === chosen)

  return (
    <div className="pf-results">
      <p className="pf-quote-ref">
        {t('quote.reference')} <strong>{result.quoteNumber}</strong> · {String(getPath(answers, 'zip') ?? '')}
      </p>

      <div className="pf-tiers" role="radiogroup" aria-label="Coverage levels">
        {result.tiers.map((tier) => {
          const isActive = tier.id === chosen
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`pf-tier${isActive ? ' is-selected' : ''}${tier.recommended ? ' is-recommended' : ''}`}
              onClick={() => setSelected(tier.id)}
            >
              {tier.recommended ? <span className="pf-tier-flag">{t('quote.recommended')}</span> : null}
              <span className="pf-tier-name">{tier.label}</span>
              <span className="pf-tier-price">
                <span className="pf-tier-amount">{money2.format(tier.monthlyPremium)}</span>
                <span className="pf-tier-unit">/month</span>
              </span>
              <span className="pf-tier-term">
                {money.format(tier.termPremium)} for {result.termMonths} months
              </span>
              <span className="pf-tier-desc">{tier.description}</span>
              <ul className="pf-tier-list">
                {tier.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {active ? (
        <div className="pf-breakdown">
          <h2 className="pf-breakdown-title">How {active.label} was priced</h2>
          <dl className="pf-breakdown-list">
            <div>
              <dt>Base rate</dt>
              <dd>{money.format(result.basePremium)}</dd>
            </div>
            {result.factors.map((factor) => (
              <div key={`${factor.label}-${factor.value}`}>
                <dt>
                  {factor.label} <span className="pf-breakdown-value">{factor.value}</span>
                </dt>
                <dd>× {factor.factor.toFixed(2)}</dd>
              </div>
            ))}
            {result.discounts.map((discount) => (
              <div key={discount.id} className="is-credit">
                <dt>{discount.label}</dt>
                <dd>− {money.format(discount.amount)}</dd>
              </div>
            ))}
            <div>
              <dt>Policy fee</dt>
              <dd>{money.format(result.policyFee)}</dd>
            </div>
            <div className="is-total">
              <dt>{active.label}, {result.termMonths} month term</dt>
              <dd>{money.format(active.termPremium)}</dd>
            </div>
          </dl>
          <p className="pf-disclosure">{t('quote.disclosure')}</p>
        </div>
      ) : null}

      <Slot name="quote.aside" tierId={chosen} />

      <div className="pf-actions">
        <button type="button" className="pf-button pf-button-quiet" onClick={back}>
          Change my answers
        </button>
        <button type="button" className="pf-button pf-button-ghost" onClick={reset}>
          Start over
        </button>
      </div>
    </div>
  )
}
