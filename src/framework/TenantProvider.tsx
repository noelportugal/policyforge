import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { BrandConfig, ContentDict, FeatureFlags, TenantConfig, TenantConfigInput, ThemeTokens } from './types'
import { resolveTenant } from './merge'
import { createTranslator, type Translator } from './content'
import { applyDocumentIdentity, applyTheme } from './theme'

/** The subset of a tenant the studio (or a client preview tool) may replace. */
export interface TenantOverrides {
  brand?: Partial<BrandConfig>
  theme?: { tokens?: ThemeTokens }
  features?: FeatureFlags
  content?: ContentDict
}

export interface TenantContextValue {
  tenant: TenantConfig
  t: Translator
  /** Every tenant the build knows about, for the demo switcher. */
  available: { id: string; name: string }[]
  switchTenant: (id: string) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

export interface TenantProviderProps {
  registry: Record<string, TenantConfigInput>
  tenantId: string
  /** Values overridden live by the studio panel, layered over the tenant. */
  overrides?: TenantOverrides
  onSwitchTenant: (id: string) => void
  children: ReactNode
}

export function TenantProvider({
  registry,
  tenantId,
  overrides,
  onSwitchTenant,
  children,
}: TenantProviderProps) {
  const tenant = useMemo(() => {
    const resolved = resolveTenant(tenantId, registry)
    if (!overrides) return resolved
    return {
      ...resolved,
      brand: { ...resolved.brand, ...(overrides.brand ?? {}) },
      theme: {
        ...resolved.theme,
        ...(overrides.theme ?? {}),
        tokens: { ...resolved.theme.tokens, ...(overrides.theme?.tokens ?? {}) },
      },
      features: { ...resolved.features, ...(overrides.features ?? {}) },
      content: { ...resolved.content, ...(overrides.content ?? {}) },
    }
  }, [registry, tenantId, overrides])

  useEffect(() => {
    applyTheme(tenant.theme)
    applyDocumentIdentity(`${tenant.brand.name} — ${tenant.brand.tagline}`, tenant.brand.favicon)
  }, [tenant])

  const value = useMemo<TenantContextValue>(() => {
    const t = createTranslator(tenant.content, {
      brand: tenant.brand.name,
      legal: tenant.brand.legalName,
      phone: tenant.brand.supportPhone,
      year: new Date().getFullYear(),
    })
    // Ids beginning with an underscore are shared parents, never brands a
    // visitor can be shown.
    const available = Object.keys(registry)
      .filter((id) => !id.startsWith('_'))
      .map((id) => ({ id, name: resolveTenant(id, registry).brand.name }))
    return { tenant, t, available, switchTenant: onSwitchTenant }
  }, [tenant, registry, onSwitchTenant])

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (!context) throw new Error('useTenant must be used inside a TenantProvider')
  return context
}
