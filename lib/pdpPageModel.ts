import type { App } from '@/lib/data'
import { getAppBySlug } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import type { CommissionerContext } from '@/lib/context/types'
import { getServerContext } from '@/lib/context/serverContext'
import { getCommissioningSnapshot, type CommissioningSnapshotCard } from '@/lib/commissioningSnapshot'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import { getProductNarrative, resolveProductNarrative } from '@/lib/content/productNarratives'
import { buildPdpSectionLinks, type PdpSectionLink } from '@/lib/pdpOnThisPage'
import { isMarketPreview } from '@/lib/marketPreview'
import { productSummary } from '@/lib/pdpSummary'

export type PdpSearchParams = Record<string, string | string[] | undefined>

/**
 * Everything the PDP overview and section routes need to render a product,
 * resolved once so both routes agree on gating, links and context.
 */
export type PdpPageModel = {
  app: App
  commissionerContext: CommissionerContext
  narrative: ProductNarrative
  /** True when the product has a curated narrative (sections + side nav). */
  showNarrativeSpine: boolean
  showLocalValue: boolean
  hasNhsExperience: boolean
  linkedFundingIds: string[]
  commissioningCards: CommissioningSnapshotCard[]
  hasPdpAlerts: boolean
  heroProposition: string
  /** Section pages for this product (empty for reference-only products). */
  sections: PdpSectionLink[]
}

/** Base path for a product's pages. */
export function pdpBasePath(slug: string): string {
  return `/apps/${slug}`
}

/** Path to a product section page. */
export function pdpSectionPath(slug: string, sectionId: string): string {
  return `${pdpBasePath(slug)}/${sectionId}`
}

/**
 * Resolves the PDP model for a slug. Returns null when the product does not exist.
 *
 * Commissioner context drives the personalised local-value block. Prefer the
 * guided-start cookie; only honour URL params when an explicit geography
 * override is present so unrelated query strings (share tokens etc.) don't
 * reset personalisation to the national baseline.
 */
export async function getPdpPageModel(
  slug: string,
  searchParams?: PdpSearchParams,
): Promise<PdpPageModel | null> {
  const app = getAppBySlug(slug)
  if (!app) return null

  const commissionerContext = await getServerContext(
    typeof searchParams?.geo === 'string' ? searchParams : undefined,
  )

  const narrative = resolveProductNarrative(slug, app)
  const showNarrativeSpine = getProductNarrative(slug) != null
  const heroProposition = productSummary(app, showNarrativeSpine ? narrative : null)

  const marketPreview = isMarketPreview(app)
  const linkedFundingIds: string[] = marketPreview ? [] : (app.linked_funding_ids ?? app.funding_ids ?? [])
  const showLocalValue =
    showNarrativeSpine && !marketPreview && (app.condition_tags?.includes('copd') ?? false)
  const hasNhsExperience =
    showNarrativeSpine &&
    (getDeploymentRegister(app).length > 0 || (app.case_studies?.length ?? 0) > 0)

  const sections = buildPdpSectionLinks({
    app,
    narrative: showNarrativeSpine ? narrative : null,
    showNarrativeSpine,
    showLocalValue,
    hasLinkedFunding: linkedFundingIds.length > 0,
    context: commissionerContext,
  })
  const hasSection = (id: string) => sections.some((s) => s.id === id)

  const commissioningCards = getCommissioningSnapshot(
    app,
    showNarrativeSpine
      ? {
          commercialHref: hasSection('how-to-buy') ? pdpSectionPath(slug, 'how-to-buy') : undefined,
          interopHref: hasSection('resources') ? pdpSectionPath(slug, 'resources') : undefined,
          demoHref: hasSection('resources') ? pdpSectionPath(slug, 'resources') : undefined,
          governanceHref: hasSection('assurance') ? pdpSectionPath(slug, 'assurance') : undefined,
        }
      : undefined,
  )

  const hasPdpAlerts = !!app.clinical_safety_alert || app.dtac_status === 'required_not_confirmed'

  return {
    app,
    commissionerContext,
    narrative,
    showNarrativeSpine,
    showLocalValue,
    hasNhsExperience,
    linkedFundingIds,
    commissioningCards,
    hasPdpAlerts,
    heroProposition,
    sections,
  }
}
