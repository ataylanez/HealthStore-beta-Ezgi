'use client'

import { useRouter } from 'next/navigation'
import { useEoiJourney } from '../EoiJourneyProvider'
import { BackLink, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'

export default function StartStep() {
  const router = useRouter()
  const { app, basePath } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={`/apps/${app.slug}`} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Express interest in {app.name}
          </h1>
          <div className="nhsuk-inset-text">
            <span className="nhsuk-u-visually-hidden">Information: </span>
            <p>
              This registers an expression of interest with the NHS HealthStore commissioning
              support team. It is not a purchase or a procurement award.
            </p>
          </div>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            We will ask for your details, what support you need and your timing. It takes about 2
            minutes. A member of the commissioning support team will then contact you.
          </p>
          <Button onClick={() => router.push(`${basePath}/details`)}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
