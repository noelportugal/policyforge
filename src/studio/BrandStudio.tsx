import { useEffect, useState } from 'react'
import { useTenant, type TenantOverrides } from '@/framework/TenantProvider'

/** The studio edits exactly the shape the framework already accepts. */
export type StudioOverrides = TenantOverrides

const COLOUR_TOKENS: { token: string; label: string }[] = [
  { token: 'brand', label: 'Brand' },
  { token: 'brand-strong', label: 'Brand, pressed' },
  { token: 'accent', label: 'Accent' },
  { token: 'ink', label: 'Text' },
  { token: 'surface', label: 'Page' },
  { token: 'surface-raised', label: 'Cards' },
]

const RADII = [
  { value: '2px', label: 'Square' },
  { value: '6px', label: 'Soft' },
  { value: '14px', label: 'Rounded' },
  { value: '22px', label: 'Pill' },
]

const FONTS = [
  { value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", label: 'System' },
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Source Sans 3', system-ui, sans-serif", label: 'Source Sans' },
  { value: "'Fraunces', Georgia, serif", label: 'Fraunces' },
]

/**
 * The live customisation panel.
 *
 * It writes the same override object the framework already accepts, which is
 * the point: there is no separate "preview mode". What a visitor changes here
 * is exactly what a client would hand over as their configuration file.
 */
export function BrandStudio({
  open,
  onClose,
  overrides,
  onChange,
  scheme,
  onScheme,
}: {
  open: boolean
  onClose: () => void
  overrides: StudioOverrides
  onChange: (next: StudioOverrides) => void
  scheme: 'system' | 'light' | 'dark'
  onScheme: (next: 'system' | 'light' | 'dark') => void
}) {
  const { tenant, available, switchTenant } = useTenant()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const setToken = (token: string, value: string) => {
    onChange({
      ...overrides,
      theme: { tokens: { ...(overrides.theme?.tokens ?? {}), [token]: value } },
    })
  }

  const setFeature = (flag: string, value: boolean) => {
    onChange({ ...overrides, features: { ...(overrides.features ?? {}), [flag]: value } })
  }

  const exported = JSON.stringify(
    {
      id: `${tenant.id}-custom`,
      extends: tenant.id,
      brand: overrides.brand ?? undefined,
      theme: overrides.theme ?? undefined,
      features: overrides.features ?? undefined,
    },
    null,
    2,
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exported)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      {open ? <div className="pf-studio-scrim" onClick={onClose} aria-hidden="true" /> : null}
      <aside className={`pf-studio${open ? ' is-open' : ''}`} aria-label="Customisation studio" inert={!open}>
        <header className="pf-studio-head">
          <div>
            <h2 className="pf-studio-title">Customisation studio</h2>
            <p className="pf-studio-sub">Everything here is configuration, not code.</p>
          </div>
          <button type="button" className="pf-icon-button" onClick={onClose} aria-label="Close the customisation studio">
            ✕
          </button>
        </header>

        <div className="pf-studio-body">
          <section className="pf-studio-section">
            <h3>Brand</h3>
            <div className="pf-studio-tenants">
              {available.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className={`pf-studio-tenant${candidate.id === tenant.id ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange({})
                    switchTenant(candidate.id)
                  }}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
            <label className="pf-studio-field">
              <span>Displayed name</span>
              <input
                className="pf-input"
                value={overrides.brand?.name ?? tenant.brand.name}
                onChange={(event) =>
                  onChange({ ...overrides, brand: { ...(overrides.brand ?? {}), name: event.target.value } })
                }
              />
            </label>
            <label className="pf-studio-field">
              <span>Tagline</span>
              <input
                className="pf-input"
                value={overrides.brand?.tagline ?? tenant.brand.tagline}
                onChange={(event) =>
                  onChange({ ...overrides, brand: { ...(overrides.brand ?? {}), tagline: event.target.value } })
                }
              />
            </label>
            <div className="pf-studio-field">
              <span>Logo mark</span>
              <div className="pf-studio-row">
                {['shield', 'chevron', 'orbit'].map((mark) => (
                  <button
                    key={mark}
                    type="button"
                    className={`pf-studio-pill${(overrides.brand?.logoMark ?? tenant.brand.logoMark) === mark ? ' is-selected' : ''}`}
                    onClick={() => onChange({ ...overrides, brand: { ...(overrides.brand ?? {}), logoMark: mark } })}
                  >
                    {mark}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="pf-studio-section">
            <h3>Colour</h3>
            <div className="pf-studio-colours">
              {COLOUR_TOKENS.map(({ token, label }) => (
                <label className="pf-studio-colour" key={token}>
                  <input
                    type="color"
                    value={normaliseHex(overrides.theme?.tokens?.[token] ?? tenant.theme.tokens[token] ?? '#000000')}
                    onChange={(event) => setToken(token, event.target.value)}
                    aria-label={label}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="pf-studio-field">
              <span>Colour scheme</span>
              <div className="pf-studio-row">
                {(['system', 'light', 'dark'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`pf-studio-pill${scheme === option ? ' is-selected' : ''}`}
                    onClick={() => onScheme(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="pf-studio-section">
            <h3>Shape and type</h3>
            <div className="pf-studio-field">
              <span>Corner radius</span>
              <div className="pf-studio-row">
                {RADII.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`pf-studio-pill${(overrides.theme?.tokens?.radius ?? tenant.theme.tokens.radius) === option.value ? ' is-selected' : ''}`}
                    onClick={() => setToken('radius', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="pf-studio-field">
              <span>Heading typeface</span>
              <select
                className="pf-input pf-select"
                value={overrides.theme?.tokens?.['font-heading'] ?? tenant.theme.tokens['font-heading'] ?? ''}
                onChange={(event) => setToken('font-heading', event.target.value)}
              >
                {FONTS.map((font) => (
                  <option key={font.label} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="pf-studio-section">
            <h3>Capabilities</h3>
            <p className="pf-studio-note">
              These flags change the funnel itself. Turning the agent network off removes a whole step from
              Sundial's flow.
            </p>
            {Object.entries(tenant.features).map(([flag, enabled]) => (
              <label className="pf-studio-toggle" key={flag}>
                <input
                  type="checkbox"
                  checked={overrides.features?.[flag] ?? enabled}
                  onChange={(event) => setFeature(flag, event.target.checked)}
                />
                <span>{flag}</span>
              </label>
            ))}
          </section>

          <section className="pf-studio-section">
            <h3>Export</h3>
            <p className="pf-studio-note">
              This is a complete tenant file. Drop it into <code>src/tenants</code>, or serve it from a
              configuration service, and the brand exists.
            </p>
            <pre className="pf-studio-code">{exported}</pre>
            <div className="pf-studio-row">
              <button type="button" className="pf-button pf-button-primary pf-button-small" onClick={copy}>
                {copied ? 'Copied ✓' : 'Copy configuration'}
              </button>
              <button type="button" className="pf-button pf-button-quiet pf-button-small" onClick={() => onChange({})}>
                Reset changes
              </button>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}

/** `<input type="color">` only accepts six digit hex, so anything else is dropped. */
function normaliseHex(value: string): string {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (!match) return '#888888'
  const digits = match[1]!
  return digits.length === 3
    ? `#${digits
        .split('')
        .map((character) => character + character)
        .join('')}`
    : `#${digits}`
}
