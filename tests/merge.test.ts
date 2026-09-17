import { describe, expect, it } from 'vitest'
import { deepMerge, resolveTenant } from '@/framework/merge'
import type { TenantConfigInput } from '@/framework/types'

describe('deepMerge', () => {
  it('merges nested objects key by key', () => {
    const result = deepMerge({ theme: { tokens: { brand: 'blue', ink: 'black' } } }, { theme: { tokens: { brand: 'red' } } })
    expect(result).toEqual({ theme: { tokens: { brand: 'red', ink: 'black' } } })
  })

  it('replaces arrays instead of merging them positionally', () => {
    const result = deepMerge({ steps: ['a', 'b', 'c'] }, { steps: ['x'] })
    expect(result).toEqual({ steps: ['x'] })
  })

  it('leaves the base alone when the override says nothing', () => {
    const base = { a: 1 }
    expect(deepMerge(base, undefined)).toBe(base)
  })

  it('allows an override to erase a value with null', () => {
    expect(deepMerge({ a: 1 }, { a: null })).toEqual({ a: null })
  })
})

describe('resolveTenant', () => {
  const registry: Record<string, TenantConfigInput> = {
    _base: { id: '_base', brand: { name: 'Base', tagline: 'House' } } as TenantConfigInput,
    child: { id: 'child', extends: '_base', brand: { name: 'Child' } } as TenantConfigInput,
    grandchild: { id: 'grandchild', extends: 'child', brand: { tagline: 'Deep' } } as TenantConfigInput,
  }

  it('inherits what a tenant does not restate', () => {
    expect(resolveTenant('child', registry).brand).toEqual({ name: 'Child', tagline: 'House' })
  })

  it('follows a chain of ancestors', () => {
    expect(resolveTenant('grandchild', registry).brand).toEqual({ name: 'Child', tagline: 'Deep' })
  })

  it('keeps the requested id rather than the parent id', () => {
    expect(resolveTenant('grandchild', registry).id).toBe('grandchild')
  })

  it('refuses an unknown tenant', () => {
    expect(() => resolveTenant('nope', registry)).toThrow(/Unknown tenant/)
  })

  it('refuses circular inheritance instead of hanging', () => {
    const circular: Record<string, TenantConfigInput> = {
      a: { id: 'a', extends: 'b' } as TenantConfigInput,
      b: { id: 'b', extends: 'a' } as TenantConfigInput,
    }
    expect(() => resolveTenant('a', circular)).toThrow(/Circular/)
  })
})
