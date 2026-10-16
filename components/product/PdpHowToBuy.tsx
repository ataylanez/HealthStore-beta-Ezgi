import type { ReactNode } from 'react'
import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import { PdpSection } from '@/components/PdpSection'
import { pdpSectionTitle } from '@/lib/pdpSections'

/** "How to buy" section — commercial route, buyer pack and the express-interest callout. */
export default function PdpHowToBuy({
  app,
  narrative,
  expressInterest,
}: {
  app: App
  narrative: ProductNarrative
  /** Express interest callout — rendered at the end of the section. */
  expressInterest?: ReactNode
}) {
  const commercial = narrative.commercial_readiness
  if (!commercial) return null

  return (
    <PdpSection
      id="how-to-buy"
      shareKey="narrative-how-to-buy"
      title={pdpSectionTitle('how-to-buy', { appName: app.app_name })}
    >
      {commercial.healthstore_role && (
        // [Provenance: NHS] Inset text for supporting context.
        <div className="nhsuk-inset-text nhsuk-u-margin-top-0">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p className="nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-1">The NHS HealthStore&rsquo;s role in procurement</p>
          <p className="nhsuk-u-margin-bottom-0">{commercial.healthstore_role}</p>
        </div>
      )}
      {/* [Provenance: NHS] Summary list for key facts. */}
      <dl className="nhsuk-summary-list">
        {[
          { label: 'Proposition type', val: commercial.proposition_type },
          { label: 'Recommended route', val: commercial.route_status },
          { label: 'Buyer pack', val: commercial.buyer_pack_status },
        ]
          .filter((f) => !!f.val)
          .map((f) => (
            <div key={f.label} className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">{f.label}</dt>
              <dd className="nhsuk-summary-list__value">{f.val}</dd>
            </div>
          ))}
      </dl>
      {expressInterest}
    </PdpSection>
  )
}
