import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import type { CommissionerContext } from '@/lib/context/types'
import { deriveAssuranceDomains } from '@/lib/content/assuranceDomains'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import { splitPdpEvidence } from '@/lib/pdpEvidence'
import { isMarketPreview } from '@/lib/marketPreview'
import { pdpSectionTitle, pdpPatientCohortLabel, resolvePdpLocalArea } from '@/lib/pdpSections'
import type { PdpSectionId } from '@/lib/pdpSections'

/** A product section that lives on its own page under /apps/[slug]/[id]. */
export type PdpSectionLink = { id: PdpSectionId; label: string; href: string }

/**
 * Builds the list of section pages for a product, in reading order. Each entry
 * becomes a route (/apps/[slug]/[id]) and a side-nav link.
 *
 * Labels come from the same title source as the rendered sections, so editing a
 * section title automatically updates its nav entry (single source of truth).
 * The two local-value sections share one page (local-impact) with a merged label.
 */
export function buildPdpSectionLinks(input: {
  app: App
  narrative: ProductNarrative | null
  showNarrativeSpine: boolean
  showLocalValue: boolean
  hasLinkedFunding: boolean
  /** Commissioner context — needed to resolve the projected-impact area label. */
  context?: CommissionerContext
}): PdpSectionLink[] {
  const { app, narrative, showNarrativeSpine, showLocalValue, hasLinkedFunding, context } = input
  const links: PdpSectionLink[] = []

  const localArea = showLocalValue && context ? resolvePdpLocalArea(app, context) : null
  const push = (id: PdpSectionId, label?: string) =>
    links.push({
      id,
      href: `/apps/${app.slug}/${id}`,
      label:
        label ??
        pdpSectionTitle(id, {
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
    // Limited market view keeps the problem only. Pathway, assurance and
    // implementation stay off the page so it does not read as a product you can adopt.
    if (!isMarketPreview(app) && (bullets.length > 0 || pathway)) {
      push('how-it-helps')
    }
    if (showLocalValue) {
      push('local-impact', `${app.app_name}'s local impact and worth`)
    }
    const economics = narrative.commissioner_economics
    if (
      !isMarketPreview(app) &&
      ((economics?.funding_levers?.length ?? 0) > 0 || !!economics?.tariff_note?.trim() || hasLinkedFunding)
    ) {
      push('funding-levers')
    }
    const hasAssuranceEvidence =
      evidenceSplit.publications.length > 0 ||
      evidenceSplit.niceEvidence.length > 0 ||
      (app.nice_guidance_refs?.length ?? 0) > 0
    if (
      !isMarketPreview(app) &&
      ((narrative.assurance_domains?.length ?? 0) > 0 ||
        deriveAssuranceDomains(app).length > 0 ||
        hasAssuranceEvidence)
    ) {
      push('assurance')
    }
    if (!isMarketPreview(app) && narrative.implementation) {
      push('implementation')
    }
    if (hasNhsExperience) {
      push('nhs-experience')
    }
    if (!isMarketPreview(app) && narrative.commercial_readiness) {
      push('how-to-buy')
    }
    const hasResources =
      (app.product_videos?.length ?? 0) > 0 || app.catalogue_demo_available === true
    if (!isMarketPreview(app) || hasResources) {
      push('resources')
    }
  }

  return links
}

/** Finds a section by its URL segment; undefined when the product has no such page. */
export function getPdpSection(links: PdpSectionLink[], section: string): PdpSectionLink | undefined {
  return links.find((l) => l.id === section)
}
