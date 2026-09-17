import { describe, expect, it } from 'vitest'
import { demoRateEngine } from '@/rating/engine'
import { ageBand, deriveRatingInputs, vehicleAgeBand } from '@/rating/derive'
import { resolveTenant } from '@/framework/merge'
import { TENANT_REGISTRY } from '@/tenants'
import type { AnswerDoc } from '@/framework/types'

const meridian = resolveTenant('meridian', TENANT_REGISTRY)

const answers: AnswerDoc = {
  zip: '90015',
  product: 'auto',
  vehicles: [{ year: '2021', make: 'Toyota', model: 'RAV4', use: 'commute', mileage: '10kto15k' }],
  drivers: [{ dateOfBirth: '1988-04-02' }],
  coverage: { liability: '100/300/100', deductible: '500' },
  yearsInsured: '5plus',
  residence: 'own-home',
  extras: [],
}

const rate = (extra: AnswerDoc = {}) =>
  demoRateEngine({ answers: { ...answers, ...extra }, config: meridian.rating, features: meridian.features })

describe('deriveRatingInputs', () => {
  it('bands the youngest driver, not the first one listed', () => {
    const derived = deriveRatingInputs(
      { drivers: [{ dateOfBirth: '1970-01-01' }, { dateOfBirth: '2008-01-01' }] },
      new Date('2026-09-16'),
    ) as { derived: Record<string, unknown> }
    expect(derived.derived.youngestDriverBand).toBe('under21')
  })

  it('bands ages and vehicle ages at the boundaries', () => {
    expect(ageBand(20)).toBe('under21')
    expect(ageBand(21)).toBe('21to24')
    expect(ageBand(null)).toBe('unknown')
    expect(vehicleAgeBand(2025, 2026)).toBe('new')
    expect(vehicleAgeBand(2020, 2026)).toBe('recent')
    expect(vehicleAgeBand(2019, 2026)).toBe('older')
    expect(vehicleAgeBand(null, 2026)).toBe('unknown')
  })
})

describe('demoRateEngine', () => {
  it('prices the same answers the same way every time', async () => {
    const [first, second] = await Promise.all([rate(), rate()])
    expect(first.tiers).toEqual(second.tiers)
    expect(first.quoteNumber).toBe(second.quoteNumber)
  })

  it('charges a young driver more than an experienced one', async () => {
    const young = await rate({ drivers: [{ dateOfBirth: '2008-01-02' }] })
    const experienced = await rate()
    expect(price(young)).toBeGreaterThan(price(experienced))
  })

  it('applies a discount only when its condition holds', async () => {
    const without = await rate()
    const bundled = await rate({ bundle: true })
    expect(without.discounts.map((discount) => discount.id)).not.toContain('bundle')
    expect(bundled.discounts.map((discount) => discount.id)).toContain('bundle')
    expect(price(bundled)).toBeLessThan(price(without))
  })

  it('reads a list answer for chip-style discounts', async () => {
    const result = await rate({ extras: ['paperless', 'autopay'] })
    const ids = result.discounts.map((discount) => discount.id)
    expect(ids).toContain('paperless')
    expect(ids).toContain('autopay')
  })

  it('never discounts a premium below the floor', async () => {
    const stacked = await rate({
      bundle: true,
      telematics: true,
      extras: ['paperless', 'autopay', 'goodStudent', 'defensive', 'antiTheft'],
    })
    const floor = Math.round(meridian.rating.basePremium * 0.35)
    expect(price(stacked)).toBeGreaterThanOrEqual(Math.round(floor * 0.79))
  })

  it('orders tiers from cheapest to dearest and marks one recommended', async () => {
    const result = await rate()
    const prices = result.tiers.map((tier) => tier.termPremium)
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
    expect(result.tiers.filter((tier) => tier.recommended)).toHaveLength(1)
  })

  it('prices a second vehicle higher but earns the multi-car discount', async () => {
    const two = await rate({
      vehicles: [...(answers.vehicles as AnswerDoc[]), { year: '2018', make: 'Honda', model: 'Civic', use: 'pleasure', mileage: 'under5k' }],
    })
    expect(two.discounts.map((discount) => discount.id)).toContain('multi-car')
    expect(price(two)).toBeGreaterThan(price(await rate()))
  })

  it('gives each brand its own price for identical answers', async () => {
    const cobalt = resolveTenant('cobalt', TENANT_REGISTRY)
    const theirs = await demoRateEngine({ answers, config: cobalt.rating, features: cobalt.features })
    expect(price(theirs)).not.toBe(price(await rate()))
  })
})

function price(result: { tiers: { termPremium: number }[] }): number {
  return result.tiers[1]?.termPremium ?? 0
}
