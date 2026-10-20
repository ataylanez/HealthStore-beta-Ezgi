import type { App } from '@/lib/data'
import type { AssuranceDomain, AssuranceDomainStatus, ProductNarrative } from '@/lib/content/productModel'
import { getProductNarrative } from '@/lib/content/productNarratives'
import { DTAC_DOMAIN, deriveAssuranceDomains } from '@/lib/content/assuranceDomains'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import {
  NOT_STATED,
  getExpectedBenefit,
  getIndicativePriceShort,
  getNiceGuidanceStatus,
  getOnboardingCompareLine,
  getPricingModelDisplay,
  getFundingEligibility,
  getServiceWrapYn,
  pickStr,
} from '@/lib/compareFieldFormat'
import { appConditionTags, formatConditionLabels } from '@/lib/compareConditions'
import { supervisionLabels } from '@/lib/data'
import { isMarketPreview } from '@/lib/marketPreview'

/**
 * Comparison content model — captioned NHS tables whose rows mirror the PDP
 * narrative spine (problem → evidence → experience → implementation → assurance → cost).
 *
 * Sourcing rule: narrative-first, catalogue fallback. Every cell resolves from the
 * curated ProductNarrative when getProductNarrative(slug) exists (Luscii, myCOPD,
 * myHeart, Joint Academy), otherwise from the catalogue JSON getters in
 * lib/compareFieldFormat.ts — so non-narrative products keep working.
 *
 * Cell copy is deliberately editorial: first-sentence / condensed phrasing decided
 * here in code (reviewable), not CSS clamping in the renderer.
 */

export type CompareTagColour = 'green' | 'yellow' | 'red' | 'blue' | 'grey' | 'orange'

export type CompareCell =
  | { kind: 'text'; text: string; missing?: boolean }
  | { kind: 'tag'; label: string; colour: CompareTagColour }
  | { kind: 'status_detail'; status: string; colour: CompareTagColour; detail: string; missing?: boolean }
  | { kind: 'link'; label: string; href: string }

export type CompareTableRowDef = {
  key: string
  label: string
  getCell: (app: App) => CompareCell
}

export type CompareTableSectionDef = {
  id: string
  caption: string
  rows: CompareTableRowDef[]
}

function text(value: string): CompareCell {
  if (!value || value === NOT_STATED) return { kind: 'text', text: NOT_STATED, missing: true }
  return { kind: 'text', text: value }
}

/** Commercial and funding cells for a product that cannot be commissioned from the HealthStore. */
function marketPreviewGap(app: App): CompareCell | null {
  if (!isMarketPreview(app)) return null
  return { kind: 'text', text: 'Not held on the HealthStore', missing: true }
}

function firstSentence(raw: string | undefined | null): string {
  if (!raw?.trim()) return ''
  const oneLine = raw.trim().replace(/\s+/g, ' ')
  // Sentence ends only at punctuation followed by a space or end of text,
  // so decimals ("£1.9 billion") and abbreviations don't split early.
  const m = oneLine.match(/^.*?[.!?](?=\s|$)/)
  return (m ? m[0] : oneLine).trim()
}

function narrativeFor(app: App): ProductNarrative | null {
  return typeof app.slug === 'string' ? getProductNarrative(app.slug) : null
}

/* ------------------------------------------------------------------ */
/* Section 1 — What it is and who it's for                            */
/* ------------------------------------------------------------------ */

function getTherapeuticType(app: App): CompareCell {
  const n = narrativeFor(app)
  const fromNarrative = n?.decision_summary?.intervention_class
  const fromCatalogue = app.supervision_model ? supervisionLabels[app.supervision_model] : ''
  return text(pickStr(fromNarrative, fromCatalogue))
}

function getWhatItDoes(app: App): CompareCell {
  const n = narrativeFor(app)
  return text(pickStr(n?.decision_summary?.one_line_proposition, app.one_line_value_proposition))
}

function getProblemAddressed(app: App): CompareCell {
  const n = narrativeFor(app)
  return text(
    pickStr(
      firstSentence(n?.decision_summary?.pathway_problem),
      firstSentence(app.target_problem_statement),
    ),
  )
}

function getConditionsAndPathways(app: App): CompareCell {
  // Catalogue condition_tags already cover condition and pathway areas
  // (e.g. COPD, Pulmonary rehab, Cardiac rehabilitation) — omit free-text pathway lists.
  const tags = appConditionTags(app)
  return text(tags.length > 0 ? formatConditionLabels(tags) : NOT_STATED)
}

/* ------------------------------------------------------------------ */
/* Section 2 — Evidence and expected impact                           */
/* ------------------------------------------------------------------ */

function getNiceGuidanceCell(app: App): CompareCell {
  const n = narrativeFor(app)
  const evidenceDomain = n?.assurance_domains?.find((d) => d.domain === DTAC_DOMAIN.nice)
  return text(pickStr(evidenceDomain?.summary, getNiceGuidanceStatus(app)))
}

function getEconomicValue(app: App): CompareCell {
  const gap = marketPreviewGap(app)
  if (gap) return gap
  const n = narrativeFor(app)
  return text(pickStr(firstSentence(n?.commissioner_economics?.headline), getExpectedBenefit(app)))
}

/* ------------------------------------------------------------------ */
/* Section — NHS experience                                            */
/* ------------------------------------------------------------------ */

/** Short display name for compare: lead clause before an em/en dash, tidy common suffixes. */
function shortSiteName(site: string): string {
  let name = site.split(/\s+[—–]\s+|\s+-\s+/)[0]?.trim() ?? site.trim()
  name = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  name = name.replace(/\s+pilot$/i, '').trim()
  name = name
    .replace(/\s+NHS Foundation Trust$/i, ' NHS')
    .replace(/\s+NHS FT$/i, ' NHS')
    .replace(/\s+NHS Trust$/i, ' NHS')
    .replace(/\s+/g, ' ')
    .trim()
  // Avoid commas inside a site name so the site list stays scannable.
  return name.replace(/,/g, ' –')
}

/** Site count + short site names only, e.g. "6 Sites. Airedale NHS, Frimley ICS, …". */
function getWhereLiveCell(app: App): CompareCell {
  if (isMarketPreview(app)) return text('Not used in the NHS')
  const rows = getDeploymentRegister(app).filter((r) => r.status !== 'historic')
  const names = rows.map((r) => shortSiteName(r.site)).filter(Boolean)
  if (names.length === 0) return text(NOT_STATED)
  const n = names.length
  return text(`${n} Site${n === 1 ? '' : 's'}.\n${names.join(', ')}`)
}

/* ------------------------------------------------------------------ */
/* Section 4 — What it takes to run locally                            */
/* ------------------------------------------------------------------ */

function getClinicalModel(app: App): CompareCell {
  const n = narrativeFor(app)
  return text(pickStr(firstSentence(n?.implementation?.human_wrapper), getOnboardingCompareLine(app)))
}

function getWorkforce(app: App): CompareCell {
  const n = narrativeFor(app)
  return text(pickStr(firstSentence(n?.implementation?.workforce), firstSentence(app.local_wraparound_detail)))
}

function getTimeToDeploy(app: App): CompareCell {
  const n = narrativeFor(app)
  return text(firstSentence(n?.implementation?.timescale) || NOT_STATED)
}

function getServiceWrapCell(app: App): CompareCell {
  if (isMarketPreview(app)) {
    return text('Supplier-published coaching and monitoring. Not an NHS service wrap.')
  }
  return text(getServiceWrapYn(app))
}

/* ------------------------------------------------------------------ */
/* Section 5 — Assurance pack                                          */
/* ------------------------------------------------------------------ */

/**
 * Pack items for compare — DTAC order, matching the PDP assurance pack
 * (see lib/content/assuranceDomains.ts). Commercial readiness is no longer
 * part of the pack.
 */
export const ASSURANCE_PACK_ITEMS = [
  DTAC_DOMAIN.clinicalSafety,
  DTAC_DOMAIN.dataProtection,
  DTAC_DOMAIN.technicalSecurity,
  DTAC_DOMAIN.interoperability,
  DTAC_DOMAIN.usability,
  DTAC_DOMAIN.nice,
  DTAC_DOMAIN.dtacForm,
] as const

const ASSURANCE_STATUS_META: Record<AssuranceDomainStatus, { label: string; colour: CompareTagColour }> = {
  verified_current: { label: 'Available', colour: 'green' },
  verified_review_due: { label: 'Review due', colour: 'yellow' },
  declared_pending: { label: 'Incomplete', colour: 'blue' },
  incomplete: { label: 'Incomplete', colour: 'red' },
  expired: { label: 'Expired', colour: 'red' },
  not_applicable: { label: 'Not applicable', colour: 'grey' },
}

function resolveAssuranceDomains(app: App): AssuranceDomain[] {
  const n = narrativeFor(app)
  if (n?.assurance_domains && n.assurance_domains.length > 0) return n.assurance_domains
  return deriveAssuranceDomains(app)
}

/**
 * Shorten PDP interoperability copy for compare scanning:
 * "FHIR integration available. EMIS integration available. NHS Notify supported. API …"
 * → "FHIR, EMIS, NHS Notify, API."
 */
function shortenInteropSummary(summary: string): string {
  const drop =
    /outcome data exportable for commissioner reporting\.?|confirm local epr integration requirements with supplier\.?/i

  const sentences = summary
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !drop.test(s))

  const capabilities: string[] = []
  const remainder: string[] = []

  for (const sentence of sentences) {
    const capability =
      sentence.match(/^(.+?)\s+integration available\.?$/i)?.[1] ??
      sentence.match(/^(.+?)\s+supported\.?$/i)?.[1]
    if (capability) {
      capabilities.push(capability.trim())
    } else {
      remainder.push(sentence)
    }
  }

  const head = capabilities.length > 0 ? `${capabilities.join(', ')}.` : ''
  return [head, ...remainder].filter(Boolean).join(' ').trim()
}

function getAssurancePackCell(app: App, item: string): CompareCell {
  const domain = resolveAssuranceDomains(app).find((d) => d.domain === item)
  if (!domain) return text(NOT_STATED)

  const { label: status, colour } = ASSURANCE_STATUS_META[domain.status]
  let detail = domain.summary?.trim() ?? ''
  if (item === 'Interoperability' && detail) {
    detail = shortenInteropSummary(detail)
  }
  if (!detail) return { kind: 'status_detail', status, colour, detail: '', missing: true }
  return { kind: 'status_detail', status, colour, detail }
}

/* ------------------------------------------------------------------ */
/* Section 6 — Cost and commercial route                               */
/* ------------------------------------------------------------------ */

function getIndicativeCost(app: App): CompareCell {
  const gap = marketPreviewGap(app)
  if (gap) return gap
  const n = narrativeFor(app)
  return text(pickStr(n?.commercial_readiness?.price_summary, getIndicativePriceShort(app)))
}

function getCommercialModel(app: App): CompareCell {
  const gap = marketPreviewGap(app)
  if (gap) return gap
  const n = narrativeFor(app)
  return text(pickStr(n?.commercial_readiness?.proposition_type, getPricingModelDisplay(app)))
}

function getProcurementRoute(app: App): CompareCell {
  const gap = marketPreviewGap(app)
  if (gap) return gap
  const n = narrativeFor(app)
  return text(pickStr(n?.commercial_readiness?.route_status))
}

function getFundingLevers(app: App): CompareCell {
  const gap = marketPreviewGap(app)
  if (gap) return gap
  const n = narrativeFor(app)
  const levers = n?.commissioner_economics?.funding_levers ?? []
  if (levers.length > 0) {
    return text(levers.slice(0, 3).map((l) => l.label).join(' · '))
  }
  return text(getFundingEligibility(app))
}

function getProductProfileLink(app: App): CompareCell {
  return { kind: 'link', label: `View ${app.short_name ?? app.app_name} page`, href: `/apps/${app.slug}` }
}

/* ------------------------------------------------------------------ */
/* Table inventory                                                     */
/* ------------------------------------------------------------------ */

export const COMPARE_TABLE_SECTIONS: CompareTableSectionDef[] = [
  {
    id: 'what-it-is',
    caption: "What it is and who it's for",
    rows: [
      { key: 'therapeutic_type', label: 'Therapeutic type', getCell: getTherapeuticType },
      { key: 'what_it_does', label: 'What it does', getCell: getWhatItDoes },
      { key: 'problem', label: 'Problem it addresses', getCell: getProblemAddressed },
      { key: 'conditions', label: 'Conditions and pathways', getCell: getConditionsAndPathways },
    ],
  },
  {
    id: 'evidence-impact',
    caption: 'Evidence and expected impact',
    rows: [
      { key: 'nice', label: 'NICE guidance', getCell: getNiceGuidanceCell },
      { key: 'economic_value', label: 'Expected economic value', getCell: getEconomicValue },
    ],
  },
  {
    id: 'assurance',
    caption: 'Assurance',
    rows: ASSURANCE_PACK_ITEMS.map((item) => ({
      key: `assurance_${item.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      label: item,
      getCell: (app: App) => getAssurancePackCell(app, item),
    })),
  },
  {
    id: 'run-locally',
    caption: 'What it takes to work locally',
    rows: [
      { key: 'clinical_model', label: 'Clinical model', getCell: getClinicalModel },
      { key: 'workforce', label: 'Workforce', getCell: getWorkforce },
      { key: 'time_to_deploy', label: 'Time to deploy', getCell: getTimeToDeploy },
      { key: 'service_wrap', label: 'Service wrap included', getCell: getServiceWrapCell },
    ],
  },
  {
    id: 'nhs-experience',
    caption: 'NHS experience',
    rows: [
      { key: 'where_live', label: "Where it's live", getCell: getWhereLiveCell },
    ],
  },
  {
    id: 'cost-commercial',
    caption: 'Cost and commercial route',
    rows: [
      { key: 'indicative_cost', label: 'Indicative cost', getCell: getIndicativeCost },
      { key: 'commercial_model', label: 'Commercial model', getCell: getCommercialModel },
      { key: 'procurement_route', label: 'Procurement route', getCell: getProcurementRoute },
      { key: 'funding_levers', label: 'Funding levers', getCell: getFundingLevers },
      { key: 'product_profile', label: 'Product page', getCell: getProductProfileLink },
    ],
  },
]
