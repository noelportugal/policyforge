import { describe, expect, it } from 'vitest'
import { evaluate } from '@/framework/expressions'
import type { Condition } from '@/framework/types'

const answers = {
  product: 'auto',
  zip: '90015',
  extras: ['paperless', 'autopay'],
  bundle: true,
  drivers: [{ age: 24 }, { age: 51 }],
  empty: '',
}

describe('evaluate', () => {
  it('treats a missing condition as true', () => {
    expect(evaluate(undefined, answers)).toBe(true)
  })

  it('compares loosely, because form controls hand back strings', () => {
    expect(evaluate({ op: 'eq', field: 'drivers.0.age', value: '24' }, answers)).toBe(true)
    expect(evaluate({ op: 'eq', field: 'bundle', value: 'true' }, answers)).toBe(true)
  })

  it('handles numeric comparison', () => {
    expect(evaluate({ op: 'gte', field: 'drivers.1.age', value: 50 }, answers)).toBe(true)
    expect(evaluate({ op: 'lt', field: 'drivers.1.age', value: 50 }, answers)).toBe(false)
  })

  it('refuses to compare values that are not numbers', () => {
    expect(evaluate({ op: 'gt', field: 'zip', value: 'abc' }, answers)).toBe(false)
  })

  it('reads list membership both ways round', () => {
    expect(evaluate({ op: 'in', field: 'product', value: ['auto', 'auto-home'] }, answers)).toBe(true)
    expect(evaluate({ op: 'nin', field: 'product', value: ['renters'] }, answers)).toBe(true)
    expect(evaluate({ op: 'contains', field: 'extras', value: 'autopay' }, answers)).toBe(true)
    expect(evaluate({ op: 'contains', field: 'extras', value: 'goodStudent' }, answers)).toBe(false)
  })

  it('distinguishes an empty string from an unanswered question', () => {
    expect(evaluate({ op: 'empty', field: 'empty' }, answers)).toBe(true)
    expect(evaluate({ op: 'filled', field: 'zip' }, answers)).toBe(true)
    expect(evaluate({ op: 'filled', field: 'nothing.here' }, answers)).toBe(false)
  })

  it('combines conditions', () => {
    const condition: Condition = {
      op: 'and',
      of: [
        { op: 'eq', field: 'product', value: 'auto' },
        { op: 'not', of: { op: 'truthy', field: 'telematics' } },
      ],
    }
    expect(evaluate(condition, answers)).toBe(true)
  })

  it('reads feature flags from the tenant, not the answers', () => {
    expect(evaluate({ op: 'feature', flag: 'agentNetwork' }, answers, { agentNetwork: true })).toBe(true)
    expect(evaluate({ op: 'feature', flag: 'agentNetwork' }, answers, { agentNetwork: false })).toBe(false)
    expect(evaluate({ op: 'feature', flag: 'missing' }, answers, {})).toBe(false)
  })
})
