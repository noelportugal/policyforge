import { useQuote } from '@/framework/QuoteProvider'
import { useTenant } from '@/framework/TenantProvider'
import { StepView } from '@/components/StepView'
import { LogoMark } from '@/components/Logos'

/**
 * The marketing page and the first step of the funnel are the same thing: the
 * hero form is step one of the configured flow, rendered in a wider layout.
 */
export function Landing() {
  const { tenant, t } = useTenant()
  const { tenant: current } = useQuote()
  const first = current.flow.steps[0]
  if (!first) return null

  return (
    <>
      <section className="pf-hero">
        <div className="pf-hero-art" aria-hidden="true" />
        <div className="pf-container pf-hero-inner">
          <div className="pf-hero-copy">
            <p className="pf-eyebrow">{t('hero.eyebrow')}</p>
            <h1 className="pf-hero-title">{t('hero.title')}</h1>
            <p className="pf-hero-sub">{t('hero.subtitle')}</p>
            <ul className="pf-hero-points">
              <li>{t('hero.point1')}</li>
              <li>{t('hero.point2')}</li>
              <li>{t('hero.point3')}</li>
            </ul>
          </div>

          <div className="pf-hero-card">
            <StepView step={first} />
          </div>
        </div>
      </section>

      <section className="pf-container pf-explainer">
        <h2 className="pf-explainer-title">How a quote works at {tenant.brand.name}</h2>
        <ol className="pf-explainer-steps">
          <li>
            <span className="pf-explainer-number">01</span>
            <h3>Tell us what you drive</h3>
            <p>Year, make and model for every vehicle kept at your address.</p>
          </li>
          <li>
            <span className="pf-explainer-number">02</span>
            <h3>Tell us who drives</h3>
            <p>Everyone with a licence in the household, and how long they have been insured.</p>
          </li>
          <li>
            <span className="pf-explainer-number">03</span>
            <h3>See the price and what moved it</h3>
            <p>Every factor and every discount, itemised. Change the coverage and watch it move.</p>
          </li>
        </ol>
      </section>

      <section className="pf-container pf-reassure">
        <LogoMark id={tenant.brand.logoMark} className="pf-reassure-mark" />
        <div>
          <h2 className="pf-reassure-title">{tenant.brand.tagline}</h2>
          <p className="pf-reassure-text">
            {tenant.brand.trustBadges.join(' · ')}. Call {tenant.brand.supportPhone} — {tenant.brand.supportHours}.
          </p>
        </div>
      </section>
    </>
  )
}
