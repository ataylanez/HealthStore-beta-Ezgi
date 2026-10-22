'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEoiJourney } from '../EoiJourneyProvider'
import { useStepHeadingFocus } from '../shared'

export default function ConfirmationStep() {
  const router = useRouter()
  const { app, basePath, reference, hydrated } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  // Guard: no confirmation to show unless a submission happened.
  useEffect(() => {
    if (hydrated && !reference) router.replace(basePath)
  }, [hydrated, reference, basePath, router])

  if (!reference) return null

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="nhsuk-panel" style={{ textAlign: 'center' }}>
            <h1 ref={headingRef} tabIndex={-1} className="nhsuk-panel__title outline-none">
              Expression of interest in {app.name} submitted
            </h1>
            <div className="nhsuk-panel__body">
              Your reference number
              <br />
              <strong>{reference}</strong>
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-body)' }}>
            We have sent you a confirmation email with your reference number.
          </p>
          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">What happens next</h2>
          <p style={{ fontSize: 'var(--text-body)' }}>
            A member of the HealthStore commissioning support team will be in touch within 5 working
            days to discuss next steps.
          </p>
          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-6">Support for success</h2>
          <p style={{ fontSize: 'var(--text-body)' }}>
            Our{' '}
            <Link href="/resources" className="nhsuk-link nhsuk-link--no-visited-state">
              commissioning toolkits
            </Link>{' '}
            offer best practice and guidance for making the most of a commissioned DTx.
          </p>
          <p style={{ fontSize: 'var(--text-body)' }}>
            <Link href={`/apps/${app.slug}`} className="nhsuk-link nhsuk-link--no-visited-state">
              Return to {app.name}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
