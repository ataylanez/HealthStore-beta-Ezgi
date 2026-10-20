import type { ReactNode } from 'react'
import type { ProductNarrative } from '@/lib/content/productModel'
import { STORE_ACCENT } from '@/lib/storeAccent'

type RegFact = { label: string; value: ReactNode }

/**
 * Builds the regulatory-position facts (NICE recommendation, device class,
 * DTAC status) from a narrative. Shared by the assurance section and the
 * product overview teaser so both show the same facts.
 */
export function buildRegulatoryFacts(narrative: ProductNarrative): RegFact[] {
  const reg = narrative.regulatory_position
  const linkStyle = { color: STORE_ACCENT }
  const facts: RegFact[] = []
  if (reg?.nice) {
    const noRecommendation = /no recommendation/i.test(reg.nice.status)
    facts.push({
      label: noRecommendation ? 'NICE guidance' : 'NICE recommendation',
      value: (
        <>
          <a href={reg.nice.url} target="_blank" rel="noopener noreferrer" className="nhsuk-link" style={linkStyle}>
            {reg.nice.ref}
          </a>
          {noRecommendation ? <span className="block">{reg.nice.status}</span> : null}
          <span className="block">Last updated {reg.nice.last_updated}</span>
        </>
      ),
    })
  }
  if (reg?.device_class) {
    facts.push({
      label: 'Medical device classification',
      value: (
        <>
          <span className="block">{reg.device_class}</span>
          {reg.mhra_pard && (
            <a href={reg.mhra_pard.url} target="_blank" rel="noopener noreferrer" className="nhsuk-link" style={linkStyle}>
              MHRA PARD record
            </a>
          )}
        </>
      ),
    })
  }
  if (reg && reg.dtac_complete !== undefined) {
    facts.push({
      label: 'DTAC status',
      value: reg.dtac_complete ? (
        <>
          <strong className="nhsuk-tag nhsuk-tag--green">Complete</strong>
          <span className="block mt-1">Evidence provided</span>
        </>
      ) : (
        <>
          <strong className="nhsuk-tag nhsuk-tag--grey">Not complete</strong>
          <span className="block mt-1">Evidence not provided</span>
        </>
      ),
    })
  }
  return facts
}

/** Three-column definition list of regulatory facts. Renders nothing when there are none. */
export default function PdpRegulatoryPosition({
  narrative,
  heading = 'Regulatory position',
}: {
  narrative: ProductNarrative
  /** Optional heading above the list; pass null to omit. */
  heading?: string | null
}) {
  const facts = buildRegulatoryFacts(narrative)
  if (facts.length === 0) return null
  return (
    <div>
      {heading ? (
        <h3 className="nhsuk-heading-s">{heading}</h3>
      ) : null}
      {/* [Provenance: NHS] Summary list for key facts. */}
      <dl className="nhsuk-summary-list nhsuk-u-margin-bottom-0">
        {facts.map((f) => (
          <div key={f.label} className="nhsuk-summary-list__row">
            <dt className="nhsuk-summary-list__key">{f.label}</dt>
            <dd className="nhsuk-summary-list__value">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
