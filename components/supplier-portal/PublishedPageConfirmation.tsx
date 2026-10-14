'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PORTAL_PATHS } from '@/lib/supplierPortal'
import { publishedPageStatus } from './portalStatus'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Published page changes submitted — confirmation. [Provenance: NHS Panel]
 *
 * Guard: only reachable after a submission (status In review).
 */
export default function PublishedPageConfirmation({
  pageId,
  title,
  editHref,
}: {
  pageId: string
  title: string
  editHref: string
}) {
  const router = useRouter()
  const { hydrated, getRecord } = useSupplierPortal()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const status = hydrated ? publishedPageStatus(getRecord('pages', pageId)) : undefined

  useEffect(() => {
    if (hydrated && status !== 'in_review') router.replace(editHref)
  }, [hydrated, status, router, editHref])

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
          <div className="nhsuk-panel__body">{title}</div>
        </div>
        <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">What happens next</h2>
        <p style={{ fontSize: 'var(--text-body)' }}>
          The NHS HealthStore team will review your changes. We will contact you if we need any further information
          or to confirm the outcome of the review.
        </p>
        <p style={{ fontSize: 'var(--text-body)' }}>
          <Link className="nhsuk-link" href={PORTAL_PATHS.published}>
            Published pages
          </Link>
        </p>
      </div>
    </div>
  )
}
