import ManagedProductsTable from '@/components/supplier-portal/ManagedProductsTable'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Manage products — ${PORTAL_SERVICE_NAME}` }

export default function ManageProductsPage() {
  return (
    <div className="hs-page">
      <PortalBreadcrumb items={[{ label: 'Product management', href: PORTAL_PATHS.products }, { label: 'Manage products' }]} />
      <div className="max-w-3xl">
        <div className="hs-section">
          <h1 className="page-title-h1">Manage products</h1>
          <p className="m-0 hs-measure leading-relaxed" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            Manage and update assurance documents and information for your existing HealthStore products.
          </p>
        </div>
        <ManagedProductsTable />
      </div>
    </div>
  )
}
