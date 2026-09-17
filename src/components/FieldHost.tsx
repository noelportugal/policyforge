import { useMemo } from 'react'
import type { FieldDef, OptionDef } from '@/framework/types'
import { fieldRegistry, optionRegistry } from '@/framework/registry'
import { getPath } from '@/framework/paths'
import { useQuote } from '@/framework/QuoteProvider'

/**
 * Binds one configured field to the answer document: finds its renderer,
 * resolves its options, and decides whether an error is ready to be shown.
 */
export function FieldHost({ field, path }: { field: FieldDef; path: string }) {
  const { answers, errors, touched, setValue, touch } = useQuote()

  const Renderer = fieldRegistry.get(field.type)
  const value = getPath(answers, path)
  const error = touched[path] ? (errors[path] ?? null) : null

  const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : ''
  const options = useMemo<OptionDef[]>(() => {
    if (!field.options) return []
    if (Array.isArray(field.options)) return field.options
    const provider = optionRegistry.get(field.options.source)
    if (!provider) return []
    const dependsOn = (field.options.dependsOn ?? []).map((dependency) =>
      getPath(answers, absolute(dependency, parent)),
    )
    return provider({ answers, path, dependsOn })
  }, [field.options, answers, path, parent])

  if (!Renderer) {
    return (
      <p className="pf-field-missing" role="alert">
        No renderer is registered for field type “{field.type}”.
      </p>
    )
  }

  const width = field.width ?? 'full'

  return (
    <div className={`pf-field pf-width-${width}${error ? ' has-error' : ''}`}>
      <label className="pf-label" htmlFor={path}>
        {field.label}
        {field.required ? <span className="pf-required" aria-hidden="true"> *</span> : null}
      </label>
      {field.help ? (
        <p className="pf-help" id={`${path}-help`}>
          {field.help}
        </p>
      ) : null}
      <Renderer
        path={path}
        label={field.label}
        value={value}
        error={error}
        required={field.required === true}
        help={field.help}
        placeholder={field.placeholder}
        options={options}
        props={field.props ?? {}}
        onChange={(next) => setValue(path, next)}
        onBlur={() => touch(path)}
      />
      {error ? (
        <p className="pf-error" id={`${path}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** `$.zip` reads the top of the document; anything else is local to the item. */
function absolute(reference: string, parent: string): string {
  if (reference.startsWith('$.')) return reference.slice(2)
  return parent ? `${parent}.${reference}` : reference
}
