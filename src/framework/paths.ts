/** Reading and writing nested answers by dot path, e.g. `drivers.0.firstName`. */

export function getPath(doc: unknown, path: string): unknown {
  if (!path) return undefined
  let cursor: unknown = doc
  for (const key of path.split('.')) {
    if (cursor === null || cursor === undefined) return undefined
    if (Array.isArray(cursor)) {
      const index = Number(key)
      cursor = Number.isInteger(index) ? cursor[index] : undefined
    } else if (typeof cursor === 'object') {
      cursor = (cursor as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return cursor
}

/** Returns a copy of `doc` with `path` set to `value`. The input is untouched. */
export function setPath<T extends object>(doc: T, path: string, value: unknown): T {
  const keys = path.split('.')
  const clone = cloneContainer(doc, keys[0]!)
  let cursor: any = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    const nextKey = keys[i + 1]!
    const existing = cursor[key]
    cursor[key] =
      existing === null || typeof existing !== 'object'
        ? emptyContainer(nextKey)
        : cloneContainer(existing, nextKey)
    cursor = cursor[key]
  }
  cursor[keys[keys.length - 1]!] = value
  return clone as T
}

/** Removes the entry at `index` from the array living at `path`. */
export function removeAt<T extends object>(doc: T, path: string, index: number): T {
  const list = getPath(doc, path)
  if (!Array.isArray(list)) return doc
  const next = list.filter((_, i) => i !== index)
  return setPath(doc, path, next)
}

function emptyContainer(nextKey: string): unknown {
  return Number.isInteger(Number(nextKey)) ? [] : {}
}

function cloneContainer(value: unknown, _nextKey: string): unknown {
  if (Array.isArray(value)) return [...value]
  if (value && typeof value === 'object') return { ...(value as object) }
  return {}
}

/** Substitutes `{path}` placeholders from a lookup document. */
export function interpolate(template: string, doc: unknown): string {
  return template.replace(/\{([a-zA-Z0-9_.]+)\}/g, (whole, path: string) => {
    const value = getPath(doc, path)
    return value === undefined || value === null ? whole : String(value)
  })
}
