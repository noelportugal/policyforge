import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { AnswerDoc, TenantConfig } from './types'
import type { FieldErrors } from './validation'
import { getPath, removeAt, setPath } from './paths'
import { firstStepId, neighbourStep, validateStep, visibleSteps } from './flow'
import { getRateEngine } from '@/rating/engine'
import type { RateResult } from '@/rating/types'

type RateStatus = 'idle' | 'rating' | 'ready' | 'failed'

interface QuoteState {
  answers: AnswerDoc
  errors: FieldErrors
  /** Fields the visitor has left, so errors appear on exit rather than on entry. */
  touched: Record<string, true>
  rateStatus: RateStatus
  rateError: string | null
  result: RateResult | null
}

type Action =
  | { type: 'set'; path: string; value: unknown }
  | { type: 'touch'; path: string }
  | { type: 'errors'; errors: FieldErrors }
  | { type: 'append'; path: string; item: AnswerDoc }
  | { type: 'remove'; path: string; index: number }
  | { type: 'rating' }
  | { type: 'rated'; result: RateResult }
  | { type: 'rateFailed'; message: string }
  | { type: 'reset'; answers: AnswerDoc }

function reducer(state: QuoteState, action: Action): QuoteState {
  switch (action.type) {
    case 'set': {
      const { [action.path]: _removed, ...rest } = state.errors
      return { ...state, answers: setPath(state.answers, action.path, action.value), errors: rest }
    }
    case 'touch':
      return { ...state, touched: { ...state.touched, [action.path]: true } }
    case 'errors':
      return { ...state, errors: action.errors }
    case 'append': {
      const list = getPath(state.answers, action.path)
      const next = Array.isArray(list) ? [...list, action.item] : [action.item]
      return { ...state, answers: setPath(state.answers, action.path, next) }
    }
    case 'remove':
      return { ...state, answers: removeAt(state.answers, action.path, action.index) }
    case 'rating':
      return { ...state, rateStatus: 'rating', rateError: null }
    case 'rated':
      return { ...state, rateStatus: 'ready', result: action.result }
    case 'rateFailed':
      return { ...state, rateStatus: 'failed', rateError: action.message }
    case 'reset':
      return initial(action.answers)
    default:
      return state
  }
}

function initial(answers: AnswerDoc): QuoteState {
  return { answers, errors: {}, touched: {}, rateStatus: 'idle', rateError: null, result: null }
}

export interface QuoteContextValue extends QuoteState {
  tenant: TenantConfig
  stepId: string
  setValue: (path: string, value: unknown) => void
  touch: (path: string) => void
  appendItem: (path: string, item?: AnswerDoc) => void
  removeItem: (path: string, index: number) => void
  /** Validates the current step and moves on, returning false when it cannot. */
  next: () => boolean
  back: () => void
  requestRate: () => void
  reset: () => void
  isLast: boolean
  isFirst: boolean
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

export interface QuoteProviderProps {
  tenant: TenantConfig
  stepId: string
  onNavigate: (stepId: string) => void
  children: ReactNode
}

export function QuoteProvider({ tenant, stepId, onNavigate, children }: QuoteProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initial(loadAnswers(tenant)))

  // A refreshed page keeps the visitor's place. Quote funnels are long and
  // abandonment on reload is the single most expensive bug in this category.
  useEffect(() => {
    saveAnswers(tenant.id, state.answers)
  }, [tenant.id, state.answers])

  const steps = useMemo(
    () => visibleSteps(tenant.flow, state.answers, tenant.features),
    [tenant.flow, tenant.features, state.answers],
  )
  const index = steps.findIndex((step) => step.id === stepId)
  const current = steps[index]

  const setValue = useCallback((path: string, value: unknown) => dispatch({ type: 'set', path, value }), [])
  const touch = useCallback((path: string) => dispatch({ type: 'touch', path }), [])
  const appendItem = useCallback(
    (path: string, item: AnswerDoc = {}) => dispatch({ type: 'append', path, item }),
    [],
  )
  const removeItem = useCallback((path: string, itemIndex: number) => dispatch({ type: 'remove', path, index: itemIndex }), [])

  const next = useCallback((): boolean => {
    if (!current) return false
    const errors = validateStep(current, state.answers, tenant.features)
    dispatch({ type: 'errors', errors })
    const paths = Object.keys(errors)
    if (paths.length > 0) {
      for (const path of paths) dispatch({ type: 'touch', path })
      return false
    }
    const target = neighbourStep(tenant.flow, state.answers, tenant.features, current.id, 1)
    if (target) onNavigate(target.id)
    return true
  }, [current, state.answers, tenant.features, tenant.flow, onNavigate])

  const back = useCallback(() => {
    if (!current) return
    const target = neighbourStep(tenant.flow, state.answers, tenant.features, current.id, -1)
    if (target) onNavigate(target.id)
  }, [current, state.answers, tenant.features, tenant.flow, onNavigate])

  const requestRate = useCallback(() => {
    dispatch({ type: 'rating' })
    const engine = getRateEngine(tenant.rating.engine)
    engine({ answers: state.answers, config: tenant.rating, features: tenant.features })
      .then((result) => dispatch({ type: 'rated', result }))
      .catch((error: unknown) => {
        dispatch({
          type: 'rateFailed',
          message: error instanceof Error ? error.message : 'The rating service did not respond.',
        })
      })
  }, [state.answers, tenant.rating, tenant.features])

  const reset = useCallback(() => {
    clearAnswers(tenant.id)
    dispatch({ type: 'reset', answers: structuredClone(tenant.defaults ?? {}) })
    onNavigate(firstStepId(tenant.flow, tenant.defaults ?? {}, tenant.features))
  }, [tenant, onNavigate])

  const value = useMemo<QuoteContextValue>(
    () => ({
      ...state,
      tenant,
      stepId,
      setValue,
      touch,
      appendItem,
      removeItem,
      next,
      back,
      requestRate,
      reset,
      isFirst: index <= 0,
      isLast: index === steps.length - 1,
    }),
    [state, tenant, stepId, setValue, touch, appendItem, removeItem, next, back, requestRate, reset, index, steps.length],
  )

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuote(): QuoteContextValue {
  const context = useContext(QuoteContext)
  if (!context) throw new Error('useQuote must be used inside a QuoteProvider')
  return context
}

/* ------------------------------------------------------- session persistence */

const storageKey = (tenantId: string) => `pf.answers.${tenantId}`

function loadAnswers(tenant: TenantConfig): AnswerDoc {
  const fallback = structuredClone(tenant.defaults ?? {})
  try {
    const raw = window.sessionStorage.getItem(storageKey(tenant.id))
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback
    return { ...fallback, ...(parsed as AnswerDoc) }
  } catch {
    return fallback
  }
}

function saveAnswers(tenantId: string, answers: AnswerDoc): void {
  try {
    window.sessionStorage.setItem(storageKey(tenantId), JSON.stringify(answers))
  } catch {
    // Storage being unavailable must never break the funnel.
  }
}

function clearAnswers(tenantId: string): void {
  try {
    window.sessionStorage.removeItem(storageKey(tenantId))
  } catch {
    // As above.
  }
}
