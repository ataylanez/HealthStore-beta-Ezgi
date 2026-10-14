import { notFound } from 'next/navigation'
import ProductCheckAnswers from '@/components/supplier-portal/ProductCheckAnswers'
import { MANAGED_PRODUCTS, PORTAL_SERVICE_NAME, findManagedProduct } from '@/lib/supplierPortal'
import { productDefaults } from '@/lib/supplierPortalContent'

type Params = Promise<{ productId: string }>

export function generateStaticParams() {
  return MANAGED_PRODUCTS.map((p) => ({ productId: p.id }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  return { title: `${product ? `${product.name} — ` : ''}Check your answers — ${PORTAL_SERVICE_NAME}` }
}

export default async function ProductCheckAnswersPage({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  if (!product) notFound()
  return <ProductCheckAnswers productId={product.id} defaults={productDefaults(product)} />
}
