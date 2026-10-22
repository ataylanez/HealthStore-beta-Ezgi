'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEoiJourney, useStepGuard } from '../EoiJourneyProvider'
import { BackLink, StepCaption, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'

/** v2: optional patient-population question as its own page (label is the h1). */
export default function PopulationStep() {
  const router = useRouter()
  const returnToCheck = useSearchParams().get('from') === 'check'
  const { app, data, update, hrefFor, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  useStepGuard('population')

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={returnToCheck ? hrefFor('check-answers') : backHref('population')} />
          <StepCaption />
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              router.push(returnToCheck ? hrefFor('check-answers') : nextHref('population'))
            }}
          >
            <FormField
              id="eoi-population"
              asPageHeading
              headingRef={headingRef}
              label={`How many patients could use ${app.name}? (optional)`}
              hint="An estimate is fine, for example 2,000 people with COPD."
            >
              {(field) => (
                <TextInput
                  {...field}
                  value={data.population}
                  onChange={(e) => update({ population: e.target.value })}
                  className="nhsuk-input--width-20"
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
