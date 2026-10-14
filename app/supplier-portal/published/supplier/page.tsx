import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import PublishedPageEditor from '@/components/supplier-portal/PublishedPageEditor'
import {
  MANAGED_PRODUCTS,
  PORTAL_PATHS,
  PORTAL_SERVICE_NAME,
  SAMPLE_SUPPLIER,
  SUPPLIER_PAGE_DEFAULTS,
  SUPPLIER_PAGE_FIELDS,
  SUPPLIER_PAGE_ID,
  SUPPLIER_STORE_PAGE_HREF,
  publishedSupplierCheckAnswersHref,
} from '@/lib/supplierPortal'
import { supplierPageReadOnly } from '@/lib/supplierPortalContent'

export const metadata = { title: `Supplier page — ${PORTAL_SERVICE_NAME}` }

export default function PublishedSupplierPage() {
  return (
    <div className="hs-page">
      <PortalBreadcrumb items={[{ label: 'Published pages', href: PORTAL_PATHS.published }, { label: 'Supplier page' }]} />
      <div className="max-w-3xl">
        <PublishedPageEditor
          pageId={SUPPLIER_PAGE_ID}
          caption="Supplier page"
          title={SAMPLE_SUPPLIER.name}
          fields={SUPPLIER_PAGE_FIELDS}
          defaults={SUPPLIER_PAGE_DEFAULTS}
          readOnlyHeading="Information from supplier onboarding"
          readOnlyIntro="This information comes from your supplier and product onboarding and cannot be changed here."
          readOnly={supplierPageReadOnly(MANAGED_PRODUCTS.map((p) => p.name))}
          viewHref={SUPPLIER_STORE_PAGE_HREF}
          checkAnswersHref={publishedSupplierCheckAnswersHref()}
        />
      </div>
    </div>
  )
}
