import { beforeAll, describe, expect, it } from 'vitest'
import { resolveTenant } from '@/framework/merge'
import { fieldRegistry, logoRegistry, optionRegistry, slotRegistry, stepRegistry } from '@/framework/registry'
import { registerBuiltInFields } from '@/fields'
import { registerBuiltInLogos } from '@/components/Logos'
import { registerBuiltInExtensions } from '@/plugins'
import { TENANT_REGISTRY, DEFAULT_TENANT_ID } from '@/tenants'
import type { FieldDef, TenantConfig } from '@/framework/types'
import { getRateEngine } from '@/rating/engine'
import '@/rating/engine'

/**
 * The contract test.
 *
 * A configuration-driven application fails at runtime when a tenant names a
 * field type, option source or plugin that nobody registered — and it fails on
 * the visitor's screen, in production, on the one brand nobody clicked through.
 * This walks every shipped tenant and proves that cannot happen.
 */
beforeAll(() => {
  registerBuiltInFields()
  registerBuiltInLogos()
  registerBuiltInExtensions()
})

const brandIds = Object.keys(TENANT_REGISTRY).filter((id) => !id.startsWith('_'))

describe('shipped tenants', () => {
  it('has a default that exists', () => {
    expect(brandIds).toContain(DEFAULT_TENANT_ID)
  })

  it.each(brandIds)('%s resolves against its ancestors', (id) => {
    const tenant = resolveTenant(id, TENANT_REGISTRY)
    expect(tenant.brand.name).toBeTruthy()
    expect(tenant.flow.steps.length).toBeGreaterThan(1)
    expect(tenant.theme.tokens.brand).toMatch(/^#/)
  })

  it.each(brandIds)('%s only names things that are registered', (id) => {
    const tenant = resolveTenant(id, TENANT_REGISTRY)

    expect(logoRegistry.has(tenant.brand.logoMark)).toBe(true)
    expect(() => getRateEngine(tenant.rating.engine)).not.toThrow()

    for (const plugins of Object.values(tenant.slots)) {
      for (const plugin of plugins) expect(slotRegistry.has(plugin), `slot plugin ${plugin}`).toBe(true)
    }

    for (const step of tenant.flow.steps) {
      if (step.component) {
        expect(stepRegistry.has(step.component), `step component ${step.component}`).toBe(true)
      }
      for (const field of everyField(tenant)) {
        expect(fieldRegistry.has(field.type), `field type ${field.type}`).toBe(true)
        if (field.options && !Array.isArray(field.options)) {
          expect(optionRegistry.has(field.options.source), `option source ${field.options.source}`).toBe(true)
        }
      }
    }
  })

  it.each(brandIds)('%s has unique step ids and a terminal quote step', (id) => {
    const tenant = resolveTenant(id, TENANT_REGISTRY)
    const ids = tenant.flow.steps.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(tenant.flow.steps.at(-1)?.component).toBe('quote-results')
  })

  it.each(brandIds)('%s can price every coverage tier it offers', (id) => {
    const tenant = resolveTenant(id, TENANT_REGISTRY)
    expect(tenant.rating.tiers.length).toBeGreaterThan(0)
    expect(tenant.rating.tiers.filter((tier) => tier.recommended).length).toBeLessThanOrEqual(1)
    for (const tier of tenant.rating.tiers) expect(tier.multiplier).toBeGreaterThan(0)
  })

  it.each(brandIds)('%s supplies every content key its steps refer to', (id) => {
    const tenant = resolveTenant(id, TENANT_REGISTRY)
    // A key that looks like a key (dotted, no spaces) must actually resolve;
    // a literal sentence passes through the translator untouched and is fine.
    const keyish = (value: string | undefined) => value !== undefined && /^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(value)
    for (const step of tenant.flow.steps) {
      for (const value of [step.title, step.subtitle]) {
        if (keyish(value)) expect(tenant.content[value!], `${step.id}: ${value}`).toBeTruthy()
      }
    }
  })
})

function everyField(tenant: TenantConfig): FieldDef[] {
  return tenant.flow.steps.flatMap((step) => (step.sections ?? []).flatMap((section) => section.fields))
}
