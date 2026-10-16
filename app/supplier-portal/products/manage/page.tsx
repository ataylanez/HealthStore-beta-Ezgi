import ManagedProductsTable from '@/components/supplier-portal/ManagedProductsTable'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Manage products — ${PORTAL_SERVICE_NAME}` }

export default function ManageProductsPage() {
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: 'Product management', href: PORTAL_PATHS.products }, { label: 'Manage products' }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <h1 className="nhsuk-heading-xl">Manage products</h1>
            <p className="nhsuk-body-l hs-measure">
              Manage and update assurance documents and information for your existing HealthStore products.
            </p>
          </div>
          <ManagedProductsTable />
        </div>
      </div>
    </div>
  )
}
