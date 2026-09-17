import type { TenantConfigInput } from './types'

const STORAGE_KEY = 'pf.tenant'

/**
 * Decides which brand this page load belongs to.
 *
 * Order: an explicit `?tenant=` in the address, then the hostname map a tenant
 * declares, then the last choice remembered in this browser, then the default.
 * Production deployments rely on the hostname; the query parameter exists so a
 * single public demo can show every brand.
 */
export function resolveTenantId(
  registry: Record<string, TenantConfigInput>,
  fallback: string,
  location: { search: string; hash: string; hostname: string },
): string {
  const fromQuery = readParam(location.search) ?? readParam(hashQuery(location.hash))
  if (fromQuery && registry[fromQuery]) return fromQuery

  const host = location.hostname.toLowerCase()
  for (const [id, config] of Object.entries(registry)) {
    if (config.hostnames?.some((candidate) => candidate.toLowerCase() === host)) return id
  }

  const remembered = safeRead()
  if (remembered && registry[remembered]) return remembered

  return fallback
}

export function rememberTenantId(id: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Private windows and blocked site data are normal, not exceptional.
  }
}

function safeRead(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function readParam(search: string): string | null {
  if (!search) return null
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('tenant')
}

function hashQuery(hash: string): string {
  const index = hash.indexOf('?')
  return index === -1 ? '' : hash.slice(index + 1)
}
