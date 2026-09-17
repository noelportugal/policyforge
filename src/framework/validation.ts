import type { FieldDef, ValidationRule } from './types'

export type FieldErrors = Record<string, string>

const PATTERNS = {
  zip: /^\d{5}(-\d{4})?$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
}

/** Runs one field's rules and returns the first message that fails. */
export function validateField(field: FieldDef, value: unknown): string | null {
  const rules: ValidationRule[] = [...(field.required ? [{ rule: 'required' } as const] : []), ...(field.validate ?? [])]

  for (const rule of rules) {
    const message = applyRule(rule, value, field)
    if (message) return message
  }
  return null
}

function applyRule(rule: ValidationRule, value: unknown, field: FieldDef): string | null {
  const text = typeof value === 'string' ? value.trim() : value
  const missing = text === undefined || text === null || text === '' || (Array.isArray(text) && text.length === 0)

  if (rule.rule === 'required') {
    return missing ? (rule.message ?? `${field.label} is required`) : null
  }
  // Every other rule only applies once something has been entered, so an
  // optional field does not shout at a visitor who left it alone.
  if (missing) return null

  switch (rule.rule) {
    case 'pattern':
      return new RegExp(rule.value).test(String(text))
        ? null
        : (rule.message ?? `${field.label} is not in the expected format`)
    case 'minLength':
      return String(text).length >= rule.value
        ? null
        : (rule.message ?? `${field.label} must be at least ${rule.value} characters`)
    case 'maxLength':
      return String(text).length <= rule.value
        ? null
        : (rule.message ?? `${field.label} must be ${rule.value} characters or fewer`)
    case 'min':
      return Number(text) >= rule.value ? null : (rule.message ?? `${field.label} must be ${rule.value} or more`)
    case 'max':
      return Number(text) <= rule.value ? null : (rule.message ?? `${field.label} must be ${rule.value} or less`)
    case 'zip':
      return PATTERNS.zip.test(String(text)) ? null : (rule.message ?? 'Enter a valid 5 digit ZIP code')
    case 'email':
      return PATTERNS.email.test(String(text)) ? null : (rule.message ?? 'Enter a valid email address')
    case 'phone':
      return PATTERNS.phone.test(String(text)) ? null : (rule.message ?? 'Enter a valid 10 digit phone number')
    case 'ageBetween': {
      const age = ageFromDate(String(text))
      if (age === null) return rule.message ?? 'Enter a valid date of birth'
      const [low, high] = rule.value
      return age >= low && age <= high ? null : (rule.message ?? `Driver must be between ${low} and ${high}`)
    }
    case 'yearBetween': {
      const year = Number(text)
      const [low, high] = rule.value
      return year >= low && year <= high ? null : (rule.message ?? `Enter a year between ${low} and ${high}`)
    }
    default:
      return null
  }
}

/** Whole years elapsed since an ISO date, or null when the date is unusable. */
export function ageFromDate(iso: string, today = new Date()): number | null {
  const born = new Date(iso)
  if (Number.isNaN(born.getTime())) return null
  let age = today.getFullYear() - born.getFullYear()
  const monthDelta = today.getMonth() - born.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < born.getDate())) age--
  return age
}
