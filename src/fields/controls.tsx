import type { FieldRendererProps } from '@/framework/registry'

/**
 * Built-in field renderers.
 *
 * Each one is registered under a string key, so a tenant's configuration asks
 * for `"radio-cards"` and a client with its own design language can register a
 * replacement under the same key without the funnel knowing.
 */

function describedBy(path: string, help?: string, error?: string | null): string | undefined {
  const ids = [help ? `${path}-help` : null, error ? `${path}-error` : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

export function TextControl({ path, value, error, required, placeholder, props, onChange, onBlur, help }: FieldRendererProps) {
  const inputMode = props.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode'] | undefined
  return (
    <input
      id={path}
      className="pf-input"
      type={(props.inputType as string) ?? 'text'}
      inputMode={inputMode}
      maxLength={props.maxLength as number | undefined}
      autoComplete={(props.autoComplete as string) ?? 'off'}
      placeholder={placeholder}
      value={value === undefined || value === null ? '' : String(value)}
      aria-invalid={error ? true : undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy(path, help, error)}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  )
}

export function SelectControl({ path, value, error, required, options, placeholder, onChange, onBlur, help }: FieldRendererProps) {
  return (
    <div className="pf-select-wrap">
      <select
        id={path}
        className="pf-input pf-select"
        value={value === undefined || value === null ? '' : String(value)}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(path, help, error)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      >
        <option value="">{placeholder ?? 'Select…'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pf-select-caret" aria-hidden="true">▾</span>
    </div>
  )
}

export function RadioCards({ path, value, options, error, onChange, onBlur, help, label }: FieldRendererProps) {
  return (
    <div
      className="pf-cards"
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy(path, help, error)}
    >
      {options.map((option) => {
        const selected = String(value ?? '') === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`pf-card-option${selected ? ' is-selected' : ''}`}
            onClick={() => {
              onChange(option.value)
              onBlur()
            }}
          >
            {option.icon ? <span className="pf-card-icon" aria-hidden="true">{option.icon}</span> : null}
            <span className="pf-card-body">
              <span className="pf-card-label">{option.label}</span>
              {option.description ? <span className="pf-card-desc">{option.description}</span> : null}
            </span>
            <span className="pf-card-tick" aria-hidden="true">{selected ? '✓' : ''}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SegmentedControl({ path, value, options, error, onChange, onBlur, help, label }: FieldRendererProps) {
  return (
    <div className="pf-segmented" role="radiogroup" aria-label={label} aria-describedby={describedBy(path, help, error)}>
      {options.map((option) => {
        const selected = String(value ?? '') === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`pf-segment${selected ? ' is-selected' : ''}`}
            onClick={() => {
              onChange(option.value)
              onBlur()
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function CheckboxControl({ path, value, props, onChange, onBlur }: FieldRendererProps) {
  const checked = value === true || value === 'true'
  return (
    <label className="pf-checkbox" htmlFor={path}>
      <input
        id={path}
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked)
          onBlur()
        }}
      />
      <span>{(props.text as string) ?? 'Yes'}</span>
    </label>
  )
}

export function ChipsControl({ path, value, options, onChange, error, help, label }: FieldRendererProps) {
  const selected = Array.isArray(value) ? (value as string[]) : []
  const toggle = (candidate: string) => {
    onChange(selected.includes(candidate) ? selected.filter((item) => item !== candidate) : [...selected, candidate])
  }
  return (
    <div className="pf-chips" role="group" aria-label={label} aria-describedby={describedBy(path, help, error)}>
      {options.map((option) => {
        const on = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            className={`pf-chip${on ? ' is-selected' : ''}`}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
