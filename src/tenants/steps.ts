import type { StepDef } from '@/framework/types'

/**
 * The house funnel, written as reusable pieces.
 *
 * A tenant's `flow.steps` is plain data, but hand-writing eight steps per brand
 * would guarantee drift. Brands compose these instead and patch what differs,
 * so a question added here reaches every brand that uses the piece.
 */

export const startStep: StepDef = {
  id: 'start',
  label: 'Start',
  title: 'quote.start.title',
  subtitle: 'quote.start.subtitle',
  nextLabel: 'Get my price',
  sections: [
    {
      id: 'start',
      layout: 'stack',
      fields: [
        {
          id: 'product',
          type: 'radio-cards',
          label: 'What do you want to cover?',
          required: true,
          options: [
            { value: 'auto', label: 'Car insurance', description: 'One or more vehicles', icon: '🚗' },
            { value: 'auto-home', label: 'Car and home', description: 'Bundle and save more', icon: '🏡' },
            { value: 'renters', label: 'Renters insurance', description: 'Cover your belongings', icon: '🔑' },
          ],
        },
        {
          id: 'zip',
          type: 'text',
          label: 'ZIP code',
          placeholder: '90015',
          required: true,
          width: 'half',
          validate: [{ rule: 'zip' }],
          props: { inputMode: 'numeric', maxLength: 10, autoComplete: 'postal-code' },
        },
      ],
    },
  ],
}

export const vehiclesStep: StepDef = {
  id: 'vehicles',
  label: 'Vehicles',
  title: 'Which vehicles are we covering?',
  subtitle: 'Add every car kept at your address. Most households save by listing them together.',
  when: { op: 'in', field: 'product', value: ['auto', 'auto-home'] },
  sections: [
    {
      id: 'vehicles',
      layout: 'grid-2',
      repeat: {
        over: 'vehicles',
        min: 1,
        max: 4,
        addLabel: 'Add another vehicle',
        removeLabel: 'Remove',
        itemLabel: 'Vehicle',
      },
      fields: [
        {
          id: 'year',
          type: 'select',
          label: 'Year',
          required: true,
          width: 'third',
          options: { source: 'vehicle.years' },
        },
        {
          id: 'make',
          type: 'select',
          label: 'Make',
          required: true,
          width: 'third',
          options: { source: 'vehicle.makes' },
        },
        {
          id: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          width: 'third',
          placeholder: 'Choose a make first',
          options: { source: 'vehicle.models', dependsOn: ['make'] },
          when: { op: 'filled', field: 'make' },
        },
        {
          id: 'ownership',
          type: 'segmented',
          label: 'Do you own it?',
          required: true,
          options: { source: 'vehicle.ownership' },
        },
        {
          id: 'use',
          type: 'radio-cards',
          label: 'How is it mainly used?',
          required: true,
          options: { source: 'vehicle.use' },
        },
        {
          id: 'mileage',
          type: 'segmented',
          label: 'Miles driven a year',
          required: true,
          options: { source: 'vehicle.mileage' },
        },
      ],
    },
  ],
}

export const driversStep: StepDef = {
  id: 'drivers',
  label: 'Drivers',
  title: 'Who drives these vehicles?',
  subtitle: 'List everyone with a licence in your household, even if they rarely drive.',
  sections: [
    {
      id: 'drivers',
      layout: 'grid-2',
      repeat: {
        over: 'drivers',
        min: 1,
        max: 5,
        addLabel: 'Add another driver',
        removeLabel: 'Remove',
        itemLabel: 'Driver',
      },
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First name',
          required: true,
          width: 'half',
          props: { autoComplete: 'given-name' },
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last name',
          required: true,
          width: 'half',
          props: { autoComplete: 'family-name' },
        },
        {
          id: 'dateOfBirth',
          type: 'text',
          label: 'Date of birth',
          required: true,
          width: 'half',
          help: 'Age is the single largest factor in a car insurance price.',
          validate: [{ rule: 'ageBetween', value: [16, 100] }],
          props: { inputType: 'date', autoComplete: 'bday' },
        },
        {
          id: 'maritalStatus',
          type: 'select',
          label: 'Marital status',
          required: true,
          width: 'half',
          options: { source: 'driver.maritalStatus' },
        },
        {
          id: 'licenceState',
          type: 'select',
          label: 'Licence state',
          required: true,
          width: 'half',
          options: { source: 'us.states' },
        },
        {
          id: 'licenceAge',
          type: 'text',
          label: 'Age first licensed',
          width: 'half',
          validate: [{ rule: 'min', value: 14 }, { rule: 'max', value: 90 }],
          props: { inputMode: 'numeric', maxLength: 2 },
        },
        {
          id: 'incidents',
          type: 'checkbox',
          label: 'Accidents, claims or violations in the last 3 years',
          props: { text: 'Yes, there have been one or more' },
        },
      ],
    },
  ],
}

export const householdStep: StepDef = {
  id: 'household',
  label: 'Household',
  title: 'Where do you keep the vehicles?',
  subtitle: 'Garaging address decides the territory your price is based on.',
  sections: [
    {
      id: 'address',
      title: 'Garaging address',
      layout: 'grid-2',
      fields: [
        {
          id: 'address.line1',
          type: 'text',
          label: 'Street address',
          required: true,
          width: 'full',
          props: { autoComplete: 'address-line1' },
        },
        { id: 'address.city', type: 'text', label: 'City', required: true, width: 'half', props: { autoComplete: 'address-level2' } },
        { id: 'address.state', type: 'select', label: 'State', required: true, width: 'half', options: { source: 'us.states' } },
      ],
    },
    {
      id: 'history',
      title: 'Your insurance history',
      layout: 'grid-2',
      fields: [
        {
          id: 'residence',
          type: 'select',
          label: 'Where do you live?',
          required: true,
          width: 'half',
          options: { source: 'driver.residence' },
        },
        {
          id: 'yearsInsured',
          type: 'select',
          label: 'How long have you held car insurance?',
          required: true,
          width: 'half',
          help: 'Continuous cover usually lowers the price.',
          options: { source: 'driver.yearsInsured' },
        },
      ],
    },
  ],
}

export const coverageStep: StepDef = {
  id: 'coverage',
  label: 'Coverage',
  title: 'Choose your protection',
  subtitle: 'You can change any of this later without losing your quote.',
  sections: [
    {
      id: 'limits',
      layout: 'stack',
      fields: [
        {
          id: 'coverage.liability',
          type: 'radio-cards',
          label: 'Liability limits',
          required: true,
          help: 'What we pay other people if an accident is your fault.',
          options: { source: 'coverage.liability' },
        },
        {
          id: 'coverage.deductible',
          type: 'segmented',
          label: 'Deductible',
          required: true,
          help: 'What you pay towards a claim on your own vehicle. A higher deductible lowers the premium.',
          options: { source: 'coverage.deductibles' },
        },
        {
          id: 'extras',
          type: 'chips',
          label: 'Add the ones that apply to you',
          options: [
            { value: 'paperless', label: 'Paperless documents' },
            { value: 'autopay', label: 'Automatic payments' },
            { value: 'goodStudent', label: 'Good student in the household' },
            { value: 'defensive', label: 'Defensive driving course' },
            { value: 'antiTheft', label: 'Anti-theft device fitted' },
          ],
        },
      ],
    },
  ],
}

export const contactStep: StepDef = {
  id: 'contact',
  label: 'Contact',
  title: 'Where should we send the quote?',
  subtitle: 'We hold your quote for 30 days so you can come back to it.',
  disclosure:
    'By continuing you agree that {brand} may contact you about this quote by email, phone or text, including automated calls. Consent is not a condition of purchase.',
  sections: [
    {
      id: 'contact',
      layout: 'grid-2',
      fields: [
        {
          id: 'contact.email',
          type: 'text',
          label: 'Email address',
          required: true,
          width: 'half',
          validate: [{ rule: 'email' }],
          props: { inputType: 'email', autoComplete: 'email' },
        },
        {
          id: 'contact.phone',
          type: 'text',
          label: 'Mobile number',
          required: true,
          width: 'half',
          validate: [{ rule: 'phone' }],
          props: { inputType: 'tel', autoComplete: 'tel' },
        },
      ],
    },
  ],
}

export const reviewStep: StepDef = {
  id: 'review',
  label: 'Review',
  title: 'Check your answers',
  subtitle: 'A wrong answer here is the most common reason a price changes later.',
  component: 'review',
}

export const quoteStep: StepDef = {
  id: 'quote',
  label: 'Your quote',
  title: 'quote.result.title',
  subtitle: 'quote.result.subtitle',
  component: 'quote-results',
}
