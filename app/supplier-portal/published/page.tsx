import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import PublishedPagesTable from '@/components/supplier-portal/PublishedPagesTable'
import { PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Published pages — ${PORTAL_SERVICE_NAME}` }

export default function PublishedPagesPage() {
  return (
    <div className="hs-page">
      <PortalBreadcrumb items={[{ label: 'Published pages' }]} />
      <div className="max-w-3xl">
        <div className="hs-section">
          <h1 className="page-title-h1">Published pages</h1>
          <p className="m-0 hs-measure leading-relaxed" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            These are the pages commissioners see on the NHS Commissioning Store. Some content comes from your product
            onboarding and cannot be changed here.
          </p>
        </div>
        <PublishedPagesTable />
      </div>
    </div>
  )
}
