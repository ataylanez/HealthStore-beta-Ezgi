import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import type { CommissionerContext } from '@/lib/context/types'
import { pdpSectionTitle, pdpPatientCohortLabel, resolvePdpLocalArea } from '@/lib/pdpSections'
import { computeMycopdImpactMetrics } from '@/lib/localData/mycopdImpact'
import { getDtxImpactRanges } from '@/lib/localData/workspaceData'
import { PdpSection } from '@/components/PdpSection'
import { IndicativeFinancialContextSection } from '@/components/AppDetailSections'
import MycopdImpactCharts from '@/components/product/MycopdImpactCharts'
import LusciiImpactCharts from '@/components/product/LusciiImpactCharts'
import { InsightCallout } from '@/components/charts'

/**
 * Round 2 content migration (quantified value) — Luscii pilot.
 *
 * Confirmed decisions (see /DS/Audits/Luscii-Content-Mig-3):
 *  - R2-1: personalisation via the guided-start context (cookie/URL) + a "Change area" line.
 *  - R2-2: projected impact = high-risk monitored cohort x a conservative->evidence-led range.
 *  - R2-3: ROI runs on a labelled illustrative 500-patient default (not yet funnel-derived).
 *  - R2-4: ROI net shown as a price-band range (price still unverified since Round 1).
 *  - R2-5: context-gated — full sections once an area is set; a teaser + CTA on the national baseline.
 *  - R2-6: minimal charts — horizontal bars + KPI tiles + a "so what" callout.
 *
 * All figures are illustrative prototype data and labelled as such. No verified price is published.
 */

// R2-2 projected-impact model (illustrative)
const MONITORED_SHARE = 0.5 // of the high-risk cohort
const HIGH_RISK_EVENT_RATE = 0.4 // emergency events per high-risk patient / year (illustrative)

// R2-3 ROI runs on a fixed illustrative cohort this round
const ROI_COHORT = 500
const ROI_ADM_RATE = 0.2
const ROI_AE_RATE = 0.25
const ROI_ADM_EFFECT = 0.4 // central
const ROI_AE_EFFECT = 0.25 // central
const ADMISSION_COST = 2655
const AE_COST = 273
const CAPACITY_TO_CASH = 0.4

// R2-4 price band (per patient / year) — spans the two unreconciled Round 1 figures
const PRICE_LOW = 110
const PRICE_HIGH = 360

function formatGbp(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000) return `${sign}£${Math.round(abs / 1_000)}k`
  return `${sign}£${abs.toLocaleString()}`
}

function Tile({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent?: string }) {
  return (
    <div className="hs-surface-card-sm bg-white rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
      <div className="hs-font-bold" style={{ fontSize: 'var(--text-card-title)', color: accent ?? 'var(--text-primary)' }}>{value}</div>
      <div className="hs-text-caption hs-font-bold uppercase tracking-wide mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {sub && <div className="hs-text-caption mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  )
}

export default function PdpLocalValue({
  app,
  narrative,
  context,
}: {
  app: App
  narrative: ProductNarrative
  context: CommissionerContext
}) {
  // Scope guard + area resolution shared with the "On this page" nav (single
  // source of truth so the projected-impact title and nav label stay in sync).
  const area = resolvePdpLocalArea(app, context)
  if (!area) return null
  const { areaLabel, isExample, ref } = area

  const isMycopd = app.slug === 'mycopd'

  const ranges = getDtxImpactRanges()
  const highRisk = ref.high_risk_cohort ?? Math.round(ref.eligible_cohort * 0.2)
  const monitored = Math.round(highRisk * MONITORED_SHARE)

  // Luscii / remote-monitoring model: high-risk monitored cohort × effect range.
  const admLow = Math.round((monitored * HIGH_RISK_EVENT_RATE * ranges.admission_reduction.conservative) / 100)
  const admHigh = Math.round((monitored * HIGH_RISK_EVENT_RATE * ranges.admission_reduction.evidence_led) / 100)
  const aeLow = Math.round((monitored * HIGH_RISK_EVENT_RATE * ranges.ae_reduction.conservative) / 100)
  const aeHigh = Math.round((monitored * HIGH_RISK_EVENT_RATE * ranges.ae_reduction.evidence_led) / 100)

  // myCOPD dual-metric model (GP baseline × effect; readmissions = enrolled × effect).
  const mycopdImpact = isMycopd ? computeMycopdImpactMetrics(ref, narrative) : null

  // R2-3 / R2-4: illustrative 500-patient ROI, net expressed across a price band.
  const admAvoided = Math.round(ROI_COHORT * ROI_ADM_RATE * ROI_ADM_EFFECT)
  const aeAvoided = Math.round(ROI_COHORT * ROI_AE_RATE * ROI_AE_EFFECT)
  const capacity = admAvoided * ADMISSION_COST + aeAvoided * AE_COST
  const cash = Math.round(capacity * CAPACITY_TO_CASH)
  const costLow = ROI_COHORT * PRICE_LOW
  const costHigh = ROI_COHORT * PRICE_HIGH
  const netLow = capacity - costHigh
  const netHigh = capacity - costLow
  const breakEvenPrice = Math.round(capacity / ROI_COHORT)

  return (
    <div className="hs-pdp-spine-group mb-6 space-y-4">
      {/* R2-1: context line showing which area the projections apply to */}
      {!isExample ? (
        <p className="hs-text-caption" style={{ color: 'var(--text-muted)', margin: 0 }}>
          Showing projected figures for <strong style={{ color: 'var(--text-secondary)' }}>{areaLabel}</strong>.
        </p>
      ) : null}

      <PdpSection
        id="local-impact"
        shareKey="narrative-projected-impact"
        title={pdpSectionTitle('local-impact', {
          appName: app.app_name,
          areaLabel,
          isExample,
          patientCohortLabel: pdpPatientCohortLabel(app.condition_tags),
        })}
        description="Projections are illustrative and based on published evidence applied to your NHSE average eligible cohort."
      >
        {mycopdImpact ? (
          <>
            <MycopdImpactCharts
              eligibleLabel={ref.eligible_cohort.toLocaleString()}
              gp={mycopdImpact.gp}
              readmit={mycopdImpact.readmit}
            />
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              <Tile
                value={mycopdImpact.atUptake.toLocaleString()}
                label="At 75% uptake"
                sub={`of ${ref.eligible_cohort.toLocaleString()} eligible`}
              />
              <Tile
                value={mycopdImpact.gp.delta.toLocaleString()}
                label="GP appointments avoided / yr"
                sub={`vs ${mycopdImpact.gp.todayValue.toLocaleString()} today · ${mycopdImpact.gp.effectPct}% effect`}
              />
              <Tile
                value={mycopdImpact.readmit.delta.toLocaleString()}
                label="Readmissions avoided / yr"
                sub={`${mycopdImpact.readmit.effectPct}% effect on ${mycopdImpact.atUptake.toLocaleString()} enrolled (RESCUE RCT)`}
              />
            </div>
            <div className="mt-4">
              <p className="nhsuk-body" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong className="nhsuk-u-font-weight-bold" style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>
                  What this means
                </strong>
                Evidence shows myCOPD can achieve a {mycopdImpact.gp.effectPct}% reduction in GP appointments. Applied to 75% of
                a {ref.eligible_cohort.toLocaleString()} eligible patients cohort, that&apos;s approximately{' '}
                {mycopdImpact.gp.delta.toLocaleString()} fewer events per year.
              </p>
            </div>
          </>
        ) : (
          <>
            <LusciiImpactCharts
              eligibleLabel={ref.eligible_cohort.toLocaleString()}
              areaLabel={areaLabel}
              admLow={admLow}
              admHigh={admHigh}
              aeLow={aeLow}
              aeHigh={aeHigh}
              admToday={ref.annual_admissions}
              aeToday={ref.annual_ae_attendances}
            />
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              <Tile value={monitored.toLocaleString()} label="Monitored cohort" sub={`~50% of ${highRisk.toLocaleString()} high-risk`} />
              <Tile value={`${admLow.toLocaleString()}–${admHigh.toLocaleString()}`} label="Admissions avoided / yr" sub={`vs ${(ref.annual_admissions ?? 0).toLocaleString()} today`} />
              <Tile value={`${aeLow.toLocaleString()}–${aeHigh.toLocaleString()}`} label="A&E avoided / yr" />
            </div>
            <div className="mt-4">
              <p className="nhsuk-body" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong className="nhsuk-u-font-weight-bold" style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>
                  What this means
                </strong>
                Monitoring roughly {monitored.toLocaleString()} high-risk patients (about half the high-risk COPD cohort in{' '}
                {areaLabel}) could avoid on the order of {admLow.toLocaleString()}–{admHigh.toLocaleString()} emergency
                admissions a year, against about {(ref.annual_admissions ?? 0).toLocaleString()} today. The range spans conservative
                to evidence-led NHS effect sizes.
              </p>
            </div>
          </>
        )}
      </PdpSection>

      <PdpSection
        id="local-value-worth"
        shareKey="narrative-economics"
        title={pdpSectionTitle('local-value-worth', { appName: app.app_name })}
        description="Illustrative economics for a 500-patient cohort. Cash and capacity are reported separately."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile value={formatGbp(capacity)} label="Capacity released / yr" sub="Freed acute beds & clinician time" />
          <Tile value={formatGbp(cash)} label="Cash-releasing / yr" sub="~40% of capacity converted to elective" />
          <Tile
            value={`${formatGbp(netLow)} to ${formatGbp(netHigh)}`}
            label="Net position / yr*"
            sub="*across the indicative price band"
            accent={netLow >= 0 ? '#007f3b' : 'var(--text-primary)'}
          />
        </div>
        <div className="mt-4">
          <InsightCallout title="Cash vs capacity">
            Avoided admissions free beds and clinician time first — that is capacity, not cash until you convert it (about 40%
            typically can). The net position is shown as a range because the price is not yet verified: at roughly{' '}
            <strong>{formatGbp(breakEvenPrice)} per patient per year</strong> the pathway breaks even on NHS cost alone; below
            that it is net positive before counting Green Book health and productivity value. Confirm pricing with the supplier
            before using these figures in a business case.
          </InsightCallout>
        </div>
        <p className="mt-3 hs-text-caption" style={{ color: 'var(--text-muted)' }}>
          Illustrative model (v5) &middot; 500-patient cohort &middot; central effect sizes &middot; price band {formatGbp(PRICE_LOW)}&ndash;{formatGbp(PRICE_HIGH)} per patient / year.
        </p>

        <details className="mt-4">
          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-label)', color: 'var(--nhs-blue)', fontWeight: 700 }}>
            Show indicative financial context
          </summary>
          <div className="mt-3 hs-surface-card-sm bg-white rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
            <IndicativeFinancialContextSection app={app} />
          </div>
        </details>
      </PdpSection>
    </div>
  )
}
