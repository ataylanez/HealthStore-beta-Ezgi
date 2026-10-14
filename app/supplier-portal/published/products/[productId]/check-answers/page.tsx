import { notFound } from 'next/navigation'
import PublishedPageCheckAnswers from '@/components/supplier-portal/PublishedPageCheckAnswers'
import {
  MANAGED_PRODUCTS,
  PORTAL_SERVICE_NAME,
  PRODUCT_PAGE_FIELDS,
  findManagedProduct,
  publishedProductConfirmationHref,
  publishedProductHref,
} from '@/lib/supplierPortal'

type Params = Promise<{ productId: string }>

export function generateStaticParams() {
  return MANAGED_PRODUCTS.map((p) => ({ productId: p.id }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  return { title: `${product ? `${product.name} — ` : ''}Check your answers — ${PORTAL_SERVICE_NAME}` }
}

export default async function PublishedProductCheckAnswersPage({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  if (!product) notFound()
  return (
    <PublishedPageCheckAnswers
      pageId={product.id}
      caption="Product page"
      title={product.name}
      fields={PRODUCT_PAGE_FIELDS}
      defaults={{}}
      editHref={publishedProductHref(product.id)}
      confirmationHref={publishedProductConfirmationHref(product.id)}
    />
  )
}
