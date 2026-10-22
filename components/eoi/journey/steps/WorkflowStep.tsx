'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEoiJourney, useStepGuard } from '../EoiJourneyProvider'
import { BackLink, StepCaption, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, Textarea } from '@/components/ui/FormField'

/** v2: optional "how would it fit your service" question as its own page (label is the h1). */
export default function WorkflowStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { app, data, update, hrefFor, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  useStepGuard('workflow')

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? hrefFor('check-answers') : backHref('workflow')} />
          <StepCaption />
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              router.push(returnToCheck ? hrefFor('check-answers') : nextHref('workflow'))
            }}
          >
            <FormField
              id="eoi-notes"
              asPageHeading
              headingRef={headingRef}
              label={`How would ${app.name} fit into your service? (optional)`}
              hint="For example, which pathway or clinic it would support and who would use it. Do not include any patient-identifiable information."
            >
              {(field) => (
                <Textarea
                  {...field}
                  rows={5}
                  value={data.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              )}
            </FormField>
            <Button type="submit">Continue</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
