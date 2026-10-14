import { notFound } from 'next/navigation'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import ProductDocumentsView from '@/components/supplier-portal/ProductDocumentsView'
import { MANAGED_PRODUCTS, PORTAL_PATHS, PORTAL_SERVICE_NAME, findManagedProduct } from '@/lib/supplierPortal'
import { productDefaults } from '@/lib/supplierPortalContent'

type Params = Promise<{ productId: string }>

export function generateStaticParams() {
  return MANAGED_PRODUCTS.map((p) => ({ productId: p.id }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  return { title: `${product ? `${product.name} — ` : ''}Documents and content — ${PORTAL_SERVICE_NAME}` }
}

export default async function ProductDocumentsPage({ params }: { params: Params }) {
  const product = findManagedProduct((await params).productId)
  if (!product) notFound()
  return (
    <div className="hs-page">
      <PortalBreadcrumb
        items={[
          { label: 'Product management', href: PORTAL_PATHS.products },
          { label: 'Manage products', href: PORTAL_PATHS.manage },
          { label: product.name },
        ]}
      />
      <div className="max-w-3xl">
        <ProductDocumentsView productId={product.id} defaults={productDefaults(product)} />
      </div>
    </div>
  )
}
