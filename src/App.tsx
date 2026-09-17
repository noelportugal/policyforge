import { useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { TenantProvider, useTenant } from '@/framework/TenantProvider'
import { QuoteProvider } from '@/framework/QuoteProvider'
import { rememberTenantId, resolveTenantId } from '@/framework/resolveTenantId'
import { firstStepId } from '@/framework/flow'
import { DEFAULT_TENANT_ID, TENANT_REGISTRY } from '@/tenants'
import { Shell } from '@/components/Shell'
import { Landing } from '@/pages/Landing'
import { FlowPage } from '@/pages/FlowPage'
import { BrandStudio, type StudioOverrides } from '@/studio/BrandStudio'

type Scheme = 'system' | 'light' | 'dark'

export function App() {
  return (
    <HashRouter>
      <AppRoot />
    </HashRouter>
  )
}

function AppRoot() {
  const [tenantId, setTenantId] = useState(() =>
    resolveTenantId(TENANT_REGISTRY, DEFAULT_TENANT_ID, window.location),
  )
  const [overrides, setOverrides] = useState<StudioOverrides>({})
  const [scheme, setScheme] = useState<Scheme>('system')
  const [studioOpen, setStudioOpen] = useState(false)

  useEffect(() => {
    if (scheme === 'system') document.documentElement.removeAttribute('data-scheme')
    else document.documentElement.setAttribute('data-scheme', scheme)
  }, [scheme])

  const navigate = useNavigate()
  const switchTenant = useCallback((id: string) => {
    setTenantId(id)
    // Each brand has its own funnel and its own saved answers, so a switch
    // starts that brand from the top rather than stranding the visitor on a
    // step the new brand may not have.
    navigate('/')
    rememberTenantId(id)
    // Keep the brand in the address so the page can be shared as it looks.
    const url = new URL(window.location.href)
    url.searchParams.set('tenant', id)
    window.history.replaceState(null, '', url)
  }, [navigate])

  return (
    <TenantProvider
      registry={TENANT_REGISTRY}
      tenantId={tenantId}
      overrides={overrides}
      onSwitchTenant={switchTenant}
    >
      <QuoteHost>
        <Shell onOpenStudio={() => setStudioOpen(true)}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/quote/:stepId" element={<FlowPage />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Shell>
        <BrandStudio
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          overrides={overrides}
          onChange={setOverrides}
          scheme={scheme}
          onScheme={setScheme}
        />
      </QuoteHost>
    </TenantProvider>
  )
}

/** Binds the funnel's state machine to the address bar. */
function QuoteHost({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const location = useLocation()

  const start = useMemo(
    () => firstStepId(tenant.flow, tenant.defaults ?? {}, tenant.features),
    [tenant.flow, tenant.defaults, tenant.features],
  )

  const match = /^\/quote\/([^/?]+)/.exec(location.pathname)
  const stepId = match?.[1] ?? start

  const onNavigate = useCallback(
    (target: string) => {
      navigate(target === start ? '/' : `/quote/${target}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate, start],
  )

  return (
    <QuoteProvider
      // Switching brand rebuilds the funnel from that brand's own defaults.
      key={tenant.id}
      tenant={tenant}
      stepId={stepId}
      onNavigate={onNavigate}
    >
      {children}
    </QuoteProvider>
  )
}
