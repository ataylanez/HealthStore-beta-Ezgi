'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PORTAL_BASE_PATH, PORTAL_PATHS } from '@/lib/supplierPortal'

/**
 * Body of the site-wide 404, following the NHS "Page not found" pattern
 * (https://www.nhs.uk/pages/404.html). The browse link goes to the Supplier
 * portal dashboard when the missing address is a portal one, and to the
 * Commissioning Store home page everywhere else.
 */
export default function NotFoundContent() {
  const pathname = usePathname()
  const isPortal = pathname?.startsWith(PORTAL_BASE_PATH) ?? false

  return (
    <div className="hs-page">
      <div className="max-w-2xl">
        <h1 className="page-title-h1">Page not found</h1>
        <p className="nhsuk-body-m">If you entered a web address please check it was correct.</p>
        <p className="nhsuk-body-m">
          {isPortal ? (
            <>
              Why not browse the{' '}
              <Link className="nhsuk-link" href={PORTAL_PATHS.dashboard}>
                Supplier portal dashboard
              </Link>{' '}
              to manage your products and pages?
            </>
          ) : (
            <>
              Why not browse the{' '}
              <Link className="nhsuk-link" href="/">
                Commissioning Store homepage
              </Link>{' '}
              to find products and information?
            </>
          )}
        </p>
      </div>
    </div>
  )
}
