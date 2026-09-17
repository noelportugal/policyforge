import type { TenantConfigInput } from '@/framework/types'
import { baseTenant } from './base'
import { meridianTenant } from './meridian'
import { cobaltTenant } from './cobalt'
import { sundialTenant } from './sundial'

/**
 * Every tenant this build knows about.
 *
 * In production this map is fetched, not imported: the shell boots, asks a
 * configuration service which brand this hostname is, and applies what comes
 * back. Bundling them is what makes one public demo able to show all three.
 */
export const TENANT_REGISTRY: Record<string, TenantConfigInput> = {
  _base: baseTenant,
  meridian: meridianTenant,
  cobalt: cobaltTenant,
  sundial: sundialTenant,
}

export const DEFAULT_TENANT_ID = 'meridian'
