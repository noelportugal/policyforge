import type { TenantConfig, TenantConfigInput } from './types'

/**
 * Layers tenant configuration.
 *
 * Objects merge key by key so a tenant can override one colour token without
 * restating the palette. Arrays replace wholesale: a tenant that lists steps is
 * declaring the whole funnel, because a positional merge of two step lists
 * produces a funnel nobody wrote.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base
  if (override === null) return override as T
  if (Array.isArray(override)) return override as T
  if (typeof override !== 'object' || typeof base !== 'object' || base === null || Array.isArray(base)) {
    return override as T
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    result[key] = deepMerge((base as Record<string, unknown>)[key], value)
  }
  return result as T
}

/**
 * Resolves a tenant against its ancestors. `extends` may be chained, so a
 * regional brand can sit on a national brand which sits on the house default.
 */
export function resolveTenant(
  id: string,
  registry: Record<string, TenantConfigInput>,
  seen: string[] = [],
): TenantConfig {
  const config = registry[id]
  if (!config) throw new Error(`Unknown tenant "${id}"`)
  if (seen.includes(id)) {
    throw new Error(`Circular tenant inheritance: ${[...seen, id].join(' -> ')}`)
  }
  if (!config.extends) return config as TenantConfig

  const parent = resolveTenant(config.extends, registry, [...seen, id])
  const merged = deepMerge(parent, config) as TenantConfig
  return { ...merged, id, extends: config.extends }
}
