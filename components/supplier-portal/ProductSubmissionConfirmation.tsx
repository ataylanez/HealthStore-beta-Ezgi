'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  findManagedProduct,
  managedProductHref,
  PORTAL_PATHS,
} from '@/lib/supplierPortal'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Product changes submitted — confirmation. [Provenance: NHS Panel]
 *
 * Guard: only reachable straight after a submission; otherwise returns to the
 * product page.
 */
export default function ProductSubmissionConfirmation({ productId }: { productId: string }) {
  const router = useRouter()
  const product = findManagedProduct(productId)!
  const productHref = managedProductHref(productId)
  const { hydrated, getRecord } = useSupplierPortal()
  const headingRef = useRef<HTMLHeadingElement>(null)

  const justSubmitted = hydrated && Boolean(getRecord('products', productId).justSubmittedAt)

  useEffect(() => {
    if (hydrated && !justSubmitted) router.replace(productHref)
  }, [hydrated, justSubmitted, router, productHref])

  useEffect(() => {
    if (justSubmitted) {
      window.scrollTo(0, 0)
      headingRef.current?.focus()
    }
  }, [justSubmitted])

  if (!justSubmitted) return null

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="nhsuk-panel" style={{ textAlign: 'center' }}>
            <h1 ref={headingRef} tabIndex={-1} className="nhsuk-panel__title outline-none">
              Changes submitted
            </h1>
            <div className="nhsuk-panel__body">
              {product.name}
            </div>
          </div>
          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">What happens next</h2>
          <p style={{ fontSize: 'var(--text-body)' }}>
            Your product information and documents have been updated. You can make further changes at any time.
          </p>
          <p style={{ fontSize: 'var(--text-body)' }}>
            <Link className="nhsuk-link" href={productHref}>
              View {product.name}
            </Link>
          </p>
          <p style={{ fontSize: 'var(--text-body)' }}>
            <Link className="nhsuk-link" href={PORTAL_PATHS.manage}>
              Manage products
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
