import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import { PdpSection } from '@/components/PdpSection'
import { pdpSectionTitle } from '@/lib/pdpSections'
import { isMarketPreview } from '@/lib/marketPreview'

/**
 * "Making it work at your site" — the curated implementation narrative.
 *
 * Ports the matt_demo implementation section (human wrapper, local workforce, timeline,
 * prerequisites) onto the hybrid PDP as a spine section after Assurance. This is the
 * curated summary; the reference "What it takes locally" tab keeps the JSON-level detail,
 * mirroring the assurance summary/detail split.
 *
 * Server component — no client boundary.
 */
export default function PdpImplementation({
  app,
  narrative,
}: {
  app: App
  narrative: ProductNarrative
}) {
  const impl = narrative.implementation
  if (!impl) return null
  const marketPreview = isMarketPreview(app)

  const cards = [
    { label: 'Clinical and human wrapper', value: impl.human_wrapper },
    { label: 'What you need locally', value: impl.workforce },
    { label: 'Timeline to go-live', value: impl.timescale },
  ].filter((c) => !!c.value)

  return (
    <PdpSection
      id="implementation"
      shareKey="narrative-implementation"
      title={pdpSectionTitle('implementation')}
      description={
        marketPreview
          ? 'This is the service the supplier publishes. It is not an NHS deployment, and there is no commissioning route through the NHS HealthStore.'
          : 'Successful deployment depends on three things: clinical engagement, systematic patient invitation, and ongoing monitoring. Here is what the supplier provides and what your local team needs to organise.'
      }
    >
      <ol className="hs-impl-timeline">
        {cards.map((c) => (
          <li key={c.label} className="hs-impl-timeline__item">
            <div className="hs-impl-timeline__marker" aria-hidden>
              <span className="hs-impl-timeline__dot">
                <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
                  <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </span>
            </div>
            <div className="hs-impl-timeline__card">
              <div className="hs-font-bold hs-text-body mb-1" style={{ color: 'var(--text-primary)' }}>{c.label}</div>
              <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">{c.value}</p>
            </div>
          </li>
        ))}
      </ol>

      {impl.prerequisites?.length > 0 && (
        <div>
          <h3 className="nhsuk-heading-s hs-pdp-subheading">
            Local prerequisites
          </h3>
          <ul className="nhsuk-list nhsuk-list--bullet">
            {impl.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {!marketPreview && (
      <div className="rounded-lg p-4 mt-4" style={{ background: '#E6F0FB', border: '1px solid var(--border)' }}>
        <div className="hs-font-bold hs-text-label mb-1" style={{ color: 'var(--text-primary)' }}>
          Supplier support included
        </div>
        <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">
          The supplier provides onboarding, training materials, technical integration support and ongoing account management as
          part of the standard package. The NHS HealthStore brokers the introduction and tracks mobilisation milestones{impl.owner ? `, with the ${impl.owner} as the recommended local owner` : ''}.
        </p>

        {(impl.onboarding_steps?.length ?? 0) > 0 && (
          <div className="mt-4">
            <div className="hs-pathway-col hs-pathway-future">
              <h4 className="hs-pathway-heading">Ongoing support</h4>
              {(() => {
                const steps = impl.onboarding_steps!
                const rows: string[][] = []
                for (let i = 0; i < steps.length; i += 2) rows.push(steps.slice(i, i + 2))
                const rowGrid = { display: 'grid', gridTemplateColumns: '1fr 32px 1fr', alignItems: 'center', gap: 'var(--space-1)' } as const
                return rows.map((row, r) => {
                  // Snake layout: even rows read left→right, odd rows right→left.
                  // The down connector turns on the side where the previous row ended.
                  const reversed = r % 2 === 1
                  const turnRight = (r - 1) % 2 === 0 // previous row ended on the right
                  return (
                    <div key={row[0]}>
                      {r > 0 && (
                        <div style={rowGrid}>
                          <div className="hs-pathway-arrow" style={{ padding: 0 }}>{turnRight ? '' : '↓'}</div>
                          <div aria-hidden />
                          <div className="hs-pathway-arrow" style={{ padding: 0 }}>{turnRight ? '↓' : ''}</div>
                        </div>
                      )}
                      <div style={rowGrid}>
                        <div className="hs-pathway-step" style={{ marginBottom: 0 }}>{row[0]}</div>
                        {row.length === 2 ? (
                          <>
                            <div className="hs-pathway-arrow" style={{ padding: 0 }}>{reversed ? '←' : '→'}</div>
                            <div className="hs-pathway-step" style={{ marginBottom: 0 }}>{row[1]}</div>
                          </>
                        ) : (
                          <>
                            <div aria-hidden />
                            <div aria-hidden />
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
              {impl.onboarding_ongoing_step && (
                <>
                  {/* Empty connector to reserve the same vertical space as an arrow row. */}
                  <div className="hs-pathway-arrow" style={{ padding: 0, visibility: 'hidden' }} aria-hidden>↓</div>
                  <div
                    className="hs-pathway-step"
                    style={{ marginBottom: 0, width: '66.6667%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}
                  >
                    {impl.onboarding_ongoing_step}
                  </div>
                </>
              )}
            </div>
            {impl.onboarding_note && (
              <p className="nhsuk-body-m nhsuk-u-margin-top-2 nhsuk-u-margin-bottom-0">
                {impl.onboarding_note}
              </p>
            )}
          </div>
        )}
      </div>
      )}
    </PdpSection>
  )
}
