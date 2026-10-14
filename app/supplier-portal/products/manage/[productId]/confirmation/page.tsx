import { notFound } from 'next/navigation'
import ProductSubmissionConfirmation from '@/components/supplier-portal/ProductSubmissionConfirmation'
import { MANAGED_PRODUCTS, PORTAL_SERVICE_NAME, findManagedProduct } from '@/lib/supplierPortal'

type Params = Promise<{ productId: string }>

export function generateStaticParams() {
  return MANAGED_PRODUCTS.map((p) => ({ productId: p.id }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  return { title: `${product ? `${product.name} — ` : ''}Changes submitted — ${PORTAL_SERVICE_NAME}` }
}

export default async function ProductConfirmationPage({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  if (!product) notFound()
  return <ProductSubmissionConfirmation productId={product.id} />
}
