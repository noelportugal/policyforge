import type { TenantConfigInput } from '@/framework/types'
import {
  contactStep,
  coverageStep,
  driversStep,
  householdStep,
  quoteStep,
  reviewStep,
  startStep,
  vehiclesStep,
} from './steps'

/**
 * The house default.
 *
 * Nothing renders this tenant directly. Every brand inherits it, so a question,
 * a discount or a piece of legal copy added here reaches all of them, and a
 * brand only writes down what makes it different.
 */
export const baseTenant: TenantConfigInput = {
  id: '_base',
  locale: { locale: 'en-US', currency: 'USD' },

  brand: {
    name: 'PolicyForge',
    legalName: 'PolicyForge Reference Insurance Services',
    tagline: 'Insurance, configured',
    logoMark: 'shield',
    favicon: '🛡️',
    supportPhone: '1-800-555-0142',
    supportHours: 'Mon to Sat, 7am to 7pm',
    trustBadges: ['Licensed in 50 states', 'Quotes in under 3 minutes', 'No sales calls unless you ask'],
  },

  theme: {
    tokens: {
      brand: '#1f3d64',
      'brand-strong': '#16304f',
      'brand-soft': '#eaf1f8',
      'on-brand': '#ffffff',
      accent: '#f2b705',
      'accent-strong': '#d89f02',
      'on-accent': '#1a1a1a',
      ink: '#15212e',
      'ink-soft': '#4a5b6c',
      'ink-faint': '#7d8a98',
      surface: '#f5f7fa',
      'surface-raised': '#ffffff',
      'surface-sunken': '#eef2f6',
      border: '#d9e0e8',
      'border-strong': '#b6c2cf',
      success: '#1f7a4d',
      danger: '#b3261e',
      'danger-soft': '#fdeceb',
      focus: '#1f6feb',
      'radius-sm': '6px',
      radius: '10px',
      'radius-lg': '16px',
      'radius-pill': '999px',
      'font-body': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      'font-heading': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      'heading-weight': '700',
      'heading-spacing': '-0.01em',
      'shadow-sm': '0 1px 2px rgba(15, 33, 51, 0.08)',
      'shadow-md': '0 6px 20px rgba(15, 33, 51, 0.10)',
      'shadow-lg': '0 18px 48px rgba(15, 33, 51, 0.16)',
      container: '1120px',
      'hero-art': 'linear-gradient(140deg, var(--pf-brand) 0%, var(--pf-brand-strong) 100%)',
    },
    dark: {
      'brand-soft': '#17263a',
      ink: '#e9eef4',
      'ink-soft': '#a8b6c5',
      'ink-faint': '#7d8a98',
      surface: '#0e1520',
      'surface-raised': '#16202d',
      'surface-sunken': '#111a25',
      border: '#26374a',
      'border-strong': '#3a4d63',
      'danger-soft': '#3a1d1b',
      danger: '#ff6b63',
      success: '#4ec98a',
      focus: '#6ea8ff',
      'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
      'shadow-md': '0 6px 20px rgba(0, 0, 0, 0.45)',
      'shadow-lg': '0 18px 48px rgba(0, 0, 0, 0.55)',
    },
  },

  content: {
    'hero.eyebrow': 'Car insurance',
    'hero.title': 'A price in three minutes, not three phone calls',
    'hero.subtitle':
      'Answer a few questions about your car and your household. {brand} shows you what it costs and exactly what moved the number.',
    'hero.point1': 'No account needed to see a price',
    'hero.point2': 'Change your coverage and watch the price move',
    'hero.point3': 'Your answers stay in this browser',
    'quote.start.title': 'Start your quote',
    'quote.start.subtitle': 'Two answers to begin.',
    'quote.result.title': 'Here is your price',
    'quote.result.subtitle': 'Pick the level of protection that fits. You can change it at any time.',
    'quote.rating': 'Pricing your policy…',
    'quote.reference': 'Quote reference',
    'quote.recommended': 'Most chosen',
    'quote.disclosure':
      'This is an illustrative price produced by a demonstration rating engine. It is not an offer of insurance and no underwriting has taken place.',
    'review.submit': 'See my price',
    'agents.title': 'Agents near {zip}',
    'agents.body':
      'A licensed agent can go through this quote with you before you buy. There is no obligation and no cost.',
    'footer.legal': '© {year} {legal}. All rights reserved.',
    'footer.disclaimer':
      'Coverage is subject to policy terms, conditions and availability. Prices shown are illustrative only.',
  },

  defaults: {
    product: 'auto',
    vehicles: [{}],
    drivers: [{}],
    coverage: { liability: '100/300/100', deductible: '500' },
    extras: [],
  },

  features: {
    multiVehicle: true,
    reviewStep: true,
    agentNetwork: false,
    bundling: true,
    telematics: false,
  },

  flow: {
    id: 'auto-v1',
    steps: [startStep, vehiclesStep, driversStep, householdStep, coverageStep, contactStep, reviewStep, quoteStep],
  },

  slots: {
    'header.banner': ['trust-strip'],
  },

  rating: {
    engine: 'demo-v1',
    basePremium: 690,
    policyFee: 35,
    termMonths: 6,
    factorLabels: {
      'derived.youngestDriverBand': 'Youngest driver',
      'derived.vehicleAgeBand': 'Vehicle age',
      'derived.vehicleCount': 'Vehicles on the policy',
      'derived.driverCount': 'Drivers on the policy',
      'derived.primaryUse': 'How the car is used',
      'derived.annualMileage': 'Miles a year',
      'coverage.liability': 'Liability limits',
      'coverage.deductible': 'Deductible',
      yearsInsured: 'Years continuously insured',
      residence: 'Where you live',
    },
    factors: {
      'derived.youngestDriverBand': {
        under21: 1.95,
        '21to24': 1.48,
        '25to34': 1.12,
        '35to49': 1.0,
        '50to64': 0.94,
        '65plus': 1.06,
        unknown: 1.05,
      },
      'derived.vehicleAgeBand': { new: 1.14, recent: 1.05, older: 0.96, vintage: 0.89, unknown: 1 },
      'derived.vehicleCount': { '1': 1, '2': 1.74, '3': 2.42, '4': 3.05, default: 3.4 },
      'derived.driverCount': { '1': 1, '2': 1.22, '3': 1.4, default: 1.55 },
      'derived.primaryUse': { commute: 1, pleasure: 0.9, business: 1.2, rideshare: 1.38, unknown: 1 },
      'derived.annualMileage': { under5k: 0.88, '5kto10k': 0.96, '10kto15k': 1, over15k: 1.14, unknown: 1 },
      'coverage.liability': { '25/50/25': 0.86, '50/100/50': 0.94, '100/300/100': 1, '250/500/250': 1.16 },
      'coverage.deductible': { '250': 1.12, '500': 1, '1000': 0.92, '2000': 0.85 },
      yearsInsured: { none: 1.22, under1: 1.12, '1to3': 1.04, '3to5': 0.97, '5plus': 0.92, unknown: 1.05 },
      residence: { 'own-home': 0.95, 'own-condo': 0.97, rent: 1.03, family: 1.05, unknown: 1 },
    },
    discounts: [
      { id: 'multi-car', label: 'Multi-car', amount: 0.1, when: { op: 'truthy', field: 'derived.multiCar' } },
      { id: 'bundle', label: 'Home and auto bundle', amount: 0.12, when: { op: 'truthy', field: 'bundle' } },
      { id: 'telematics', label: 'Drive-tracked savings', amount: 0.08, when: { op: 'truthy', field: 'telematics' } },
      { id: 'paperless', label: 'Paperless documents', amount: 0.03, when: { op: 'contains', field: 'extras', value: 'paperless' } },
      { id: 'autopay', label: 'Automatic payments', amount: 0.04, when: { op: 'contains', field: 'extras', value: 'autopay' } },
      { id: 'good-student', label: 'Good student', amount: 0.06, when: { op: 'contains', field: 'extras', value: 'goodStudent' } },
      { id: 'defensive', label: 'Defensive driving course', amount: 0.03, when: { op: 'contains', field: 'extras', value: 'defensive' } },
      { id: 'anti-theft', label: 'Anti-theft device', amount: 0.02, when: { op: 'contains', field: 'extras', value: 'antiTheft' } },
      {
        id: 'prior-cover',
        label: 'Continuous prior cover',
        amount: 0.07,
        when: { op: 'in', field: 'yearsInsured', value: ['3to5', '5plus'] },
      },
    ],
    tiers: [
      {
        id: 'basic',
        label: 'Essential',
        description: 'Meets state requirements and keeps the price down.',
        multiplier: 0.82,
        highlights: ['Liability as chosen', 'Uninsured motorist', 'No roadside assistance'],
      },
      {
        id: 'standard',
        label: 'Balanced',
        description: 'What most households choose.',
        multiplier: 1,
        recommended: true,
        highlights: ['Everything in Essential', 'Comprehensive and collision', 'Roadside assistance', 'Rental car for 15 days'],
      },
      {
        id: 'premium',
        label: 'Complete',
        description: 'Lowest out-of-pocket cost when something goes wrong.',
        multiplier: 1.27,
        highlights: [
          'Everything in Balanced',
          'New car replacement',
          'Deductible falls $100 each claim-free year',
          'Accident forgiveness',
        ],
      },
    ],
  },
}
