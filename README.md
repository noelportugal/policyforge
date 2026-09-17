# PolicyForge

**▶ Live demo: https://noelportugal.github.io/policyforge/**

A single page React application that runs an **auto insurance quote funnel**, and a small
framework that lets one codebase serve completely different insurance brands from
configuration alone.

Three brands ship in the demo. They share every line of application code and differ only in
data:

| | Meridian Mutual | Cobalt Direct | Sundial Assurance |
|---|---|---|---|
| Business model | Regional carrier, agent supported | App-first direct carrier | Independent agency |
| Steps in the funnel | 8 | 7 | 9 |
| Extra questions | Garaging address, insurance history | One-line address only | Adviser preference and call window |
| Read-back before pricing | ✓ | ✗ | ✓ |
| Panels on the quote | Local agents | Telematics offer | Carrier comparison, advisers |
| Look | Blue and amber, square corners, humanist sans | Indigo and cyan, large radii, Inter | Terracotta and amber, serif headings |
| Base rate / policy fee | $712 / $38 | $648 / $0 | $668 / $45 |

Open each one, or switch between them live with the **Customise** button in the header:

- [Meridian Mutual](https://noelportugal.github.io/policyforge/?tenant=meridian)
- [Cobalt Direct](https://noelportugal.github.io/policyforge/?tenant=cobalt)
- [Sundial Assurance](https://noelportugal.github.io/policyforge/?tenant=sundial)

The Customise panel also edits colours, corner radius, typeface and feature flags live, and
copies the resulting tenant file to your clipboard.

## Why it is built this way

Insurance software has one recurring shape: the same product sold under many brands, in many
states, through many channels. The usual outcome is a fork per client, and then a change to a
legal disclosure has to be made eleven times.

Here the funnel is data. A tenant is a JSON-shaped object describing its brand, its design
tokens, its questions, its conditional logic, its rating factors and its extension points.
The React code knows how to render *any* funnel; it knows nothing about any particular one.

```
┌────────────────────────────────────────────────────────────────┐
│  Tenant configuration (plain data, per brand)                  │
│  brand · theme tokens · content · flow · features · rating     │
└───────────────┬────────────────────────────────────────────────┘
                │ deep merge over the house default (`extends`)
┌───────────────▼────────────────────────────────────────────────┐
│  Framework                                                     │
│  theme → CSS custom properties      flow   → visible steps     │
│  conditions → safe interpreter      fields → validation        │
│  registries → components by key     rating → pluggable engine  │
└───────────────┬────────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────────┐
│  React shell — one set of components, no brand knowledge       │
└────────────────────────────────────────────────────────────────┘
```

## The six extension points

| Layer | What a client changes | Where |
|---|---|---|
| **Theme** | Colour, radius, typeface, dark scheme | `theme.tokens`, applied as `--pf-*` custom properties |
| **Content** | Every visible sentence, with `{placeholders}` | `content` dictionary, inherited from the parent tenant |
| **Flow** | Which questions exist, their order, their conditions | `flow.steps`, composed from reusable step pieces |
| **Fields** | How a question is rendered | `fieldRegistry` — a client can replace `radio-cards` wholesale |
| **Slots** | Extra panels at named mount points | `slots`, e.g. `"step.bottom:coverage": ["bundle-nudge"]` |
| **Rating** | What a policy costs | `rating` factors and discounts, plus a pluggable rate engine |

Nothing in the list needs a build change. A client-specific deployment registers its own
components at start-up and then ships configuration.

### Conditions are interpreted, never evaluated

Configuration is treated as untrusted, because in production it arrives from a content tool or
a configuration service rather than from this repository. Conditions are a small serialisable
language with no path to `eval`:

```ts
when: {
  op: 'and',
  of: [
    { op: 'in', field: 'product', value: ['auto', 'auto-home'] },
    { op: 'feature', flag: 'agentNetwork' },
  ],
}
```

Inside a repeating section (drivers, vehicles) field paths are rebased automatically, so a
condition written as `licensed` means *this driver's* licence, and `$.product` escapes to the
top of the document.

### Rating is a seam, not a feature

`src/rating/` defines a `RateEngine` interface and ships one deterministic in-browser
implementation so the public demo prices a policy with no backend. Every screen consumes the
`RateResult`, so pointing the application at a real rating service is one registration:

```ts
registerRateEngine('acme-v2', async (request) => fetchQuote(request))
```

The demo engine multiplies a tenant's base premium by that tenant's own factor tables, applies
the discounts whose conditions hold, and spreads the result across coverage tiers. **It is an
illustration, not an actuarial model, and no underwriting takes place.**

## Adding a brand

A whole new brand is one file. This is the complete minimum:

```ts
export const northgateTenant: TenantConfigInput = {
  id: 'northgate',
  extends: '_base',
  hostnames: ['quote.northgate.example'],
  brand: {
    name: 'Northgate Mutual',
    legalName: 'Northgate Mutual Insurance Company',
    tagline: 'Sixty years on your side',
    logoMark: 'chevron',
    favicon: '🏔️',
    supportPhone: '1-800-555-0117',
    supportHours: 'Mon to Fri, 8am to 6pm',
    trustBadges: ['Licensed in 12 states'],
  },
  theme: { tokens: { brand: '#0f5132', accent: '#ffd166', radius: '8px' } },
  features: { agentNetwork: false },
  rating: { basePremium: 705 },
}
```

Everything not stated — the eight funnel steps, every question, every validation rule, the
discount table, the legal copy, the dark scheme — is inherited. Register it in
`src/tenants/index.ts` and the brand exists.

The **Customisation studio** in the running app writes exactly this object and will copy it to
your clipboard.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit and configuration contract tests
npm run build      # static output in dist/
```

Requires Node 20 or newer. There is no backend, no API key and no database: answers live in
`sessionStorage` and never leave the browser.

`BASE_PATH=/policyforge/ npm run build` builds for a GitHub Pages project site. The included
workflow does this on every push to `main`.

## Tests

```
tests/expressions.test.ts   the condition interpreter, operator by operator
tests/merge.test.ts         tenant inheritance, array replacement, circular guard
tests/flow.test.ts          visible steps, repeating sections, path rebasing
tests/validation.test.ts    field rules and age arithmetic
tests/rating.test.ts        determinism, discount conditions, tier ordering
tests/tenants.test.ts       the contract test
```

The contract test is the one that matters for a configuration-driven system. It walks every
shipped tenant and proves that every field type, option source, step component, slot plugin,
logo mark and rate engine it names is actually registered — because otherwise a typo in a
tenant file fails at runtime, in production, on the one brand nobody clicked through.

## What is deliberately not here

- No backend, no authentication, no payment, no policy issue.
- No real rating, underwriting or state filings.
- No address or VIN lookup; the vehicle catalogue is a trimmed static list behind the same
  option provider a real service would sit behind.

## Notes on the design

The visual language and the funnel structure follow the conventions of US consumer auto
insurance quoting — a ZIP-first hero, year/make/model, household drivers, coverage tiers.
**The brands here are invented.** PolicyForge is not affiliated with, endorsed by or derived
from the software of any insurer, and nothing in it should be read as a quote or an offer of
insurance.

## Licence

MIT. See [LICENSE](LICENSE).
