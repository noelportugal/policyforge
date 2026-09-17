import type { StepDef, TenantConfigInput } from '@/framework/types'
import { contactStep, coverageStep, driversStep, quoteStep, startStep, vehiclesStep } from './steps'

/**
 * Cobalt Direct — an app-first carrier that competes on how little it asks.
 *
 * It uses the same components as every other brand and differs only in data:
 * two steps fewer, one merged address question, a telematics offer, and its own
 * coverage tiers. This is the case the framework exists for.
 */
const quickAddressStep: StepDef = {
  id: 'household',
  label: 'Address',
  title: 'Where do you park at night?',
  subtitle: 'One line. We work out the rest.',
  sections: [
    {
      id: 'address',
      layout: 'grid-2',
      fields: [
        { id: 'address.line1', type: 'text', label: 'Street address', required: true, width: 'full', props: { autoComplete: 'address-line1' } },
        { id: 'address.city', type: 'text', label: 'City', required: true, width: 'half', props: { autoComplete: 'address-level2' } },
        { id: 'address.state', type: 'select', label: 'State', required: true, width: 'half', options: { source: 'us.states' } },
        {
          id: 'yearsInsured',
          type: 'segmented',
          label: 'Insured today?',
          required: true,
          width: 'full',
          options: [
            { value: 'none', label: 'Not right now' },
            { value: '1to3', label: 'Under 3 years' },
            { value: '5plus', label: '3 years or more' },
          ],
        },
      ],
    },
  ],
}

export const cobaltTenant: TenantConfigInput = {
  id: 'cobalt',
  extends: '_base',
  hostnames: ['cobalt.example'],

  brand: {
    name: 'Cobalt Direct',
    legalName: 'Cobalt Direct Insurance Company',
    tagline: 'Car insurance without the paperwork',
    logoMark: 'chevron',
    favicon: '⚡',
    supportPhone: '1-888-555-0110',
    supportHours: 'Chat 24/7, phone 8am to 10pm',
    trustBadges: ['Quote in 90 seconds', 'Claims filed in the app', 'Cancel any time, no fee'],
  },

  theme: {
    webFonts: ['Inter:wght@400;500;700'],
    tokens: {
      brand: '#3730a3',
      'brand-strong': '#272178',
      'brand-soft': '#eceafd',
      'on-brand': '#ffffff',
      accent: '#22d3ee',
      'accent-strong': '#0fb6d1',
      'on-accent': '#04212a',
      ink: '#14142b',
      'ink-soft': '#545475',
      'ink-faint': '#8a8aa3',
      surface: '#f7f7fd',
      'surface-raised': '#ffffff',
      'surface-sunken': '#efeffa',
      border: '#e0e0ef',
      'border-strong': '#c3c3dd',
      focus: '#3730a3',
      'radius-sm': '10px',
      radius: '14px',
      'radius-lg': '22px',
      'font-body': "'Inter', system-ui, sans-serif",
      'font-heading': "'Inter', system-ui, sans-serif",
      'heading-weight': '700',
      'heading-spacing': '-0.03em',
      'shadow-md': '0 10px 30px rgba(55, 48, 163, 0.14)',
      'shadow-lg': '0 24px 60px rgba(55, 48, 163, 0.22)',
      container: '1040px',
      'hero-art': 'linear-gradient(150deg, #3730a3 0%, #5b21b6 55%, #0f766e 100%)',
    },
    dark: {
      brand: '#8b85f0',
      'brand-strong': '#6f68e0',
      'on-brand': '#11102b',
      focus: '#a9a4ff',
      danger: '#ff7a72',
      'brand-soft': '#1d1b3a',
      surface: '#0c0c1a',
      'surface-raised': '#15152a',
      'surface-sunken': '#101024',
      border: '#2a2a4a',
      'border-strong': '#3d3d63',
      ink: '#eceafd',
      'ink-soft': '#a7a7c7',
    },
  },

  content: {
    'hero.eyebrow': 'Direct car insurance',
    'hero.title': 'Six questions. One price. No phone call.',
    'hero.subtitle':
      'Cobalt is built for people who would rather not talk to anyone. Answer what we actually need and buy in the app.',
    'hero.point1': 'No agent, no commission built into your price',
    'hero.point2': 'Earn up to 8% back for careful driving',
    'hero.point3': 'Switch in minutes, we cancel the old policy for you',
    'quote.start.title': 'Two taps to start',
    'quote.start.subtitle': 'Then six questions, we promise.',
    'quote.result.title': 'That is your price',
    'quote.result.subtitle': 'Everything is monthly and everything is cancellable.',
    'quote.recommended': 'Most popular',
  },

  features: { agentNetwork: false, bundling: false, reviewStep: false, telematics: true },

  flow: {
    id: 'auto-short-v1',
    steps: [startStep, vehiclesStep, driversStep, quickAddressStep, coverageStep, contactStep, quoteStep],
  },

  slots: {
    'header.banner': ['trust-strip'],
    'step.bottom:coverage': ['telematics-offer'],
  },

  rating: {
    basePremium: 648,
    policyFee: 0,
    termMonths: 6,
    tiers: [
      {
        id: 'basic',
        label: 'Lean',
        description: 'The legal minimum, priced accordingly.',
        multiplier: 0.79,
        highlights: ['Liability as chosen', 'Uninsured motorist', 'App-only support'],
      },
      {
        id: 'standard',
        label: 'Everyday',
        description: 'Covers your own car too.',
        multiplier: 1,
        recommended: true,
        highlights: ['Comprehensive and collision', 'Roadside assistance', 'Rental car for 20 days', 'Phone support'],
      },
      {
        id: 'premium',
        label: 'Worry-free',
        description: 'Nothing to think about after a claim.',
        multiplier: 1.24,
        highlights: ['New car replacement', 'Zero deductible on glass', 'Accident forgiveness from day one', 'Priority claims'],
      },
    ],
  },
}
