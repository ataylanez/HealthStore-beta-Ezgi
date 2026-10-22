'use client'

import { useRouter } from 'next/navigation'
import { useEoiJourney } from '../EoiJourneyProvider'
import { BackLink, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'

export default function StartStep() {
  const router = useRouter()
  const { app, flow, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={backHref('start')} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            {flow === 'v2' ? `Get in touch about ${app.name}` : `Express interest in ${app.name}`}
          </h1>
          {flow === 'v2' ? (
            <>
              <p style={{ fontSize: 'var(--text-body)' }}>
                Use this form to tell the NHS HealthStore commissioning support team that you are
                interested in {app.name}. A member of the team will contact you to talk about next
                steps.
              </p>
              <h2 className="nhsuk-heading-m">Before you start</h2>
              <p style={{ fontSize: 'var(--text-body)' }}>We will ask you:</p>
              <ul className="nhsuk-list nhsuk-list--bullet">
                <li>why you are interested and what support you need</li>
                <li>when you would like to start and how it would fit your service</li>
                <li>for your name, role, organisation and NHS work email address</li>
              </ul>
              <p style={{ fontSize: 'var(--text-body)' }}>It takes about 2 minutes.</p>
            </>
          ) : null}
          <div className="nhsuk-inset-text">
            <span className="nhsuk-u-visually-hidden">Information: </span>
            <p>
              This registers an expression of interest with the NHS HealthStore commissioning
              support team. It is not a purchase or a procurement award.
            </p>
          </div>
          {flow === 'v1' ? (
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
              We will ask for your details, what support you need and your timing. It takes about 2
              minutes. A member of the commissioning support team will then contact you.
            </p>
          ) : null}
          <Button onClick={() => router.push(nextHref('start'))}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
