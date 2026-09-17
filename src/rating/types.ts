import type { AnswerDoc, FeatureFlags, RatingConfig } from '@/framework/types'

export interface RateRequest {
  answers: AnswerDoc
  config: RatingConfig
  features: FeatureFlags
}

export interface AppliedFactor {
  label: string
  value: string
  factor: number
}

export interface AppliedDiscount {
  id: string
  label: string
  /** Dollars removed from the term premium. */
  amount: number
}

export interface RatedTier {
  id: string
  label: string
  description: string
  highlights: string[]
  recommended: boolean
  /** Premium for the whole term, in dollars. */
  termPremium: number
  monthlyPremium: number
}

export interface RateResult {
  quoteNumber: string
  termMonths: number
  basePremium: number
  factors: AppliedFactor[]
  discounts: AppliedDiscount[]
  policyFee: number
  tiers: RatedTier[]
  ratedAt: string
}

/**
 * The seam between the funnel and whatever actually prices a policy.
 *
 * The demo ships a deterministic in-browser engine. A real deployment registers
 * an engine that calls a rating service; nothing else in the application
 * changes, because every screen consumes `RateResult`.
 */
export type RateEngine = (request: RateRequest) => Promise<RateResult>
