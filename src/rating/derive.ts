import type { AnswerDoc } from '@/framework/types'
import { getPath } from '@/framework/paths'
import { ageFromDate } from '@/framework/validation'

/**
 * Rating factor tables key on bands, not raw answers, so the bands are computed
 * once here and written back under `derived.*`. Conditions in tenant
 * configuration can read the same paths.
 */
export function deriveRatingInputs(answers: AnswerDoc, today = new Date()): AnswerDoc {
  const drivers = Array.isArray(getPath(answers, 'drivers')) ? (getPath(answers, 'drivers') as AnswerDoc[]) : []
  const vehicles = Array.isArray(getPath(answers, 'vehicles')) ? (getPath(answers, 'vehicles') as AnswerDoc[]) : []

  const ages = drivers
    .map((driver) => ageFromDate(String(driver.dateOfBirth ?? ''), today))
    .filter((age): age is number => age !== null)

  const youngest = ages.length ? Math.min(...ages) : null
  const newestVehicleYear = vehicles.length
    ? Math.max(...vehicles.map((vehicle) => Number(vehicle.year) || 0))
    : null

  return {
    ...answers,
    derived: {
      driverCount: String(Math.max(drivers.length, 1)),
      vehicleCount: String(Math.max(vehicles.length, 1)),
      youngestDriverBand: ageBand(youngest),
      vehicleAgeBand: vehicleAgeBand(newestVehicleYear, today.getFullYear()),
      multiCar: vehicles.length > 1,
      primaryUse: String(vehicles[0]?.use ?? 'unknown'),
      annualMileage: String(vehicles[0]?.mileage ?? 'unknown'),
    },
  }
}

export function ageBand(age: number | null): string {
  if (age === null) return 'unknown'
  if (age < 21) return 'under21'
  if (age < 25) return '21to24'
  if (age < 35) return '25to34'
  if (age < 50) return '35to49'
  if (age < 65) return '50to64'
  return '65plus'
}

export function vehicleAgeBand(year: number | null, currentYear: number): string {
  if (!year) return 'unknown'
  const age = currentYear - year
  if (age <= 2) return 'new'
  if (age <= 6) return 'recent'
  if (age <= 12) return 'older'
  return 'vintage'
}
