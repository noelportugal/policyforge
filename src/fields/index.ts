import { fieldRegistry, optionRegistry } from '@/framework/registry'
import { ChipsControl, CheckboxControl, RadioCards, SegmentedControl, SelectControl, TextControl } from './controls'
import { makesList, modelsFor, modelYears } from '@/data/vehicles'
import {
  ANNUAL_MILEAGE,
  DEDUCTIBLES,
  LIABILITY_LIMITS,
  MARITAL_STATUS,
  OWNERSHIP,
  RESIDENCE,
  US_STATES,
  VEHICLE_USE,
  YEARS_INSURED,
} from '@/data/reference'

/** Registers everything the shipped tenants can name in their configuration. */
export function registerBuiltInFields(): void {
  fieldRegistry.registerAll({
    text: TextControl,
    select: SelectControl,
    'radio-cards': RadioCards,
    segmented: SegmentedControl,
    checkbox: CheckboxControl,
    chips: ChipsControl,
  })

  const plain = (items: { value: string; label: string; description?: string }[]) => () => items

  optionRegistry.registerAll({
    'us.states': plain(US_STATES),
    'driver.maritalStatus': plain(MARITAL_STATUS),
    'driver.residence': plain(RESIDENCE),
    'driver.yearsInsured': plain(YEARS_INSURED),
    'vehicle.use': plain(VEHICLE_USE),
    'vehicle.ownership': plain(OWNERSHIP),
    'vehicle.mileage': plain(ANNUAL_MILEAGE),
    'coverage.deductibles': plain(DEDUCTIBLES),
    'coverage.liability': plain(LIABILITY_LIMITS),
    'vehicle.years': () => modelYears().map((year) => ({ value: year, label: year })),
    'vehicle.makes': () => makesList().map((make) => ({ value: make, label: make })),
    // Models depend on the make chosen for the same vehicle, which the field
    // declares through `dependsOn`.
    'vehicle.models': ({ dependsOn }) => {
      const make = String(dependsOn[0] ?? '')
      return modelsFor(make).map((model) => ({ value: model, label: model }))
    },
  })
}
