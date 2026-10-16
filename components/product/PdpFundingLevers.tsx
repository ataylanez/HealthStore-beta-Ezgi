import type { ProductNarrative } from '@/lib/content/productModel'
import { getCommissionerFacingFunding } from '@/lib/data'
import { PdpSection } from '@/components/PdpSection'
import { FundingStatusBadge } from '@/components/Badges'
import { pdpSectionTitle } from '@/lib/pdpSections'

/**
 * "Funding levers and tariff alignment" — ports the matt_demo commissioner_economics
 * levers grid (and tariff/QOF note) onto the hybrid PDP, and includes linked
 * commissioner-facing funding schemes (formerly the Funding opportunities section).
 *
 * Server component — no client boundary.
 */
function leverStatusClass(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('future') || s.includes('proposed') || s.includes('upcoming')) {
    return 'badge badge-amber'
  }
  if (s.includes('live') || s.includes('applicable')) {
    return 'badge badge-green'
  }
  if (s.includes('support') || s.includes('negotiate')) {
    return 'badge badge-blue'
  }
  return 'badge badge-grey'
}

export default function PdpFundingLevers({
  narrative,
  fundingIds = [],
}: {
  narrative: ProductNarrative
  fundingIds?: string[]
}) {
  const economics = narrative.commissioner_economics
  const levers = economics?.funding_levers ?? []
  const tariffNote = economics?.tariff_note?.trim()
  const schemes = getCommissionerFacingFunding(fundingIds)

  if (!tariffNote && levers.length === 0 && schemes.length === 0) return null

  return (
    <PdpSection
      id="funding-levers"
      shareKey="narrative-funding-levers"
      title={pdpSectionTitle('funding-levers')}
      description="Where cash, tariff and QOF incentives align with this pathway — plus linked commissioner funding schemes."
    >
      {tariffNote && (
        <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="hs-font-bold hs-text-label mb-1" style={{ color: 'var(--text-primary)' }}>
            Tariff and QOF implications
          </div>
          <p className="nhsuk-body-m nhsuk-u-margin-bottom-0" style={{ color: 'var(--text-secondary)' }}>
            {tariffNote}
          </p>
        </div>
      )}

      {levers.length > 0 && (
        // [Provenance: NHS] grid row, one-half columns from tablet.
        <div className="nhsuk-grid-row">
          {levers.map((f) => (
            <div key={f.label} className="nhsuk-grid-column-one-half">
              <div
                className="hs-surface-card-sm bg-white border p-4 nhsuk-u-margin-bottom-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <p className="nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-0" style={{ color: 'var(--text-primary)' }}>
                    {f.label}
                  </p>
                  <span className={leverStatusClass(f.status)}>{f.status}</span>
                </div>
                <p className="nhsuk-body-s nhsuk-u-margin-bottom-0" style={{ color: 'var(--text-secondary)' }}>
                  {f.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {schemes.length > 0 && (
        <div>
          <h3 className="nhsuk-heading-s hs-pdp-subheading">
            Linked funding schemes
          </h3>
          <div className="grid gap-4 grid-cols-1">
            {schemes.map((f: any) => (
              <div
                key={f.id}
                className="hs-surface-card-sm bg-white rounded-lg border p-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="hs-font-bold hs-text-label" style={{ color: 'var(--text-secondary)' }}>
                    {f.title}
                  </div>
                  <FundingStatusBadge status={f.status} />
                </div>
                <p className="hs-text-caption mb-2" style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {f.description}
                </p>
                {f.total_value && (
                  <div className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>
                    Value: {f.total_value}
                  </div>
                )}
                {f.external_url && (
                  <a
                    href={f.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hs-text-caption hs-font-normal mt-2 inline-block"
                    style={{ color: 'var(--nhs-blue)' }}
                  >
                    {f.external_url_label ?? 'More info'} (opens in a new tab)
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </PdpSection>
  )
}
