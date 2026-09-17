import { describe, expect, it } from 'vitest'
import type { FlowConfig, StepDef } from '@/framework/types'
import { neighbourStep, resolveStep, validateStep, visibleSteps } from '@/framework/flow'

const flow: FlowConfig = {
  id: 'test',
  steps: [
    { id: 'start', label: 'Start', title: 'Start', sections: [] },
    {
      id: 'vehicles',
      label: 'Vehicles',
      title: 'Vehicles',
      when: { op: 'in', field: 'product', value: ['auto'] },
      sections: [],
    },
    {
      id: 'agent',
      label: 'Agent',
      title: 'Agent',
      when: { op: 'feature', flag: 'agentNetwork' },
      sections: [],
    },
    { id: 'quote', label: 'Quote', title: 'Quote', component: 'quote-results' },
  ],
}

describe('visibleSteps', () => {
  it('drops a step whose condition does not hold', () => {
    const ids = visibleSteps(flow, { product: 'renters' }, { agentNetwork: false }).map((step) => step.id)
    expect(ids).toEqual(['start', 'quote'])
  })

  it('adds a step when a feature flag turns on', () => {
    const ids = visibleSteps(flow, { product: 'auto' }, { agentNetwork: true }).map((step) => step.id)
    expect(ids).toEqual(['start', 'vehicles', 'agent', 'quote'])
  })
})

describe('neighbourStep', () => {
  it('skips over a hidden step rather than landing on it', () => {
    const next = neighbourStep(flow, { product: 'auto' }, { agentNetwork: false }, 'vehicles', 1)
    expect(next?.id).toBe('quote')
  })

  it('returns nothing past the end', () => {
    expect(neighbourStep(flow, {}, {}, 'quote', 1)).toBeNull()
  })
})


const repeatStep: StepDef = {
  id: 'drivers',
  label: 'Drivers',
  title: 'Drivers',
  sections: [
    {
      id: 'drivers',
      repeat: { over: 'drivers', min: 1, max: 4, addLabel: 'Add', removeLabel: 'Remove', itemLabel: 'Driver' },
      fields: [
        { id: 'firstName', type: 'text', label: 'First name', required: true },
        {
          id: 'licenceNumber',
          type: 'text',
          label: 'Licence number',
          required: true,
          when: { op: 'truthy', field: 'licensed' },
        },
        {
          id: 'note',
          type: 'text',
          label: 'Note',
          when: { op: 'eq', field: '$.product', value: 'auto' },
        },
      ],
    },
  ],
}

describe('repeating sections', () => {
  it('unrolls one pass per entry and rebases every field path', () => {
    const answers = { drivers: [{ firstName: 'Ada' }, { firstName: 'Grace' }] }
    const [section] = resolveStep(repeatStep, answers, {})
    expect(section?.items).toHaveLength(2)
    expect(section?.items?.[1]?.fields.map((field) => field.path)).toContain('drivers.1.firstName')
  })

  it('always renders the minimum number of entries', () => {
    const [section] = resolveStep(repeatStep, {}, {})
    expect(section?.items).toHaveLength(1)
    expect(section?.items?.[0]?.canRemove).toBe(false)
  })

  it('rebases a condition onto the entry being rendered', () => {
    const answers = { drivers: [{ licensed: true }, { licensed: false }] }
    const [section] = resolveStep(repeatStep, answers, {})
    const paths = (index: number) => section?.items?.[index]?.fields.map((field) => field.field.id) ?? []
    expect(paths(0)).toContain('licenceNumber')
    expect(paths(1)).not.toContain('licenceNumber')
  })

  it('reads a $-prefixed path from the top of the document', () => {
    const [withProduct] = resolveStep(repeatStep, { product: 'auto', drivers: [{}] }, {})
    const [withoutProduct] = resolveStep(repeatStep, { product: 'renters', drivers: [{}] }, {})
    expect(withProduct?.items?.[0]?.fields.map((field) => field.field.id)).toContain('note')
    expect(withoutProduct?.items?.[0]?.fields.map((field) => field.field.id)).not.toContain('note')
  })

  it('stops adding entries at the configured maximum', () => {
    const answers = { drivers: [{}, {}, {}, {}] }
    const [section] = resolveStep(repeatStep, answers, {})
    expect(section?.canAdd).toBe(false)
  })
})

describe('validateStep', () => {
  it('reports errors against the full path of each repeated field', () => {
    const errors = validateStep(repeatStep, { drivers: [{ firstName: 'Ada' }, {}] }, {})
    expect(errors['drivers.1.firstName']).toMatch(/required/i)
    expect(errors['drivers.0.firstName']).toBeUndefined()
  })

  it('ignores a field that is not currently shown', () => {
    const errors = validateStep(repeatStep, { drivers: [{ firstName: 'Ada', licensed: false }] }, {})
    expect(errors['drivers.0.licenceNumber']).toBeUndefined()
  })
})
