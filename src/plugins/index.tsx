import { slotRegistry, stepRegistry } from '@/framework/registry'
import { useQuote } from '@/framework/QuoteProvider'
import { useTenant } from '@/framework/TenantProvider'
import { getPath } from '@/framework/paths'
import { QuoteResults } from '@/components/steps/QuoteResults'
import { ReviewStep } from '@/components/steps/ReviewStep'
import { hash } from '@/rating/engine'

/**
 * Optional panels. None of these are referenced by the funnel; a tenant opts in
 * by naming them in its `slots` configuration, which is how two brands share
 * one codebase while showing different things on the same screen.
 */

/** Agency model: match the visitor with a nearby licensed agent. */
function AgentLocator() {
  const { answers } = useQuote()
  const { t } = useTenant()
  const zip = String(getPath(answers, 'zip') ?? '')
  if (!zip) return null

  const seed = hash(zip)
  const agents = [
    { name: 'Dana Whitfield', years: 12 },
    { name: 'Marcus Okafor', years: 8 },
    { name: 'Priya Raman', years: 15 },
  ].map((agent, index) => ({
    ...agent,
    distance: (((seed >> (index * 3)) % 70) / 10 + 0.8).toFixed(1),
    rating: (4.4 + ((seed >> index) % 6) / 10).toFixed(1),
  }))

  return (
    <aside className="pf-panel">
      <h2 className="pf-panel-title">{t('agents.title', { zip })}</h2>
      <p className="pf-panel-sub">{t('agents.body')}</p>
      <ul className="pf-agent-list">
        {agents.map((agent) => (
          <li key={agent.name}>
            <span className="pf-agent-avatar" aria-hidden="true">
              {agent.name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </span>
            <span className="pf-agent-body">
              <strong>{agent.name}</strong>
              <span className="pf-agent-meta">
                {agent.distance} miles · {agent.years} years · ★ {agent.rating}
              </span>
            </span>
            <button type="button" className="pf-button pf-button-ghost pf-button-small">
              Request call
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

/** Carrier model: nudge towards bundling a second policy. */
function BundleNudge() {
  const { answers, setValue } = useQuote()
  const bundled = getPath(answers, 'bundle') === true
  return (
    <aside className={`pf-nudge${bundled ? ' is-on' : ''}`}>
      <div>
        <h2 className="pf-nudge-title">Add a home or renters policy</h2>
        <p className="pf-nudge-text">
          Households that insure two policies with us keep an extra discount on both for as long as they
          hold them.
        </p>
      </div>
      <button
        type="button"
        className={`pf-button ${bundled ? 'pf-button-quiet' : 'pf-button-primary'}`}
        onClick={() => setValue('bundle', !bundled)}
      >
        {bundled ? 'Added ✓' : 'Add it'}
      </button>
    </aside>
  )
}

/** Direct model: offer the telematics programme that earns a discount. */
function TelematicsOffer() {
  const { answers, setValue } = useQuote()
  const enrolled = getPath(answers, 'telematics') === true
  return (
    <aside className={`pf-nudge${enrolled ? ' is-on' : ''}`}>
      <div>
        <h2 className="pf-nudge-title">Drive-tracked savings</h2>
        <p className="pf-nudge-text">
          Share driving data from your phone for 90 days. Careful drivers keep the discount at renewal; no
          one pays more for taking part.
        </p>
      </div>
      <button
        type="button"
        className={`pf-button ${enrolled ? 'pf-button-quiet' : 'pf-button-primary'}`}
        onClick={() => setValue('telematics', !enrolled)}
      >
        {enrolled ? 'Enrolled ✓' : 'Count me in'}
      </button>
    </aside>
  )
}

/** A thin strip of trust statements under the header. */
function TrustStrip() {
  const { tenant } = useTenant()
  if (tenant.brand.trustBadges.length === 0) return null
  return (
    <div className="pf-trust-strip">
      <div className="pf-container pf-trust-inner">
        {tenant.brand.trustBadges.map((badge) => (
          <span className="pf-trust-badge" key={badge}>
            {badge}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Agency model: show what a handful of carriers would charge. */
function CarrierComparison({ tierId }: { tierId?: string }) {
  const { result } = useQuote()
  const { tenant } = useTenant()
  if (!result) return null
  const tier = result.tiers.find((candidate) => candidate.id === tierId) ?? result.tiers[0]
  if (!tier) return null

  const money = new Intl.NumberFormat(tenant.locale.locale, {
    style: 'currency',
    currency: tenant.locale.currency,
    minimumFractionDigits: 2,
  })
  // The price already shown came from the panel, so it is the panel's best.
  // Every other carrier has to sit above it or the table contradicts the quote.
  const seed = hash(result.quoteNumber)
  const names = ['Northgate Mutual', 'Pacific Standard', 'Harbourline', 'Redwood Casualty']
  const carriers = names.map((name, index) => ({
    name,
    premium: index === 0 ? tier.monthlyPremium : tier.monthlyPremium * (1 + (((seed >> (index * 4)) % 22) + 4) / 100),
    quoted: index === 0,
  }))
  carriers.sort((a, b) => a.premium - b.premium)

  return (
    <aside className="pf-panel">
      <h2 className="pf-panel-title">What other carriers quoted</h2>
      <p className="pf-panel-sub">Same {tier.label} coverage, priced across the panel we represent.</p>
      <table className="pf-compare">
        <thead>
          <tr>
            <th scope="col">Carrier</th>
            <th scope="col">Monthly</th>
          </tr>
        </thead>
        <tbody>
          {carriers.map((carrier) => (
            <tr key={carrier.name} className={carrier.quoted ? 'is-best' : undefined}>
              <td>
                {carrier.name}
                {carrier.quoted ? <span className="pf-tag">Your quote</span> : null}
              </td>
              <td>{money.format(carrier.premium)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  )
}

export function registerBuiltInExtensions(): void {
  stepRegistry.registerAll({
    'quote-results': QuoteResults,
    review: ReviewStep,
  })
  slotRegistry.registerAll({
    'agent-locator': AgentLocator,
    'bundle-nudge': BundleNudge,
    'telematics-offer': TelematicsOffer,
    'trust-strip': TrustStrip,
    'carrier-comparison': CarrierComparison,
  })
}
