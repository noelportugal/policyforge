/**
 * A trimmed vehicle catalogue.
 *
 * A production deployment replaces this with a VIN or year/make/model service
 * behind the same option provider, which is why the funnel only ever asks the
 * registry for options rather than importing this file.
 */
export interface MakeEntry {
  make: string
  models: string[]
}

export const VEHICLE_CATALOGUE: MakeEntry[] = [
  { make: 'Acura', models: ['ILX', 'Integra', 'MDX', 'RDX', 'TLX'] },
  { make: 'BMW', models: ['3 Series', '5 Series', 'X1', 'X3', 'X5', 'i4'] },
  { make: 'Chevrolet', models: ['Blazer', 'Bolt EV', 'Colorado', 'Equinox', 'Malibu', 'Silverado 1500', 'Tahoe', 'Traverse'] },
  { make: 'Dodge', models: ['Challenger', 'Charger', 'Durango', 'Hornet'] },
  { make: 'Ford', models: ['Bronco', 'Edge', 'Escape', 'Explorer', 'F-150', 'Maverick', 'Mustang', 'Mustang Mach-E'] },
  { make: 'Honda', models: ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'] },
  { make: 'Hyundai', models: ['Elantra', 'Ioniq 5', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson'] },
  { make: 'Jeep', models: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Wrangler'] },
  { make: 'Kia', models: ['Carnival', 'EV6', 'Forte', 'K5', 'Seltos', 'Sorento', 'Sportage', 'Telluride'] },
  { make: 'Lexus', models: ['ES', 'GX', 'NX', 'RX', 'UX'] },
  { make: 'Mazda', models: ['CX-30', 'CX-5', 'CX-50', 'CX-90', 'Mazda3'] },
  { make: 'Nissan', models: ['Altima', 'Ariya', 'Frontier', 'Kicks', 'Leaf', 'Pathfinder', 'Rogue', 'Sentra'] },
  { make: 'Ram', models: ['1500', '2500', 'ProMaster'] },
  { make: 'Subaru', models: ['Ascent', 'Crosstrek', 'Forester', 'Impreza', 'Outback', 'WRX'] },
  { make: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'] },
  { make: 'Toyota', models: ['4Runner', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sienna', 'Tacoma', 'Tundra'] },
  { make: 'Volkswagen', models: ['Atlas', 'Golf GTI', 'ID.4', 'Jetta', 'Taos', 'Tiguan'] },
  { make: 'Volvo', models: ['S60', 'XC40', 'XC60', 'XC90'] },
]

export function makesList(): string[] {
  return VEHICLE_CATALOGUE.map((entry) => entry.make)
}

export function modelsFor(make: string): string[] {
  return VEHICLE_CATALOGUE.find((entry) => entry.make === make)?.models ?? []
}

export function modelYears(span = 26, now = new Date()): string[] {
  const latest = now.getFullYear() + 1
  return Array.from({ length: span }, (_, offset) => String(latest - offset))
}
