import type { App } from '@/lib/data'
import { PdpSection } from '@/components/PdpSection'
import { pdpSectionTitle } from '@/lib/pdpSections'
import ProductVideosSection from '@/components/ProductVideosSection'
import { DemoAccessSection, shouldShowDemoAccess } from '@/components/AppDetailSections'
import { STORE_ACCENT } from '@/lib/storeAccent'

/** Narrative spine — product videos and demo links. */
export default function PdpResources({ app }: { app: App }) {
  const hasVideos = (app.product_videos?.length ?? 0) > 0
  const hasDemo = shouldShowDemoAccess(app)
  const showSubheads = hasVideos && hasDemo

  if (!hasVideos && !hasDemo) return null

  return (
    <PdpSection
      id="resources"
      shareKey="narrative-resources"
      title={pdpSectionTitle('resources')}
      description="Product videos, demo links and documentation."
    >
      {hasVideos && (
        <ProductVideosSection
          videos={app.product_videos}
          embedded
          showHeading={showSubheads}
        />
      )}

      {hasDemo && (
        <div
          className={hasVideos ? 'mt-8 border-t pt-8' : undefined}
          style={hasVideos ? { borderColor: 'var(--border)' } : undefined}
        >
          {showSubheads && (
            <h3
              className="mb-1 hs-text-card-title-sm hs-font-bold"
              style={{ fontFamily: 'Frutiger, Arial, sans-serif', color: 'var(--text-primary)' }}
            >
              Demo access
            </h3>
          )}
          {showSubheads && (
            <p className="nhsuk-body-m nhsuk-u-margin-bottom-4">
              Try the product or request a configured demonstration from the supplier.
            </p>
          )}
          <DemoAccessSection app={app} accent={STORE_ACCENT} />
        </div>
      )}
    </PdpSection>
  )
}
