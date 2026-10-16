import type { ReactNode } from 'react'
import { PdpSharePrintProvider, PdpShareRegion } from '@/components/PdpSharePrintContext'
import { PageBreadcrumb, type PageBreadcrumbItem } from '@/components/PageBreadcrumb'
import PdpSectionNav from '@/components/PdpSectionNav'
import type { PdpPageModel } from '@/lib/pdpPageModel'

/**
 * Shared chrome for every product page (overview and section pages), on the
 * NHS page template: width container → breadcrumb → main wrapper → grid row
 * with the section contents list in a one-third column and the page content
 * in a two-thirds column. Products without sections (no curated narrative)
 * render the content in a two-thirds column with no contents list.
 * [Provenance: NHS] service-manual.nhs.uk/design-system/styles/layout
 */
export default function PdpFrame({
  model,
  breadcrumb,
  children,
}: {
  model: PdpPageModel
  /** Crumbs after Home (the current page is omitted by PageBreadcrumb). */
  breadcrumb: PageBreadcrumbItem[]
  children: ReactNode
}) {
  const { app, sections } = model
  const hasSidebar = sections.length > 0

  return (
    <div className="hs-pdp">
      <PdpSharePrintProvider>
        <div className="nhsuk-width-container">
          <PdpShareRegion shareKey="breadcrumb" label="Browse trail" excludeFromShareUi>
            <PageBreadcrumb items={breadcrumb} />
          </PdpShareRegion>

          <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
            <div className="nhsuk-grid-row">
              {hasSidebar ? (
                <aside className="nhsuk-grid-column-one-third hs-pdp-aside">
                  <PdpSectionNav sections={sections} title={app.app_name} />
                </aside>
              ) : null}

              <div className="nhsuk-grid-column-two-thirds hs-pdp-main">{children}</div>
            </div>
          </div>
        </div>
      </PdpSharePrintProvider>
    </div>
  )
}
