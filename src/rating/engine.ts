import type { RateEngine, RateRequest, RateResult, AppliedDiscount, AppliedFactor } from './types'
import { evaluate } from '@/framework/expressions'
import { getPath } from '@/framework/paths'
import { deriveRatingInputs } from './derive'

const engines = new Map<string, RateEngine>()

export function registerRateEngine(key: string, engine: RateEngine): void {
  engines.set(key, engine)
}

export function getRateEngine(key: string): RateEngine {
  const engine = engines.get(key)
  if (!engine) throw new Error(`No rate engine registered for "${key}"`)
  return engine
}

/**
 * A deterministic demonstration rater.
 *
 * It multiplies a tenant's base premium by that tenant's own factor tables,
 * removes the discounts whose conditions hold, then spreads the result across
 * coverage tiers. Two visitors who answer identically always see the same
 * price, which keeps the public demo honest and makes the tests meaningful.
 * It is not an actuarial model and it is not underwriting.
 */
export const demoRateEngine: RateEngine = async ({ answers, config, features }: RateRequest): Promise<RateResult> => {
  const enriched = deriveRatingInputs(answers)

  const factors: AppliedFactor[] = []
  let premium = config.basePremium

  for (const [path, table] of Object.entries(config.factors)) {
    const raw = getPath(enriched, path)
    const key = raw === undefined || raw === null || raw === '' ? 'unknown' : String(raw)
    const factor = table[key] ?? table['default'] ?? 1
    if (factor !== 1) {
      factors.push({ label: config.factorLabels?.[path] ?? humanise(path), value: humanise(key), factor })
    }
    premium *= factor
  }

  // Territory nudge: a stable pseudo-variation by ZIP so two nearby postcodes
  // do not print an identical premium in a demo.
  const zip = String(getPath(enriched, 'zip') ?? '')
  const territory = 1 + (hash(zip) % 13) / 100
  if (zip) factors.push({ label: 'Territory', value: zip, factor: round2(territory) })
  premium *= territory

  premium = Math.round(premium)

  const discounts: AppliedDiscount[] = config.discounts
    .filter((discount) => evaluate(discount.when, enriched, features))
    .map((discount) => ({
      id: discount.id,
      label: discount.label,
      amount: Math.round(premium * discount.amount),
    }))

  const discountTotal = discounts.reduce((sum, discount) => sum + discount.amount, 0)
  const net = Math.max(premium - discountTotal, Math.round(config.basePremium * 0.35)) + config.policyFee

  const tiers = config.tiers.map((tier) => {
    const termPremium = Math.round(net * tier.multiplier)
    return {
      id: tier.id,
      label: tier.label,
      description: tier.description,
      highlights: tier.highlights,
      recommended: tier.recommended === true,
      termPremium,
      monthlyPremium: Math.round((termPremium / config.termMonths) * 100) / 100,
    }
  })

  await delay(450)

  return {
    quoteNumber: quoteNumber(enriched),
    termMonths: config.termMonths,
    basePremium: config.basePremium,
    factors,
    discounts,
    policyFee: config.policyFee,
    tiers,
    ratedAt: new Date().toISOString(),
  }
}

registerRateEngine('demo-v1', demoRateEngine)

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function quoteNumber(answers: unknown): string {
  const seed = hash(JSON.stringify(answers ?? {}))
  return `Q-${String(seed % 1_000_000).padStart(6, '0')}`
}

/** Small non-cryptographic hash, used only to keep demo numbers stable. */
export function hash(input: string): number {
  let value = 2166136261
  for (let i = 0; i < input.length; i++) {
    value ^= input.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** Turns a coded answer such as `10kto15k` into something a person can read. */
function humanise(token: string): string {
  const last = token.split('.').pop() ?? token
  return last
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d[a-z]*)to(\d)/gi, '$1 to $2')
    .replace(/^under(\d)/i, 'under $1')
    .replace(/(\d)plus/i, '$1 or more')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (character) => character.toUpperCase())
    .trim()
}
