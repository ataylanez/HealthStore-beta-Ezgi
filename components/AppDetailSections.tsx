import Link from 'next/link'
import {
  AlertBox,
  DtacBadge,
  EffortBadge,
  EvidenceBadge,
  FundingStatusBadge,
  MaturityBadge,
  SupervisionBadge,
} from '@/components/Badges'
import enumsData from '@/content/common/enums.json'
import ProductVideosSection from '@/components/ProductVideosSection'
import { DeviceClassDetails } from '@/components/DeviceClassDetails'
import { DeploymentRegisterTable } from '@/components/DeploymentRegisterTable'
import { getDeploymentRegister } from '@/lib/deploymentRegister'
import { CHECK_WITH_SUPPLIER, getCommissionerFacingFunding } from '@/lib/data'

export function TechnicalIntegrationTable({
  app,
  excludeLabels = [],
}: {
  app: any
  /** Row labels to omit (e.g. narrative Resources technical specification). */
  excludeLabels?: string[]
}) {
  const ti = app.technical_integrations
  const exclude = new Set(excludeLabels)
  const nhsLoginDisplay =
    app.nhs_login_integration === true
      ? 'Yes'
      : app.nhs_login_integration === false
        ? 'No'
        : 'Not confirmed'
  const nhsNotifyDisplay =
    app.nhs_notify_integration === true
      ? 'Yes'
      : app.nhs_notify_integration === false
        ? 'No'
        : 'Not confirmed'

  const platformTags: string[] = app.platform_tags ?? app.platforms ?? []
  const platformsDisplay =
    platformTags.length > 0 ? platformTags.join(', ') : 'iOS, Android, Web'

  const rows: { label: string; value: string | undefined }[] = [
    { label: 'Platforms', value: platformsDisplay },
  ]
  if (ti) {
    rows.push(
      { label: 'FHIR', value: ti.fhir },
      { label: 'EMIS', value: ti.emis },
    )
  }
  rows.push({ label: 'NHS Login', value: nhsLoginDisplay })
  rows.push({ label: 'NHS Notify', value: nhsNotifyDisplay })
  if (ti) {
    rows.push(
      { label: 'Population health dashboard', value: ti.population_health_dashboard ? 'Yes' : 'No' },
      { label: 'Device integration', value: ti.device_integration },
      { label: 'Languages', value: ti.languages?.join(', ') },
      { label: 'Data hosting', value: ti.data_hosting },
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full hs-text-label">
        <tbody>
          {rows.filter((r) => !exclude.has(r.label)).map(r => (
            <tr key={r.label} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <td className="py-2 pr-4 hs-font-bold w-56" style={{ color: 'var(--text-muted)' }}>{r.label}</td>
              <td className="py-2" style={{ color: r.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {r.value || 'Not confirmed'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ScaleAndMaturitySection({ app, showDeploymentRegister = true }: { app: any; showDeploymentRegister?: boolean }) {
  const deploymentRows = getDeploymentRegister(app)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-4 mb-6">
        <div
          className="rounded-lg px-4 py-2 hs-text-label w-fit"
          style={{ background: '#F0F4F5', border: '1px solid var(--border)' }}
        >
          <span className="hs-text-label hs-font-bold" style={{ color: 'var(--text-muted)' }}>Maturity </span>
          <MaturityBadge level={app.maturity_level} />
        </div>
        <div
          className="rounded-lg px-4 py-2 hs-text-label w-fit"
          style={{ background: '#F0F4F5', border: '1px solid var(--border)' }}
        >
          <span className="hs-text-label hs-font-bold" style={{ color: 'var(--text-muted)' }}>Evidence strength </span>
          <EvidenceBadge strength={app.evidence_strength} />
        </div>
      </div>
      <dl className="space-y-4 mb-6" style={{ color: 'var(--text-secondary)' }}>
        {app.evidence_strength_rationale && (
          <div>
            <dt className="hs-text-label hs-font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Evidence overview</dt>
            <dd className="nhsuk-body-m nhsuk-u-margin-bottom-0">{app.evidence_strength_rationale}</dd>
          </div>
        )}
        {app.patients_covered_note && (
          <div>
            <dt className="hs-text-label hs-font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Population reach</dt>
            <dd style={{ lineHeight: 1.6 }}>{app.patients_covered_note}</dd>
          </div>
        )}
      </dl>
      {showDeploymentRegister && (
        <div>
          <div className="hs-text-label hs-font-bold mb-4" style={{ color: 'var(--text-muted)' }}>Where it&apos;s live</div>
          <DeploymentRegisterTable rows={deploymentRows} />
        </div>
      )}
    </div>
  )
}

export function hasWhatItTakesContent(app: any) {
  return !!(
    app.onboarding_detail ||
    app.onboarding_model ||
    app.local_wraparound_detail ||
    app.local_wraparound ||
    app.training_note ||
    app.training_required ||
    app.supplier_wrap ||
    app.service_wrap_note ||
    app.service_wrap_included !== undefined ||
    (app.implementation_prerequisites?.length > 0) ||
    app.monitoring_note ||
    app.operating_hours_caveat ||
    app.escalation_note
  )
}

export function WhatItTakesLocallySection({ app, accent }: { app: any; accent: string }) {
  if (!hasWhatItTakesContent(app)) return null

  return (
    <div>
      {app.local_wraparound && (
        <div className="mb-4 flex flex-wrap items-center gap-2 hs-text-label">
          <span className="hs-text-label hs-font-bold" style={{ color: 'var(--text-muted)' }}>Local effort</span>
          <EffortBadge level={app.local_wraparound} />
        </div>
      )}
      {app.local_wraparound_detail && (
        <p className="nhsuk-body-m" style={{ color: 'var(--text-secondary)' }}>{app.local_wraparound_detail}</p>
      )}
      <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
        {app.onboarding_model && (
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Onboarding model:</strong>{' '}
            {String(app.onboarding_model).replace(/_/g, ' ')}
          </div>
        )}
        {app.onboarding_detail && (
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Onboarding:</strong> {app.onboarding_detail}
          </div>
        )}
        {(app.training_required || app.training_note) && (
          <div className="rounded-lg p-4" style={{ background: '#F0F4F5' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Training:</strong>{' '}
            {app.training_required ? 'Required. ' : ''}{app.training_note ?? ''}
          </div>
        )}
        {app.supplier_wrap && (
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Supplier wrap:</strong> {app.supplier_wrap}
          </div>
        )}
        {(app.service_wrap_included !== undefined || app.service_wrap_note) && (
          <div className="rounded-lg p-4" style={{ background: '#F0F4F5' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Service wrap:</strong>{' '}
            {app.service_wrap_included === true ? 'Included in offer. ' : app.service_wrap_included === false ? 'Not included by default. ' : ''}{app.service_wrap_note ?? ''}
          </div>
        )}
        {app.monitoring_note && (
          <div className="rounded-lg p-4" style={{ background: '#F0F4F5' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Monitoring:</strong> {app.monitoring_note}
          </div>
        )}
        {app.escalation_note && (
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Escalation:</strong> {app.escalation_note}
          </div>
        )}
        {app.operating_hours_caveat && (
          <div className="rounded-lg p-4" style={{ background: '#FEF5E6', color: '#7A4800' }}>
            <strong>Hours caveat:</strong> {app.operating_hours_caveat}
          </div>
        )}
      </div>
      {app.implementation_prerequisites?.length > 0 && (
        <div className="mt-6">
          <div className="hs-text-label hs-font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Prerequisites</div>
          <ul className="space-y-2">
            {app.implementation_prerequisites.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-1 flex-shrink-0" style={{ color: accent }}>✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Case study card — type tag, title, detail (setting, sample size, outcome), source footer.
 */
function CaseStudyCard({ caseStudy: cs, plain }: { caseStudy: any; plain?: boolean }) {
  const hasDetail = !!(cs.setting || cs.sample_size || cs.outcome)
  const typeLabel = cs.type_label ?? 'Case study'
  return (
    <article className={`hs-case-card${plain ? ' hs-case-card--publication' : ''}`}>
      {plain ? (
        <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>{typeLabel}</span>
      ) : (
        <span className="hs-case-card__pill">{typeLabel}</span>
      )}
      <h4 className="hs-case-card__title">{cs.title ?? cs.setting}</h4>
      {hasDetail ? (
        <div className="hs-case-card__detail-body">
          {(cs.setting && cs.title) || cs.sample_size ? (
            <div className="flex flex-wrap items-center gap-2">
              {cs.setting && cs.title ? (
                <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>{cs.setting}</span>
              ) : null}
              {cs.sample_size ? (
                plain ? (
                  <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>
                    n = {cs.sample_size.toLocaleString()}
                  </span>
                ) : (
                  <span className="hs-case-card__pill">n = {cs.sample_size.toLocaleString()}</span>
                )
              ) : null}
            </div>
          ) : null}
          {cs.outcome ? (
            <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">{cs.outcome}</p>
          ) : null}
        </div>
      ) : null}
      {cs.source ? (
        <p className="hs-case-card__source m-0">Source: {cs.source}</p>
      ) : null}
    </article>
  )
}

/**
 * Clinical publication / evaluation card — shared visual language for the
 * "Clinical publications and evaluations" subsection and peer-reviewed studies
 * in case-study grids. Type and peer-reviewed labels render as plain caption text.
 */
export function PeerReviewedEvaluationCard({
  study,
  accent,
}: {
  study: any
  accent: string
}) {
  const meta = [study.authors, study.journal, study.year].filter(Boolean).join(' · ')
  const links = [
    study.url_doi && !study.url_pubmed && { href: study.url_doi, label: 'DOI (opens in a new tab)' },
    study.url_pubmed && { href: study.url_pubmed, label: 'PubMed (opens in a new tab)' },
    study.url_pmc && { href: study.url_pmc, label: 'PMC (open) (opens in a new tab)' },
    study.url_full_text && !study.url_doi && !study.url_pubmed
      ? { href: study.url_full_text, label: study.source_label ? `${study.source_label} (opens in a new tab)` : 'Source (opens in a new tab)' }
      : null,
  ].filter(Boolean) as { href: string; label: string }[]

  const hasDetail = !!(meta || study.n || study.key_results || study.setting)
  const typeLabel = study.type_label ?? study.type ?? 'Publication'

  return (
    <article className="hs-case-card hs-case-card--publication">
      {study.peer_reviewed ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>Peer-reviewed</span>
          {(study.type_label || study.type) ? (
            <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>{typeLabel}</span>
          ) : null}
        </div>
      ) : (
        <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>{typeLabel}</span>
      )}
      <h4 className="hs-case-card__title">{study.ref}</h4>
      {hasDetail ? (
        <div className="hs-case-card__detail-body">
          {(meta || study.n || study.setting) ? (
            <div className="flex flex-wrap items-center gap-2">
              {study.setting ? (
                <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>{study.setting}</span>
              ) : meta ? (
                <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>{meta}</span>
              ) : null}
              {study.n ? (
                <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>n = {study.n.toLocaleString()}</span>
              ) : null}
            </div>
          ) : null}
          {study.key_results ? (
            <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">{study.key_results}</p>
          ) : null}
        </div>
      ) : null}
      {links.length > 0 ? (
        <div className="hs-case-card__source m-0 flex flex-wrap gap-x-3 gap-y-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="hs-font-bold underline" style={{ color: accent }}>
              {l.label}
            </a>
          ))}
        </div>
      ) : study.source_label ? (
        <p className="hs-case-card__source m-0">Source: {study.source_label}</p>
      ) : null}
    </article>
  )
}

export function CaseStudyCards({
  caseStudies,
  studies = [],
  accent = 'var(--nhs-blue)',
  plainCards = false,
}: {
  caseStudies: any[]
  /** Peer-reviewed studies to surface alongside case studies (rendered first). */
  studies?: any[]
  accent?: string
  /** Flat non-clickable card chrome (no green keyline). */
  plainCards?: boolean
}) {
  return (
    <div className="hs-case-grid">
      {studies.map((s: any, i: number) => (
        <PeerReviewedEvaluationCard key={`study-${s.id ?? i}`} study={s} accent={accent} />
      ))}
      {caseStudies.map((cs: any, i: number) => (
        <CaseStudyCard key={`case-${i}`} caseStudy={cs} plain={plainCards} />
      ))}
    </div>
  )
}

export function shouldShowImpactSection(app: any) {
  const hasImpact = !!(app.expected_benefit_note && String(app.expected_benefit_note).trim())
  const hasCases = app.case_studies?.length > 0
  const hasVideos = app.product_videos?.length > 0
  return !!(hasImpact || hasCases || hasVideos)
}

export function ImpactAndCaseStudiesSection({
  app,
  showCaseStudies = true,
  showVideos = true,
}: {
  app: any
  showCaseStudies?: boolean
  showVideos?: boolean
}) {
  const hasImpact = !!(app.expected_benefit_note && String(app.expected_benefit_note).trim())
  const hasCases = showCaseStudies && app.case_studies?.length > 0
  const hasVideos = showVideos && app.product_videos?.length > 0
  if (!hasImpact && !hasCases && !hasVideos) return null

  return (
    <div>
      {hasImpact && (
        <p style={{ fontSize: 'var(--text-body)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{app.expected_benefit_note}</p>
      )}
      {hasCases && <CaseStudyCards caseStudies={app.case_studies} />}
      {hasVideos && <ProductVideosSection videos={app.product_videos} embedded />}
    </div>
  )
}

export function shouldShowDemoAccess(app: any) {
  return (app.demo_variants?.length > 0) || !!(app.demo_notes && String(app.demo_notes).trim())
}

const SUPPLIER_STUDIES_LINKS: Record<string, { href: string; label: string }> = {
  luscii: {
    href: 'https://luscii.co.uk/evidence#:~:text=Published%20Luscii%20Studies',
    label: 'Published Luscii studies',
  },
  mycopd: {
    href: 'https://mymhealth.com/studies',
    label: 'My mHealth studies',
  },
  myheart: {
    href: 'https://mymhealth.com/studies',
    label: 'My mHealth studies',
  },
}

export function DemoAccessSection({ app, accent }: { app: any; accent: string }) {
  const hasDemo = (app.demo_variants?.length > 0) || !!(app.demo_notes && String(app.demo_notes).trim())
  const studiesLink = SUPPLIER_STUDIES_LINKS[app.slug]
  if (!hasDemo && !studiesLink) return null

  return (
    <div>
      {app.demo_notes && (
        <p className="nhsuk-body-m" style={{ color: 'var(--text-secondary)' }}>{app.demo_notes}</p>
      )}
      {(app.demo_variants?.length > 0 || studiesLink) && (
        <ul className="space-y-2">
          {app.demo_variants?.map((d: any) => (
            <li key={d.url}>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="hs-text-label hs-font-normal underline hover:no-underline" style={{ color: accent }}>
                {d.label} (opens in a new tab)
              </a>
            </li>
          ))}
          {studiesLink && (
            <li>
              <a
                href={studiesLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hs-text-label hs-font-normal underline hover:no-underline"
                style={{ color: accent }}
              >
                {studiesLink.label} (opens in a new tab)
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

const PRICING_MODEL_LABELS = (enumsData as { pricing_labels?: Record<string, string> }).pricing_labels ?? {}

export function formatPricingConfidence(raw: string | undefined): string | null {
  if (!raw) return null
  const map: Record<string, string> = {
    not_stated: 'Not stated',
    supplier_reported: 'Supplier-reported',
    confirmed: 'Confirmed',
  }
  return map[raw] ?? raw.replace(/_/g, ' ')
}

export function formatPricingModelDisplay(raw: string | undefined): string {
  if (!raw || String(raw).trim() === '') return CHECK_WITH_SUPPLIER
  const key = String(raw).trim()
  if (PRICING_MODEL_LABELS[key]) return PRICING_MODEL_LABELS[key]
  return key
}

function yesNo(value: boolean | undefined | null): string {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return CHECK_WITH_SUPPLIER
}

function CommercialDlRow({
  label,
  value,
  mutedWhenEmpty,
  children,
}: {
  label: string
  value?: string | null
  mutedWhenEmpty?: boolean
  children?: React.ReactNode
}) {
  const has = children != null ? true : !!(value && String(value).trim())
  const content = children ?? value
  return (
    <div
      className="flex flex-col sm:flex-row sm:gap-4 gap-1 py-4 border-b last:border-0 hs-text-label"
      style={{ borderColor: 'var(--border)' }}
    >
      <dt className="w-full sm:w-52 flex-shrink-0 hs-font-bold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </dt>
      <dd
        className="min-w-0 flex-1 leading-relaxed"
        style={{
          color: has || !mutedWhenEmpty ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        {has ? content : CHECK_WITH_SUPPLIER}
      </dd>
    </div>
  )
}

/** Pricing, procurement, service wrap — mirrors healthstore-m “Commercial model and cost”. */
export function CommercialModelAndCostSection({ app }: { app: any }) {
  const procurement = app.procurement_notes ?? app.contract_note
  const serviceWrapDetail = app.service_wrap_description ?? app.service_wrap_note
  const conf = formatPricingConfidence(app.pricing_confidence)

  return (
    <div>
      <dl className="mt-0">
        <CommercialDlRow label="Pricing model" value={formatPricingModelDisplay(app.pricing_model)} />
        <CommercialDlRow
          label="National price"
          value={
            app.national_price_available === true
              ? 'Available'
              : app.national_price_available === false
                ? 'Not available'
                : null
          }
          mutedWhenEmpty
        />
        <div
          className="flex flex-col sm:flex-row sm:gap-4 gap-1 py-4 border-b hs-text-label"
          style={{ borderColor: 'var(--border)' }}
        >
          <dt className="w-full sm:w-52 flex-shrink-0 hs-font-bold" style={{ color: 'var(--text-muted)' }}>
            Indicative price
          </dt>
          <dd className="min-w-0 flex-1 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {app.indicative_price_text ?? CHECK_WITH_SUPPLIER}
            {conf ? (
              <div className="hs-text-caption mt-2" style={{ color: 'var(--text-muted)' }}>
                Pricing confidence: {conf}
              </div>
            ) : null}
          </dd>
        </div>
        <CommercialDlRow label="Service wrap included" value={yesNo(app.service_wrap_included)} />
        <CommercialDlRow label="Service wrap details" value={serviceWrapDetail} mutedWhenEmpty />
        <CommercialDlRow label="Procurement notes" value={procurement} mutedWhenEmpty />
        {app.nhse_125k_note && (
          <CommercialDlRow label="NHSE £125k funding" value={app.nhse_125k_note} />
        )}
        {app.monitoring_model && (
          <CommercialDlRow label="Monitoring / ongoing service model" value={app.monitoring_model} />
        )}
      </dl>
      {app.free_offer_flag === true && (
        <div className="mt-4">
          <AlertBox type="warning">
            <strong>Free-tier access: </strong>
            Free-tier access typically does not include a full supplier service wrap. The ICB should expect to
            provide local onboarding, training and support independently unless otherwise agreed in contract.
          </AlertBox>
        </div>
      )}
    </div>
  )
}

function FinancialContextDlRow({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  const has = !!(value && String(value).trim())
  return (
    <div
      className="flex flex-col sm:flex-row sm:gap-4 gap-1 py-4 border-b last:border-0 hs-text-label"
      style={{ borderColor: 'var(--border)' }}
    >
      <dt className="w-full sm:w-52 flex-shrink-0 hs-font-bold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </dt>
      <dd
        className="min-w-0 flex-1 leading-relaxed"
        style={{ color: has ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {has ? value : CHECK_WITH_SUPPLIER}
      </dd>
    </div>
  )
}

function IndicativeFinancialContextBody({ app }: { app: any }) {
  return (
    <div>
      <dl>
        <FinancialContextDlRow
          label="Expected benefit"
          value={app.financial_expected_benefit_note ?? app.expected_benefit_note}
        />
        <FinancialContextDlRow label="Tariff considerations" value={app.tariff_considerations} />
        <FinancialContextDlRow label="Provider income impact" value={app.provider_income_note} />
        <FinancialContextDlRow label="ROI note" value={app.roi_note} />
        {app.minimum_conditions_for_success && (
          <FinancialContextDlRow label="Minimum conditions for success" value={app.minimum_conditions_for_success} />
        )}
      </dl>
      <div className="mt-4 rounded-lg p-4" style={{ background: '#E6F0FB', border: '1px solid #A2C8E8' }}>
        <p className="hs-text-caption leading-relaxed" style={{ color: '#003087' }}>
          These are directional indicators only. Local finance modelling using actual baseline activity,
          population size and pathway design is required before any business case submission.
        </p>
      </div>
    </div>
  )
}

/** Tariff, ROI, benefit context — title lives on PDP expander row. */
export function IndicativeFinancialContextSection({ app }: { app: any }) {
  return <IndicativeFinancialContextBody app={app} />
}

function GovernanceRow({ label, value, children }: { label: string; value?: string | null; mutedWhenEmpty?: boolean; children?: React.ReactNode }) {
  const has = children != null ? true : !!(value && String(value).trim())
  return (
    <div className="flex flex-col gap-1 py-4 border-b last:border-0 hs-text-label sm:flex-row sm:gap-4" style={{ borderColor: 'var(--border)' }}>
      <dt className="w-full flex-shrink-0 hs-font-bold sm:w-52" style={{ color: 'var(--text-muted)' }}>{label}</dt>
      <dd className="min-w-0 flex-1 leading-relaxed" style={{ color: has ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {children ?? (has ? value : CHECK_WITH_SUPPLIER)}
      </dd>
    </div>
  )
}

/**
 * Safety & governance group: clinical safety (Maisie) + information governance (Deb).
 * Surfaces assurance detail that previously only appeared compressed in the sidebar.
 */
export function SafetyAndGovernanceSection({ app }: { app: any }) {
  return (
    <div className="space-y-6">
      {app.clinical_safety_alert ? (
        <div className="space-y-4">
          <AlertBox type="danger"><strong>Clinical safety: </strong>{app.clinical_safety_alert}</AlertBox>
        </div>
      ) : null}

      <div>
        <div className="mb-1 hs-text-label hs-font-bold" style={{ color: 'var(--text-muted)' }}>Clinical safety</div>
        <dl>
          <GovernanceRow label="DTAC">
            <span className="inline-flex flex-wrap items-center gap-2">
              <DtacBadge status={app.dtac_status} />
              {app.dtac_note ? <span style={{ color: 'var(--text-secondary)' }}>{app.dtac_note}</span> : null}
            </span>
          </GovernanceRow>
          <GovernanceRow label="DCB0129 (manufacturer)" value={app.dcb0129_status} mutedWhenEmpty />
          <GovernanceRow label="DCB0160 (deploying org)">
            {app.dcb0160_boilerplate_available
              ? 'Boilerplate clinical safety case available to support local DCB0160.'
              : 'No supplier boilerplate recorded — complete local DCB0160 safety case.'}
          </GovernanceRow>
          <GovernanceRow label="Device class">
            <div>
              <div style={{ fontWeight: 600 }}>{app.device_class ?? CHECK_WITH_SUPPLIER}</div>
              {app.device_class_note && <div className="mt-1 hs-text-caption" style={{ color: '#7A4800' }}>⚠ {app.device_class_note}</div>}
              <DeviceClassDetails deviceClass={app.device_class} />
            </div>
          </GovernanceRow>
          <GovernanceRow label="Supervision model">
            <SupervisionBadge model={app.supervision_model} />
          </GovernanceRow>
        </dl>
      </div>

      <div id="data-information-governance">
        <div className="mb-1 hs-text-label hs-font-bold" style={{ color: 'var(--text-muted)' }}>Data & information governance</div>
        <dl>
          <GovernanceRow label="GDPR / data protection" value={app.gdpr_note} mutedWhenEmpty />
          <GovernanceRow label="ISO 27001" value={app.iso27001} mutedWhenEmpty />
          <GovernanceRow label="Cyber Essentials" value={app.cyber_essentials} mutedWhenEmpty />
          <GovernanceRow label="DSP Toolkit" value={app.dspt_status} mutedWhenEmpty />
        </dl>
        {app.cyber_notes && (
          <div className="mt-4 rounded p-4 hs-text-caption" style={{ background: '#FEF5E6', color: '#7A4800' }}>
            {app.cyber_notes}
          </div>
        )}
      </div>
    </div>
  )
}

export function RelatedFundingSection({ fundingIds }: { fundingIds: string[] }) {
  const funding = getCommissionerFacingFunding(fundingIds)
  if (funding.length === 0) return null
  return (
    <div>
      <div className="space-y-4">
        {funding.map((f: any) => (
            <div key={f.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: '#F0F4F5' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="hs-font-bold hs-text-label" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
                <FundingStatusBadge status={f.status} />
              </div>
              <p className="hs-text-caption mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.description}</p>
              {f.total_value && (
                <div className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>Value: {f.total_value}</div>
              )}
              {f.external_url && (
                <a href={f.external_url} target="_blank" rel="noopener noreferrer"
                  className="hs-text-caption hs-font-normal mt-2 inline-block" style={{ color: 'var(--nhs-blue)' }}>
                  {f.external_url_label ?? 'More info'} (opens in a new tab)
                </a>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
