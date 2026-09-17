/** Reference lists shared by every tenant's funnel. */

export const US_STATES: { value: string; label: string }[] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'],
  ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'],
  ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
].map(([value, label]) => ({ value: value as string, label: label as string }))

export const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'domestic', label: 'Domestic partner' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
]

export const VEHICLE_USE = [
  { value: 'commute', label: 'Commuting to work or school', description: 'Regular weekday driving' },
  { value: 'pleasure', label: 'Pleasure only', description: 'Errands and weekends' },
  { value: 'business', label: 'Business use', description: 'Client visits, deliveries, site work' },
  { value: 'rideshare', label: 'Rideshare or delivery app', description: 'Uber, Lyft, DoorDash and similar' },
]

export const OWNERSHIP = [
  { value: 'owned', label: 'Owned outright' },
  { value: 'financed', label: 'Financed' },
  { value: 'leased', label: 'Leased' },
]

export const RESIDENCE = [
  { value: 'own-home', label: 'Own a house' },
  { value: 'own-condo', label: 'Own a condo' },
  { value: 'rent', label: 'Rent' },
  { value: 'family', label: 'Live with family' },
]

export const YEARS_INSURED = [
  { value: 'none', label: 'Not insured right now' },
  { value: 'under1', label: 'Less than 1 year' },
  { value: '1to3', label: '1 to 3 years' },
  { value: '3to5', label: '3 to 5 years' },
  { value: '5plus', label: '5 years or more' },
]

export const ANNUAL_MILEAGE = [
  { value: 'under5k', label: 'Under 5,000' },
  { value: '5kto10k', label: '5,000 to 10,000' },
  { value: '10kto15k', label: '10,000 to 15,000' },
  { value: 'over15k', label: 'Over 15,000' },
]

export const DEDUCTIBLES = [
  { value: '250', label: '$250' },
  { value: '500', label: '$500' },
  { value: '1000', label: '$1,000' },
  { value: '2000', label: '$2,000' },
]

export const LIABILITY_LIMITS = [
  { value: '25/50/25', label: '$25k / $50k / $25k', description: 'State minimum in many states' },
  { value: '50/100/50', label: '$50k / $100k / $50k', description: 'Common starting point' },
  { value: '100/300/100', label: '$100k / $300k / $100k', description: 'Recommended for most households' },
  { value: '250/500/250', label: '$250k / $500k / $250k', description: 'Higher asset protection' },
]
