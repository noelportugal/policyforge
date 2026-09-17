import type { ThemeConfig, ThemeTokens } from './types'

/**
 * Turns design tokens into CSS custom properties.
 *
 * Every stylesheet in the application reads `var(--pf-…)` and nothing else, so
 * re-branding is a data change rather than a stylesheet change.
 *
 * The tokens are written into a stylesheet rather than onto `document
 * .documentElement.style`: an inline style on the root element outranks every
 * rule in every stylesheet, so inline base tokens would silently defeat the
 * dark scheme overrides below.
 */
export function applyTheme(theme: ThemeConfig): void {
  const dark = theme.dark ?? {}
  const blocks = [rule(':root', theme.tokens)]

  if (Object.keys(dark).length > 0) {
    // The guard lets an explicit light choice win over the system preference.
    blocks.push(`@media (prefers-color-scheme: dark) {\n${rule(':root:not([data-scheme="light"])', dark)}\n}`)
    blocks.push(rule(':root[data-scheme="dark"]', dark))
  }

  writeStyle(TOKEN_STYLE_ID, blocks.join('\n'))
  loadWebFonts(theme.webFonts ?? [])
}

export function cssVar(token: string): string {
  return `--pf-${token}`
}

const TOKEN_STYLE_ID = 'pf-theme-tokens'
const FONT_LINK_ID = 'pf-web-fonts'

function rule(selector: string, tokens: ThemeTokens): string {
  const declarations = Object.entries(tokens)
    .map(([key, value]) => `  ${cssVar(key)}: ${value};`)
    .join('\n')
  return `${selector} {\n${declarations}\n}`
}

function writeStyle(id: string, css: string): void {
  const existing = document.getElementById(id) as HTMLStyleElement | null
  const style = existing ?? Object.assign(document.createElement('style'), { id })
  if (style.textContent !== css) style.textContent = css
  if (!existing) {
    // First in `head` so the application stylesheet can still override a token
    // driven rule if it ever needs to.
    document.head.prepend(style)
  }
}

function loadWebFonts(families: string[]): void {
  const existing = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null
  if (families.length === 0) {
    existing?.remove()
    return
  }
  const href = `https://fonts.googleapis.com/css2?${families
    .map((family) => `family=${encodeURIComponent(family)}`)
    .join('&')}&display=swap`

  const link = existing ?? document.createElement('link')
  link.id = FONT_LINK_ID
  link.rel = 'stylesheet'
  if (link.href !== href) link.href = href
  if (!existing) document.head.appendChild(link)
}

/** Sets the tab title and an emoji favicon so a tenant needs no image assets. */
export function applyDocumentIdentity(title: string, emoji: string): void {
  document.title = title
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">${emoji}</text></svg>`
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = href
}
