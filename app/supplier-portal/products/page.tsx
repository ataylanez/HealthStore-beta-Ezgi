import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { PortalCardGrid } from '@/components/supplier-portal/PortalCardGrid'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Product management — ${PORTAL_SERVICE_NAME}` }

export default function ProductManagementPage() {
  return (
    <div className="hs-page">
      <PortalBreadcrumb items={[{ label: 'Product management' }]} />
      <div className="hs-section">
        <h1 className="page-title-h1">Product management</h1>
        <p className="m-0 hs-measure leading-relaxed" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
          Manage and onboard products on to the HealthStore.
        </p>
      </div>
      <PortalCardGrid
        cards={[
          {
            href: PORTAL_PATHS.manage,
            title: 'Manage products',
            description: 'Update assurance documents and information for your existing HealthStore products',
          },
          {
            href: PORTAL_PATHS.onboard,
            title: 'Product onboarding',
            description: 'Provide assurance documents and information for new HealthStore products',
          },
        ]}
      />
    </div>
  )
}
