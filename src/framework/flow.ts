import type { AnswerDoc, FeatureFlags, FieldDef, FlowConfig, SectionDef, StepDef } from './types'
import { evaluate } from './expressions'
import { getPath } from './paths'
import { validateField, type FieldErrors } from './validation'

/** A field once its position in the answer document is known. */
export interface ResolvedField {
  field: FieldDef
  /** Absolute path into the answer document. */
  path: string
}

/** One rendered pass of a repeating section, e.g. "Driver 2". */
export interface ResolvedRepeatItem {
  index: number
  label: string
  fields: ResolvedField[]
  canRemove: boolean
}

export interface ResolvedSection {
  section: SectionDef
  /** Populated for a plain section. */
  fields: ResolvedField[]
  /** Populated for a repeating section. */
  items: ResolvedRepeatItem[] | null
  canAdd: boolean
}

export function visibleSteps(flow: FlowConfig, answers: AnswerDoc, features: FeatureFlags): StepDef[] {
  return flow.steps.filter((step) => evaluate(step.when, answers, features))
}

/** The step a visitor should land on when the requested one is not available. */
export function firstStepId(flow: FlowConfig, answers: AnswerDoc, features: FeatureFlags): string {
  return visibleSteps(flow, answers, features)[0]?.id ?? flow.steps[0]?.id ?? ''
}

export function neighbourStep(
  flow: FlowConfig,
  answers: AnswerDoc,
  features: FeatureFlags,
  stepId: string,
  direction: 1 | -1,
): StepDef | null {
  const steps = visibleSteps(flow, answers, features)
  const index = steps.findIndex((step) => step.id === stepId)
  if (index === -1) return null
  return steps[index + direction] ?? null
}

/**
 * Expands a step into what should actually be rendered: sections whose
 * condition holds, fields whose condition holds, and repeating sections
 * unrolled once per list entry.
 */
export function resolveStep(step: StepDef, answers: AnswerDoc, features: FeatureFlags): ResolvedSection[] {
  return (step.sections ?? [])
    .filter((section) => evaluate(section.when, answers, features))
    .map((section) => {
      if (!section.repeat) {
        return {
          section,
          fields: resolveFields(section.fields, answers, features),
          items: null,
          canAdd: false,
        }
      }

      const list = getPath(answers, section.repeat.over)
      const count = Math.max(Array.isArray(list) ? list.length : 0, section.repeat.min)
      const items: ResolvedRepeatItem[] = []
      for (let index = 0; index < count; index++) {
        items.push({
          index,
          label: `${section.repeat.itemLabel} ${index + 1}`,
          fields: resolveFields(section.fields, answers, features, `${section.repeat.over}.${index}`),
          canRemove: count > section.repeat.min,
        })
      }
      return { section, fields: [], items, canAdd: count < section.repeat.max }
    })
}

function resolveFields(
  fields: FieldDef[],
  answers: AnswerDoc,
  features: FeatureFlags,
  prefix?: string,
): ResolvedField[] {
  return fields
    .map((field) => ({ field, path: prefix ? `${prefix}.${field.id}` : field.id }))
    .filter(({ field, path }) => evaluate(rebase(field.when, prefix), answers, features) && path.length > 0)
}

/**
 * Inside a repeating section a condition that names `licenceNumber` means this
 * item's licence number, so its field paths are rebased onto the current item.
 */
function rebase(condition: any, prefix?: string): any {
  if (!condition || !prefix) return condition
  if (condition.op === 'and' || condition.op === 'or') {
    return { ...condition, of: condition.of.map((child: unknown) => rebase(child, prefix)) }
  }
  if (condition.op === 'not') return { ...condition, of: rebase(condition.of, prefix) }
  if (condition.op === 'feature') return condition
  // An author can opt out of rebasing by writing an absolute path with `$.`.
  if (typeof condition.field === 'string' && condition.field.startsWith('$.')) {
    return { ...condition, field: condition.field.slice(2) }
  }
  return { ...condition, field: `${prefix}.${condition.field}` }
}

/** Validates everything currently visible on a step. */
export function validateStep(step: StepDef, answers: AnswerDoc, features: FeatureFlags): FieldErrors {
  const errors: FieldErrors = {}
  for (const resolved of resolveStep(step, answers, features)) {
    const all = resolved.items ? resolved.items.flatMap((item) => item.fields) : resolved.fields
    for (const { field, path } of all) {
      const message = validateField(field, getPath(answers, path))
      if (message) errors[path] = message
    }
  }
  return errors
}
