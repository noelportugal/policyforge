/**
 * The contract every tenant configuration is written against.
 *
 * Nothing in this file imports React. A tenant configuration is plain data so
 * that it can live in a database, a CMS or a git repository and be delivered to
 * the browser at runtime without shipping new application code.
 */

/* ------------------------------------------------------------------ theme */

/** Design tokens. Each key becomes a CSS custom property named `--pf-<key>`. */
export type ThemeTokens = Record<string, string>

export interface ThemeConfig {
  /** Tokens applied in every colour scheme. */
  tokens: ThemeTokens
  /** Tokens that replace the defaults when the viewer prefers a dark scheme. */
  dark?: ThemeTokens
  /** Optional Google Fonts family names to load, e.g. ["Inter:wght@400;600"]. */
  webFonts?: string[]
}

/* ------------------------------------------------------------------ brand */

export interface BrandConfig {
  /** Short display name used in headings and the browser tab. */
  name: string
  /** Full legal entity name used in footer copy. */
  legalName: string
  /** One-line positioning statement. */
  tagline: string
  /** Identifier of a registered logo mark component. */
  logoMark: string
  /** Emoji used as the browser favicon so no binary assets are needed. */
  favicon: string
  supportPhone: string
  supportHours: string
  /** Short trust statements rendered in the site header or hero. */
  trustBadges: string[]
}

/* -------------------------------------------------------------- conditions */

/**
 * A serialisable predicate. Conditions are interpreted, never evaluated as
 * JavaScript, so a configuration authored outside this codebase cannot execute
 * code in a visitor's browser.
 */
export type Condition =
  | { op: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'; field: string; value: unknown }
  | { op: 'in' | 'nin'; field: string; value: unknown[] }
  | { op: 'contains'; field: string; value: unknown }
  | { op: 'filled' | 'empty' | 'truthy' | 'falsy'; field: string }
  | { op: 'and' | 'or'; of: Condition[] }
  | { op: 'not'; of: Condition }
  | { op: 'feature'; flag: string }

/* -------------------------------------------------------------- validation */

export type ValidationRule =
  | { rule: 'required'; message?: string }
  | { rule: 'pattern'; value: string; message?: string }
  | { rule: 'minLength' | 'maxLength'; value: number; message?: string }
  | { rule: 'min' | 'max'; value: number; message?: string }
  | { rule: 'zip' | 'email' | 'phone'; message?: string }
  | { rule: 'ageBetween'; value: [number, number]; message?: string }
  | { rule: 'yearBetween'; value: [number, number]; message?: string }

/* ------------------------------------------------------------------ fields */

export interface OptionDef {
  value: string
  label: string
  description?: string
  /** Optional icon key resolved by the icon registry. */
  icon?: string
}

/** Options may be listed inline or pulled from a registered data source. */
export type OptionSource = OptionDef[] | { source: string; dependsOn?: string[] }

export interface FieldDef {
  /** Dot path into the answer document, e.g. `drivers.0.firstName`. */
  id: string
  /** Key into the field renderer registry. */
  type: string
  label: string
  help?: string
  placeholder?: string
  required?: boolean
  when?: Condition
  options?: OptionSource
  validate?: ValidationRule[]
  width?: 'full' | 'half' | 'third'
  /** Arbitrary props handed to the renderer. */
  props?: Record<string, unknown>
}

/* ------------------------------------------------------------------- steps */

export interface SectionDef {
  id: string
  title?: string
  description?: string
  when?: Condition
  layout?: 'stack' | 'grid-2' | 'grid-3'
  fields: FieldDef[]
  /** Renders the section once per entry in a list answer (drivers, vehicles). */
  repeat?: {
    over: string
    min: number
    max: number
    addLabel: string
    removeLabel: string
    itemLabel: string
  }
}

export interface StepDef {
  id: string
  /** Label shown in the progress indicator. */
  label: string
  title: string
  subtitle?: string
  when?: Condition
  sections?: SectionDef[]
  /** Renders a registered component instead of a field form. */
  component?: string
  nextLabel?: string
  backLabel?: string
  /** Legal or consent copy rendered above the primary button. */
  disclosure?: string
}

export interface FlowConfig {
  id: string
  steps: StepDef[]
}

/* ------------------------------------------------------------------ rating */

/** Multiplier tables keyed by an answer path, then by that answer's value. */
export type FactorTable = Record<string, Record<string, number>>

export interface DiscountDef {
  id: string
  label: string
  /** Fraction removed from the premium, e.g. 0.08 for eight per cent. */
  amount: number
  when: Condition
}

export interface CoverageTierDef {
  id: string
  label: string
  description: string
  /** Multiplier applied to the rated premium. */
  multiplier: number
  highlights: string[]
  recommended?: boolean
}

export interface RatingConfig {
  /** Key into the rate engine registry. */
  engine: string
  /** Six-month premium before any factor is applied, in dollars. */
  basePremium: number
  policyFee: number
  factors: FactorTable
  /** How each factor table is named on the price breakdown. */
  factorLabels?: Record<string, string>
  discounts: DiscountDef[]
  tiers: CoverageTierDef[]
  /** Term length in months, printed beside the price. */
  termMonths: number
}

/* -------------------------------------------------------------- extensions */

/** Named mount points a tenant can fill with registered plugin components. */
export type SlotConfig = Record<string, string[]>

export type FeatureFlags = Record<string, boolean>

/** Copy dictionary. Values may contain `{placeholders}`. */
export type ContentDict = Record<string, string>

export interface LocaleConfig {
  locale: string
  currency: string
}

/* ------------------------------------------------------------------ tenant */

export interface TenantConfig {
  id: string
  /** Id of another tenant this one is layered on top of. */
  extends?: string
  /** Hostnames that should resolve to this tenant in production. */
  hostnames?: string[]
  brand: BrandConfig
  theme: ThemeConfig
  /** Answers the funnel starts with, e.g. one empty driver and one vehicle. */
  defaults: AnswerDoc
  content: ContentDict
  flow: FlowConfig
  features: FeatureFlags
  rating: RatingConfig
  slots: SlotConfig
  locale: LocaleConfig
}

/** A tenant file may leave anything out and inherit it from its parent. */
export type TenantConfigInput = DeepPartial<TenantConfig> & { id: string }

export type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

/* ------------------------------------------------------------------ answers */

/** The document the visitor fills in. Deliberately loose: the shape is owned by
 *  the flow configuration, not by this file. */
export type AnswerDoc = Record<string, unknown>
