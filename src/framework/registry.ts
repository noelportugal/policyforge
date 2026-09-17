import type { ComponentType } from 'react'
import type { OptionDef } from './types'

/**
 * Extension points.
 *
 * Every renderable piece of the funnel is looked up by string key, which is
 * what lets a tenant configuration written as plain data choose components. A
 * client-specific build registers its own entries at start-up and then only
 * ever ships configuration.
 */
function createRegistry<T>(kind: string) {
  const entries = new Map<string, T>()
  return {
    register(key: string, value: T): void {
      entries.set(key, value)
    },
    registerAll(values: Record<string, T>): void {
      for (const [key, value] of Object.entries(values)) entries.set(key, value)
    },
    get(key: string): T | undefined {
      return entries.get(key)
    },
    require(key: string): T {
      const found = entries.get(key)
      if (!found) throw new Error(`No ${kind} registered for "${key}"`)
      return found
    },
    has(key: string): boolean {
      return entries.has(key)
    },
    keys(): string[] {
      return [...entries.keys()]
    },
  }
}

/** Props every field renderer receives. */
export interface FieldRendererProps {
  /** Absolute path into the answer document. */
  path: string
  label: string
  value: unknown
  error: string | null
  required: boolean
  help?: string
  placeholder?: string
  options: OptionDef[]
  props: Record<string, unknown>
  onChange: (value: unknown) => void
  onBlur: () => void
}

/** A data source supplies options that depend on answers already given. */
export type OptionProvider = (context: { answers: unknown; path: string; dependsOn: unknown[] }) => OptionDef[]

export const fieldRegistry = createRegistry<ComponentType<FieldRendererProps>>('field renderer')
export const stepRegistry = createRegistry<ComponentType<{ stepId: string }>>('step component')
export const slotRegistry = createRegistry<ComponentType<Record<string, unknown>>>('slot plugin')
export const logoRegistry = createRegistry<ComponentType<{ className?: string }>>('logo mark')
export const optionRegistry = createRegistry<OptionProvider>('option source')
