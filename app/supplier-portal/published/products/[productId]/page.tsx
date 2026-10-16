import { notFound } from 'next/navigation'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import PublishedPageEditor from '@/components/supplier-portal/PublishedPageEditor'
import {
  MANAGED_PRODUCTS,
  PORTAL_PATHS,
  PORTAL_SERVICE_NAME,
  PRODUCT_PAGE_FIELDS,
  findManagedProduct,
  publishedProductCheckAnswersHref,
} from '@/lib/supplierPortal'
import { productPageReadOnly } from '@/lib/supplierPortalContent'

type Params = Promise<{ productId: string }>

export function generateStaticParams() {
  return MANAGED_PRODUCTS.map((p) => ({ productId: p.id }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  return { title: `${product ? `${product.name} — ` : ''}Product page — ${PORTAL_SERVICE_NAME}` }
}

export default async function PublishedProductPage({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  if (!product) notFound()
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: 'Published pages', href: PORTAL_PATHS.published }, { label: product.name }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <PublishedPageEditor
            pageId={product.id}
            caption="Product page"
            title={product.name}
            fields={PRODUCT_PAGE_FIELDS}
            defaults={{}}
            readOnlyHeading="Information from product onboarding"
            readOnlyIntro="This information comes from your product onboarding form and cannot be changed here. To update it, go to Manage products."
            readOnly={productPageReadOnly(product)}
            viewHref={`/apps/${product.appSlug}`}
            checkAnswersHref={publishedProductCheckAnswersHref(product.id)}
          />
        </div>
      </div>
    </div>
  )
}
