import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getAllAppsUnfiltered, getAppBySlug, type App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import type { CommissionerContext } from '@/lib/context/types'
import { getPdpPageModel, pdpBasePath, type PdpSearchParams } from '@/lib/pdpPageModel'
import { buildPdpSectionLinks, getPdpSection } from '@/lib/pdpOnThisPage'
import { PDP_SECTION_IDS, type PdpSectionId } from '@/lib/pdpSections'
import { getProductNarrative, resolveProductNarrative } from '@/lib/content/productNarratives'
import { isMarketPreview } from '@/lib/marketPreview'
import { STORE_ACCENT } from '@/lib/storeAccent'
import PdpFrame from '@/components/product/PdpFrame'
import { PdpSectionHeadingProvider } from '@/components/PdpSection'
import { PdpShareRegion } from '@/components/PdpSharePrintContext'
import PdpProblem from '@/components/product/PdpProblem'
import PdpHowItHelps from '@/components/product/PdpHowItHelps'
import PdpLocalValue from '@/components/product/PdpLocalValue'
import PdpFundingLevers from '@/components/product/PdpFundingLevers'
import PdpAssurancePassport from '@/components/product/PdpAssurancePassport'
import PdpImplementation from '@/components/product/PdpImplementation'
import PdpNhsExperience from '@/components/product/PdpNhsExperience'
import PdpHowToBuy from '@/components/product/PdpHowToBuy'
import PdpResources from '@/components/product/PdpResources'
import PdpExpressInterestCallout from '@/components/product/PdpExpressInterestCallout'

type Params = { slug: string; section: string }

/**
 * Only products with a curated narrative have section pages. local-value-worth
 * shares the local-impact page, so it is not a route of its own.
 */
export async function generateStaticParams() {
  const sectionIds = PDP_SECTION_IDS.filter((id) => id !== 'local-value-worth')
  return getAllAppsUnfiltered()
    .filter((a) => getProductNarrative(a.slug) != null)
    .flatMap((a) => sectionIds.map((section) => ({ slug: a.slug, section })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, section } = await params
  const app = getAppBySlug(slug)
  if (!app || getProductNarrative(slug) == null) return { title: 'Not found' }

  // Label lookup without commissioner context — the page itself re-resolves with it.
  const links = buildPdpSectionLinks({
    app,
    narrative: resolveProductNarrative(slug, app),
    showNarrativeSpine: true,
    showLocalValue: !isMarketPreview(app) && (app.condition_tags?.includes('copd') ?? false),
    hasLinkedFunding: !isMarketPreview(app) && (app.linked_funding_ids ?? app.funding_ids ?? []).length > 0,
  })
  const match = getPdpSection(links, section)
  return { title: match ? `${match.label} — ${app.app_name} — NHS HealthStore` : 'Not found' }
}

/**
 * One product section per page. The section's title is the H1 (with the
 * product name as a caption); the side nav links between sections.
 */
export default async function AppSectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<PdpSearchParams>
}) {
  const { slug, section } = await params
  const model = await getPdpPageModel(slug, await searchParams)
  if (!model) notFound()

  const current = getPdpSection(model.sections, section)
  if (!current) notFound()

  const { app, narrative, commissionerContext, linkedFundingIds, hasNhsExperience } = model

  const expressInterest = (
    <PdpShareRegion shareKey="express-interest" label="Express interest callout" excludeFromShareUi>
      <PdpExpressInterestCallout accent={STORE_ACCENT} slug={app.slug} />
    </PdpShareRegion>
  )

  return (
    <PdpFrame
      model={model}
      breadcrumb={[
        { label: 'Product catalogue', href: '/catalogue' },
        { label: 'Digital therapeutics', href: '/catalogue/digital-therapeutics' },
        { label: app.app_name, href: pdpBasePath(app.slug) },
        { label: current.label },
      ]}
    >
      <PdpSectionHeadingProvider value={{ h1SectionId: current.id, caption: app.app_name }}>
        <SectionContent
          id={current.id}
          app={app}
          narrative={narrative}
          context={commissionerContext}
          linkedFundingIds={linkedFundingIds}
          hasNhsExperience={hasNhsExperience}
          expressInterest={expressInterest}
        />
      </PdpSectionHeadingProvider>
    </PdpFrame>
  )
}

function SectionContent({
  id,
  app,
  narrative,
  context,
  linkedFundingIds,
  hasNhsExperience,
  expressInterest,
}: {
  id: PdpSectionId
  app: App
  narrative: ProductNarrative
  context: CommissionerContext
  linkedFundingIds: string[]
  hasNhsExperience: boolean
  expressInterest: ReactNode
}) {
  switch (id) {
    case 'the-problem':
      return <PdpProblem app={app} narrative={narrative} />
    case 'how-it-helps':
      return <PdpHowItHelps app={app} narrative={narrative} />
    case 'local-impact':
    case 'local-value-worth':
      return <PdpLocalValue app={app} narrative={narrative} context={context} />
    case 'funding-levers':
      return <PdpFundingLevers narrative={narrative} fundingIds={linkedFundingIds} />
    case 'assurance':
      return <PdpAssurancePassport app={app} narrative={narrative} />
    case 'implementation':
      return <PdpImplementation app={app} narrative={narrative} />
    case 'nhs-experience':
      return hasNhsExperience ? <PdpNhsExperience app={app} /> : null
    case 'how-to-buy':
      return <PdpHowToBuy app={app} narrative={narrative} expressInterest={expressInterest} />
    case 'resources':
      return <PdpResources app={app} />
  }
}
