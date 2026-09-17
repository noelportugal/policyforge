import { useTenant } from '@/framework/TenantProvider'
import { slotRegistry } from '@/framework/registry'

/**
 * A named mount point.
 *
 * The application declares where extensions may appear; a tenant's `slots`
 * configuration decides what appears there. Adding a client-specific panel is
 * a registry entry plus one line of configuration, not a change to this file.
 */
export function Slot({ name, ...rest }: { name: string } & Record<string, unknown>) {
  const { tenant } = useTenant()
  const plugins = tenant.slots[name] ?? []
  if (plugins.length === 0) return null

  return (
    <>
      {plugins.map((key) => {
        const Plugin = slotRegistry.get(key)
        if (!Plugin) {
          if (import.meta.env.DEV) console.warn('[policyforge] unknown slot plugin', { slot: name, key })
          return null
        }
        return <Plugin key={key} {...rest} />
      })}
    </>
  )
}
