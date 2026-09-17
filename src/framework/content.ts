import type { ContentDict } from './types'
import { interpolate } from './paths'

/**
 * Copy lookup with interpolation.
 *
 * A missing key returns the key itself rather than an empty string: a visible
 * `quote.hero.title` in the page is a bug someone fixes, whereas a blank
 * heading ships to production unnoticed.
 */
export function createTranslator(dict: ContentDict, vars: Record<string, unknown> = {}) {
  return function t(key: string, extra: Record<string, unknown> = {}): string {
    // A key with no entry is returned as written, so configuration may hold
    // either a content key or the literal sentence. Both interpolate.
    const template = dict[key] ?? key
    return interpolate(template, { ...vars, ...extra })
  }
}

export type Translator = ReturnType<typeof createTranslator>
