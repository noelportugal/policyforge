import { logoRegistry } from '@/framework/registry'

/**
 * Logo marks are drawn from theme tokens rather than shipped as image files, so
 * a new brand needs no binary assets and every mark stays sharp in both colour
 * schemes.
 */

function ShieldMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" role="img" aria-hidden="true" focusable="false">
      <path d="M20 3 6 8v13c0 8 6 14.5 14 16 8-1.5 14-8 14-16V8Z" fill="var(--pf-brand)" />
      <path d="M20 9 12 12v8.5c0 4.8 3.4 8.8 8 10 4.6-1.2 8-5.2 8-10V12Z" fill="var(--pf-accent)" />
      <path d="m15.5 20.5 3.3 3.4 6-6.6" fill="none" stroke="var(--pf-brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" role="img" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="36" height="36" rx="11" fill="var(--pf-brand)" />
      <path d="M11 24.5 20 12l9 12.5" fill="none" stroke="var(--pf-accent)" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 29.5 20 21l6 8.5" fill="none" stroke="var(--pf-on-brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </svg>
  )
}

function OrbitMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" role="img" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="17" fill="var(--pf-brand)" />
      <ellipse cx="20" cy="20" rx="16" ry="7" fill="none" stroke="var(--pf-accent)" strokeWidth="2.6" transform="rotate(-28 20 20)" />
      <circle cx="20" cy="20" r="5.5" fill="var(--pf-accent)" />
    </svg>
  )
}

export function registerBuiltInLogos(): void {
  logoRegistry.registerAll({ shield: ShieldMark, chevron: ChevronMark, orbit: OrbitMark })
}

export function LogoMark({ id, className }: { id: string; className?: string }) {
  const Mark = logoRegistry.get(id) ?? logoRegistry.get('shield')
  return Mark ? <Mark className={className} /> : null
}
