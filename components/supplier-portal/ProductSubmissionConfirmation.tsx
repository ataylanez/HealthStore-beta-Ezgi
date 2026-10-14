'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  findManagedProduct,
  managedProductHref,
  PORTAL_PATHS,
} from '@/lib/supplierPortal'
import { managedProductStatus } from './portalStatus'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Product changes submitted — confirmation. [Provenance: NHS Panel]
 *
 * Guard: only reachable after a submission (status In review); otherwise
 * returns to the product page.
 */
export default function ProductSubmissionConfirmation({ productId }: { productId: string }) {
  const router = useRouter()
  const product = findManagedProduct(productId)!
  const productHref = managedProductHref(productId)
  const { hydrated, getRecord } = useSupplierPortal()
  const headingRef = useRef<HTMLHeadingElement>(null)

  const status = hydrated ? managedProductStatus(product, getRecord('products', productId)) : undefined

  useEffect(() => {
    if (hydrated && status !== 'in_review') router.replace(productHref)
  }, [hydrated, status, router, productHref])

  useEffect(() => {
    if (status === 'in_review') {
      window.scrollTo(0, 0)
      headingRef.current?.focus()
    }
  }, [status])

  if (!hydrated || status !== 'in_review') return null

  return (
    <div className="hs-page">
      <div className="max-w-2xl">
        <div className="nhsuk-panel" style={{ textAlign: 'center' }}>
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-panel__title outline-none">
            Changes submitted for review
          </h1>
          <div className="nhsuk-panel__body">
            {product.name}
          </div>
        </div>
        <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">What happens next</h2>
        <p style={{ fontSize: 'var(--text-body)' }}>
          The NHS HealthStore team will review your changes. We will contact you if we need any further information
          or to confirm the outcome of the review.
        </p>
        <p style={{ fontSize: 'var(--text-body)' }}>
          <Link className="nhsuk-link" href={PORTAL_PATHS.manage}>
            Manage products
          </Link>
        </p>
      </div>
    </div>
  )
}
