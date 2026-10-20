import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAllAppsUnfiltered, getAppBySlug } from '@/lib/data'
import { getPdpPageModel, pdpSectionPath, type PdpSearchParams } from '@/lib/pdpPageModel'
import PdpFrame from '@/components/product/PdpFrame'
import PdpExpressInterestCallout from '@/components/product/PdpExpressInterestCallout'
import PdpOverviewSummary from '@/components/product/PdpOverviewSummary'
import { PdpCommissioningSnapshot } from '@/components/PdpCommissioningSnapshot'
import { overviewParagraphs, usesSummaryOverview } from '@/lib/pdpSummary'
import { MaturityBadge, SupervisionBadge, ConditionTag, AlertBox } from '@/components/Badges'
import { CompareToggleButton } from '@/components/CompareToggleButton'
import { STORE_ACCENT } from '@/lib/storeAccent'
import { isMarketPreview } from '@/lib/marketPreview'
import { PdpShareRegion } from '@/components/PdpSharePrintContext'

export async function generateStaticParams() {
  return getAllAppsUnfiltered().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const app = getAppBySlug(slug)
  return { title: app ? `${app.app_name} — NHS HealthStore` : 'Not found' }
}

/**
 * Product overview — hero, alerts and commissioning snapshot. The narrative
 * sections each live on their own page under /apps/[slug]/[section] and are
 * reached from the side nav (see app/apps/[slug]/[section]/page.tsx).
 */
export default async function AppPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<PdpSearchParams>
}) {
  const { slug } = await params
  const model = await getPdpPageModel(slug, await searchParams)
  if (!model) notFound()

  const { app, narrative, commissioningCards, hasNhsExperience, hasPdpAlerts, heroProposition, showNarrativeSpine, sections } = model
  const accent = STORE_ACCENT
  const marketPreview = isMarketPreview(app)
  // Summary-style overview (Luscii only for now): no action buttons or snapshot;
  // one short block per section page instead of the plain-English overview.
  const summaryOverview = usesSummaryOverview(app.slug) && showNarrativeSpine
  // Plain-English overview paragraphs from content/apps/{slug}.json (optional).
  const overview = summaryOverview ? [] : overviewParagraphs(app)

  return (
    <PdpFrame
      model={model}
      breadcrumb={[
        { label: 'Product catalogue', href: '/catalogue' },
        { label: 'Digital therapeutics', href: '/catalogue/digital-therapeutics' },
        { label: app.app_name },
      ]}
    >
      <PdpShareRegion
        shareKey="hero"
        label="DTx app summary"
        description="Supplier, proposition, and actions."
        className="mb-4"
      >
        {/* NHS page heading pattern: supplier as a caption above the H1 (heading-xl),
            then tags and the lede proposition in body text. */}
        <div className="overflow-visible">
          <div className="w-full min-w-0">
            <div className="flex items-start gap-4">
              {app.logo_path && (
                <Image src={app.logo_path} alt={`${app.app_name} logo`} width={48} height={48}
                  className="rounded-lg flex-shrink-0" />
              )}
              <h1 className="nhsuk-heading-xl nhsuk-u-margin-bottom-4">
                <span className="nhsuk-caption-xl">{app.supplier_name}</span>
                {app.app_name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 nhsuk-u-margin-bottom-4">
              {(app.condition_tags ?? []).map((t: string) => (
                <ConditionTag key={t} tag={t} />
              ))}
              {app.supervision_model ? <SupervisionBadge model={app.supervision_model} /> : null}
              {app.maturity_level ? <MaturityBadge level={app.maturity_level} hideEstablished /> : null}
              {app.content_confidence && app.content_confidence !== 'Confirmed' && (
                <span className={`badge ${app.content_confidence === 'Supplier-reported' ? 'badge-blue' : 'badge-amber'}`}>
                  {app.content_confidence}
                </span>
              )}
            </div>
            <p className="nhsuk-body-m" style={{ color: 'var(--text-secondary)' }}>
              {heroProposition}
            </p>
          </div>
          {!summaryOverview && (
            <div className="nhsuk-u-margin-top-5 nhsuk-u-margin-bottom-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {!marketPreview && (
                <Link
                  href={`/apps/${app.slug}/express-interest`}
                  className="nhsuk-button mb-0 inline-flex items-center justify-center gap-2 align-top max-sm:mb-2 max-sm:w-full no-underline"
                >
                  Get in touch
                </Link>
              )}
              <CompareToggleButton
                appId={app.id}
                solid
              />
            </div>
          )}
        </div>
      </PdpShareRegion>

      {hasPdpAlerts ? (
        <PdpShareRegion shareKey="alerts" label="Alerts and notices" excludeFromShareUi className="mb-6 space-y-6">
          {app.clinical_safety_alert && <div><AlertBox type="danger"><strong>Clinical safety: </strong>{app.clinical_safety_alert}</AlertBox></div>}
          {app.dtac_status === 'required_not_confirmed' && <div><AlertBox type="danger"><strong>DTAC not confirmed: </strong>{app.dtac_note}</AlertBox></div>}
        </PdpShareRegion>
      ) : null}

      {summaryOverview ? (
        <PdpOverviewSummary app={app} narrative={narrative} sections={sections} />
      ) : marketPreview ? null : (
        <PdpShareRegion
          shareKey="commissioning-snapshot"
          label="Commissioning snapshot"
          description="Governance, pricing model, integration, and where it's live."
          className="hs-decision-snapshot mb-6"
        >
          <PdpCommissioningSnapshot
            cards={commissioningCards}
            whereLiveApp={app}
            whereLiveHref={hasNhsExperience ? pdpSectionPath(app.slug, 'nhs-experience') : undefined}
          />
        </PdpShareRegion>
      )}

      {overview.length > 0 && (
        <PdpShareRegion
          shareKey="overview"
          label={`Overview of ${app.app_name}`}
          description="Plain-English summary for buyers and commissioners."
          className="mb-8"
        >
          <section aria-labelledby="pdp-overview-heading">
            <h2 id="pdp-overview-heading" className="nhsuk-heading-l hs-pdp-heading">
              Overview of {app.app_name}
            </h2>
            {overview.map((paragraph, i) => (
              <p
                key={i}
                className={`nhsuk-body-m ${i < overview.length - 1 ? '' : 'nhsuk-u-margin-bottom-0'}`}
                style={{ color: 'var(--text-secondary)' }}
              >
                {paragraph}
              </p>
            ))}
          </section>
        </PdpShareRegion>
      )}

      {!showNarrativeSpine && (
        <PdpShareRegion shareKey="express-interest" label="Express interest callout" excludeFromShareUi>
          <div className="hs-surface-card-sm rounded-b-xl border overflow-hidden" style={{ borderColor: accent }}>
            <PdpExpressInterestCallout accent={accent} slug={app.slug} />
          </div>
        </PdpShareRegion>
      )}
    </PdpFrame>
  )
}
