import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import type { CommissionerContext } from '@/lib/context/types'
import { deriveAssuranceDomains } from '@/lib/content/assuranceDomains'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import { splitPdpEvidence } from '@/lib/pdpEvidence'
import { pdpSectionTitle, pdpPatientCohortLabel, resolvePdpLocalArea } from '@/lib/pdpSections'
import type { PdpSectionId } from '@/lib/pdpSections'

export type PdpOnThisPageLink = { id: string; label: string }

/**
 * Builds anchor links for the PDP "On this page" nav from the narrative spine sections.
 */
export function buildPdpOnThisPageLinks(input: {
  app: App
  narrative: ProductNarrative | null
  showNarrativeSpine: boolean
  showLocalValue: boolean
  hasLinkedFunding: boolean
  /** Commissioner context — needed to resolve the projected-impact area label. */
  context?: CommissionerContext
}): PdpOnThisPageLink[] {
  const { app, narrative, showNarrativeSpine, showLocalValue, hasLinkedFunding, context } = input
  const links: PdpOnThisPageLink[] = []

  // Labels come from the same title source as the rendered sections, so editing a
  // section title automatically updates its nav entry (single source of truth).
  const localArea = showLocalValue && context ? resolvePdpLocalArea(app, context) : null
  const push = (id: PdpSectionId) =>
    links.push({
      id,
      label: pdpSectionTitle(id, {
        appName: app.app_name,
        areaLabel: localArea?.areaLabel,
        isExample: localArea?.isExample,
        patientCohortLabel: pdpPatientCohortLabel(app.condition_tags),
      }),
    })

  const hasNhsExperience =
    showNarrativeSpine &&
    (getDeploymentRegister(app).length > 0 || (app.case_studies?.length ?? 0) > 0)
  // For narrative products the evidence record moves into the spine (Assurance
  // and evidence / NHS experience); the tab section only survives if leftovers remain.
  const evidenceSplit = splitPdpEvidence(app, { showNarrativeSpine, hasNhsExperience })

  if (showNarrativeSpine && narrative) {
    const problem = narrative.decision_summary?.pathway_problem
    const bullets = narrative.what_it_does_bullets ?? []
    const pathway = narrative.pathway_model

    if (problem) {
      push('the-problem')
    }
    if (bullets.length > 0 || pathway) {
      push('how-it-helps')
    }
    if (showLocalValue) {
      push('local-impact')
      push('local-value-worth')
    }
    const economics = narrative.commissioner_economics
    if ((economics?.funding_levers?.length ?? 0) > 0 || !!economics?.tariff_note?.trim() || hasLinkedFunding) {
      push('funding-levers')
    }
    const hasAssuranceEvidence =
      evidenceSplit.publications.length > 0 ||
      evidenceSplit.niceEvidence.length > 0 ||
      (app.nice_guidance_refs?.length ?? 0) > 0
    if (
      (narrative.assurance_domains?.length ?? 0) > 0 ||
      deriveAssuranceDomains(app).length > 0 ||
      hasAssuranceEvidence
    ) {
      push('assurance')
    }
    if (narrative.implementation) {
      push('implementation')
    }
    if (hasNhsExperience) {
      push('nhs-experience')
    }
    if (narrative.commercial_readiness) {
      push('how-to-buy')
    }
    push('resources')
  }

  return links
}
