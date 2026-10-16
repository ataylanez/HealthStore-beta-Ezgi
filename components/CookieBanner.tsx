'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

/**
 * Cookie banner. [Provenance: GOV.UK-recoloured]
 *
 * NHS has no cookie-banner component, so this uses the GOV.UK Cookie banner
 * container (`.govuk-cookie-banner`, recoloured to NHS via the gap theme) with
 * NHS buttons for the actions and NHS spacing inside.
 */
export default function CookieBanner({
  onAccept,
  onReject,
}: {
  onAccept: () => void
  onReject: () => void
}) {
  return (
    <div
      data-cookie-banner
      data-nosnippet
      className="govuk-cookie-banner"
      role="region"
      aria-label="Cookies on NHS HealthStore"
    >
      <div className="govuk-cookie-banner__message">
        <div className="nhsuk-width-container" style={{ paddingBlock: 'var(--space-4)' }}>
          <h2
            className="m-0 mb-4 hs-font-bold"
            style={{
              fontFamily: 'Frutiger, Arial, sans-serif',
              fontSize: 'var(--text-section-alt)',
              color: 'var(--nhs-dark)',
            }}
          >
            Cookies on NHS HealthStore
          </h2>
          <div
            className="space-y-4 mb-6 max-w-3xl"
            style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)', lineHeight: 1.5 }}
          >
            <p className="m-0">
              We use essential cookies to make this prototype work - for example to keep you signed in when you choose to
              use your account.
            </p>
            <p className="m-0">
              We&apos;d also like to use analytics cookies so we can understand how to improve the NHS HealthStore.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
            <Button onClick={onAccept}>Accept analytics cookies</Button>
            <Button variant="secondary" onClick={onReject}>
              Reject analytics cookies
            </Button>
            <Link
              href="/cookies"
              className="inline-flex justify-center sm:justify-start items-center hs-text-label hs-font-bold underline hover:no-underline px-1 py-2"
              style={{ color: 'var(--nhs-blue)' }}
            >
              View cookies
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
