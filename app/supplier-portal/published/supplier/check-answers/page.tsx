import PublishedPageCheckAnswers from '@/components/supplier-portal/PublishedPageCheckAnswers'
import {
  PORTAL_PATHS,
  PORTAL_SERVICE_NAME,
  SAMPLE_SUPPLIER,
  SUPPLIER_PAGE_DEFAULTS,
  SUPPLIER_PAGE_FIELDS,
  SUPPLIER_PAGE_ID,
  publishedSupplierConfirmationHref,
} from '@/lib/supplierPortal'

export const metadata = { title: `Check your answers — ${PORTAL_SERVICE_NAME}` }

export default function PublishedSupplierCheckAnswersPage() {
  return (
    <PublishedPageCheckAnswers
      pageId={SUPPLIER_PAGE_ID}
      caption="Supplier page"
      title={SAMPLE_SUPPLIER.name}
      fields={SUPPLIER_PAGE_FIELDS}
      defaults={SUPPLIER_PAGE_DEFAULTS}
      editHref={PORTAL_PATHS.supplierPage}
      confirmationHref={publishedSupplierConfirmationHref()}
    />
  )
}
