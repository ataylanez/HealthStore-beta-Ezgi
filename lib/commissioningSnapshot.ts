import { formatPricingModelDisplay } from '@/components/AppDetailSections'
import { catalogueDemoAvailable } from '@/lib/catalogueCardSignals'

/** Tri-state for prose fields (FHIR / EMIS); NHS rows use boolean only. */
export type InteropIntegrationValue = boolean | null

export type InteropSnapshotItem = {
  key: string
  /** Display label (NHS App / Notify / Login row, or FHIR / EMIS pill text). */
  name: string
  integrated: InteropIntegrationValue
  /** When set, bottom-row FHIR / EMIS use bordered pill; NHS top row uses `name` as dark blue text. */
  textLabel?: string
}

export type SnapshotFundingRow = { id: string; title: string; status: string }

export type RegulationSnapshotPill = {
  label: string
  /** Softer styling when the programme type is not present (e.g. NICE-EVA). */
  muted?: boolean
}

export type CommissioningSnapshotCard =
  | {
      kind: 'regulation'
      label: string
      href: string
      pills: RegulationSnapshotPill[]
    }
  | {
      kind: 'cost'
      label: string
      href?: string
      /** Shown in small type when pricing is indicative. */
      indicativeNote?: string
      modelPills: string[]
      subline?: string
    }
  | {
      kind: 'funding'
      label: string
      pills: string[]
      subline?: string
      /** Replaces plain subline when present (e.g. in-page anchor to Related funding). */
      opportunitiesLink?: { href: string; label: string }
    }
  | {
      kind: 'interop'
      label: string
      href?: string
      items: InteropSnapshotItem[]
    }
  | {
      kind: 'platform'
      label: string
      values: string[]
      /** Deep-link to demo access when a catalogue demo is available. */
      demoLink?: { href: string; label: string }
    }

export type FundingSnapshotCard = Extract<CommissioningSnapshotCard, { kind: 'funding' }>

/**
 * Infer yes / no / unknown from `technical_integrations` prose.
 * Negatives → no; positives → yes; empty or ambiguous → unknown.
 */
function inferProseIntegration(value: string | undefined | null): InteropIntegrationValue {
  const t = String(value ?? '').trim().toLowerCase()
  if (!t) return null
  const negatives = [
    'not confirmed',
    'check with supplier',
    'not available',
    'n/a',
    'none',
    'no integration',
    'not integrated',
  ]
  if (negatives.some(n => t.includes(n))) return false
  const positives = [
    'available',
    'compatible',
    'integration',
    'fhir',
    'emis',
    'r4',
    'hl7',
    'api',
    'via ',
    'supported',
    'connect',
  ]
  if (positives.some(p => t.includes(p))) return true
  return null
}

function regulationCard(app: any): CommissioningSnapshotCard {
  const refs = (app.nice_guidance_refs ?? []) as { type?: string }[]
  const hasEva = refs.some(r => r.type === 'EVA')

  return {
    kind: 'regulation',
    label: 'Governance',
    href: '#data-information-governance',
    pills: [
      { label: 'NICE-EVA', muted: !hasEva },
      { label: 'DTAC' },
      { label: 'Cyber Essentials' },
    ],
  }
}

function costCard(app: any, opts?: { commercialHref?: string }): CommissioningSnapshotCard {
  const model = formatPricingModelDisplay(app.pricing_model)
  const indicativeConfidence = app.pricing_confidence === 'indicative'
  const indicativeNote = indicativeConfidence ? 'Indicative' : undefined

  const modelPills: string[] = []
  if (model && String(model).trim()) {
    modelPills.push(String(model).trim())
  }
  if (app.free_offer_flag === true) {
    modelPills.push('Free offer')
  }

  return {
    kind: 'cost',
    label: 'Indicative cost',
    ...(opts?.commercialHref ? { href: opts.commercialHref } : {}),
    indicativeNote,
    modelPills,
  }
}

function fundingCard(
  app: any,
  linked: SnapshotFundingRow[],
  opts?: { opportunitiesHref?: string; opportunitiesLabel?: string },
): FundingSnapshotCard | null {
  const pills: string[] = []
  const showNhse125Pill =
    app.nhse_125k_eligible === true && app.slug !== 'clinitouch'
  if (showNhse125Pill) {
    pills.push('NHSE £125k — eligible')
  }
  for (const f of linked) {
    if (f.title && String(f.title).trim()) {
      pills.push(String(f.title).trim())
    }
  }

  if (pills.length === 0) {
    return null
  }

  return {
    kind: 'funding',
    label: 'Funding opportunities',
    pills,
    ...(opts?.opportunitiesHref
      ? {
          opportunitiesLink: {
            href: opts.opportunitiesHref,
            label: opts?.opportunitiesLabel ?? 'Related funding opportunities',
          },
        }
      : {}),
  }
}

function platformCard(app: any, opts?: { demoHref?: string }): CommissioningSnapshotCard {
  const platforms: string[] = app.platform_tags ?? app.platforms ?? []
  return {
    kind: 'platform',
    label: 'Platform',
    values: platforms.length > 0 ? platforms : ['iOS', 'Android', 'Web'],
    ...(catalogueDemoAvailable(app) && opts?.demoHref
      ? { demoLink: { href: opts.demoHref, label: 'Demo available' } }
      : {}),
  }
}

function interopCard(app: any, opts?: { interopHref?: string }): CommissioningSnapshotCard {
  const ti = app.technical_integrations as { fhir?: string; emis?: string } | undefined
  const fhirState = ti ? inferProseIntegration(ti.fhir) : null
  const emisState = ti ? inferProseIntegration(ti.emis) : null

  const items: InteropSnapshotItem[] = [
    {
      key: 'fhir',
      name: 'FHIR',
      integrated: fhirState,
      textLabel: 'FHIR',
    },
    {
      key: 'emis',
      name: 'EMIS',
      integrated: emisState,
      textLabel: 'EMIS',
    },
  ]

  return {
    kind: 'interop',
    label: 'Technical integration',
    ...(opts?.interopHref ? { href: opts.interopHref } : {}),
    items,
  }
}

/** Grid callout cards: governance, pricing model, platform, integration ready (where-live is the 4th slot in the UI). */
export function getCommissioningSnapshot(
  app: any,
  opts?: { commercialHref?: string; interopHref?: string; demoHref?: string },
): CommissioningSnapshotCard[] {
  return [regulationCard(app), platformCard(app, opts), costCard(app, opts), interopCard(app, opts)]
}

export function getFundingSnapshotCard(
  app: any,
  linkedFunding: SnapshotFundingRow[],
  opts?: { opportunitiesHref?: string; opportunitiesLabel?: string },
): FundingSnapshotCard | null {
  return fundingCard(app, linkedFunding, opts)
}
