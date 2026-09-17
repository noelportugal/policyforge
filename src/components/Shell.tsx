import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/framework/TenantProvider'
import { LogoMark } from './Logos'
import { Slot } from './Slot'

/** Brand chrome. Everything visible here comes from tenant configuration. */
export function Shell({ children, onOpenStudio }: { children: ReactNode; onOpenStudio: () => void }) {
  const { tenant, t } = useTenant()
  const { brand } = tenant

  return (
    <div className="pf-shell">
      <a className="pf-skip" href="#main">
        Skip to content
      </a>

      <header className="pf-header">
        <div className="pf-container pf-header-inner">
          <Link className="pf-brand" to="/">
            <LogoMark id={brand.logoMark} className="pf-brand-mark" />
            <span className="pf-brand-text">
              <span className="pf-brand-name">{brand.name}</span>
              <span className="pf-brand-tagline">{brand.tagline}</span>
            </span>
          </Link>

          <div className="pf-header-actions">
            <a className="pf-phone" href={`tel:${brand.supportPhone.replace(/[^\d+]/g, '')}`}>
              <span className="pf-phone-number">{brand.supportPhone}</span>
              <span className="pf-phone-hours">{brand.supportHours}</span>
            </a>
            <button type="button" className="pf-button pf-button-ghost pf-studio-open" onClick={onOpenStudio}>
              Customise
            </button>
          </div>
        </div>
        <Slot name="header.banner" />
      </header>

      <main className="pf-main" id="main">
        {children}
      </main>

      <footer className="pf-footer">
        <div className="pf-container">
          <div className="pf-footer-grid">
            <div>
              <LogoMark id={brand.logoMark} className="pf-footer-mark" />
              <p className="pf-footer-legal">{t('footer.legal')}</p>
            </div>
            <div className="pf-footer-note">
              <p>{t('footer.disclaimer')}</p>
              <p className="pf-footer-demo">
                This is a portfolio demonstration. It is not a real insurer, it sells nothing, and no answer
                you type leaves your browser.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
