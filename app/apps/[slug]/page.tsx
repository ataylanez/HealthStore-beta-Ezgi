import { getAllAppsUnfiltered, getAppBySlug } from '@/lib/data'
import { getCommissioningSnapshot } from '@/lib/commissioningSnapshot'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import { resolveProductNarrative, getProductNarrative } from '@/lib/content/productNarratives'
import PdpNarrativeSpine from '@/components/product/PdpNarrativeSpine'
import PdpLocalValue from '@/components/product/PdpLocalValue'
import PdpAssurancePassport from '@/components/product/PdpAssurancePassport'
import PdpImplementation from '@/components/product/PdpImplementation'
import PdpNhsExperience from '@/components/product/PdpNhsExperience'
import PdpResources from '@/components/product/PdpResources'
import PdpExpressInterestCallout from '@/components/product/PdpExpressInterestCallout'
import PdpFundingLevers from '@/components/product/PdpFundingLevers'
import { getServerContext } from '@/lib/context/serverContext'
import { PdpCommissioningSnapshot } from '@/components/PdpCommissioningSnapshot'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  DtacBadge, MaturityBadge, EffortBadge,
  SupervisionBadge, ConditionTag, AlertBox
} from '@/components/Badges'
import { CompareToggleButton } from '@/components/CompareToggleButton'
import { STORE_ACCENT } from '@/lib/storeAccent'
import { PdpSharePrintProvider, PdpShareRegion } from '@/components/PdpSharePrintContext'
import { DeviceClassDetails } from '@/components/DeviceClassDetails'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import PdpSupplierContactCard from '@/components/PdpSupplierContactCard'
import PdpOnThisPage from '@/components/PdpOnThisPage'
import { buildPdpOnThisPageLinks } from '@/lib/pdpOnThisPage'

export async function generateStaticParams() {
  return getAllAppsUnfiltered().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const app = getAppBySlug(slug)
  return { title: app ? `${app.app_name} — NHS HealthStore` : 'Not found' }
}

export default async function AppPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const app = getAppBySlug(slug)
  if (!app) notFound()

  // Round 2 content migration: commissioner context drives the personalised
  // local-value block. Prefer the guided-start cookie; only honour URL params
  // when an explicit geography override is present so unrelated query strings
  // (share tokens etc.) don't reset personalisation to the national baseline.
  const sp = await searchParams
  const commissionerContext = await getServerContext(
    typeof sp?.geo === 'string' ? sp : undefined
  )

  const accent = STORE_ACCENT
  const showPdpFactsGrid = false

  // Content migration (hybrid page): fold the curated narrative spine onto the canonical PDP.
  // Round 3 (R3-4 D) replaces the Luscii-only gate with data-driven gating: any product with a
  // curated narrative gets the spine + assurance passport; the local-value block self-gates to
  // COPD, and other products keep the reference-only layout.
  const narrative = resolveProductNarrative(slug, app)
  const showNarrativeSpine = getProductNarrative(slug) != null
  const heroProposition =
    (showNarrativeSpine && narrative.decision_summary?.one_line_proposition) || app.one_line_value_proposition

  const linkedFundingIds = app.linked_funding_ids ?? app.funding_ids ?? []
  const commissioningCards = getCommissioningSnapshot(
    app,
    showNarrativeSpine
      ? { commercialHref: '#how-to-buy', interopHref: '#resources', demoHref: '#resources' }
      : undefined,
  )
  const showLocalValue = showNarrativeSpine && (app.condition_tags?.includes('copd') ?? false)
  const hasNhsExperience =
    showNarrativeSpine &&
    (getDeploymentRegister(app).length > 0 || (app.case_studies?.length ?? 0) > 0)

  const onThisPageLinks = buildPdpOnThisPageLinks({
    app,
    narrative: showNarrativeSpine ? narrative : null,
    showNarrativeSpine,
    showLocalValue,
    hasLinkedFunding: linkedFundingIds.length > 0,
    context: commissionerContext,
  })

  const hasPdpAlerts =
    !!app.clinical_safety_alert ||
    app.dtac_status === 'required_not_confirmed'

  return (
      <div className="hs-pdp">
        <PdpSharePrintProvider>
        <div className="hs-pdp-top">
        <div className="hs-page">
        <PdpShareRegion shareKey="breadcrumb" label="Browse trail" excludeFromShareUi className="mb-4">
          <PageBreadcrumb
            items={[
              { label: 'Product catalogue', href: '/catalogue' },
              { label: 'Digital therapeutics', href: '/catalogue/digital-therapeutics' },
              { label: app.app_name },
            ]}
          />
        </PdpShareRegion>

        <PdpShareRegion
          shareKey="hero"
          label="DTx app summary"
          description="Supplier, proposition, and actions."
          className="mb-4"
        >
        <div className="overflow-visible">
            <div className="w-full min-w-0">
              <div className="flex items-start gap-4 mb-2">
                {app.logo_path && (
                  <Image src={app.logo_path} alt={`${app.app_name} logo`} width={48} height={48}
                    className="rounded-lg flex-shrink-0" />
                )}
                <div>
                  <h1 className="page-title-h1 mb-1">{app.app_name}</h1>
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>{app.supplier_name}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(app.condition_tags ?? []).map((t: string) => (
                  <ConditionTag key={t} tag={t} />
                ))}
                {app.supervision_model ? <SupervisionBadge model={app.supervision_model} /> : null}
                <MaturityBadge level={app.maturity_level} hideEstablished />
                {app.content_confidence && app.content_confidence !== 'Confirmed' && (
                  <span className={`badge ${app.content_confidence === 'Supplier-reported' ? 'badge-blue' : 'badge-amber'}`}>
                    {app.content_confidence}
                  </span>
                )}
              </div>
              <p
                className="min-w-0 max-w-[640px] mb-4"
                style={{ fontSize: 'var(--text-body)', lineHeight: 1.7, color: 'var(--text-secondary)' }}
              >
                {heroProposition}
              </p>
            </div>
            <div className="mt-8 mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={`/apps/${app.slug}/express-interest`}
                className="nhsuk-button mb-0 inline-flex items-center justify-center gap-2 align-top max-sm:mb-2 max-sm:w-full px-6 py-4 hs-text-label hs-font-bold no-underline"
              >
                Get in touch
              </Link>
              <CompareToggleButton
                appId={app.id}
                solid
                size="none"
                className="px-6 py-4 hs-text-label hs-font-bold"
              />
            </div>
        </div>
        </PdpShareRegion>

        {hasPdpAlerts ? (
          <PdpShareRegion shareKey="alerts" label="Alerts and notices" excludeFromShareUi className="mb-6 space-y-6">
            {app.clinical_safety_alert && <div><AlertBox type="danger"><strong>Clinical safety: </strong>{app.clinical_safety_alert}</AlertBox></div>}
            {app.dtac_status === 'required_not_confirmed' && <div><AlertBox type="danger"><strong>DTAC not confirmed: </strong>{app.dtac_note}</AlertBox></div>}
          </PdpShareRegion>
        ) : null}

        <div className="mb-6 space-y-4">
          {showPdpFactsGrid ? (
          <PdpShareRegion
            shareKey="sidebar-summary"
            label="Quick facts, assurance and sources"
            description="Device class, assurance statements, supplier email, product tiers, and how this profile was sourced."
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >

            <div className="hs-surface-card-sm bg-white rounded-xl border p-6" style={{ borderColor: 'var(--border)' }}>
              <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Quick facts</div>
              <div className="space-y-4 hs-text-label">
                <div>
                  <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Maturity</div>
                  <MaturityBadge level={app.maturity_level} />
                </div>
                <div>
                  <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Local effort</div>
                  <EffortBadge level={app.local_wraparound} />
                </div>
                <div>
                  <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Device class</div>
                  <div style={{ fontWeight: 600 }}>{app.device_class}</div>
                  {app.device_class_note && <div className="hs-text-caption mt-1" style={{ color: '#7A4800' }}>⚠ {app.device_class_note}</div>}
                  <DeviceClassDetails deviceClass={app.device_class} />
                </div>
                <div>
                  <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Supervision model</div>
                  <SupervisionBadge model={app.supervision_model} />
                </div>
                <div>
                  <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Target patients</div>
                  <div className="hs-text-caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{app.target_patients}</div>
                </div>
              </div>
            </div>

            <div className="hs-surface-card-sm bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: 'var(--border)' }}>
              <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Assurance</div>
              {[
                { label: 'DTAC', val: <DtacBadge status={app.dtac_status} /> },
                { label: 'DCB0129', val: app.dcb0129_status },
                { label: 'GDPR', val: app.gdpr_note?.split('.')[0] },
                { label: 'ISO 27001', val: app.iso27001 },
                { label: 'Cyber Essentials', val: app.cyber_essentials },
                { label: 'DSP Toolkit', val: app.dspt_status },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-2 hs-text-caption">
                  <span className="w-28 flex-shrink-0 hs-font-normal" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  {typeof r.val === 'string' ? <span style={{ color: 'var(--text-secondary)' }}>{r.val}</span> : r.val}
                </div>
              ))}
              {app.cyber_notes && (
                <div className="hs-text-caption p-2 rounded mt-2" style={{ background: '#FEF5E6', color: '#7A4800' }}>
                  {app.cyber_notes}
                </div>
              )}
            </div>

            <PdpSupplierContactCard email={app.supplier_contact_email} />

            {app.product_tiers?.length > 0 && (
              <div className="hs-surface-card-sm bg-white rounded-xl border p-6" style={{ borderColor: 'var(--border)' }}>
                <div className="hs-text-caption hs-font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Product tiers</div>
                {app.product_tiers.map((t: any) => (
                  <div key={t.tier_name} className="mb-4 last:mb-0">
                    <div className="hs-font-bold hs-text-label" style={{ color: accent }}>{t.tier_name}</div>
                    <div className="hs-text-caption mt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.description}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="hs-surface-card-sm rounded-lg p-4 hs-text-caption" style={{ background: '#F0F4F5', border: '1px solid var(--border)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Sources: </strong>{app.source_summary}
              <br /><br />
              {app.confidence_note}
            </div>
          </PdpShareRegion>
          ) : null}
        </div>

        <PdpShareRegion
          shareKey="commissioning-snapshot"
          label="Commissioning snapshot"
          description="Governance, pricing model, integration, and where it's live."
          className="hs-decision-snapshot"
        >
          <PdpCommissioningSnapshot
            cards={commissioningCards}
            whereLiveApp={app}
            whereLiveHref={hasNhsExperience ? '#nhs-experience' : undefined}
          />
        </PdpShareRegion>
        </div>
        </div>

        <div className="hs-page">
        <div className={onThisPageLinks.length >= 2 ? 'hs-pdp-with-sidebar' : undefined}>
          {onThisPageLinks.length >= 2 ? (
            <aside className="hs-pdp-with-sidebar__aside">
              <PdpOnThisPage links={onThisPageLinks} title={app.app_name} />
            </aside>
          ) : null}

          <div className="hs-pdp-with-sidebar__main">
            {showNarrativeSpine && (
              <PdpNarrativeSpine
                app={app}
                narrative={narrative}
                localValue={<PdpLocalValue app={app} narrative={narrative} context={commissionerContext} />}
                fundingLevers={<PdpFundingLevers narrative={narrative} fundingIds={linkedFundingIds} />}
                assurance={<PdpAssurancePassport app={app} narrative={narrative} />}
                implementation={<PdpImplementation app={app} narrative={narrative} />}
                nhsExperience={hasNhsExperience ? <PdpNhsExperience app={app} /> : undefined}
                resources={showNarrativeSpine ? <PdpResources app={app} /> : undefined}
                expressInterest={
                  <PdpShareRegion shareKey="express-interest" label="Express interest callout" excludeFromShareUi>
                    <PdpExpressInterestCallout accent={accent} slug={app.slug} />
                  </PdpShareRegion>
                }
              />
            )}

            <div className="space-y-4">
              {!showNarrativeSpine && (
              <PdpShareRegion shareKey="express-interest" label="Express interest callout" excludeFromShareUi>
              <div className="hs-surface-card-sm rounded-b-xl border overflow-hidden" style={{ borderColor: accent }}>
                <PdpExpressInterestCallout accent={accent} slug={app.slug} />
              </div>
              </PdpShareRegion>
              )}

            </div>
          </div>
        </div>
        </div>
        </PdpSharePrintProvider>
      </div>
  )
}
