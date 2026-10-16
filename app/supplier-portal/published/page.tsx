import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import PublishedPagesTable from '@/components/supplier-portal/PublishedPagesTable'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Published pages — ${PORTAL_SERVICE_NAME}` }

export default function PublishedPagesPage() {
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: 'Published pages' }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <h1 className="nhsuk-heading-xl">Published pages</h1>
            <p className="nhsuk-body-l hs-measure">
              These are the pages commissioners see on the NHS Commissioning Store. Some content comes from your product
              onboarding and cannot be changed here.
            </p>
          </div>
          <PublishedPagesTable />
        </div>
      </div>
    </div>
  )
}
