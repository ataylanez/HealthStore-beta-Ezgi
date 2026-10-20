'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PORTAL_PATHS } from '@/lib/supplierPortal'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Published page changes submitted — confirmation. [Provenance: NHS Panel]
 *
 * Guard: only reachable straight after a submission.
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
  const justSubmitted = hydrated && Boolean(getRecord('pages', pageId).justSubmittedAt)

  useEffect(() => {
    if (hydrated && !justSubmitted) router.replace(editHref)
  }, [hydrated, justSubmitted, router, editHref])

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
              Page published
            </h1>
            <div className="nhsuk-panel__body">{title}</div>
          </div>
          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">What happens next</h2>
          <p style={{ fontSize: 'var(--text-body)' }}>
            Your changes are now live on the Commissioning Store. You can make further changes at any time.
          </p>
          <p style={{ fontSize: 'var(--text-body)' }}>
            <Link className="nhsuk-link" href={PORTAL_PATHS.published}>
              Published pages
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
