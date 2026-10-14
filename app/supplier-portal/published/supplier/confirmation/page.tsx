import PublishedPageConfirmation from '@/components/supplier-portal/PublishedPageConfirmation'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME, SAMPLE_SUPPLIER, SUPPLIER_PAGE_ID } from '@/lib/supplierPortal'

export const metadata = { title: `Changes submitted — ${PORTAL_SERVICE_NAME}` }

export default function PublishedSupplierConfirmationPage() {
  return (
    <PublishedPageConfirmation
      pageId={SUPPLIER_PAGE_ID}
      title={SAMPLE_SUPPLIER.name}
      editHref={PORTAL_PATHS.supplierPage}
    />
  )
}
