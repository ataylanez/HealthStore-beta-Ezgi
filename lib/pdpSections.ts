import type { App } from '@/lib/data'
import type { CommissionerContext } from '@/lib/context/types'
import { getLocalReferenceData } from '@/lib/localData/referenceData'
import type { IcbReferenceData } from '@/lib/content/productModel'

/**
 * Single source of truth for PDP narrative-spine section titles.
 *
 * Both the rendered sections (PdpProblem, PdpHowItHelps, PdpLocalValue, PdpFundingLevers,
 * PdpAssurancePassport, PdpImplementation, PdpNhsExperience, PdpHowToBuy, PdpResources)
 * and the left-hand section nav (lib/pdpOnThisPage.ts) read titles from here, so a
 * title change on the page automatically flows through to the nav label.
 * Each id is also the URL segment of that section's page: /apps/[slug]/[id].
 */

export type PdpSectionId =
  | 'the-problem'
  | 'how-it-helps'
  | 'local-impact'
  | 'local-value-worth'
  | 'funding-levers'
  | 'assurance'
  | 'implementation'
  | 'nhs-experience'
  | 'how-to-buy'
  | 'resources'

/** Every section id, in reading order. Also the set of valid /apps/[slug]/[section] segments. */
export const PDP_SECTION_IDS: readonly PdpSectionId[] = [
  'the-problem',
  'how-it-helps',
  'local-impact',
  'local-value-worth',
  'funding-levers',
  'assurance',
  'implementation',
  'nhs-experience',
  'how-to-buy',
  'resources',
]

export type PdpSectionTitleContext = {
  /** Product name, for titles that interpolate it (e.g. "How {app} changes a treatment pathway"). */
  appName?: string
  /** Resolved local-area label for the projected-impact section. */
  areaLabel?: string
  /** Whether the local-value block is showing an example (no area set) cohort. */
  isExample?: boolean
  /** Patient cohort noun for local-impact titles: "COPD" or "cardiac". */
  patientCohortLabel?: 'COPD' | 'cardiac'
}

/**
 * Maps product condition tags to the patient cohort noun used in local-impact titles.
 * myHeart (cardiac_rehab) → cardiac; Luscii / myCOPD (copd) → COPD.
 */
export function pdpPatientCohortLabel(
  conditionTags?: string[] | null,
): 'COPD' | 'cardiac' | undefined {
  if (!conditionTags?.length) return undefined
  if (conditionTags.includes('cardiac_rehab')) return 'cardiac'
  if (conditionTags.includes('copd')) return 'COPD'
  return undefined
}

/**
 * Canonical title for a PDP section. Edit here (or the interpolation) and both the
 * section heading and its nav entry update together.
 */
export function pdpSectionTitle(id: PdpSectionId, ctx: PdpSectionTitleContext = {}): string {
  const appName = ctx.appName ?? 'this product'
  switch (id) {
    case 'the-problem':
      return `The problem ${appName} addresses`
    case 'how-it-helps':
      return `How ${appName} changes a treatment pathway`
    case 'local-impact': {
      const cohort = ctx.patientCohortLabel
      return cohort
        ? `What using ${appName} could mean for ${cohort} patients`
        : `What using ${appName} could mean for patients`
    }
    case 'local-value-worth':
      return 'What it could be worth'
    case 'funding-levers':
      return 'Funding levers and tariff alignment'
    case 'assurance':
      return 'Assurance and evidence'
    case 'implementation':
      return 'Making it work at your site'
    case 'nhs-experience':
      return 'NHS experience'
    case 'how-to-buy':
      return 'How to commission and procure'
    case 'resources':
      return 'Resources'
  }
}

// When no area is set we still show fully-worked local-value sections, projecting
// onto the NHSE Average ICB (clearly labelled as an example) rather than a teaser.
export const PDP_DEMO_CONTEXT: CommissionerContext = {
  geography_type: 'icb',
  geography_id: 'GEN',
  geography_label: 'NHSE Average ICB',
  scenario_id: 'central',
}

export type PdpLocalArea = {
  areaLabel: string
  isExample: boolean
  ref: IcbReferenceData
}

/**
 * Resolves the local-value area for a product + commissioner context. Shared by
 * PdpLocalValue (for its figures) and the nav builder (for the projected-impact
 * label), so both agree on the area name and example/real state. Returns null when
 * the local-value block does not apply (non-COPD or no reference data).
 */
export function resolvePdpLocalArea(app: App, context: CommissionerContext): PdpLocalArea | null {
  // Scope guard: the ROI model is COPD-specific (R2-7 A).
  if (!app.condition_tags?.includes('copd')) return null

  const localRef = getLocalReferenceData(context)
  const isLocal = context.geography_type !== 'national' && !!context.geography_id && !!localRef
  const effectiveContext = isLocal ? context : PDP_DEMO_CONTEXT
  const ref = isLocal ? localRef! : getLocalReferenceData(PDP_DEMO_CONTEXT)
  if (!ref) return null

  return {
    areaLabel: effectiveContext.geography_label,
    isExample: !isLocal,
    ref,
  }
}
