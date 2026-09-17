import { describe, expect, it } from 'vitest'
import { ageFromDate, validateField } from '@/framework/validation'
import type { FieldDef } from '@/framework/types'

const field = (overrides: Partial<FieldDef> = {}): FieldDef => ({
  id: 'x',
  type: 'text',
  label: 'ZIP code',
  ...overrides,
})

describe('validateField', () => {
  it('reports a required field that is blank', () => {
    expect(validateField(field({ required: true }), '   ')).toMatch(/required/i)
  })

  it('leaves an optional empty field alone', () => {
    expect(validateField(field({ validate: [{ rule: 'zip' }] }), '')).toBeNull()
  })

  it('checks ZIP, email and phone shapes', () => {
    expect(validateField(field({ validate: [{ rule: 'zip' }] }), '90015')).toBeNull()
    expect(validateField(field({ validate: [{ rule: 'zip' }] }), '9001')).toMatch(/ZIP/)
    expect(validateField(field({ validate: [{ rule: 'email' }] }), 'ada@example.com')).toBeNull()
    expect(validateField(field({ validate: [{ rule: 'email' }] }), 'ada@example')).toMatch(/email/)
    expect(validateField(field({ validate: [{ rule: 'phone' }] }), '(213) 555-0147')).toBeNull()
    expect(validateField(field({ validate: [{ rule: 'phone' }] }), '555-0147')).toMatch(/phone/)
  })

  it('uses the message the configuration supplies', () => {
    const message = validateField(field({ validate: [{ rule: 'zip', message: 'We need a ZIP to find your rates' }] }), 'x')
    expect(message).toBe('We need a ZIP to find your rates')
  })

  it('rejects a driver outside the accepted age range', () => {
    const rule = field({ label: 'Date of birth', validate: [{ rule: 'ageBetween', value: [16, 100] }] })
    const tooYoung = new Date()
    tooYoung.setFullYear(tooYoung.getFullYear() - 12)
    expect(validateField(rule, tooYoung.toISOString().slice(0, 10))).toMatch(/between/)
  })

  it('returns the first failure, not all of them', () => {
    const many = field({ required: true, validate: [{ rule: 'zip' }] })
    expect(validateField(many, '')).toMatch(/required/i)
  })
})

describe('ageFromDate', () => {
  it('counts whole years only', () => {
    expect(ageFromDate('1990-06-15', new Date('2026-06-14'))).toBe(35)
    expect(ageFromDate('1990-06-15', new Date('2026-06-15'))).toBe(36)
  })

  it('returns null for something that is not a date', () => {
    expect(ageFromDate('not a date')).toBeNull()
  })
})
