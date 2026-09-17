import type { Condition, FeatureFlags } from './types'
import { getPath } from './paths'

/**
 * Interprets a serialisable condition against the answer document.
 *
 * Tenant configuration is treated as untrusted input: it may be authored by a
 * business user in a content tool and fetched at runtime. Nothing here reaches
 * `eval` or `new Function`, so the worst a malformed condition can do is
 * evaluate to `false`.
 */
export function evaluate(
  condition: Condition | undefined,
  answers: unknown,
  features: FeatureFlags = {},
): boolean {
  if (!condition) return true

  switch (condition.op) {
    case 'and':
      return condition.of.every((child) => evaluate(child, answers, features))
    case 'or':
      return condition.of.some((child) => evaluate(child, answers, features))
    case 'not':
      return !evaluate(condition.of, answers, features)
    case 'feature':
      return features[condition.flag] === true
    default:
      break
  }

  const actual = getPath(answers, condition.field)

  switch (condition.op) {
    case 'eq':
      return looseEqual(actual, condition.value)
    case 'ne':
      return !looseEqual(actual, condition.value)
    case 'gt':
      return compare(actual, condition.value, (a, b) => a > b)
    case 'gte':
      return compare(actual, condition.value, (a, b) => a >= b)
    case 'lt':
      return compare(actual, condition.value, (a, b) => a < b)
    case 'lte':
      return compare(actual, condition.value, (a, b) => a <= b)
    case 'in':
      return condition.value.some((candidate) => looseEqual(actual, candidate))
    case 'nin':
      return !condition.value.some((candidate) => looseEqual(actual, candidate))
    case 'contains':
      return Array.isArray(actual) && actual.some((entry) => looseEqual(entry, condition.value))
    case 'filled':
      return !isEmpty(actual)
    case 'empty':
      return isEmpty(actual)
    case 'truthy':
      return Boolean(actual)
    case 'falsy':
      return !actual
    default:
      return false
  }
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/** Form controls hand back strings, so `"25" == 25` has to hold. */
function looseEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || a === undefined || b === null || b === undefined) return false
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return toBoolean(a) === toBoolean(b)
  }
  return String(a) === String(b)
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return Boolean(value)
}

function compare(a: unknown, b: unknown, test: (x: number, y: number) => boolean): boolean {
  const left = Number(a)
  const right = Number(b)
  if (Number.isNaN(left) || Number.isNaN(right)) return false
  return test(left, right)
}
