import type { StepDef, TenantConfigInput } from '@/framework/types'
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
 * Sundial Assurance Group — an independent agency rather than a carrier.
 *
 * It shops the same answers across a panel of carriers, so it adds a step the
 * other brands do not have and shows a comparison beside the price.
 */
const agentPreferenceStep: StepDef = {
  id: 'agent',
  label: 'Your agent',
  title: 'How would you like to work with us?',
  subtitle: 'Sundial is an independent agency. An adviser checks your quote against every carrier we represent.',
  when: { op: 'feature', flag: 'agentNetwork' },
  sections: [
    {
      id: 'agent',
      layout: 'stack',
      fields: [
        {
          id: 'agentPreference',
          type: 'radio-cards',
          label: 'Pick what suits you',
          required: true,
          options: [
            { value: 'self', label: 'Let me do it myself', description: 'See prices online, no contact', icon: '💻' },
            { value: 'review', label: 'Have an adviser check it', description: 'One call before you buy', icon: '📞' },
            { value: 'full', label: 'Do it all for me', description: 'An adviser shops the whole panel', icon: '🤝' },
          ],
        },
        {
          id: 'agentWindow',
          type: 'segmented',
          label: 'Best time to reach you',
          required: true,
          when: { op: 'ne', field: 'agentPreference', value: 'self' },
          options: [
            { value: 'morning', label: 'Morning' },
            { value: 'afternoon', label: 'Afternoon' },
            { value: 'evening', label: 'Evening' },
          ],
        },
      ],
    },
  ],
}

export const sundialTenant: TenantConfigInput = {
  id: 'sundial',
  extends: '_base',
  hostnames: ['sundial.example'],

  brand: {
    name: 'Sundial Assurance',
    legalName: 'Sundial Assurance Group, an independent insurance agency',
    tagline: 'One form. Every carrier we represent.',
    logoMark: 'orbit',
    favicon: '🌅',
    supportPhone: '1-877-555-0193',
    supportHours: 'Mon to Fri, 7am to 6pm',
    trustBadges: ['32 carriers on our panel', 'Independent since 1994', 'Licensed advisers, not a call centre'],
  },

  theme: {
    webFonts: ['Fraunces:opsz,wght@9..144,600', 'Public Sans:wght@400;600'],
    tokens: {
      brand: '#9a3412',
      'brand-strong': '#7c2d12',
      'brand-soft': '#fdf1e7',
      'on-brand': '#ffffff',
      accent: '#f59e0b',
      'accent-strong': '#d97706',
      'on-accent': '#2a1707',
      ink: '#2b1f16',
      'ink-soft': '#63544a',
      'ink-faint': '#94857a',
      surface: '#fbf7f2',
      'surface-raised': '#ffffff',
      'surface-sunken': '#f3ebe2',
      border: '#e6dad0',
      'border-strong': '#cdbaab',
      focus: '#9a3412',
      radius: '4px',
      'radius-lg': '8px',
      'font-body': "'Public Sans', system-ui, sans-serif",
      'font-heading': "'Fraunces', Georgia, serif",
      'heading-weight': '600',
      'heading-spacing': '0',
      'hero-art': 'linear-gradient(160deg, #7c2d12 0%, #9a3412 45%, #f59e0b 140%)',
    },
    dark: {
      brand: '#f08a5d',
      'brand-strong': '#d9703f',
      'on-brand': '#2a1103',
      focus: '#f6a780',
      danger: '#ff7a72',
      'brand-soft': '#2c1a11',
      surface: '#16100b',
      'surface-raised': '#1f1710',
      'surface-sunken': '#1a130d',
      border: '#39291d',
      'border-strong': '#54402f',
      ink: '#f4ece4',
      'ink-soft': '#c0ac9c',
    },
  },

  content: {
    'hero.eyebrow': 'Independent agency',
    'hero.title': 'We work for you, not for one carrier',
    'hero.subtitle':
      'Fill this in once and Sundial shops it across every carrier on our panel. You see what each of them charges for the same protection.',
    'hero.point1': 'One form, quotes from 32 carriers',
    'hero.point2': 'A licensed adviser reviews every quote',
    'hero.point3': 'We re-shop your policy at each renewal',
    'quote.result.title': 'What the panel came back with',
    'quote.result.subtitle': 'Prices for the protection level you chose. Your adviser can push these further.',
    'quote.recommended': 'Adviser pick',
    'review.submit': 'Shop my quote',
    'agents.body':
      'Sundial is an independent agency. Your adviser checks this quote against every carrier on our panel before you buy.',
  },

  features: { agentNetwork: true, bundling: true, reviewStep: true, telematics: false },

  flow: {
    id: 'agency-v1',
    steps: [
      startStep,
      vehiclesStep,
      driversStep,
      householdStep,
      coverageStep,
      agentPreferenceStep,
      contactStep,
      reviewStep,
      quoteStep,
    ],
  },

  slots: {
    'header.banner': ['trust-strip'],
    'step.bottom:coverage': ['bundle-nudge'],
    'quote.aside': ['carrier-comparison', 'agent-locator'],
  },

  rating: { basePremium: 668, policyFee: 45 },
}
