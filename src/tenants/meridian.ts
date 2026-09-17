import type { TenantConfigInput } from '@/framework/types'

/**
 * Meridian Mutual — a long-established regional carrier that sells both direct
 * and through agents. The longest funnel of the three brands: it asks for the
 * garaging address and reads every answer back before pricing.
 */
export const meridianTenant: TenantConfigInput = {
  id: 'meridian',
  extends: '_base',
  hostnames: ['meridian.example', 'quote.meridian.example'],

  brand: {
    name: 'Meridian Mutual',
    legalName: 'Meridian Mutual Insurance Services, LLC',
    tagline: 'Covering California families since 1968',
    logoMark: 'shield',
    favicon: '🛡️',
    supportPhone: '1-800-555-0168',
    supportHours: 'Mon to Sat, 6am to 8pm PT',
    trustBadges: ['A.M. Best rated A (demo)', '4.6★ from 12,400 reviews', 'Local agents in 48 counties'],
  },

  theme: {
    webFonts: ['Source Sans 3:wght@400;600;700'],
    tokens: {
      brand: '#006699',
      'brand-strong': '#005570',
      'brand-soft': '#ddeeff',
      'on-brand': '#ffffff',
      accent: '#ffc000',
      'accent-strong': '#e8b107',
      'on-accent': '#242424',
      ink: '#242424',
      'ink-soft': '#51606b',
      'ink-faint': '#7a8791',
      surface: '#f1f3f6',
      'surface-raised': '#ffffff',
      'surface-sunken': '#e3e5e8',
      border: '#d3d6d9',
      'border-strong': '#b7bcc2',
      success: '#4cb944',
      danger: '#c70808',
      'danger-soft': '#fdeaea',
      focus: '#006699',
      radius: '6px',
      'radius-lg': '10px',
      'font-body': "'Source Sans 3', system-ui, sans-serif",
      'font-heading': "'Source Sans 3', system-ui, sans-serif",
      'heading-weight': '700',
      'hero-art': 'linear-gradient(135deg, #00334c 0%, #006699 62%, #17374b 100%)',
    },
    dark: {
      brand: '#3ba3d0',
      'brand-strong': '#2b86ae',
      'on-brand': '#05202c',
      focus: '#7cc7e8',
      danger: '#ff6b63',
      'danger-soft': '#3a1614',
      'brand-soft': '#12293a',
      surface: '#0c1720',
      'surface-raised': '#14222d',
      'surface-sunken': '#101b24',
      border: '#263a49',
      'border-strong': '#3a5265',
      ink: '#e8eef2',
      'ink-soft': '#a6b6c2',
    },
  },

  content: {
    'hero.eyebrow': 'Auto insurance',
    'hero.title': 'The price you see is the price we mean',
    'hero.subtitle':
      'Meridian has insured California drivers for over fifty years. Answer a few questions and see a real six month price, with every factor spelled out.',
    'hero.point1': 'Every discount applied automatically',
    'hero.point2': 'Talk to a local agent whenever you want',
    'hero.point3': 'Bundle your home and save a further 12%',
  },

  features: { agentNetwork: true, bundling: true, reviewStep: true, telematics: false },

  slots: {
    'header.banner': ['trust-strip'],
    'step.bottom:coverage': ['bundle-nudge'],
    'quote.aside': ['agent-locator'],
  },

  rating: { basePremium: 712, policyFee: 38 },
}
