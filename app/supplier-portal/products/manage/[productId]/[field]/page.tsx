import { notFound } from 'next/navigation'
import ProductFieldEditor from '@/components/supplier-portal/ProductFieldEditor'
import {
  MANAGED_PRODUCTS,
  PORTAL_SERVICE_NAME,
  PRODUCT_CONTENT_FIELDS,
  PRODUCT_DOCUMENT_FIELDS,
  findManagedProduct,
  findProductField,
} from '@/lib/supplierPortal'
import { productDefaults } from '@/lib/supplierPortalContent'

type Params = Promise<{ productId: string; field: string }>

export function generateStaticParams() {
  const fields = [...PRODUCT_CONTENT_FIELDS, ...PRODUCT_DOCUMENT_FIELDS]
  return MANAGED_PRODUCTS.flatMap((p) => fields.map((f) => ({ productId: p.id, field: f.id })))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { productId, field } = await params
  const product = findManagedProduct(productId)
  const match = findProductField(field)
  if (!product || !match) return { title: PORTAL_SERVICE_NAME }
  return { title: `${match.field.label} — ${product.name} — ${PORTAL_SERVICE_NAME}` }
}

export default async function ProductFieldPage({ params }: { params: Params }) {
  const { productId, field } = await params
  const product = findManagedProduct(productId)
  if (!product || !findProductField(field)) notFound()
  return <ProductFieldEditor productId={product.id} fieldId={field} defaults={productDefaults(product)} />
}
